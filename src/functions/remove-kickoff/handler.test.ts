import {handler} from './handler';
import {logger} from 'lib';
import {removeKickoff} from './usecases/remove-kickoff';

import {Context} from 'aws-lambda';
import {RemoveKickoffEvent} from 'domain/events';

jest.mock('lib');
jest.mock('./usecases/remove-kickoff');

const callback = () => {};

const removeKickoffEvent: RemoveKickoffEvent = {
  channelId: 'C025RNKNB28',
  responseUrl: 'https://hooks.slack.com/commands/1234/5678',
  text: '`<@URVUTD7UP> is kicking off',
  userId: 'URVUTD7UP',
  ts: '1458170866.000004',
};

beforeEach(jest.clearAllMocks);

it('should set the logger context using event and context', async () => {
  const event = removeKickoffEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(logger.withRequest).toBeCalledWith(event, context);
});

it('should call our remove kickoff usecase with the event', async () => {
  const event = removeKickoffEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(removeKickoff).toBeCalledWith(event);
});
