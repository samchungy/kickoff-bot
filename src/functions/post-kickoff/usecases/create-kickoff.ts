import {KickoffEvent} from 'domain/events';
import {Kickoff} from 'domain/kickoff';

const createKickoff = (event: KickoffEvent, ts: string, time: number): Kickoff => ({
  channelId: event.values.channelId,
  ts,
  domain: event.metadata.domain,
  eventTime: time,
  author: event.userId,
  users: {},
});

export {
  createKickoff,
};
