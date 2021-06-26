import {BlockAction, SlashCommand, ViewOutput, ViewStateValue, ViewSubmitAction} from '@slack/bolt';

import {ActionsBlock, Block, KnownBlock, View} from '@slack/types';
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
  action_id?: A
}

type SlackActionsBlock<A> = ActionsBlock & {
  elements: (ActionsBlock['elements'][0] & ActionId<A>)[]
}

type SlackActionsBlocks<A> = (Exclude<KnownBlock, 'ActionsBlock'> | SlackActionsBlock<A> | Block)[]

type SlackBlock = (KnownBlock | Block);

type SlackBlocks = SlackBlock[];

interface SlackView<B> extends View {
  callback_id: ViewCallback
  blocks: (SlackBlock & BlockId<B>)[]
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
  SlackActionsBlocks,
  SlackBlocks,
  SlackBlockAction,
  SlashCommandAPIGatewayEvent,
  SlashCommand,
  SlackView,
  SlackViewAction,
  SlackViewValues,
};
