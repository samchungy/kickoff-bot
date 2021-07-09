import {InvokeCommandOutput} from '@aws-sdk/client-lambda';
import {ChatPostMessageResponse, ErrorCode, WebAPIPlatformError} from '@slack/web-api';
import {KickoffEvent} from 'domain/events';
import {Kickoff} from 'domain/kickoff';

import {invokeAsync} from 'infrastructure/lambda-gateway';
import {sendMessage} from 'infrastructure/slack-gateway';
import {putKickoff} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {mocked} from 'ts-jest/utils';
import {postKickoff} from './post-kickoff';

jest.mock('infrastructure/lambda-gateway');
jest.mock('infrastructure/slack-gateway');
jest.mock('infrastructure/storage/kickoff-gateway');
jest.mock('lib');

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

const samplePostMessageResponse: ChatPostMessageResponse = {
  ok: true,
  channel: 'C1H9RESGL',
  ts: '1503435956.000247',
  message: {
    text: 'Here\'s a message for you',
    username: 'ecto1',
    bot_id: 'B19LU7CSY',
    attachments: [
      {
        text: 'This is an attachment',
        id: 1,
        fallback: 'This is an attachment\'s fallback',
      },
    ],
    type: 'message',
    subtype: 'bot_message',
    ts: '1503435956.000247',
  },
};

const asyncInvokeResults: InvokeCommandOutput = {
  $metadata: {},
  StatusCode: 200,
};

beforeEach(() => {
  jest.resetAllMocks();
  mocked(sendMessage).mockResolvedValue(samplePostMessageResponse);
  mocked(putKickoff).mockResolvedValue();
  mocked(invokeAsync).mockResolvedValue(asyncInvokeResults);
});

it('should call the slack interface to create an new post', async () => {
  const expectedText = '<@URVUTD7UP> is kicking off *test kickoff * at *<!date^1611826200^{date_short_pretty} - {time}|2021-01-28 09:30am Australian Eastern Daylight Time>*';

  await expect(postKickoff(kickoffEvent)).resolves.toBeUndefined();

  expect(sendMessage).toBeCalledWith(kickoffEvent.values.channelId, expectedText, expect.any(Object));
});

it('should call the kickoff interface to store the kickoff metadata', async () => {
  const expectedItem: Kickoff = ({
    author: kickoffEvent.userId,
    domain: kickoffEvent.metadata.domain,
    eventTime: 1611826200,
    users: {},
  });

  await expect(postKickoff(kickoffEvent)).resolves.toBeUndefined();

  expect(putKickoff).toBeCalledWith(expectedItem);
});

it('should call to async invoke the add user reminder function', async () => {
  await expect(postKickoff(kickoffEvent)).resolves.toBeUndefined();
  expect(invokeAsync).toBeCalledWith({functionName: 'add-user-reminder', payload: {
    channelId: kickoffEvent.values.channelId,
    ts: samplePostMessageResponse.ts,
    userId: kickoffEvent.userId,
  }});
});

it('should attempt to send a Slack error message if the function fails to post', async () => {
  const slackPlatformError: WebAPIPlatformError = {
    code: ErrorCode.PlatformError,
    data: {
      ok: false,
      error: 'not_in_channel',
    },
    name: ErrorCode.PlatformError,
    message: 'not_in_channel',
  };
  mocked(sendMessage).mockRejectedValueOnce(slackPlatformError);
  mocked(sendMessage).mockResolvedValueOnce(samplePostMessageResponse);

  const expectedText = ':information_source: Failed to post a kickoff to <#C025RNKNB28>. Please run `/invite @kickoff` in the channel and click the retry button below.';

  await expect(postKickoff(kickoffEvent)).resolves.toBeUndefined();
  expect(sendMessage).lastCalledWith(kickoffEvent.userId, expectedText, expect.any(Object));
});

it('should log and throw an error if it fails to post the retry kickoff to the user', async () => {
  const slackPlatformError: WebAPIPlatformError = {
    code: ErrorCode.PlatformError,
    data: {
      ok: false,
      error: 'not_in_channel',
    },
    name: ErrorCode.PlatformError,
    message: 'not_in_channel',
  };
  mocked(sendMessage).mockRejectedValue(slackPlatformError);

  await expect(postKickoff(kickoffEvent)).rejects.toBe(slackPlatformError);
  expect(logger.error).toBeCalledWith(slackPlatformError, 'Failed to send post kickoff retry to user');
});

it('should log and throw an error when store fails', async () => {
  const error = new Error();
  mocked(putKickoff).mockRejectedValue(error);

  await expect(postKickoff(kickoffEvent)).rejects.toThrowError(error);
  expect(logger.error).toBeCalled();
});
