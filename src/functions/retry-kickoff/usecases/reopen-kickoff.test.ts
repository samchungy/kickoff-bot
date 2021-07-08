import {mocked} from 'ts-jest/utils';
import {reopenKickoff} from './reopen-kickoff';
import {updateKickoffModal} from 'lib/kickoff/modal';

import {logger} from 'lib';
import {KickoffEvent} from 'domain/events';

jest.mock('lib');
jest.mock('lib/kickoff/modal');

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
it('should call updateKickoffModal with the correct arguments', async () => {
  await expect(reopenKickoff(kickoffEvent)).resolves.toBeUndefined();

  expect(updateKickoffModal).toBeCalledWith({
    initialChannel: kickoffEvent.values.channelId,
    initialDate: kickoffEvent.values.date,
    initialDescription: kickoffEvent.values.description,
    initialTime: kickoffEvent.values.time,
    initialZoom: kickoffEvent.values.zoom,
    metadata: kickoffEvent.metadata,
    timezone: kickoffEvent.metadata.timezone,
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

