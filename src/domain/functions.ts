import {UserReminderEvent, KickoffEvent, RemoveKickoffEvent} from './events';
interface BaseFunctionInterface {
  functionName: string
  payload: Record<string, unknown>
}

// Kickoff
interface PostKickOffFunction extends BaseFunctionInterface {
  functionName: 'post-kickoff'
  payload: KickoffEvent
}

interface RetryKickoffFunction extends BaseFunctionInterface {
  functionName: 'retry-kickoff'
  payload: KickoffEvent
}

interface RemoveKickoffFunction extends BaseFunctionInterface {
  functionName: 'remove-kickoff',
  payload: RemoveKickoffEvent
}
// Reminders

interface AddUserReminderFunction extends BaseFunctionInterface {
  functionName: 'add-user-reminder'
  payload: UserReminderEvent
}

interface RemoveUserReminderFunction extends BaseFunctionInterface {
  functionName: 'remove-user-reminder'
  payload: UserReminderEvent
}

type FunctionInput = PostKickOffFunction | RetryKickoffFunction | AddUserReminderFunction | RemoveUserReminderFunction | RemoveKickoffFunction

export {FunctionInput};
