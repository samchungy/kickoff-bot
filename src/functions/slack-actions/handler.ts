import {logger} from 'lib';
import {slackAuthenticate} from 'lib/slack/authoriser';
import {APIGatewayEvent, APIGatewayProxyHandler} from 'aws-lambda';

import {viewSubmissionHandler} from './view-submission';
import {blockActionsHandler} from './block-actions';
import {SlackBlockAction, SlackViewAction} from 'domain/slack';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context) => {
  logger.withRequest(event, context);
  await slackAuthenticate(event);
  const eventBody = Object.fromEntries(new URLSearchParams(event.body as string).entries());
  const payload = JSON.parse(eventBody.payload) as SlackViewAction | SlackBlockAction;

  const getResponse = async () => {
    switch (payload.type) {
      case 'view_submission': {
        return viewSubmissionHandler(payload);
      }

      case 'block_actions': {
        return blockActionsHandler(payload);
      }

      default: {
        logger.warn({payload}, 'Unknown Action');
        break;
      }
    }
  };

  return {
    statusCode: 200,
    body: await getResponse() || '',
  };
};
