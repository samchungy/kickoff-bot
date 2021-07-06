import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {postKickoff} from './usecases/post-kickoff';
import {KickoffEvent} from 'domain/events';

// Async Handler
export const handler: Handler<KickoffEvent> = async (event: KickoffEvent, context) => {
  logger.withRequest(event, context);
  return await postKickoff(event);
};
