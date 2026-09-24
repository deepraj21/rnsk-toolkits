import { tool } from 'ai';
import { z } from 'zod';
import { CreateAccessLogSubscriptionCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeAccessLogSubscription = tool({
  description: 'Create an access log subscription. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceIdentifier: z.string().describe('Resource identifier'),
    destinationArn: z.string().describe('Destination ARN'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceIdentifier, destinationArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateAccessLogSubscriptionCommand({
          resourceIdentifier: resourceIdentifier,
          destinationArn: destinationArn,
          tags: tags,
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
      return { error: 'Failed to create an access log subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
