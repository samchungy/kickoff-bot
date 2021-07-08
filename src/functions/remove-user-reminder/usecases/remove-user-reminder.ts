import {UserReminderEvent} from 'domain/events';
import {deleteScheduledMessage} from 'infrastructure/slack-interface';
import {getKickoff, removeKickoffUser} from 'infrastructure/storage/kickoff-interface';
import {logger} from 'lib';
import {createHashRangeKey} from 'lib/kickoff/keys';

const removeUserReminder = async (event: UserReminderEvent) => {
  const hashRangeKey = createHashRangeKey(event.channelId, event.ts);
  const kickoff = await getKickoff(hashRangeKey);

  if (!kickoff || !kickoff.users[event.userId] || kickoff.eventTime <= new Date().getTime() / 1000) {
    logger.info({kickoff}, 'No kickoff or user already is gone');
    return;
  }

  try {
    await Promise.all([
      deleteScheduledMessage(event.channelId, kickoff.users[event.userId]),
      removeKickoffUser(hashRangeKey, event.userId),
    ]);
  } catch (error) {
    logger.warn(error, 'Something went wrong removing a message');
  }
};

export {
  removeUserReminder,
};
