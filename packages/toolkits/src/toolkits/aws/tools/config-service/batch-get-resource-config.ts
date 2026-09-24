import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetResourceConfigCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsBatchGetResourceConfig = tool({
  description: 'Returns the current configuration for one or more requested resources. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceKeys: z.array(z.record(z.any())).describe('List of resource keys'),
  }),
  execute: async ({ awsCredentials, region, resourceKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new BatchGetResourceConfigCommand({
          resourceKeys: resourceKeys,
      } as any);
      const response = await client.send(command);
      return {
                  baseConfigurationItems: response.baseConfigurationItems || [],
                  unprocessedResourceKeys: response.unprocessedResourceKeys || [],
              };
    } catch (err) {
      return { error: 'Failed to returns the current configuration for one or more requested resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
