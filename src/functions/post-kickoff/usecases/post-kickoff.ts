import {getUnixTime} from 'date-fns';
import {format, zonedTimeToUtc} from 'date-fns-tz';
import {PostKickoffEvent} from 'domain/events';
import {RetryKickoffBlocks} from 'domain/kickoff';
import {SlackBlocks} from 'domain/slack';
import {sendMessage} from 'infrastructure/slackInterface';
import {putKickoff} from 'infrastructure/storage/kickoffInterface';
import {logger} from 'lib';

const getDateString = (timezone: string, date: string, time: string) => {
  const kickoffDate = zonedTimeToUtc(`${date} ${time}`, timezone);
  const backupTime = format(kickoffDate, 'yyyy-MM-dd hh:mmaaa zzzz', {timeZone: timezone});
  return `<!date^${getUnixTime(kickoffDate)}^{date_short_pretty} - ^{time}|${backupTime}}>`;
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
  return await sendMessage(event.channelId, text, blocks);
};

const handlePermissionError = async (event: PostKickoffEvent) => {
  await putKickoff(event.teamId, event.channelId, event.viewId, event);

  const text = `:information_source: Failed to post a kickoff to <#${event.channelId}>. Please run \`/invite @kickoff\` in the channel and click the retry button below.`;
  const value = {
    channelId: event.channelId,
    viewId: event.viewId,
  };
  const blocks: RetryKickoffBlocks = [
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
          value: JSON.stringify(value),
          action_id: 'retry',
        },
      ],
    },
  ];
  return sendMessage(event.userId, text, blocks);
};

const postKickoff = async (event: PostKickoffEvent) => {
  try {
    await createSlackPost(event);
  } catch (error) {
    logger.error(error, `Failed to post to ${event.channelId}`);
    return handlePermissionError(event);
  }
};

export {
  postKickoff,
};
