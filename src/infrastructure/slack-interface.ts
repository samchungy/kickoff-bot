import {ErrorCode, View, WebClient} from '@slack/web-api';
import {logger} from 'lib';
import {config} from 'config';
import {SlackBlocks} from 'domain/slack';

const client = new WebClient();

const openModal = async (triggerId: string, view: View) => {
  try {
    return await client.views.open({
      trigger_id: triggerId,
      view,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to open view in Slack');
    } else {
      logger.error(error, 'Failed to open view in Slack');
    }

    throw error;
  }
};

const updateModal = async (viewId: string, view: View) => {
  try {
    return await client.views.update({
      view_id: viewId,
      view,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to update view in Slack');
    } else {
      logger.error(error, 'Failed to update view in Slack');
    }

    throw error;
  }
};

const fetchUserInfo = async (userId: string) => {
  try {
    return await client.users.info({
      user: userId,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to get user info in Slack');
    } else {
      logger.error(error, 'Failed to get user info in Slack');
    }

    throw error;
  }
};

const sendEphemeralMessage = async (userId: string, channelId: string, message: string, blocks?: SlackBlocks) => {
  try {
    return await client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      text: message,
      blocks,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to send ephemeral message in Slack');
    } else {
      logger.error(error, 'Failed to send ephemeral message in Slack');
    }

    throw error;
  }
};

const sendMessage = async (sendTo: string, message: string, blocks?: SlackBlocks) => {
  try {
    return await client.chat.postMessage({
      channel: sendTo,
      text: message,
      blocks,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to send message in Slack');
    } else {
      logger.error(error, 'Failed to send message in Slack');
    }

    throw error;
  }
};

const scheduleMessage = async (sendTo: string, postAt: number, message: string, blocks?: SlackBlocks) => {
  try {
    return await client.chat.scheduleMessage({
      channel: sendTo,
      text: message,
      blocks,
      post_at: postAt,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to schedule message in Slack');
    } else {
      logger.error(error, 'Failed to schedule message in Slack');
    }

    throw error;
  }
};

const deleteScheduledMessage = async (sendTo: string, messageId: string) => {
  try {
    return await client.chat.deleteScheduledMessage({
      channel: sendTo,
      scheduled_message_id: messageId,
      token: config.slack.token,
    });
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      logger.error(error.data, 'Failed to delete scheduled message in Slack');
    } else {
      logger.error(error, 'Failed to delete scheduled message in Slack');
    }

    throw error;
  }
};

export {deleteScheduledMessage, fetchUserInfo, openModal, sendEphemeralMessage, updateModal, sendMessage, scheduleMessage};
