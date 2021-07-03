import {SlackCallbackEvent} from 'domain/slack';
import {logger} from 'lib';
import {invokeAddUserReminder} from './usecases/invoke-add-user-reminder';
import {invokeRemoveUserReminder} from './usecases/invoke-remove-user-reminder';

const eventCallbackHandler = (payload: SlackCallbackEvent) => {
  switch (payload.event.type) {
    case 'reaction_added': {
      // Check if it's an event on our user's post
      const userId = payload.authorizations?.find(auth => auth.is_bot)?.user_id;
      if (userId === payload.event.item_user && payload.event.item.type === 'message'
      && payload.event.reaction.startsWith('+1') && (payload.event.item.channel.startsWith('C') || payload.event.item.channel.startsWith('G'))) {
        return invokeAddUserReminder(payload.event.item.channel, payload.event.user, payload.event.item.ts);
      }

      return;
    }

    case 'reaction_removed': {
      const userId = payload.authorizations?.find(auth => auth.is_bot)?.user_id;
      if (userId === payload.event.item_user && payload.event.item.type === 'message'
      && payload.event.reaction.startsWith('+1') && (payload.event.item.channel.startsWith('C') || payload.event.item.channel.startsWith('G'))) {
        return invokeRemoveUserReminder(payload.event.item.channel, payload.event.user, payload.event.item.ts);
      }

      return;
    }

    default: {
      logger.warn({payload}, 'Unknown Event');
    }
  }
};

export {
  eventCallbackHandler,
};
