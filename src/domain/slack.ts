import {BasicSlackEvent, BlockAction, BlockElementAction, Option, ReactionAddedEvent, ReactionRemovedEvent, SlashCommand, ViewOutput, ViewStateValue, ViewSubmitAction} from '@slack/bolt';

import {ActionsBlock, Block, InputBlock, KnownBlock, Overflow, SectionBlock, View} from '@slack/types';
import {APIGatewayEvent} from 'aws-lambda';
import {KickoffOverflowActionId, RetryKickoffActionId} from './kickoff';
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

interface Value<V> {
  value: V
}

interface SlackActionsBlock<A> extends Omit<ActionsBlock, 'elements'>{
  elements: (ActionsBlock['elements'][0] & ActionId<A>)[]
}

interface SlackOverflow<V> extends Omit<Overflow, 'options'>{
  options: (Option & Value<V>)[]
}

interface SlackSectionActionBlock<A, V> extends Omit<SectionBlock, 'accessory'>{
  accessory?: (Exclude<SectionBlock['accessory'], Overflow> | SlackOverflow<V>) & ActionId<A>
}

interface SlackInputBlock<I> extends Omit<InputBlock, 'element'> {
  element: InputBlock['element'] & ActionId<I>
}

type SlackBlockWithAction<A, V> = Exclude<KnownBlock, ActionsBlock | SectionBlock> | SlackActionsBlock<A> | SlackSectionActionBlock<A, V> | Block

type SlackBlockWithInput<I> = Exclude<KnownBlock, InputBlock> | SlackInputBlock<I> | Block

type SlackBlock = (KnownBlock | Block);

type SlackBlocks = SlackBlock[];

interface SlackView<B, I> extends Omit<View, 'blocks'> {
  callback_id: ViewCallback
  blocks: (SlackBlockWithInput<I> & BlockId<B>)[]
}

type SlackViewValues<B extends string, A extends string> = ViewOutput['state']['values'] | Record<B, Record<A, ViewStateValue>>

type SlackBlockActionElement = BlockElementAction & {
  action_id: RetryKickoffActionId | KickoffOverflowActionId
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
  SlackSectionActionBlock,
  SlackView,
  SlackViewAction,
  SlackViewValues,
};
