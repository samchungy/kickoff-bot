import {ConditionalCheckFailedException} from '@aws-sdk/client-dynamodb';
import {ChatDeleteScheduledMessageResponse, ChatScheduleMessageResponse} from '@slack/web-api';
import {UserReminderEvent} from 'domain/events';
import {KickoffRecord} from 'domain/kickoff';

import {scheduleMessage, deleteScheduledMessage} from 'infrastructure/slack-gateway';
import {getKickoff, addKickoffUser} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {mocked} from 'ts-jest/utils';
import {addUserReminder} from './add-user-reminder';

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
  channelId: 'C025RNKNB28',
  ts: '1458170866.000004',
  author: 'URVUTD7UP',
  users,
  domain: 'spotbottest',
  eventTime,
});

const beforeCurrentTime = 1609459000;
const sampleKickoff = createKickoffRecord({}, beforeCurrentTime);

const deleteScheduledMessageResponse: ChatDeleteScheduledMessageResponse = {
  ok: true,
};

const scheduleMessageResponse: ChatScheduleMessageResponse = {
  ok: true,
  channel: 'C025RNKNB28',
  scheduled_message_id: 'Q1298393284',
  post_at: 1562180400,
  message: {
    text: 'Here\'s a message for you in the future',
    bot_id: 'B19LU7CSY',
    type: 'delayed_message',
  },
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
  mocked(scheduleMessage).mockResolvedValue(scheduleMessageResponse);
  mocked(addKickoffUser).mockResolvedValue();
  mocked(deleteScheduledMessage).mockResolvedValue(deleteScheduledMessageResponse);
});

it('should call the kickoff interface to get the kickoff', async () => {
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(logger.warn).not.toBeCalled();
});

it('should return when the kickoff no longer exists', async () => {
  mocked(getKickoff).mockResolvedValue(undefined);
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(logger.info).toBeCalled();
});

it('should return when the kickoff already has the user', async () => {
  mocked(getKickoff).mockResolvedValue(createKickoffRecord({[userReminderEvent.userId]: 'Q1298393284'}, beforeCurrentTime));
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(logger.info).toBeCalled();
});

it('should return when the kickoff is expired', async () => {
  mocked(getKickoff).mockResolvedValue(createKickoffRecord({}, 1609459600));
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(logger.info).toBeCalled();
});

it('should call the addReminder function with Your kickoff...', async () => {
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(scheduleMessage).toBeCalledWith(
    userReminderEvent.userId,
    sampleKickoff.eventTime - 60,
    'Your kickoff is starting in 1 minute.\n\nhttps://spotbottest.slack.com/archives/C025RNKNB28/p1458170866000004',
    expect.any(Object));
});

it('should call the addReminder function with <UserId>\'s kickoff...', async () => {
  const otherUserReminderEvent: UserReminderEvent = {
    channelId: 'C025RNKNB28',
    ts: '1458170866.000004',
    userId: 'UMNUTD6DP',
  };
  await expect(addUserReminder(otherUserReminderEvent)).resolves.toBeUndefined();

  expect(getKickoff).toBeCalledWith(userReminderEvent.channelId, userReminderEvent.ts);
  expect(scheduleMessage).toBeCalledWith(
    otherUserReminderEvent.userId,
    sampleKickoff.eventTime - 60,
    '<@URVUTD7UP>\'s kickoff is starting in 1 minute.\n\nhttps://spotbottest.slack.com/archives/C025RNKNB28/p1458170866000004',
    expect.any(Object));
});

it('should call addKickoffUser with the correct parameters', async () => {
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();

  expect(addKickoffUser).toBeCalledWith(
    userReminderEvent.channelId,
    userReminderEvent.ts,
    userReminderEvent.userId,
    scheduleMessageResponse.scheduled_message_id,
  );
  expect(logger.error).not.toBeCalled();
});

it('should call deleteScheduledMessage when addKickoffUser returns a ConditionalCheckFailedException error', async () => {
  const error: ConditionalCheckFailedException = {
    name: 'ConditionalCheckFailedException',
    $fault: 'client',
    $metadata: {},
  };
  mocked(addKickoffUser).mockRejectedValue(error);
  await expect(addUserReminder(userReminderEvent)).resolves.toBeUndefined();
  expect(deleteScheduledMessage).toBeCalledWith(userReminderEvent.userId, scheduleMessageResponse.scheduled_message_id as string);
});

it('should log an error when deleteScheduledMessage fails for a different reason', async () => {
  const error = new Error();
  mocked(addKickoffUser).mockRejectedValue(error);
  await expect(addUserReminder(userReminderEvent)).rejects.toThrowError(error);
  expect(logger.error).toBeCalled();
});
