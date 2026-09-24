import { tool } from 'ai';
import { z } from 'zod';
import { CopyDBSnapshotCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCopyDbSnapshot = tool({
  description: 'Copy an RDS snapshot across regions or accounts. Use it to duplicate data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceDBSnapshotIdentifier: z.string().describe('Source snapshot identifier or ARN'),
    targetDBSnapshotIdentifier: z.string().describe('Target snapshot identifier'),
    copyTags: z.boolean().optional().describe('Copy tags from source snapshot'),
  }),
  execute: async ({ awsCredentials, region, sourceDBSnapshotIdentifier, targetDBSnapshotIdentifier, copyTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CopyDBSnapshotCommand({
          SourceDBSnapshotIdentifier: sourceDBSnapshotIdentifier,
          TargetDBSnapshotIdentifier: targetDBSnapshotIdentifier,
          CopyTags: copyTags,
      });
      const response = await client.send(command);
      return response.DBSnapshot;
    } catch (err) {
      return { error: 'Failed to copy an RDS snapshot across regions or accounts', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
