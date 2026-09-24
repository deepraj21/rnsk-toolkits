import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateDRTRoleCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsDisassociateDrtRole = tool({
  description: 'Revoke DRT access to your account. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new DisassociateDRTRoleCommand({});
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to revoke DRT access to your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
