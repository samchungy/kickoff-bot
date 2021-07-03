import {ChatPostMessageResponse} from '@slack/web-api';
import {getUnixTime} from 'date-fns';
import {format, zonedTimeToUtc} from 'date-fns-tz';
import {PostKickoffEvent} from 'domain/events';
import {RetryKickoffBlock} from 'domain/kickoff';
import {SlackBlocks} from 'domain/slack';
import {invokeAsync} from 'infrastructure/lambda-Interface';
import {sendMessage} from 'infrastructure/slack-interface';
import {putKickoff} from 'infrastructure/storage/kickoff-interface';
import {logger} from 'lib';

const getDateString = (timezone: string, date: string, time: string) => {
  const kickoffDate = zonedTimeToUtc(`${date} ${time}`, timezone);
  const backupTime = format(kickoffDate, 'yyyy-MM-dd hh:mmaaa zzzz', {timeZone: timezone});
  return `<!date^${getUnixTime(kickoffDate)}^{date_short_pretty} - {time}|${backupTime}>`;
};

const handlePermissionError = async (event: PostKickoffEvent) => {
  try {
    const text = `:information_source: Failed to post a kickoff to <#${event.channelId}>. Please run \`/invite @kickoff\` in the channel and click the retry button below.`;
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
            action_id: 'retry',
          },
        ],
      },
    ];
    await sendMessage(event.userId, text, blocks);
  } catch (error) {
    logger.error(error, 'Failed to send post kickoff retry to user');
  }
};

const createSlackPost = async (event: PostKickoffEvent) => {
  const text = `<@${event.userId}> is kicking off *${event.description} * at *${getDateString(event.timezone, event.date, event.time)}*`;
  const blocks: SlackBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Zoom Meeting URL: ${event.zoom}`,
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
    return await sendMessage(event.channelId, text, blocks);
  } catch (error) {
    logger.error(error, `Failed to post to ${event.channelId}`);
    throw error;
  }
};

const storeKickoff = async (event: PostKickoffEvent, metadata: ChatPostMessageResponse) => {
  const time = zonedTimeToUtc(`${event.date} ${event.time}`, event.timezone).getTime() / 1000;
  await putKickoff(event.channelId, metadata.ts as string, time, event.userId);
};

const postKickoff = async (event: PostKickoffEvent) => {
  try {
    const metadata = await createSlackPost(event);
    await storeKickoff(event, metadata);
    await invokeAsync({functionName: 'add-user-reminder', payload: {
      channelId: event.channelId,
      ts: metadata.ts as string,
      userId: event.userId,
    }});
  } catch (error) {
    if (error?.code === 'slack_webapi_platform_error' && error?.data?.error === 'not_in_channel') {
      await handlePermissionError(event);
    }

    throw error;
  }
};

export {
  postKickoff,
};
