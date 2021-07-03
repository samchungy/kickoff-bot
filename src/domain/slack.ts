import {BasicSlackEvent, BlockAction, BlockElementAction, ReactionAddedEvent, ReactionRemovedEvent, SlashCommand, ViewOutput, ViewStateValue, ViewSubmitAction} from '@slack/bolt';

import {ActionsBlock, Block, InputBlock, KnownBlock, View} from '@slack/types';
import {APIGatewayEvent} from 'aws-lambda';
import {RetryKickoffActionId} from './kickoff';
import {KickoffCallbackId} from './kickoff-modal';
interface SlashCommandAPIGatewayEvent extends Omit<APIGatewayEvent, 'body'> {
  body: SlashCommand
}

type ViewCallback = KickoffCallbackId

interface BlockId<B> {
  block_id?: B
}

interface ActionId<A> {
  action_id: A
}

interface SlackActionsBlock<A> extends Omit<ActionsBlock, 'elements'>{
  elements: (ActionsBlock['elements'][0] & ActionId<A>)[]
}

interface SlackInputBlock<I> extends Omit<InputBlock, 'element'> {
  element: InputBlock['element'] & ActionId<I>
}

type SlackBlockWithAction<A> = Exclude<KnownBlock, ActionsBlock> | SlackActionsBlock<A> | Block

type SlackBlockWithInput<I> = Exclude<KnownBlock, InputBlock> | SlackInputBlock<I> | Block

type SlackBlock = (KnownBlock | Block);

type SlackBlocks = SlackBlock[];

interface SlackView<B, I> extends Omit<View, 'blocks'> {
  callback_id: ViewCallback
  blocks: (SlackBlockWithInput<I> & BlockId<B>)[]
}

type SlackViewValues<B extends string, A extends string> = ViewOutput['state']['values'] | Record<B, Record<A, ViewStateValue>>

type SlackBlockActionElement = BlockElementAction & {
  action_id: RetryKickoffActionId
}

interface SlackBlockAction extends Omit<BlockAction, 'actions'> {
  actions: SlackBlockActionElement[]
}

interface SlackViewSubmit extends ViewOutput {
  callback_id: ViewCallback
}

interface SlackViewAction extends ViewSubmitAction {
  view: SlackViewSubmit
}

interface SlackChallengeEvent {
  type: 'url_verification',
  token: string
  challenge: string
}

// Taken from Bolt
interface SlackEnvelopedEvent<Event = BasicSlackEvent> extends Record<string, unknown> {
  token: string;
  team_id: string;
  enterprise_id?: string;
  api_app_id: string;
  event: Event;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  // TODO: the two properties below are being deprecated on Feb 24, 2021
  authed_users?: string[];
  authed_teams?: string[];
  is_ext_shared_channel?: boolean;
  authorizations?: Authorization[];
}

interface Authorization {
  enterprise_id: string | null;
  team_id: string | null;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install?: boolean;
}

type SlackCallbackEvent = SlackEnvelopedEvent<ReactionAddedEvent> | SlackEnvelopedEvent<ReactionRemovedEvent>

type SlackEvent = SlackChallengeEvent | SlackCallbackEvent

export {
  SlackBlocks,
  SlackBlockAction,
  SlackBlockWithAction,
  SlashCommandAPIGatewayEvent,
  SlashCommand,
  SlackCallbackEvent,
  SlackEnvelopedEvent,
  SlackEvent,
  SlackView,
  SlackViewAction,
  SlackViewValues,
};
