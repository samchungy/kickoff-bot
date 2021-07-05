import {handler} from './handler';
import {logger} from 'lib';
import {slackAuthenticate} from 'lib/slack/authoriser';
import {openKickoffModal} from './usecases/open-kickoff-modal';

import {SlashCommand, SlashCommandAPIGatewayEvent} from 'domain/slack';
import {Context} from 'aws-lambda';

jest.mock('lib');
jest.mock('lib/slack/authoriser');
jest.mock('./usecases/open-kickoff-modal');

const callback = () => {};

const sampleSlashCommand: SlashCommand = {
  token: 'XE3aPtpkxZh5fOUKGegkhKDS',
  team_id: 'TRVUTD7DM',
  team_domain: 'spotbottest',
  channel_id: 'C025RNKNB28',
  channel_name: 'kickoff',
  user_id: 'URVUTD7UP',
  user_name: 'samchungy',
  command: '/kickoff',
  text: '',
  api_app_id: 'A0254T2GSGP',
  is_enterprise_install: 'false',
  response_url: 'https://hooks.slack.com/commands/TRVUTD7DM/2246645353908/cxIduGuVYE0djWZAeBEV9pr1',
  trigger_id: '2233695126694.879979449463.f1ad7601f7099ffa486d1e12c90ec102',
};

beforeEach(jest.clearAllMocks);

it('should set the logger context using event and context', async () => {
  const event = {
    body: sampleSlashCommand,
  } as SlashCommandAPIGatewayEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(logger.withRequest).toBeCalledWith(event, context);
});

it('should call the slack authenticate method with the event', async () => {
  const event = {
    body: sampleSlashCommand,
  } as SlashCommandAPIGatewayEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(slackAuthenticate).toBeCalledWith(event);
});

it('should call our open kickoff modal usecase with the body', async () => {
  const event = {
    body: sampleSlashCommand,
  } as SlashCommandAPIGatewayEvent;
  const context = {} as Context;

  await handler(event, context, callback);

  expect(openKickoffModal).toBeCalledWith(event.body);
});
