import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTrafficPolicyCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDeleteRoute53TrafficPolicy = tool({
  description: 'Delete a Route 53 traffic policy. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The traffic policy ID'),
    version: z.number().describe('The traffic policy version'),
  }),
  execute: async ({ awsCredentials, region, id, version }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      await client.send(new DeleteTrafficPolicyCommand({
          Id: id,
          Version: version,
      }));
      return {
                  success: true,
                  message: `Traffic policy ${id} version ${version} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a Route 53 traffic policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
