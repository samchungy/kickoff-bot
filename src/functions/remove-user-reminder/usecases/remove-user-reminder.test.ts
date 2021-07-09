import {ChatDeleteScheduledMessageResponse} from '@slack/web-api';
import {UserReminderEvent} from 'domain/events';
import {KickoffRecord} from 'domain/kickoff';

import {deleteScheduledMessage} from 'infrastructure/slack-gateway';
import {getKickoff, removeKickoffUser} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {mocked} from 'ts-jest/utils';
import {removeUserReminder} from './remove-user-reminder';

jest.mock('infrastructure/slack-gateway');
jest.mock('infrastructure/storage/kickoff-gateway');
jest.mock('lib');

const userReminderEvent: UserReminderEvent = {
  channelId: 'C025RNKNB28',
  ts: '1458170866.000004',
  userId: 'URVUTD7UP',
};

const createKickoffRecord = (users: KickoffRecord['users'], eventTime: number): KickoffRecord => ({
  hashKey: 'channel-C025RNKNB28',
  rangeKey: 'timestamp-1458170866.000004',
  author: 'URVUTD7UP',
  users,
  domain: 'spotbottest',
  eventTime,
});

const kickoffUsers = {URVUTD7UP: 'Q1298393284'};
const beforeCurrentTime = 1609459000;
const sampleKickoff = createKickoffRecord(kickoffUsers, beforeCurrentTime);

const deleteScheduledMessageResponse: ChatDeleteScheduledMessageResponse = {
  ok: true,
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
  mocked(deleteScheduledMessage).mockResolvedValue(deleteScheduledMessageResponse);
  mocked(removeKickoffUser).mockResolvedValue();
});

it('should call the kickoff interface to get the kickoff', async () => {
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(logger.warn).not.toBeCalled();
});

it('should return when kickoff returns nothing', async () => {
  mocked(getKickoff).mockResolvedValue(undefined);
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(logger.info).toBeCalled();
});

it('should return when kickoff has no user', async () => {
  const noKickoffUsers = {};
  const kickoff = createKickoffRecord(noKickoffUsers, beforeCurrentTime);
  mocked(getKickoff).mockResolvedValue(kickoff);
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(logger.info).toBeCalled();
});

it('should return when kickoff is already expired', async () => {
  const expiredTime = 1609459400;
  const kickoff = createKickoffRecord(kickoffUsers, expiredTime);
  mocked(getKickoff).mockResolvedValue(kickoff);
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(logger.info).toBeCalled();
});

it('should call deleteScheduledMessage when kickoff is valid with correct parameters', async () => {
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(deleteScheduledMessage).toBeCalledWith(userReminderEvent.channelId, sampleKickoff.users[userReminderEvent.userId]);
  expect(logger.warn).not.toBeCalled();
});

it('should call removeKickoffUser when kickoff is valid with correct parameters', async () => {
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(removeKickoffUser).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts, userReminderEvent.userId);
  expect(logger.warn).not.toBeCalled();
});

it('should log an warning when anything fails', async () => {
  mocked(getKickoff).mockRejectedValue(new Error());
  await expect(removeUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(logger.warn).toBeCalled();
});

