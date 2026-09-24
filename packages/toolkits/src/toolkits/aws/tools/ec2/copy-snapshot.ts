import { tool } from 'ai';
import { z } from 'zod';
import { CopySnapshotCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCopyEc2Snapshot = tool({
  description: 'Copy an EBS snapshot to another region. Use it to duplicate a resource, optionally across regions.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceRegion: z.string().describe('Source region'),
    sourceSnapshotId: z.string().describe('Source snapshot ID'),
    description: z.string().optional().describe('Description for the copied snapshot'),
  }),
  execute: async ({ awsCredentials, region, sourceRegion, sourceSnapshotId, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CopySnapshotCommand({
          SourceRegion: sourceRegion,
          SourceSnapshotId: sourceSnapshotId,
          Description: description,
      });
      const response = await client.send(command);
      return { snapshotId: response.SnapshotId };
    } catch (err) {
      return { error: 'Failed to copy an EBS snapshot to another region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
