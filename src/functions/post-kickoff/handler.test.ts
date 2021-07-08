import {handler} from './handler';
import {logger} from 'lib';
import {postKickoff} from './usecases/post-kickoff';

import {Context} from 'aws-lambda';
import {KickoffEvent} from 'domain/events';

jest.mock('lib');
jest.mock('./usecases/post-kickoff');

const callback = () => {};

const kickoffEvent: KickoffEvent = {
  values: {
    channelId: 'C025RNKNB28',
    date: '2021-01-28',
    description: 'test kickoff',
    time: '20:30',
    zoom: 'https://seek.zoom.us/j/2089361925?pwd=test',
  },
  metadata: {
    timezone: 'Australia/Melbourne',
    domain: 'spotbottest',
  },
  userId: 'URVUTD7UP',
  viewId: 'VMHU10V25',
};

beforeEach(jest.clearAllMocks);

it('should set the logger context using event and context', async () => {
  const event = kickoffEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(logger.withRequest).toBeCalledWith(event, context);
});

it('should call our post kickoff usecase with the event', async () => {
  const event = kickoffEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(postKickoff).toBeCalledWith(event);
});
