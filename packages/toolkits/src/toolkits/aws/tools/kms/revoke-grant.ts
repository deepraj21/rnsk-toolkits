import { tool } from 'ai';
import { z } from 'zod';
import { RevokeGrantCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsRevokeGrant = tool({
  description: 'Revoke a grant on a KMS key',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    grantId: z.string().describe('Grant ID to revoke'),
  }),
  execute: async ({ awsCredentials, region, keyId, grantId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new RevokeGrantCommand({
          KeyId: keyId,
          GrantId: grantId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to revoke a grant on a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
