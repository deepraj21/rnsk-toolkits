import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsUntagKmsResource = tool({
  description: 'Remove tags from a KMS key. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, keyId, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          KeyId: keyId,
          TagKeys: tagKeys,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to remove tags from a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
