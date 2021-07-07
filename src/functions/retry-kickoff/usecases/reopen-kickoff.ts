import {KickoffEvent} from 'domain/events';
import {KickoffMetadata} from 'domain/kickoff-modal';
import {logger} from 'lib';
import {updateKickoffModal} from 'lib/kickoff/modal';

const reopenKickoff = async (event: KickoffEvent) => {
  const metadata: KickoffMetadata = {
    timezone: event.timezone,
  };

  try {
    await updateKickoffModal({
      metadata,
      viewId: event.viewId,
      timezone: event.timezone,
      initialDate: event.date,
      initialTime: event.time,
      initialChannel: event.channelId,
      initialZoom: event.zoom,
      initialDescription: event.description,
    });
  } catch (error: unknown) {
    logger.error({error}, 'Failed to update open modal with kickoff');
    throw error;
  }
};

export {reopenKickoff};
