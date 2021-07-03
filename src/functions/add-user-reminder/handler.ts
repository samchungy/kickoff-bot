import {logger} from 'lib';
import {Handler} from 'aws-lambda';

import {addUserReminder} from './usecases/add-user-reminder';
import {AddUserReminderEvent} from 'domain/events';

// Async Handler
export const handler: Handler = async (event: AddUserReminderEvent, context) => {
  logger.withRequest(event, context);
  return await addUserReminder(event);
};
