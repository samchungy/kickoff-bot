import {AddUserReminderEvent, PostKickoffEvent} from './events';
interface BaseFunctionInterface {
  functionName: string
  payload: Record<string, unknown>
}

interface PostKickOffFunction extends BaseFunctionInterface {
  functionName: 'post-kickoff'
  payload: PostKickoffEvent
}

interface RetryKickoffFunction extends BaseFunctionInterface {
  functionName: 'retry-kickoff'
  payload: PostKickoffEvent
}

interface AddUserReminderFunction extends BaseFunctionInterface {
  functionName: 'add-user-reminder'
  payload: AddUserReminderEvent
}

type FunctionInput = PostKickOffFunction | RetryKickoffFunction | AddUserReminderFunction

export {FunctionInput};
