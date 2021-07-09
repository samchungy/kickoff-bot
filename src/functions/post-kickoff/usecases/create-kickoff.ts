import {KickoffEvent} from 'domain/events';
import {Kickoff} from 'domain/kickoff';

const createKickoff = (event: KickoffEvent, ts: string, userId: string, time: number): Kickoff => ({
  domain: event.metadata.domain,
  eventTime: time,
  author: userId,
  users: {},
});

export {
  createKickoff,
};
