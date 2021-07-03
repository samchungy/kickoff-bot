import {UserReminderEvent} from 'domain/events';
import {deleteScheduledMessage} from 'infrastructure/slack-interface';
import {getKickoff, removeKickoffUser} from 'infrastructure/storage/kickoff-interface';
import {logger} from 'lib';

const removeUserReminder = async (event: UserReminderEvent) => {
  const kickoff = await getKickoff(event.channelId, event.ts);

  if (!kickoff || !kickoff.users[event.userId] || kickoff.eventTime <= new Date().getTime() / 1000) {
    logger.info({kickoff}, 'No kickoff or user already is gone');
    return;
  }

  try {
    await Promise.all([
      deleteScheduledMessage(event.channelId, kickoff.users[event.userId]),
      removeKickoffUser(event.channelId, event.ts, event.userId),
    ]);
  } catch (error) {
    logger.warn(error, 'Something went wrong removing a message');
  }
};

export {
  removeUserReminder,
};
