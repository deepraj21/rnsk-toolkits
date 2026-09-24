import { tool } from 'ai';
import { z } from 'zod';
import { PutFunctionEventInvokeConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsPutLambdaFunctionEventInvokeConfig = tool({
  description: 'Configure async invocation settings for a Lambda function. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
    maximumRetryAttempts: z.number().optional().describe('Maximum retry attempts'),
    maximumEventAgeInSeconds: z.number().optional().describe('Maximum event age in seconds'),
    destinationConfig: z.record(z.any()).optional().describe('Destination configuration for success/failure'),
  }),
  execute: async ({ awsCredentials, region, functionName, qualifier, maximumRetryAttempts, maximumEventAgeInSeconds, destinationConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new PutFunctionEventInvokeConfigCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
          MaximumRetryAttempts: maximumRetryAttempts,
          MaximumEventAgeInSeconds: maximumEventAgeInSeconds,
          DestinationConfig: destinationConfig,
      });
      const response = await client.send(command);
      return {
                  functionArn: response.FunctionArn,
                  lastModified: response.LastModified,
                  maximumRetryAttempts: response.MaximumRetryAttempts,
                  maximumEventAgeInSeconds: response.MaximumEventAgeInSeconds,
                  destinationConfig: response.DestinationConfig,
              };
    } catch (err) {
      return { error: 'Failed to configure async invocation settings for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
