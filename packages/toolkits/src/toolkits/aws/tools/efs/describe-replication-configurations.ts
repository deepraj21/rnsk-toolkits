import { tool } from 'ai';
import { z } from 'zod';
import { DescribeReplicationConfigurationsCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDescribeEfsReplicationConfigurations = tool({
  description: 'Get replication configurations for EFS file systems. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().optional().describe('File system ID to filter by'),
    maxResults: z.number().optional().describe('Maximum number of configurations to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DescribeReplicationConfigurationsCommand({
          FileSystemId: fileSystemId,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  replications: response.Replications || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get replication configurations for EFS file systems', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
