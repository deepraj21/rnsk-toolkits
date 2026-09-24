import { tool } from 'ai';
import { z } from 'zod';
import { CreateReplicationConfigurationCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsCreateEfsReplicationConfiguration = tool({
  description: 'Create a replication configuration for an EFS file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceFileSystemId: z.string().describe('The ID of the source file system'),
    destinations: z.array(z.record(z.any())).describe('Destination configurations for replication'),
  }),
  execute: async ({ awsCredentials, region, sourceFileSystemId, destinations }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new CreateReplicationConfigurationCommand({
          SourceFileSystemId: sourceFileSystemId,
          Destinations: destinations,
      });
      const response = await client.send(command);
      return {
                  replicationConfiguration: response,
              };
    } catch (err) {
      return { error: 'Failed to create a replication configuration for an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
