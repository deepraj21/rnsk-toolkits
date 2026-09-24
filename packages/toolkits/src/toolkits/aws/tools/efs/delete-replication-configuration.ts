import { tool } from 'ai';
import { z } from 'zod';
import { DeleteReplicationConfigurationCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDeleteEfsReplicationConfiguration = tool({
  description: 'Delete a replication configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceFileSystemId: z.string().describe('The ID of the source file system'),
  }),
  execute: async ({ awsCredentials, region, sourceFileSystemId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DeleteReplicationConfigurationCommand({
          SourceFileSystemId: sourceFileSystemId,
      });
      await client.send(command);
      return {
                  message: 'Replication configuration deleted successfully',
                  sourceFileSystemId: sourceFileSystemId,
              };
    } catch (err) {
      return { error: 'Failed to delete a replication configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
