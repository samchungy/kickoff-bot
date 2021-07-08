import {KickoffMetadata, KickoffValues} from './kickoff-modal';

type KickoffEvent = {
  viewId: string
  userId: string
  values: KickoffValues
  metadata: KickoffMetadata
}

type UserReminderEvent = {
  userId: string
  channelId: string
  ts: string
}

type RemoveKickoffEvent = {
  userId: string
  channelId: string
  ts: string
  text: string
  responseUrl: string
}

export {
  KickoffEvent,
  RemoveKickoffEvent,
  UserReminderEvent,
};
