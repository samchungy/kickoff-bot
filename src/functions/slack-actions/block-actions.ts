
import {ButtonAction, OverflowAction} from '@slack/bolt';
import {KickoffOverflowValues} from 'domain/kickoff';
import {SlackBlockAction} from 'domain/slack';
import {logger} from 'lib';
import {invokeRemoveKickoff} from './usecases/invoke-remove-kickoff';
import {invokeRetryKickoff} from './usecases/invoke-retry-kickoff';

const blockActionsHandler = (payload: SlackBlockAction) => {
  const action = payload.actions[0];
  switch (action.action_id) {
    case 'retry-kickoff': {
      return invokeRetryKickoff((action as ButtonAction).value, payload.trigger_id);
    }

    case 'kickoff-overflow': {
      switch ((action as OverflowAction).selected_option.value as KickoffOverflowValues) {
        case 'remove-kickoff': {
          return invokeRemoveKickoff({
            channelId: payload.channel?.id as string,
            userId: payload.user.id,
            ts: payload.message?.ts as string,
            text: payload.message?.text as string,
            responseUrl: payload.response_url,
          });
        }

        default: {
          logger.warn({value: (action as OverflowAction).selected_option.value}, 'Unknown value');
          break;
        }
      }

      break;
    }

    default: {
      logger.warn({actionId: payload.actions[0].action_id}, 'Unknown Action ID');
      break;
    }
  }
};

export {blockActionsHandler};
