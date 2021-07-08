import {HashRangeKey} from 'domain/db';

const createHashKey = (channelId: string) => `channel-${channelId}`;
const createRangeKey = (ts: string) => `timestamp-${ts}`;

const createHashRangeKey = (channelId: string, ts: string): HashRangeKey => ({
  hashKey: createHashKey(channelId),
  rangeKey: createRangeKey(ts),
});

export {createHashKey, createRangeKey, createHashRangeKey};
