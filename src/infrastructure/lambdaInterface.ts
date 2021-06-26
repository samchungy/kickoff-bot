import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {config} from 'config';
import {FunctionName} from 'domain/functions';

const client = new LambdaClient(config.lambda.opts);

const invokeAsync = (
  functionName: FunctionName,
  payload: Record<string, unknown>,
) =>
  client.send(
    new InvokeCommand({
      InvocationType: 'Event',
      Payload: Buffer.from(JSON.stringify(payload), 'utf8'),
      FunctionName: config.lambda.prefix + functionName,
    }),
  );

export {invokeAsync};
