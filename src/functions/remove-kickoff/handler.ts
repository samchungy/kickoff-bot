import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {removeKickoff} from './usecases/remove-kickoff';
import {RemoveKickoffEvent} from 'domain/events';

// Async Handler
export const handler: Handler = async (event: RemoveKickoffEvent, context) => {
  logger.withRequest(event, context);
  return await removeKickoff(event);
};
