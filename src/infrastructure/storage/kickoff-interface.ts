import {GetCommand, PutCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {config} from 'config';
import {HashRangeKey} from 'domain/db';
import {KickoffItem} from 'domain/kickoff';
import {client} from './dynamodb-client';

const putKickoff = async (item: KickoffItem) => {
  await client.send(new PutCommand({
    Item: item,
    TableName: config.dynamodb.tableName,
  }));
};

const addKickoffUser = async (key: HashRangeKey, userId: string, messageId: string) => {
  await client.send(new UpdateCommand({
    Key: key,
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

const removeKickoffUser = async (key: HashRangeKey, userId: string) => {
  await client.send(new UpdateCommand({
    Key: key,
    TableName: config.dynamodb.tableName,
    ConditionExpression: 'attribute_exists(#user.#userId)',
    ExpressionAttributeNames: {
      '#user': 'user',
      '#userId': userId,
    },
    UpdateExpression: 'REMOVE #user.#userId',
  }));
};

const getKickoff = async (key: HashRangeKey) => {
  const payload = await client.send(new GetCommand({
    Key: key,
    TableName: config.dynamodb.tableName,
  }));
  return payload.Item as KickoffItem | undefined;
};

export {addKickoffUser, getKickoff, putKickoff, removeKickoffUser};
