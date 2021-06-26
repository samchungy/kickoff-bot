import {logger} from 'lib';
import crypto from 'crypto';
import {SlashCommandAPIGatewayEvent} from 'domain/slack';
import {APIGatewayEvent} from 'aws-lambda';
import {config} from 'config';

interface SlackAuthenticator {
  (event: SlashCommandAPIGatewayEvent | APIGatewayEvent): Promise<void>;
}

const slackAuthenticate: SlackAuthenticator = async event => {
  const slackSignature = event.headers['X-Slack-Signature'];
  const timestamp = parseInt(
    event.headers['X-Slack-Request-Timestamp'] || '',
    10,
  );
  const time = Math.floor(Date.now() / 1000);

  const bodyString = typeof event.body === 'object' ? new URLSearchParams(event.body as Record<string, string>).toString() : event.body;

  if (
    !Number.isNaN(timestamp)
    && Math.abs(time - timestamp) <= 300
    && slackSignature
  ) {
    const sigBasestring = `v0:${timestamp}:${bodyString}`;
    const mySignature = `v0=${crypto
      .createHmac('sha256', config.slack.secret)
      .update(sigBasestring, 'utf8')
      .digest('hex')}`;
    if (
      !crypto.timingSafeEqual(
        Buffer.from(mySignature, 'utf8'),
        Buffer.from(slackSignature, 'utf8'),
      )
    ) {
      logger.error(
        {timestamp, slackSignature},
        'Slack Signing Signature Error',
      );
      throw new Error('Slack Signing Signature Error');
    }

    return;
  }

  logger.error(
    {timestamp, slackSignature},
    'Slack timestamp expired',
  );
  throw new Error('Slack timestamp expired');
};

export {slackAuthenticate};
