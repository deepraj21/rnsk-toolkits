import { tool } from 'ai';
import { z } from 'zod';
import { DescribeSnapshotsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2Snapshots = tool({
  description: 'Describe EC2 snapshots. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotIds: z.array(z.string()).optional().describe('Array of snapshot IDs'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
    ownerIds: z.array(z.string()).optional().describe('Array of owner IDs'),
  }),
  execute: async ({ awsCredentials, region, snapshotIds, filters, ownerIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeSnapshotsCommand({
          SnapshotIds: snapshotIds,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
          OwnerIds: ownerIds,
      });
      const response = await client.send(command);
      return { snapshots: response.Snapshots };
    } catch (err) {
      return { error: 'Failed to describe EC2 snapshots', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
