import { tool } from 'ai';
import { z } from 'zod';
import { DeleteProtectionCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsDeleteProtection = tool({
  description: 'Remove protection from a resource. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    protectionId: z.string().describe('Protection ID to delete'),
  }),
  execute: async ({ awsCredentials, region, protectionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new DeleteProtectionCommand({
          ProtectionId: protectionId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to remove protection from a resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
