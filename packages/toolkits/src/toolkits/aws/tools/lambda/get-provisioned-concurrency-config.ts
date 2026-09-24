import { tool } from 'ai';
import { z } from 'zod';
import { GetProvisionedConcurrencyConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsGetLambdaProvisionedConcurrencyConfig = tool({
  description: 'Get provisioned concurrency configuration for a function version. Use it to inspect current state before making changes.',
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

      const command = new GetProvisionedConcurrencyConfigCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
      });
      const response = await client.send(command);
      return {
                  requestedProvisionedConcurrentExecutions: response.RequestedProvisionedConcurrentExecutions,
                  availableProvisionedConcurrentExecutions: response.AvailableProvisionedConcurrentExecutions,
                  allocatedProvisionedConcurrentExecutions: response.AllocatedProvisionedConcurrentExecutions,
                  status: response.Status,
                  statusReason: response.StatusReason,
                  lastModified: response.LastModified,
              };
    } catch (err) {
      return { error: 'Failed to get provisioned concurrency configuration for a function version', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
