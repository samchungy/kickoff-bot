import {SlackViewAction} from 'domain/slack';
import {logger} from 'lib';
import {submitKickoffModal} from './usecases/submit-kickoff-modal';

const viewSubmissionHandler = (payload: SlackViewAction) => {
  switch (payload.view.callback_id) {
    case 'kickoff': {
      return submitKickoffModal({
        values: payload.view.state.values,
        viewId: payload.view.id,
        userId: payload.user.id,
        metadata: payload.view.private_metadata,
      });
    }

    default: {
      logger.error({callbackId: payload.view.callback_id}, 'Unknown callback id');
      throw new Error('Unknown callback id');
    }
  }
};

export {viewSubmissionHandler};
