import { tool } from 'ai';
import { z } from 'zod';
import { PutProvisionedConcurrencyConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsPutLambdaProvisionedConcurrencyConfig = tool({
  description: 'Configure provisioned concurrency for a function version. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    qualifier: z.string().describe('Version or alias qualifier'),
    provisionedConcurrentExecutions: z.number().describe('Number of concurrent executions'),
  }),
  execute: async ({ awsCredentials, region, functionName, qualifier, provisionedConcurrentExecutions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new PutProvisionedConcurrencyConfigCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
          ProvisionedConcurrentExecutions: provisionedConcurrentExecutions,
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
      return { error: 'Failed to configure provisioned concurrency for a function version', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
