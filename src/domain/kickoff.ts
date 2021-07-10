import {SlackBlockWithAction} from './slack';

type UserScheduledMessage = Record<string, string>

interface Kickoff {
  channelId: string
  ts: string
  eventTime: number
  domain: string
  author: string
  users: UserScheduledMessage
}

interface KickoffRecord extends Kickoff {
  hashKey: string
  rangeKey: string
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
  Kickoff,
  KickoffRecord,
  KickoffOverflowActionId,
  KickoffOverflowValues,
  RetryKickoffActionId,
  RetryKickoffBlock,
  RetryKickoffValue,
  KickoffBlock,
};
