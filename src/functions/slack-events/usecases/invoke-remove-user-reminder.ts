import {invokeAsync} from 'infrastructure/lambda-gateway';

const invokeRemoveUserReminder = async (channelId: string, userId: string, ts: string) => {
  await invokeAsync({
    functionName: 'remove-user-reminder',
    payload: {
      channelId, userId, ts,
    },
  });
};

export {invokeRemoveUserReminder};
