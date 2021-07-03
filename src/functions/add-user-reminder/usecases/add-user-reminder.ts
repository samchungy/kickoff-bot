import {AddUserReminderEvent} from 'domain/events';
import {SlackBlocks} from 'domain/slack';
import {deleteScheduledMessage, scheduleMessage} from 'infrastructure/slack-interface';
import {addKickoffUser, getKickoff} from 'infrastructure/storage/kickoff-interface';
import {logger} from 'lib';
import {config} from 'config';
import {KickoffItem} from 'domain/kickoff';

const addReminder = async (channelId: string, userId: string, ts: string, kickoff: KickoffItem) => {
  const url = `https://${config.slack.domain}.com/archives/${channelId}/p${ts.replace('.', '')}`;
  const text = `<@${kickoff.author}>'s kickoff is starting in 1 minute.\n\n${url}`;
  const blocks: SlackBlocks = [
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
            text: 'Join Zoom Meeting',
            emoji: true,
          },
          style: 'primary',
          url: `https://${config.slack.domain}.com/archives/${channelId}/p1625277172000800`,
        },
      ],
    },
  ];
  return await scheduleMessage(userId, kickoff.eventTime, text, blocks);
};

const addUserReminder = async (event: AddUserReminderEvent) => {
  const kickoff = await getKickoff(event.channelId, event.ts);

  if (!kickoff || kickoff.users[event.userId]) {
    logger.info({kickoff}, 'No kickoff or user already exists');
    return;
  }

  const metadata = await addReminder(event.channelId, event.userId, event.ts, kickoff);

  try {
    await addKickoffUser(event.channelId, event.ts, event.userId, metadata.scheduled_message_id as string);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // User already has a link, remove it.
      await deleteScheduledMessage(event.userId, metadata.scheduled_message_id as string);
    }
  }
};

export {
  addUserReminder,
};
