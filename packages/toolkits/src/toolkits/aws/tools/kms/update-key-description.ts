import { tool } from 'ai';
import { z } from 'zod';
import { UpdateKeyDescriptionCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsUpdateKeyDescription = tool({
  description: 'Update the description of a KMS key. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    description: z.string().describe('New description for the key'),
  }),
  execute: async ({ awsCredentials, region, keyId, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new UpdateKeyDescriptionCommand({
          KeyId: keyId,
          Description: description,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the description of a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
