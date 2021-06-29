import {PostKickoffEvent} from './events';
import {SlackBlockWithAction} from './slack';

interface KickoffItem extends PostKickoffEvent {
  hashKey: string
  rangeKey: string
}

type RetryKickoffBlock = SlackBlockWithAction<'retry'>

export {
  KickoffItem,
  RetryKickoffBlock,
};
