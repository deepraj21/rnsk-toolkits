import { tool } from 'ai';
import { z } from 'zod';
import { ScheduleKeyDeletionCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsScheduleKeyDeletion = tool({
  description: 'Schedule a KMS key for deletion (7-30 days waiting period)',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    pendingWindowInDays: z.number().optional().describe('Waiting period before deletion (7-30 days)'),
  }),
  execute: async ({ awsCredentials, region, keyId, pendingWindowInDays }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new ScheduleKeyDeletionCommand({
          KeyId: keyId,
          PendingWindowInDays: pendingWindowInDays,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to schedule a KMS key for deletion (7-30 days waiting period)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
