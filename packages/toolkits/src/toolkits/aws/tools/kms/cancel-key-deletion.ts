import { tool } from 'ai';
import { z } from 'zod';
import { CancelKeyDeletionCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsCancelKeyDeletion = tool({
  description: 'Cancel a scheduled key deletion. Use it to cancel a running operation.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
  }),
  execute: async ({ awsCredentials, region, keyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new CancelKeyDeletionCommand({
          KeyId: keyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to cancel a scheduled key deletion', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
