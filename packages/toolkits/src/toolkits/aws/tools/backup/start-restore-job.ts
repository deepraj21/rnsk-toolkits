import { tool } from 'ai';
import { z } from 'zod';
import { StartRestoreJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsStartRestoreJob = tool({
  description: 'Start a restore job. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    recoveryPointArn: z.string().describe('The ARN of the recovery point'),
    metadata: z.record(z.any()).describe('Metadata about the restore'),
    iamRoleArn: z.string().describe('The ARN of the IAM role'),
    idempotencyToken: z.string().optional().describe('A unique token for idempotency'),
    resourceType: z.string().optional().describe('The type of resource to restore'),
    copySourceTagsToRestoredResource: z.boolean().optional().describe('Copy source tags to restored resource'),
  }),
  execute: async ({ awsCredentials, region, recoveryPointArn, metadata, iamRoleArn, idempotencyToken, resourceType, copySourceTagsToRestoredResource }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new StartRestoreJobCommand({
          RecoveryPointArn: recoveryPointArn,
          Metadata: metadata,
          IamRoleArn: iamRoleArn,
          IdempotencyToken: idempotencyToken,
          ResourceType: resourceType,
          CopySourceTagsToRestoredResource: copySourceTagsToRestoredResource,
      });
      const response = await client.send(command);
      return {
                  restoreJobId: response.RestoreJobId,
              };
    } catch (err) {
      return { error: 'Failed to start a restore job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
