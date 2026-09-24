import { tool } from 'ai';
import { z } from 'zod';
import { ListProvisionedConcurrencyConfigsCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaProvisionedConcurrencyConfigs = tool({
  description: 'List provisioned concurrency configurations for a function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    marker: z.string().optional().describe('Pagination token'),
    maxItems: z.number().optional().describe('Maximum number of configs to return'),
  }),
  execute: async ({ awsCredentials, region, functionName, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListProvisionedConcurrencyConfigsCommand({
          FunctionName: functionName,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  provisionedConcurrencyConfigs: response.ProvisionedConcurrencyConfigs?.map((c: any) => ({
                      functionArn: c.FunctionArn,
                      requestedProvisionedConcurrentExecutions: c.RequestedProvisionedConcurrentExecutions,
                      availableProvisionedConcurrentExecutions: c.AvailableProvisionedConcurrentExecutions,
                      allocatedProvisionedConcurrentExecutions: c.AllocatedProvisionedConcurrentExecutions,
                      status: c.Status,
                      statusReason: c.StatusReason,
                      lastModified: c.LastModified,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list provisioned concurrency configurations for a function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
