import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAccessLogSubscriptionCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeAccessLogSubscription = tool({
  description: 'Update an access log subscription. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accessLogSubscriptionIdentifier: z.string().describe('The access log subscription identifier'),
    destinationArn: z.string().optional().describe('Destination ARN'),
  }),
  execute: async ({ awsCredentials, region, accessLogSubscriptionIdentifier, destinationArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateAccessLogSubscriptionCommand({
          accessLogSubscriptionIdentifier: accessLogSubscriptionIdentifier,
          destinationArn: destinationArn,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  destinationArn: response.destinationArn,
                  id: response.id,
                  resourceArn: response.resourceArn,
                  resourceId: response.resourceId,
              };
    } catch (err) {
      return { error: 'Failed to update an access log subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
