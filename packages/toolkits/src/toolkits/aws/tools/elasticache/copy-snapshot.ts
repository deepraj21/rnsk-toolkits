import { tool } from 'ai';
import { z } from 'zod';
import { CopySnapshotCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsCopySnapshot = tool({
  description: 'Copy a Redis snapshot across regions. Use it to duplicate data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceSnapshotName: z.string().describe('Source snapshot name'),
    targetSnapshotName: z.string().describe('Target snapshot name'),
    targetBucket: z.string().optional().describe('S3 bucket for cross-region copy'),
  }),
  execute: async ({ awsCredentials, region, sourceSnapshotName, targetSnapshotName, targetBucket }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new CopySnapshotCommand({
          SourceSnapshotName: sourceSnapshotName,
          TargetSnapshotName: targetSnapshotName,
          TargetBucket: targetBucket,
      });
      const response = await client.send(command);
      return response.Snapshot;
    } catch (err) {
      return { error: 'Failed to copy a Redis snapshot across regions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
