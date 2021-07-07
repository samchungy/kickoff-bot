import {mocked} from 'ts-jest/utils';
import {reopenKickoff} from './reopen-kickoff';
import {updateKickoffModal} from 'lib/kickoff/modal';

import {logger} from 'lib';
import {KickoffEvent} from 'domain/events';

jest.mock('lib');
jest.mock('lib/kickoff/modal');

const kickoffEvent: KickoffEvent = {
  channelId: 'C025RNKNB28',
  date: '2021-01-28',
  description: 'test kickoff',
  time: '20:30',
  timezone: 'Australia/Melbourne',
  userId: 'URVUTD7UP',
  viewId: 'VMHU10V25',
  zoom: 'https://seek.zoom.us/j/2089361925?pwd=test',
};

it('should call updateKickoffModal with the correct arguments', async () => {
  await expect(reopenKickoff(kickoffEvent)).resolves.toBeUndefined();

  expect(updateKickoffModal).toBeCalledWith({
    initialChannel: kickoffEvent.channelId,
    initialDate: kickoffEvent.date,
    initialDescription: kickoffEvent.description,
    initialTime: kickoffEvent.time,
    initialZoom: kickoffEvent.zoom,
    metadata: {
      timezone: kickoffEvent.timezone,
    },
    timezone: kickoffEvent.timezone,
    viewId: kickoffEvent.viewId,
  });
  expect(logger.error).not.toBeCalled();
});

it('should log and throw an error when updateKickoffModal fails', async () => {
  const error = new Error();
  mocked(updateKickoffModal).mockRejectedValue(error);

  await expect(reopenKickoff(kickoffEvent)).rejects.toThrowError(error);

  expect(logger.error).toBeCalled();
});

