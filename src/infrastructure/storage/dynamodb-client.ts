import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import {config} from 'config';

const dynamoDbClient = new DynamoDBClient(config.dynamodb.opts);
const client = DynamoDBDocumentClient.from(dynamoDbClient);

export {client};
