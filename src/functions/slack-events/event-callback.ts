import {SlackCallbackEvent} from 'domain/slack';
import {ReactionAddedEvent, ReactionRemovedEvent, ReactionMessageItem} from '@slack/bolt';
import {logger} from 'lib';
import {invokeAddUserReminder} from './usecases/invoke-add-user-reminder';
import {invokeRemoveUserReminder} from './usecases/invoke-remove-user-reminder';
import {add} from 'date-fns';

const isValidChannelReaction = (event: ReactionAddedEvent | ReactionRemovedEvent) =>
  event.item.type === 'message'
  && event.reaction.startsWith('+1') // Makes sure the reaction is one of the +1 variants
  && (event.item.channel.startsWith('C') || event.item.channel.startsWith('G')) // New channels start with C, old start with G
  && add(new Date(parseFloat(event.item.ts) * 1000), {weeks: 2}) >= new Date(); // If the event is less than 2 weeks old

const eventCallbackHandler = (payload: SlackCallbackEvent) => {
  switch (payload.event.type) {
    case 'reaction_added': {
      // Check if it's an event on our user's post
      const userId = payload.authorizations?.find(auth => auth.is_bot)?.user_id;
      if (userId === payload.event.item_user && isValidChannelReaction(payload.event)) {
        return invokeAddUserReminder(
          (payload.event.item as ReactionMessageItem).channel,
          payload.event.user,
          (payload.event.item as ReactionMessageItem).ts,
        );
      }

      return;
    }

    case 'reaction_removed': {
      const userId = payload.authorizations?.find(auth => auth.is_bot)?.user_id;
      if (userId === payload.event.item_user && isValidChannelReaction(payload.event)) {
        return invokeRemoveUserReminder(
          (payload.event.item as ReactionMessageItem).channel,
          payload.event.user,
          (payload.event.item as ReactionMessageItem).ts,
        );
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
