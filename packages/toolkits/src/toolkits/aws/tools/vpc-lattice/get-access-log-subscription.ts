import { tool } from 'ai';
import { z } from 'zod';
import { GetAccessLogSubscriptionCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeAccessLogSubscription = tool({
  description: 'Get information about an access log subscription. Use it to inspect current state before making changes.',
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

      const command = new GetAccessLogSubscriptionCommand({
          accessLogSubscriptionIdentifier: accessLogSubscriptionIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  createdAt: response.createdAt,
                  destinationArn: response.destinationArn,
                  id: response.id,
                  lastUpdatedAt: response.lastUpdatedAt,
                  resourceArn: response.resourceArn,
                  resourceId: response.resourceId,
              };
    } catch (err) {
      return { error: 'Failed to get information about an access log subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
