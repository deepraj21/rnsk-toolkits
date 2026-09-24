import { tool } from 'ai';
import { z } from 'zod';
import { DisableKeyCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsDisableKmsKey = tool({
  description: 'Disable a KMS key',
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

      const command = new DisableKeyCommand({
          KeyId: keyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to disable a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
