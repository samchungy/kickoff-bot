import {UserReminderEvent} from 'domain/events';
import {SlackBlocks} from 'domain/slack';
import {deleteScheduledMessage, scheduleMessage} from 'infrastructure/slack-gateway';
import {addKickoffUser, getKickoff} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {KickoffRecord} from 'domain/kickoff';
import {ConditionalCheckFailedException} from '@aws-sdk/client-dynamodb';

const addReminder = async (channelId: string, userId: string, ts: string, kickoff: KickoffRecord) => {
  const url = `https://${kickoff.domain}.slack.com/archives/${channelId}/p${ts.replace('.', '')}`;
  const user = kickoff.author === userId ? 'Your' : `<@${kickoff.author}>'s`;
  const text = `${user} kickoff is starting in 1 minute.\n\n${url}`;
  const blocks: SlackBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    },
  ];
  return await scheduleMessage(userId, kickoff.eventTime - 60, text, blocks);
};

const addUserToKickoff = async (channelId: string, ts: string, userId: string, messageId: string) => {
  try {
    await addKickoffUser(channelId, ts, userId, messageId);
  } catch (error) {
    if ((error as ConditionalCheckFailedException).name === 'ConditionalCheckFailedException') {
      // User already has a link, remove it.
      await deleteScheduledMessage(userId, messageId);
      return;
    }

    throw error;
  }
};

const addUserReminder = async (event: UserReminderEvent) => {
  try {
    const kickoff = await getKickoff(event.channelId, event.ts);
    const currentTime = new Date().getTime() / 1000;

    if (!kickoff || kickoff.users[event.userId] || kickoff.eventTime < currentTime) {
      logger.info({kickoff}, 'No kickoff, kickoff has expired or user already exists');
      return;
    }

    const metadata = await addReminder(event.channelId, event.userId, event.ts, kickoff);
    await addUserToKickoff(event.channelId, event.ts, event.userId, metadata.scheduled_message_id as string);
  } catch (error) {
    logger.error(error, 'Failed to add user reminder');
    throw error;
  }
};

export {
  addUserReminder,
};
