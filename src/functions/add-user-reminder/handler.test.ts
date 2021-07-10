import {handler} from './handler';
import {logger} from 'lib';
import {addUserReminder} from './usecases/add-user-reminder';

import {Context} from 'aws-lambda';
import {UserReminderEvent} from 'domain/events';

jest.mock('lib');
jest.mock('./usecases/add-user-reminder');

const callback = () => {};

const userReminderEvent: UserReminderEvent = {
  channelId: 'C025RNKNB28',
  ts: '1458170866.000004',
  userId: 'URVUTD7UP',
};

beforeEach(jest.clearAllMocks);

it('should set the logger context using event and context', async () => {
  const event = userReminderEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(logger.withRequest).toBeCalledWith(event, context);
});

it('should call our add user reminder usecase with the event', async () => {
  const event = userReminderEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(addUserReminder).toBeCalledWith(event);
});
