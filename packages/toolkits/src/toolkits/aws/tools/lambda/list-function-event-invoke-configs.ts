import { tool } from 'ai';
import { z } from 'zod';
import { ListFunctionEventInvokeConfigsCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaFunctionEventInvokeConfigs = tool({
  description: 'List async invocation configurations for a Lambda function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    maxItems: z.number().optional().describe('Maximum number of configs to return'),
  }),
  execute: async ({ awsCredentials, region, functionName, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListFunctionEventInvokeConfigsCommand({
          FunctionName: functionName,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  functionEventInvokeConfigs: response.FunctionEventInvokeConfigs?.map((c: any) => ({
                      functionArn: c.FunctionArn,
                      lastModified: c.LastModified,
                      maximumRetryAttempts: c.MaximumRetryAttempts,
                      maximumEventAgeInSeconds: c.MaximumEventAgeInSeconds,
                      destinationConfig: c.DestinationConfig,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list async invocation configurations for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
