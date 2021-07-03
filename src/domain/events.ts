import {KickoffValues} from './kickoff-modal';

type KickoffEvent = KickoffValues & {
  viewId: string
  userId: string
  timezone: string
}

type UserReminderEvent = {
  userId: string
  channelId: string
  ts: string
}

export {
  UserReminderEvent,
  KickoffEvent,
};
