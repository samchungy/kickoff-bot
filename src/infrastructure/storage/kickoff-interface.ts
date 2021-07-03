import {GetCommand, PutCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {config} from 'config';
import {KickoffItem} from 'domain/kickoff';
import {client} from './dynamodb-client';

const createHashKey = (channelId: string) => `channel-${channelId}`;
const createRangeKey = (ts: string) => `timestamp-${ts}`;

const putKickoff = async (channelId: string, ts: string, eventTime: number, author: string) => {
  const item: KickoffItem = {
    hashKey: createHashKey(channelId),
    rangeKey: createRangeKey(ts),
    eventTime,
    author,
    users: {},
  };
  await client.send(new PutCommand({
    Item: item,
    TableName: config.dynamodb.tableName,
  }));
};

const addKickoffUser = async (channelId: string, ts: string, userId: string, messageId: string) => {
  await client.send(new UpdateCommand({
    Key: {
      hashKey: createHashKey(channelId),
      rangeKey: createRangeKey(ts),
    },
    TableName: config.dynamodb.tableName,
    ConditionExpression: 'attribute_not_exists(#user.#userId)',
    ExpressionAttributeValues: {
      ':messageId': messageId,
    },
    ExpressionAttributeNames: {
      '#user': 'user',
      '#userId': userId,
    },
    UpdateExpression: '#user.#userId = :messageId',
  }));
};

const getKickoff = async (channelId: string, ts: string) => {
  const payload = await client.send(new GetCommand({
    Key: {
      hashKey: createHashKey(channelId),
      rangeKey: createRangeKey(ts),
    },
    TableName: config.dynamodb.tableName,
  }));
  return payload.Item as KickoffItem | undefined;
};

export {addKickoffUser, getKickoff, putKickoff};
