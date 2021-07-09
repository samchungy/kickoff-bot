import {ChatPostMessageResponse, ErrorCode, WebAPIPlatformError} from '@slack/web-api';
import {getUnixTime} from 'date-fns';
import {format, zonedTimeToUtc} from 'date-fns-tz';
import {KickoffEvent} from 'domain/events';
import {KickoffBlock, RetryKickoffBlock} from 'domain/kickoff';
import {invokeAsync} from 'infrastructure/lambda-gateway';
import {sendMessage} from 'infrastructure/slack-gateway';
import {putKickoff} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {createKickoff} from './create-kickoff';

const getDateString = (timezone: string, date: string, time: string) => {
  const kickoffDate = zonedTimeToUtc(`${date} ${time}`, timezone);
  const backupTime = format(kickoffDate, 'yyyy-MM-dd hh:mmaaa zzzz', {timeZone: timezone});
  return `<!date^${getUnixTime(kickoffDate)}^{date_short_pretty} - {time}|${backupTime}>`;
};

const handlePermissionError = async (event: KickoffEvent) => {
  try {
    const text = `:information_source: Failed to post a kickoff to <#${event.values.channelId}>. Please run \`/invite @kickoff\` in the channel and click the retry button below.`;
    const blocks: RetryKickoffBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Retry',
            },
            value: JSON.stringify(event),
            action_id: 'retry-kickoff',
          },
        ],
      },
    ];
    await sendMessage(event.userId, text, blocks);
  } catch (error) {
    logger.error(error, 'Failed to send post kickoff retry to user');
    throw error;
  }
};

const createSlackPost = async (event: KickoffEvent) => {
  const text = `<@${event.userId}> is kicking off *${event.values.description} * at *${getDateString(event.metadata.timezone, event.values.date, event.values.time)}*`;
  const blocks: KickoffBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'Delete Kickoff',
            },
            value: 'remove-kickoff',
          },
        ],
        action_id: 'kickoff-overflow',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Zoom Meeting URL: ${event.values.zoom}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'React with :+1: to be notified before the kickoff begins',
        },
      ],
    },
  ];

  try {
    return await sendMessage(event.values.channelId, text, blocks);
  } catch (error: unknown) {
    logger.error({error}, `Failed to post to channel ${event.values.channelId}`);
    throw error;
  }
};

const storeKickoff = async (event: KickoffEvent, metadata: ChatPostMessageResponse) => {
  const time = zonedTimeToUtc(`${event.values.date} ${event.values.time}`, event.metadata.timezone).getTime() / 1000;
  const kickoff = createKickoff(event, metadata.ts as string, event.userId, time);
  await putKickoff(kickoff);
};

const postKickoff = async (event: KickoffEvent) => {
  try {
    const metadata = await createSlackPost(event);
    await storeKickoff(event, metadata);
    await invokeAsync({functionName: 'add-user-reminder', payload: {
      channelId: event.values.channelId,
      ts: metadata.ts as string,
      userId: event.userId,
    }});
  } catch (error: unknown) {
    if ((error as WebAPIPlatformError).code === ErrorCode.PlatformError && (error as WebAPIPlatformError).data.error === 'not_in_channel') {
      return await handlePermissionError(event);
    }

    logger.error({error}, 'Failed to post kickoff');
    throw error;
  }
};

export {
  postKickoff,
};
