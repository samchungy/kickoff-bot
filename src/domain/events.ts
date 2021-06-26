import {KickoffValues} from './kickoff-modal';

interface PostKickoffEvent extends KickoffValues {
  viewId: string
  teamId: string
  userId: string
  timezone: string
}

export {
  PostKickoffEvent,
};
