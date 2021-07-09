import {invokeAsync} from 'infrastructure/lambda-gateway';

const invokeAddUserReminder = async (channelId: string, userId: string, ts: string) => {
  await invokeAsync({
    functionName: 'add-user-reminder',
    payload: {
      channelId, userId, ts,
    },
  });
};

export {invokeAddUserReminder};
