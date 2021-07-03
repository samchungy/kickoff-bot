import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {PostKickoffEvent} from 'domain/events';
import {reopenKickoff} from './usecases/reopen-kickoff';

// Async Handler
export const handler: Handler = async (event: PostKickoffEvent, context) => {
  logger.withRequest(event, context);
  return await reopenKickoff(event);
};
