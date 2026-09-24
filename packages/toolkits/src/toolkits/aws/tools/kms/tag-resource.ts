import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsTagKmsResource = tool({
  description: 'Add or update tags for a KMS key. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    tags: z.array(z.record(z.any())).describe('Tags to add or update'),
  }),
  execute: async ({ awsCredentials, region, keyId, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new TagResourceCommand({
          KeyId: keyId,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to add or update tags for a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
