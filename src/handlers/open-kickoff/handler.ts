import {logger} from '@lib';
import {slackAuthenticate} from '@lib/auth';
import {Handler} from 'aws-lambda';
import {SlashCommandAPIGatewayEvent} from '@domain/slack';

import {openKickoffModal} from './usecases/open-kickoff-modal';

export const handler: Handler = async (event: SlashCommandAPIGatewayEvent, context) => {
	logger.withRequest(event, context);
	await slackAuthenticate(event);
	return await openKickoffModal(event.body);
};
