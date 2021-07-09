import {RemoveKickoffEvent} from 'domain/events';
import {invokeAsync} from 'infrastructure/lambda-gateway';

const invokeRemoveKickoff = async (payload: RemoveKickoffEvent) => {
  await invokeAsync({functionName: 'remove-kickoff', payload});
};

export {
  invokeRemoveKickoff,
};
