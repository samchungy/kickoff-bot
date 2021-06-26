import {ErrorCode, View, WebClient} from '@slack/web-api';
import {logger} from 'lib';
import {config} from 'config';
import {SlackBlocks} from 'domain/slack';

const client = new WebClient(config.slack.token);

const openModal = async (triggerId: string, view: View) => {
  try {
    return await client.views.open({
      trigger_id: triggerId,
      view,
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

export {fetchUserInfo, openModal, sendEphemeralMessage, updateModal, sendMessage};
