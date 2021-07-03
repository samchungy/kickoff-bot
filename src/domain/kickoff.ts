import {SlackBlockWithAction} from './slack';

type UserScheduledMessage = Record<string, string>

interface KickoffItem {
  hashKey: string
  rangeKey: string
  eventTime: number
  author: string
  users: UserScheduledMessage
}

type RetryKickoffActionId = 'retry'

type RetryKickoffBlock = SlackBlockWithAction<RetryKickoffActionId>

interface RetryKickoffValue {
  channelId: string
  viewId: string
  kickoffDate: string
}

export {
  KickoffItem,
  RetryKickoffActionId,
  RetryKickoffBlock,
  RetryKickoffValue,
};
