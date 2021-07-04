import {APIGatewayEvent, APIGatewayProxyHandler} from 'aws-lambda';
import {SlackEvent} from 'domain/slack';
import {logger} from 'lib';
import {slackAuthenticate} from 'lib/slack/authoriser';
import {eventCallbackHandler} from './event-callback';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context) => {
  logger.withRequest(event, context);
  await slackAuthenticate(event);
  const payload = JSON.parse(event.body as string) as SlackEvent;
  const getResponse = async () => {
    switch (payload.type) {
      case 'url_verification': {
        return JSON.stringify({
          challenge: payload.challenge,
        });
      }

      case 'event_callback': {
        return eventCallbackHandler(payload);
      }

      default: {
        logger.warn({payload}, 'Unknown Event');
        break;
      }
    }
  };

  return {
    statusCode: 200,
    body: await getResponse() || '',
  };
};
