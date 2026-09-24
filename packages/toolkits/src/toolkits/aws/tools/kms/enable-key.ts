import { tool } from 'ai';
import { z } from 'zod';
import { EnableKeyCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsEnableKmsKey = tool({
  description: 'Enable a disabled KMS key. Use it to enable a feature.',
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

      const command = new EnableKeyCommand({
          KeyId: keyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to enable a disabled KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
