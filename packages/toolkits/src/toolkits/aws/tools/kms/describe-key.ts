import { tool } from 'ai';
import { z } from 'zod';
import { DescribeKeyCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsDescribeKmsKey = tool({
  description: 'Get detailed information about a KMS key. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID, ARN, alias name, or alias ARN'),
  }),
  execute: async ({ awsCredentials, region, keyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new DescribeKeyCommand({
          KeyId: keyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
