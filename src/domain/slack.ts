import {BlockAction, SlashCommand, ViewOutput, ViewStateValue, ViewSubmitAction} from '@slack/bolt';

import {ActionsBlock, Block, InputBlock, KnownBlock, View} from '@slack/types';
import {APIGatewayEvent} from 'aws-lambda';
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

interface SlackBlockAction extends BlockAction {}

interface SlackViewSubmit extends ViewOutput {
  callback_id: ViewCallback
}

interface SlackViewAction extends ViewSubmitAction {
  view: SlackViewSubmit
}

export {
  SlackBlocks,
  SlackBlockAction,
  SlackBlockWithAction,
  SlashCommandAPIGatewayEvent,
  SlashCommand,
  SlackView,
  SlackViewAction,
  SlackViewValues,
};
