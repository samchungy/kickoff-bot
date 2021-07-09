import {mocked} from 'ts-jest/utils';
import {openKickoffModal} from './open-kickoff-modal';
import {fetchUserInfo, sendMessage} from 'infrastructure/slack-gateway';
import {openEmptyKickoffModal, updateKickoffModal} from 'lib/kickoff/modal';

import {SlashCommand} from 'domain/slack';
import {UsersInfoResponse} from '@slack/web-api';
import {logger} from 'lib';
import {KickoffMetadata} from 'domain/kickoff-modal';

jest.mock('lib');
jest.mock('lib/kickoff/modal');
jest.mock('infrastructure/slack-gateway');

const sampleViewId = 'VMHU10V25';

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
  response_url:
    'https://hooks.slack.com/commands/TRVUTD7DM/2246645353908/cxIduGuVYE0djWZAeBEV9pr1',
  trigger_id: '2233695126694.879979449463.f1ad7601f7099ffa486d1e12c90ec102',
};

const sampleUserInfo = (tzLabel: string, tz: string): UsersInfoResponse => ({
  ok: true,
  user: {
    id: 'W012A3CDE',
    team_id: 'T012AB3C4',
    name: 'spengler',
    deleted: false,
    color: '9f69e7',
    real_name: 'Egon Spengler',
    tz,
    tz_label: tzLabel,
    tz_offset: -25200,
    profile: {
      avatar_hash: 'ge3b51ca72de',
      status_text: 'Print is dead',
      status_emoji: ':books:',
      real_name: 'Egon Spengler',
      display_name: 'spengler',
      real_name_normalized: 'Egon Spengler',
      display_name_normalized: 'spengler',
      email: 'spengler@ghostbusters.example.com',
      image_original: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      image_24: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      image_32: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      image_48: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      image_72: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      image_192: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      image_512: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
      team: 'T012AB3C4',
    },
    is_admin: true,
    is_owner: false,
    is_primary_owner: false,
    is_restricted: false,
    is_ultra_restricted: false,
    is_bot: false,
    updated: 1502138686,
    is_app_user: false,
    has_2fa: false,
  },
});

beforeAll(() => {
  jest.useFakeTimers('modern');
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  jest.resetAllMocks();

  // Defaults
  const userInfo = sampleUserInfo('UTC', 'UTC');
  jest.setSystemTime(new Date('2021-01-01T00:00:00'));
  mocked(openEmptyKickoffModal).mockResolvedValue(sampleViewId);
  mocked(fetchUserInfo).mockResolvedValue(userInfo);
});

it('should call openEmptyKickoffModal with a triggerId', async () => {
  await expect(openKickoffModal(sampleSlashCommand)).resolves.toBeUndefined();

  expect(openEmptyKickoffModal).toBeCalledWith(sampleSlashCommand.trigger_id);
  expect(logger.error).not.toBeCalled();
});

it('should call fetchUserInfo with a userId', async () => {
  await expect(openKickoffModal(sampleSlashCommand)).resolves.toBeUndefined();

  expect(fetchUserInfo).toBeCalledWith(sampleSlashCommand.user_id);
  expect(logger.error).not.toBeCalled();
});

it('should call openEmptyKickoffModal with all the correct inputs', async () => {
  const expectedMetadata: KickoffMetadata = {
    timezone: 'UTC',
    domain: 'spotbottest',
  };

  const expectedInputs = {
    viewId: sampleViewId,
    metadata: expectedMetadata,
    initialDate: '2021-01-01',
    initialTime: '00:15',
    timezone: '(UTC +00:00) UTC',
  };

  await expect(openKickoffModal(sampleSlashCommand)).resolves.toBeUndefined();

  expect(updateKickoffModal).toBeCalledWith(expectedInputs);
  expect(logger.error).not.toBeCalled();
});

it.each([{
  it: 'should round up the initial time to 00:15 when time is 00:00',
  currentTime: '2021-01-01T00:00:00',
  userInfo: sampleUserInfo('UTC', 'UTC'),
  expected: {
    initialDate: '2021-01-01',
    initialTime: '00:15',
    timezone: '(UTC +00:00) UTC',
  },
},
{
  it: 'should round up the initial time to 00:30 when time is 00:01',
  currentTime: '2021-01-01T00:01:00',
  userInfo: sampleUserInfo('UTC', 'UTC'),
  expected: {
    initialDate: '2021-01-01',
    initialTime: '00:30',
    timezone: '(UTC +00:00) UTC',
  },
},
{
  it: 'should round up the initial time to 00:45 when time is 00:29',
  currentTime: '2021-01-01T00:29:00',
  userInfo: sampleUserInfo('UTC', 'UTC'),
  expected: {
    initialDate: '2021-01-01',
    initialTime: '00:45',
    timezone: '(UTC +00:00) UTC',
  },
},
{
  it: 'should round up the initial time to 01:00 when time is 00:45',
  currentTime: '2021-01-01T00:45:00',
  userInfo: sampleUserInfo('UTC', 'UTC'),
  expected: {
    initialDate: '2021-01-01',
    initialTime: '01:00',
    timezone: '(UTC +00:00) UTC',
  },
},
{
  it: 'should correctly convert the time to a specific timezone',
  currentTime: '2021-01-01T00:00:00',
  userInfo: sampleUserInfo('Australian Eastern Standard Time', 'Australia/Melbourne'),
  expected: {
    initialDate: '2021-01-01',
    initialTime: '11:15',
    timezone: '(UTC +11:00) Australian Eastern Standard Time',
  },
}])('$it', async ({currentTime, expected, userInfo}) => {
  mocked(fetchUserInfo).mockResolvedValue(userInfo);
  jest.setSystemTime(new Date(currentTime));
  await expect(openKickoffModal(sampleSlashCommand)).resolves.toBeUndefined();

  expect(updateKickoffModal).toBeCalledWith(expect.objectContaining(expected));
  expect(logger.error).not.toBeCalled();
});

it('should log an error and return a message to the user when something fails', async () => {
  mocked(openEmptyKickoffModal).mockRejectedValue(new Error());

  await expect(openKickoffModal(sampleSlashCommand)).resolves.toBeUndefined();

  expect(sendMessage).toBeCalledWith(sampleSlashCommand.user_id, ':white_frowning_face: Something went wrong! Please try again');
  expect(logger.error).toBeCalled();
});
