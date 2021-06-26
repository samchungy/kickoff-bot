import {PostKickoffEvent} from './events';
import {SlackActionsBlocks} from './slack';

interface KickoffItem extends PostKickoffEvent {
  hashKey: string
  sortKey: string
}

type RetryKickoffBlocks = SlackActionsBlocks<'retry'>

export {
  KickoffItem,
  RetryKickoffBlocks,
};
