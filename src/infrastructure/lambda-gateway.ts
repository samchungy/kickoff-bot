import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {config} from 'config';
import {FunctionInput} from 'domain/functions';

const client = new LambdaClient(config.lambda.opts);

const invokeAsync = (input: FunctionInput) =>
  client.send(
    new InvokeCommand({
      InvocationType: 'Event',
      Payload: Buffer.from(JSON.stringify(input.payload), 'utf8'),
      FunctionName: config.lambda.prefix + input.functionName,
    }),
  );

export {invokeAsync};
