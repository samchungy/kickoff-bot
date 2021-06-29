import {logger} from 'lib';
import {SlackView, SlashCommand} from 'domain/slack';
import {fetchUserInfo, openModal, sendMessage, updateModal} from 'infrastructure/slackInterface';
import {add, roundToNearestMinutes} from 'date-fns';
import {format} from 'date-fns-tz';

import {config} from '../config';
import {KickoffBlockId, KickoffMetadata} from 'domain/kickoff-modal';

const openEmptyKickoffModal = async (triggerId: string): Promise<string> => {
  const view: SlackView<undefined, undefined> = {
    callback_id: 'kickoff',
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

  // Makes sure that the next time slot is used if the rounded time
  return roundToNearestMinutes(add(nextAvailableTime, {minutes: config.roundToNearestMinutes}), {
    nearestTo: config.roundToNearestMinutes,
  });
};

const updateKickoffModal = async (viewId: string, timezone: TimezoneInfo) => {
  const initialDateTime = getNextAvailableTime();
  const initialDate = format(initialDateTime, 'yyyy-MM-dd', {timeZone: timezone.tz});
  const initialTime = format(initialDateTime, 'HH:mm', {timeZone: timezone.tz});
  const timezoneString = `(UTC ${format(initialDateTime, 'xxx', {timeZone: timezone.tz})}) ${timezone.tz}`;

  const metadata: KickoffMetadata = {
    timezone: timezone.tz,
  };

  const view: SlackView<KickoffBlockId, KickoffBlockId> = {
    callback_id: 'kickoff',
    private_metadata: JSON.stringify(metadata),
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
        block_id: 'channelId',
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
          action_id: 'channelId',
        },
      },
      {
        block_id: 'description',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'What are we kicking off?',
        },
        element: {
          type: 'plain_text_input',
          multiline: true,
          action_id: 'description',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `All dates and times are set according to the timezone listed in your Slack profile.\n*Your timezone*: ${timezoneString}`,
          },
        ],
      },
      {
        block_id: 'date',
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
          action_id: 'date',
        },
      },
      {
        block_id: 'time',
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
          action_id: 'time',
        },
      },
      {
        block_id: 'zoom',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Zoom Link',
        },
        element: {
          type: 'plain_text_input',
          action_id: 'zoom',
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
    return sendMessage(userId, ':white_frowning_face: Something went wrong! Please try again');
  }
};

export {
  openKickoffModal,
};
