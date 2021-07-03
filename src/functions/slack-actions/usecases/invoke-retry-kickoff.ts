import {PostKickoffEvent} from 'domain/events';
import {invokeAsync} from 'infrastructure/lambda-Interface';
import {openEmptyKickoffModal} from 'lib/kickoff/modal';

const invokeRetryKickoff = async (value: string, triggerId: string) => {
  const parsedValue = JSON.parse(value) as PostKickoffEvent;
  const viewId = await openEmptyKickoffModal(triggerId);

  await invokeAsync({functionName: 'retry-kickoff', payload: {...parsedValue, viewId}});
};

export {
  invokeRetryKickoff,
};
