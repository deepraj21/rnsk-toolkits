import { tool } from 'ai';
import { z } from 'zod';
import { PutReplicationConfigurationCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutReplicationConfiguration = tool({
  description: 'Create or update the replication configuration for the registry. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationConfiguration: z.record(z.any()).describe('The replication configuration'),
  }),
  execute: async ({ awsCredentials, region, replicationConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutReplicationConfigurationCommand({
          replicationConfiguration: replicationConfiguration,
      } as any);
      const response = await client.send(command);
      return {
                  replicationConfiguration: response.replicationConfiguration,
              };
    } catch (err) {
      return { error: 'Failed to create or update the replication configuration for the registry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
