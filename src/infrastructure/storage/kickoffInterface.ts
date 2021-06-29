import {PutCommand} from '@aws-sdk/lib-dynamodb';
import {config} from 'config';
import {PostKickoffEvent} from 'domain/events';
import {KickoffItem} from 'domain/kickoff';
import {client} from './dynamodbClient';

const createHashKey = (teamId: string, channelId: string) => `${teamId}-${channelId}`;

const putKickoff = async (teamId: string, channelId: string, viewId: string, kickoff: PostKickoffEvent): Promise<KickoffItem> => {
  const item: KickoffItem = {
    hashKey: createHashKey(teamId, channelId),
    rangeKey: viewId,
    ...kickoff,
  };
  await client.send(new PutCommand({
    Item: item,
    TableName: config.dynamodb.tableName,
  }));

  return item;
};

export {putKickoff};
