import { tool } from 'ai';
import { z } from 'zod';
import { DeleteProvisionedConcurrencyConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsDeleteLambdaProvisionedConcurrencyConfig = tool({
  description: 'Delete provisioned concurrency configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    qualifier: z.string().describe('Version or alias qualifier'),
  }),
  execute: async ({ awsCredentials, region, functionName, qualifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new DeleteProvisionedConcurrencyConfigCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Provisioned concurrency config deleted successfully for function ${functionName}:${qualifier}`,
              };
    } catch (err) {
      return { error: 'Failed to delete provisioned concurrency configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
