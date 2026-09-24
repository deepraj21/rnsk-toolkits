import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAccessLogSubscriptionCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeAccessLogSubscription = tool({
  description: 'Delete an access log subscription. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accessLogSubscriptionIdentifier: z.string().describe('The access log subscription identifier'),
  }),
  execute: async ({ awsCredentials, region, accessLogSubscriptionIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteAccessLogSubscriptionCommand({
          accessLogSubscriptionIdentifier: accessLogSubscriptionIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Access log subscription ${accessLogSubscriptionIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete an access log subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
