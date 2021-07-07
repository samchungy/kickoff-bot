import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {KickoffEvent} from 'domain/events';
import {reopenKickoff} from './usecases/reopen-kickoff';

// Async Handler
export const handler: Handler<KickoffEvent> = async (event: KickoffEvent, context) => {
  logger.withRequest(event, context);
  return await reopenKickoff(event);
};
