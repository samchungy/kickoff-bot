import {UserReminderEvent} from 'domain/events';
import {SlackBlocks} from 'domain/slack';
import {deleteScheduledMessage, scheduleMessage} from 'infrastructure/slack-gateway';
import {addKickoffUser, getKickoff} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';
import {KickoffRecord} from 'domain/kickoff';

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

const addUserReminder = async (event: UserReminderEvent) => {
  const kickoff = await getKickoff(event.channelId, event.ts);

  if (!kickoff || kickoff.users[event.userId] || kickoff.eventTime <= new Date().getTime() / 1000) {
    logger.info({kickoff}, 'No kickoff, kickoff has expired or user already exists');
    return;
  }

  const metadata = await addReminder(event.channelId, event.userId, event.ts, kickoff);

  try {
    await addKickoffUser(event.channelId, event.ts, event.userId, metadata.scheduled_message_id as string);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // User already has a link, remove it.
      return await deleteScheduledMessage(event.userId, metadata.scheduled_message_id as string);
    }

    logger.error(error, 'Failed to add kickoff user');
    throw error;
  }
};

export {
  addUserReminder,
};
