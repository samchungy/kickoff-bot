import {KickoffEvent} from 'domain/events';
import {logger} from 'lib';
import {updateKickoffModal} from 'lib/kickoff/modal';

const reopenKickoff = async (event: KickoffEvent) => {
  try {
    await updateKickoffModal({
      metadata: event.metadata,
      viewId: event.viewId,
      timezone: event.metadata.timezone,
      initialDate: event.values.date,
      initialTime: event.values.time,
      initialChannel: event.values.channelId,
      initialZoom: event.values.zoom,
      initialDescription: event.values.description,
    });
  } catch (error: unknown) {
    logger.error({error}, 'Failed to update open modal with kickoff');
    throw error;
  }
};

export {reopenKickoff};
