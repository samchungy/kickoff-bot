import {SlackBlockWithAction} from './slack';

type UserScheduledMessage = Record<string, string>

interface KickoffItem {
  hashKey: string
  rangeKey: string
  eventTime: number
  domain: string
  author: string
  users: UserScheduledMessage
}

type RetryKickoffActionId = 'retry-kickoff'

type RetryKickoffBlock = SlackBlockWithAction<RetryKickoffActionId, undefined>

interface RetryKickoffValue {
  channelId: string
  viewId: string
  kickoffDate: string
}

type KickoffOverflowActionId = 'kickoff-overflow'
type KickoffOverflowValues = 'remove-kickoff'

type KickoffBlock = SlackBlockWithAction<KickoffOverflowActionId, KickoffOverflowValues>

export {
  KickoffItem,
  KickoffOverflowActionId,
  KickoffOverflowValues,
  RetryKickoffActionId,
  RetryKickoffBlock,
  RetryKickoffValue,
  KickoffBlock,
};
