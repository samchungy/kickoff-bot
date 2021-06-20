import {logger} from '@lib';
import {SlashCommand} from '@domain/slack';
import {fetchUserInfo, openModal, sendPrivateMessage, updateModal} from 'infrastructure/http/slackClient';
import {View} from '@slack/types';
import {add, roundToNearestMinutes} from 'date-fns';
import {format} from 'date-fns-tz';

import {config} from '../config';

const openEmptyKickoffModal = async (triggerId: string): Promise<string> => {
	const view: View = {
		title: {
			type: 'plain_text',
			text: 'Create a Kickoff',
		},
		type: 'modal',
		close: {
			type: 'plain_text',
			text: 'Cancel',
		},
		blocks: [{
			type: 'section',
			text: {
				type: 'plain_text',
				text: 'Loading...',
			},
		}],
	};

	const response = await openModal(triggerId, view);
	return response.view?.id as string;
};

interface TimezoneInfo {
	tz: string,
	label: string
}

const fetchUserTimezone = async (userId: string): Promise<TimezoneInfo> => {
	const user = await fetchUserInfo(userId);
	return {
		tz: user.user?.tz as string,
		label: user.user?.tz_label as string,
	};
};

const getNextAvailableTime = () => {
	const currentDate = new Date();
	const minimumDate = add(currentDate, {minutes: config.minimumNotifyMinutesBeforeKickoff});
	// Get the nearest time block
	const nextAvailableTime = roundToNearestMinutes(minimumDate, {
		nearestTo: config.roundToNearestMinutes,
	});

	if (nextAvailableTime > minimumDate) {
		return nextAvailableTime;
	}

	return add(nextAvailableTime, {minutes: config.roundToNearestMinutes});
};

const updateKickoffModal = async (viewId: string, timezone: TimezoneInfo) => {
	const initialDateTime = getNextAvailableTime();
	const initialDate = format(initialDateTime, 'yyyy-MM-dd', {timeZone: timezone.tz});
	const initialTime = format(initialDateTime, 'HH:mm', {timeZone: timezone.tz});
	const timezoneString = `(UTC ${format(initialDateTime, 'xxx', {timeZone: timezone.tz})}) ${timezone.tz}`;

	const view: View = {
		title: {
			type: 'plain_text',
			text: 'Create a Kickoff',
		},
		type: 'modal',
		submit: {
			type: 'plain_text',
			text: 'Submit',
		},
		close: {
			type: 'plain_text',
			text: 'Cancel',
		},
		blocks: [
			{
				type: 'input',
				label: {
					type: 'plain_text',
					text: 'Channel',
				},
				element: {
					type: 'conversations_select',
					default_to_current_conversation: true,
					filter: {
						include: [
							'private', 'public',
						],
					},
					placeholder: {
						type: 'plain_text',
						text: 'Select a channel',
						emoji: true,
					},
					action_id: 'static_select-action',
				},
			},
			{
				type: 'input',
				label: {
					type: 'plain_text',
					text: 'What are we kicking off?',
				},
				element: {
					type: 'plain_text_input',
					multiline: true,
				},
			},
			{
				type: 'context',
				elements: [
					{
						type: 'mrkdwn',
						text: `All dates and times are set according to the timezone set in your Slack profile.\n*Your timezone*: ${timezoneString}`,
					},
				],
			},
			{
				type: 'input',
				label: {
					type: 'plain_text',
					text: 'Date',
				},
				element: {
					type: 'datepicker',
					initial_date: initialDate,
					placeholder: {
						type: 'plain_text',
						text: 'Select a date',
					},
					action_id: 'datepicker-action',
				},
			},
			{
				type: 'input',
				label: {
					type: 'plain_text',
					text: 'Time',
				},
				element: {
					type: 'timepicker',
					initial_time: initialTime,
					placeholder: {
						type: 'plain_text',
						text: 'Select time',
					},
					action_id: 'timepicker-action',
				},
			},
			{
				type: 'input',
				label: {
					type: 'plain_text',
					text: 'Zoom Link',
				},
				element: {
					type: 'plain_text_input',
					action_id: 'plain_text_input-action',
				},
			},
		],
	};

	await updateModal(viewId, view);
};

const openKickoffModal = async (command: SlashCommand) => {
	const {trigger_id: triggerId, user_id: userId} = command;

	try {
		const [viewId, timezoneInfo] = await Promise.all([
			// We need to open an empty one because the trigger id needs to be responded to within 5 seconds.
			openEmptyKickoffModal(triggerId),
			fetchUserTimezone(userId),
		]);
		await updateKickoffModal(viewId, timezoneInfo);
	} catch (error) {
		logger.error(error, 'Failed to open a kickoff modal');
		return sendPrivateMessage(userId, ':white_frowning_face: Something went wrong! Please try again');
	}
};

export {
	openKickoffModal,
};
