import {UserReminderEvent} from 'domain/events';
import {deleteScheduledMessage} from 'infrastructure/slack-gateway';
import {getKickoff, removeKickoffUser} from 'infrastructure/storage/kickoff-gateway';
import {logger} from 'lib';

const removeUserReminder = async (event: UserReminderEvent) => {
  try {
    const kickoff = await getKickoff(event.channelId, event.ts);
    const currentTime = new Date().getTime() / 1000;

    if (!kickoff || !kickoff.users[event.userId] || kickoff.eventTime >= currentTime) {
      logger.info({event, kickoff, currentTime}, 'No kickoff or user already is gone');
      return;
    }

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
