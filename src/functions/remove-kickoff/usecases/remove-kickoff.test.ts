import {ChatDeleteResponse} from '@slack/web-api';
import {AxiosResponse} from 'axios';
import {RemoveKickoffEvent} from 'domain/events';
import {KickoffRecord} from 'domain/kickoff';

import {deleteMessage, deleteScheduledMessage, respond, sendMessage} from 'infrastructure/slack-gateway';
import {getKickoff, removeKickoffUser} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {mocked} from 'ts-jest/utils';
import {removeKickoff} from './remove-kickoff';

jest.mock('infrastructure/slack-gateway');
jest.mock('infrastructure/storage/kickoff-gateway');
jest.mock('lib');

const removeKickoffEvent: RemoveKickoffEvent = {
  channelId: 'C025RNKNB28',
  responseUrl: 'https://hooks.slack.com/commands/1234/5678',
  text: '<@URVUTD7UP> is kicking off',
  userId: 'URVUTD7UP',
  ts: '1458170866.000004',
};

const createKickoffRecord = (users: KickoffRecord['users'], eventTime: number): KickoffRecord => ({
  hashKey: 'channel-C025RNKNB28',
  rangeKey: 'timestamp-1458170866.000004',
  ts: '1458170866.000004',
  channelId: 'C025RNKNB28',
  author: 'URVUTD7UP',
  users,
  domain: 'spotbottest',
  eventTime,
});

const kickoffUsers: Record<string, string> = {URVUTD7UP: 'Q1298393284', UTMNGD5TY: 'Q1298987289'};
const beforeCurrentTime = 1609459000;
const sampleKickoff = createKickoffRecord(kickoffUsers, beforeCurrentTime);

const deleteMessageResponse: ChatDeleteResponse = {
  ok: true,
  channel: 'C024BE91L',
  ts: '1401383885.000061',
};

const respondResponse: AxiosResponse = {
  status: 200,
  headers: {},
  data: {},
  config: {},
  statusText: 'OK',
};

beforeAll(() => {
  jest.useFakeTimers('modern');
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.setSystemTime(new Date('2021-01-01T00:00:00'));
  mocked(getKickoff).mockResolvedValue(sampleKickoff);
  mocked(deleteMessage).mockResolvedValue(deleteMessageResponse);
  mocked(removeKickoffUser).mockResolvedValue();
  mocked(respond).mockResolvedValue(respondResponse);
});

describe('kickoff author invoking remove-kickoff', () => {
  it('should call the slack interface to deleteMessage', async () => {
    await expect(removeKickoff(removeKickoffEvent)).resolves.toBeUndefined();

    expect(deleteMessage).toBeCalledWith(removeKickoffEvent.channelId, removeKickoffEvent.ts);
  });

  it('should call the kickoff interface to get the kickoff', async () => {
    await expect(removeKickoff(removeKickoffEvent)).resolves.toBeUndefined();

    expect(getKickoff).toBeCalledWith(removeKickoffEvent.channelId, removeKickoffEvent.ts);
  });

  it.each(Object.keys(kickoffUsers))('should call delete schedledMessage on %s', async user => {
    await expect(removeKickoff(removeKickoffEvent)).resolves.toBeUndefined();

    expect(deleteScheduledMessage).toBeCalledWith(user, kickoffUsers[user]);
  });

  it('should send one notification message to the user who is not the author', async () => {
    await expect(removeKickoff(removeKickoffEvent)).resolves.toBeUndefined();

    expect(sendMessage).toBeCalledTimes(1);
    expect(sendMessage).toBeCalledWith('UTMNGD5TY', '<@URVUTD7UP> deleted their kickoff from <#C025RNKNB28>');
  });

  it('should not call deleteScheduledMessage when kickoff does not exist anymore', async () => {
    mocked(getKickoff).mockResolvedValue(undefined);
    await expect(removeKickoff(removeKickoffEvent)).resolves.toBeUndefined();

    expect(sendMessage).not.toBeCalled();
  });

  it('should not call deleteScheduledMessage when kickoff is expired', async () => {
    mocked(getKickoff).mockResolvedValue(createKickoffRecord(kickoffUsers, 1609459600));
    await expect(removeKickoff(removeKickoffEvent)).resolves.toBeUndefined();

    expect(sendMessage).not.toBeCalled();
  });

  it('should log and throw and error when something fails', async () => {
    const error = new Error();
    mocked(deleteMessage).mockRejectedValue(error);

    await expect(removeKickoff(removeKickoffEvent)).rejects.toThrowError(error);

    expect(logger.error).toBeCalled();
  });
});

describe('non kickoff author invoking remove-kickoff', () => {
  it('should call the respond method informing the user that they cannot remove the kickoff', async () => {
    const nonUserRemoveKickoffEvent: RemoveKickoffEvent = {
      channelId: 'C025RNKNB28',
      responseUrl: 'https://hooks.slack.com/commands/1234/5678',
      text: '<@URVUTD7UP> is kicking off',
      userId: 'UMDUTF7OP',
      ts: '1458170866.000004',
    };
    await expect(removeKickoff(nonUserRemoveKickoffEvent)).resolves.toBeUndefined();

    expect(respond).toBeCalledWith(nonUserRemoveKickoffEvent.responseUrl, 'You cannot delete a kickoff which does not belong to you.');
  });
});
