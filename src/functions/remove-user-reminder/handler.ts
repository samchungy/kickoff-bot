import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {removeUserReminder} from './usecases/remove-user-reminder';
import {UserReminderEvent} from 'domain/events';

// Async Handler
export const handler: Handler = async (event: UserReminderEvent, context) => {
  logger.withRequest(event, context);
  return await removeUserReminder(event);
};
