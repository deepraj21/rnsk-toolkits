import { tool } from 'ai';
import { z } from 'zod';
import { DescribeSnapshotsCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDescribeFsxSnapshots = tool({
  description: 'Get details about snapshots. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotIds: z.array(z.string()).optional().describe('List of snapshot IDs to describe'),
    filters: z.array(z.record(z.any())).optional().describe('Filters to apply'),
    maxResults: z.number().optional().describe('Maximum number of snapshots to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, snapshotIds, filters, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DescribeSnapshotsCommand({
          SnapshotIds: snapshotIds,
          Filters: filters,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  snapshots: response.Snapshots || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about snapshots', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
