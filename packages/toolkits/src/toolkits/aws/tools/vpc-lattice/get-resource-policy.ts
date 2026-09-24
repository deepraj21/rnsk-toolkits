import { tool } from 'ai';
import { z } from 'zod';
import { GetResourcePolicyCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeResourcePolicy = tool({
  description: 'Get a resource policy. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('Resource ARN'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new GetResourcePolicyCommand({
          resourceArn: resourceArn,
      });
      const response = await client.send(command);
      return {
                  policy: response.policy,
              };
    } catch (err) {
      return { error: 'Failed to get a resource policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
