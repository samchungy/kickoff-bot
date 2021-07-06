import {RemoveKickoffEvent} from 'domain/events';
import {respond} from 'functions/slack-actions/usecases/respond';
import {deleteMessage, deleteScheduledMessage, sendMessage} from 'infrastructure/slack-interface';
import {getKickoff} from 'infrastructure/storage/kickoff-interface';

const removeKickoff = async (event: RemoveKickoffEvent) => {
  if (!event.text.startsWith(`<@${event.userId}>`)) {
    return respond(event.responseUrl, 'You cannot delete a kickoff which does not belong to you.');
  }

  // Stop any extra events coming in
  await deleteMessage(event.channelId, event.ts);

  const kickoff = await getKickoff(event.channelId, event.ts);

  if (kickoff && new Date().getTime() / 1000 > kickoff.eventTime) {
    await Promise.all(Object.entries(kickoff.users).map(([user, messageId]) =>
      Promise.all([
        deleteScheduledMessage(user, messageId),
        (user !== event.userId && sendMessage(user, `<@${event.userId}> deleted their kickoff from <#${event.channelId}>`)) || null,
      ]),
    ));
  }
};

export {removeKickoff};