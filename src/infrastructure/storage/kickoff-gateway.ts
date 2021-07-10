import {GetCommand, PutCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {config} from 'config';
import {HashRangeKey} from 'domain/db';
import {Kickoff, KickoffRecord} from 'domain/kickoff';
import {client} from './dynamodb-client';

const createHashKey = (channelId: string) => `channel-${channelId}`;
const createRangeKey = (ts: string) => `timestamp-${ts}`;

const createHashRangeKey = (channelId: string, ts: string): HashRangeKey => ({
  hashKey: createHashKey(channelId),
  rangeKey: createRangeKey(ts),
});

const putKickoff = async (channelId: string, ts: string, kickoff: Kickoff) => {
  const item: KickoffRecord = {
    ...createHashRangeKey(channelId, ts),
    ...kickoff,
  };
  await client.send(new PutCommand({
    Item: item,
    TableName: config.dynamodb.tableName,
  }));
};

const addKickoffUser = async (channelId: string, ts: string, userId: string, messageId: string) => {
  await client.send(new UpdateCommand({
    Key: createHashRangeKey(channelId, ts),
    TableName: config.dynamodb.tableName,
    ConditionExpression: 'attribute_not_exists(#users.#userId)',
    ExpressionAttributeValues: {
      ':messageId': messageId,
    },
    ExpressionAttributeNames: {
      '#users': 'users',
      '#userId': userId,
    },
    UpdateExpression: 'SET #users.#userId = :messageId',
  }));
};

const removeKickoffUser = async (channelId: string, ts: string, userId: string) => {
  await client.send(new UpdateCommand({
    Key: createHashRangeKey(channelId, ts),
    TableName: config.dynamodb.tableName,
    ConditionExpression: 'attribute_exists(#user.#userId)',
    ExpressionAttributeNames: {
      '#user': 'user',
      '#userId': userId,
    },
    UpdateExpression: 'REMOVE #user.#userId',
  }));
};

const getKickoff = async (channelId: string, ts: string) => {
  const payload = await client.send(new GetCommand({
    Key: createHashRangeKey(channelId, ts),
    TableName: config.dynamodb.tableName,
  }));
  return payload.Item as KickoffRecord | undefined;
};

export {addKickoffUser, getKickoff, putKickoff, removeKickoffUser};
