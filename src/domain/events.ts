import {KickoffValues} from './kickoff-modal';

type PostKickoffEvent = KickoffValues & {
  viewId: string
  userId: string
  timezone: string
}

type AddUserReminderEvent = {
  userId: string
  channelId: string
  ts: string
}

export {
  AddUserReminderEvent,
  PostKickoffEvent,
};
