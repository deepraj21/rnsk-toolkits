import { tool } from 'ai';
import { z } from 'zod';
import { DeleteReusableDelegationSetCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDeleteRoute53ReusableDelegationSet = tool({
  description: 'Delete a reusable delegation set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The delegation set ID'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      await client.send(new DeleteReusableDelegationSetCommand({
          Id: id,
      }));
      return {
                  success: true,
                  message: `Delegation set ${id} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a reusable delegation set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
