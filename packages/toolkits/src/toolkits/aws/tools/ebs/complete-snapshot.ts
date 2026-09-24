import { tool } from 'ai';
import { z } from 'zod';
import { CompleteSnapshotCommand } from '@aws-sdk/client-ebs';
import { createEbsClient } from '../client.js';

export const awsCompleteEbsSnapshot = tool({
  description: 'Complete the creation of an EBS snapshot',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotId: z.string().describe('The ID of the snapshot'),
    changedBlocksCount: z.number().describe('The number of blocks that were written to the snapshot'),
    checksum: z.string().optional().describe('Aggregate SHA256 checksum of all blocks'),
    checksumAlgorithm: z.enum(['SHA256']).optional().describe('Checksum algorithm (SHA256)'),
    checksumAggregationMethod: z.enum(['LINEAR']).optional().describe('Checksum aggregation method (LINEAR)'),
  }),
  execute: async ({ awsCredentials, region, snapshotId, changedBlocksCount, checksum, checksumAlgorithm, checksumAggregationMethod }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEbsClient(awsCredentials, region);

      const command = new CompleteSnapshotCommand({
          SnapshotId: snapshotId,
          ChangedBlocksCount: changedBlocksCount,
          Checksum: checksum,
          ChecksumAlgorithm: checksumAlgorithm,
          ChecksumAggregationMethod: checksumAggregationMethod,
      });
      const response = await client.send(command);
      return {
                  status: response.Status,
              };
    } catch (err) {
      return { error: 'Failed to complete the creation of an EBS snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
