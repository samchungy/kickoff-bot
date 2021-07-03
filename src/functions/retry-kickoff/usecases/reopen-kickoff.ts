import {PostKickoffEvent} from 'domain/events';
import {KickoffMetadata} from 'domain/kickoff-modal';
import {updateKickoffModal} from 'lib/kickoff/modal';

const reopenKickoff = async (event: PostKickoffEvent) => {
  const metadata: KickoffMetadata = {
    timezone: event.timezone,
  };

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
};

export {reopenKickoff};
