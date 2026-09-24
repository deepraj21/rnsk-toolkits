import { tool } from 'ai';
import { z } from 'zod';
import { RetireGrantCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsRetireGrant = tool({
  description: 'Retire a grant (can only be called by retiring principal)',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    grantToken: z.string().optional().describe('Grant token'),
    grantId: z.string().optional().describe('Grant ID'),
    keyId: z.string().optional().describe('Key ID or ARN'),
  }),
  execute: async ({ awsCredentials, region, grantToken, grantId, keyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new RetireGrantCommand({
          GrantToken: grantToken,
          GrantId: grantId,
          KeyId: keyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to retire a grant (can only be called by retiring principal)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
