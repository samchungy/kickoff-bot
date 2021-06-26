import {SlackViewAction} from 'domain/slack';
import {logger} from 'lib';
import {submitKickoffModal} from './usecases/submit-kickoff-modal';

const viewSubmissionHandler = (payload: SlackViewAction) => {
  switch (payload.view.callback_id) {
    case 'kickoff': {
      return submitKickoffModal(payload.view.state.values, payload.team?.id as string, payload.view.id, payload.user.id, payload.view.private_metadata);
    }

    default: {
      logger.error({callbackId: payload.view.callback_id}, 'Unknown callback id');
      throw new Error('Unknown callback id');
    }
  }
};

export {viewSubmissionHandler};
