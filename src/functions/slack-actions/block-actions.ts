
import {ButtonAction} from '@slack/bolt';
import {SlackBlockAction} from 'domain/slack';
import {logger} from 'lib';
import {invokeRetryKickoff} from './usecases/invoke-retry-kickoff';

const blockActionsHandler = (payload: SlackBlockAction) => {
  switch (payload.actions[0].action_id) {
    case 'retry': {
      return invokeRetryKickoff((payload.actions[0] as ButtonAction).value, payload.trigger_id);
    }

    default: {
      logger.warn({actionId: payload.actions[0].action_id}, 'Unknown Action ID');
      break;
    }
  }
};

export {blockActionsHandler};
