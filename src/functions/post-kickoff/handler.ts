import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {postKickoff} from './usecases/post-kickoff';
import {PostKickoffEvent} from 'domain/events';

// Async Handler
export const handler: Handler = async (event: PostKickoffEvent, context) => {
  logger.withRequest(event, context);
  return await postKickoff(event);
};
