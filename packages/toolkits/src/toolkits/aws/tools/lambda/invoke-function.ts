import { tool } from 'ai';
import { z } from 'zod';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsInvokeLambdaFunction = tool({
  description: 'Invoke a Lambda function synchronously or asynchronously.. Use it to execute the function.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    payload: z.string().optional().describe('JSON string payload for the function'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
    invocationType: z.string().optional().describe('Invocation type: RequestResponse, Event, DryRun'),
  }),
  execute: async ({ awsCredentials, region, functionName, payload, qualifier, invocationType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new InvokeCommand({
          FunctionName: functionName,
          Payload: payload ? Buffer.from(payload) : undefined,
          Qualifier: qualifier,
          InvocationType: invocationType as any,
      });
      const response = await client.send(command);
      const result = response.Payload ? await response.Payload.transformToString() : '';
      return {
                  statusCode: response.StatusCode,
                  executedVersion: response.ExecutedVersion,
                  functionError: response.FunctionError,
                  logResult: response.LogResult,
                  result: result,
              };
    } catch (err) {
      return { error: 'Failed to invoke a Lambda function synchronously or asynchronously', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
