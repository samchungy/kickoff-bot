import {KickoffEvent} from 'domain/events';
import {KickoffItem} from 'domain/kickoff';
import {createHashKey, createRangeKey} from 'lib/kickoff/keys';

const createKickoffMetadata = (event: KickoffEvent, ts: string, userId: string, time: number): KickoffItem => ({
  hashKey: createHashKey(event.values.channelId),
  rangeKey: createRangeKey(ts),
  domain: event.metadata.domain,
  eventTime: time,
  author: userId,
  users: {},
});

export {
  createKickoffMetadata,
};
