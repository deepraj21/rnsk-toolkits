import { tool } from 'ai';
import { z } from 'zod';
import { PutKeyPolicyCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsPutKeyPolicy = tool({
  description: 'Update the key policy for a KMS key. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    policyName: z.string().optional().describe('Policy name (currently only "default" is supported)'),
    policy: z.string().describe('JSON key policy document'),
  }),
  execute: async ({ awsCredentials, region, keyId, policyName, policy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new PutKeyPolicyCommand({
          KeyId: keyId,
          PolicyName: policyName || 'default',
          Policy: policy,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the key policy for a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
