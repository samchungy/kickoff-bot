import {ErrorCode, View, WebClient} from '@slack/web-api';
import {logger} from 'lib';
import {config} from 'config';
import {SlackBlocks} from 'domain/slack';

const client = new WebClient();

const handleCall = async (apiCall: Function, activity: string) => {
  try {
    await apiCall();
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, `Failed to ${activity} in Slack`);
    } else {
      logger.error(error, `Failed to ${activity} in Slack`);
    }

    throw error;
  }
};

const openModal = async (triggerId: string, view: View) => await handleCall(() => client.views.open({
  trigger_id: triggerId,
  view,
  token: config.slack.token,
}), 'open modal');

const updateModal = async (viewId: string, view: View) => await handleCall(() => client.views.update({
  view_id: viewId,
  view,
  token: config.slack.token,
}), 'update modal');

const fetchUserInfo = async (userId: string) => await handleCall(() => client.users.info({
  user: userId,
  token: config.slack.token,
}), 'get user info');

const sendEphemeralMessage = async (
  userId: string,
  channelId: string,
  message: string,
  blocks?: SlackBlocks,
) => await handleCall(() => client.chat.postEphemeral({
  channel: channelId,
  user: userId,
  text: message,
  blocks,
  token: config.slack.token,
}), 'send ephemeral message');

const sendMessage = async (
  sendTo: string,
  message: string,
  blocks?: SlackBlocks,
) => await handleCall(() => client.chat.postMessage({
  channel: sendTo,
  text: message,
  blocks,
  token: config.slack.token,
}), 'send message');

const scheduleMessage = async (
  sendTo: string,
  postAt: number,
  message: string,
  blocks?: SlackBlocks,
) => await handleCall(() => client.chat.scheduleMessage({
  channel: sendTo,
  text: message,
  blocks,
  post_at: postAt,
  token: config.slack.token,
}), 'schedule message');

const deleteScheduledMessage = async (sendTo: string, messageId: string) => await handleCall(() => client.chat.deleteScheduledMessage({
  channel: sendTo,
  scheduled_message_id: messageId,
  token: config.slack.token,
}), 'delete scheduled message');

const deleteMessage = async (sendTo: string, ts: string) => await handleCall(() => client.chat.delete({
  channel: sendTo,
  ts,
  token: config.slack.token,
}), 'delete message');

export {deleteMessage, deleteScheduledMessage, fetchUserInfo, openModal, sendEphemeralMessage, updateModal, sendMessage, scheduleMessage};
