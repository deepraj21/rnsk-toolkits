import { tool } from 'ai';
import { z } from 'zod';
import { ModifyGlobalClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsModifyGlobalCluster = tool({
  description: 'Modify an Aurora Global Database cluster. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalClusterIdentifier: z.string().describe('Global cluster identifier to modify'),
    newGlobalClusterIdentifier: z.string().optional().describe('New global cluster identifier'),
    deletionProtection: z.boolean().optional().describe('Enable deletion protection'),
  }),
  execute: async ({ awsCredentials, region, globalClusterIdentifier, newGlobalClusterIdentifier, deletionProtection }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new ModifyGlobalClusterCommand({
          GlobalClusterIdentifier: globalClusterIdentifier,
          NewGlobalClusterIdentifier: newGlobalClusterIdentifier,
          DeletionProtection: deletionProtection,
      });
      const response = await client.send(command);
      return response.GlobalCluster;
    } catch (err) {
      return { error: 'Failed to modify an Aurora Global Database cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
