import { tool } from 'ai';
import { z } from 'zod';
import { GetAuthPolicyCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeAuthPolicy = tool({
  description: 'Get an auth policy. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceIdentifier: z.string().describe('Resource identifier'),
  }),
  execute: async ({ awsCredentials, region, resourceIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new GetAuthPolicyCommand({
          resourceIdentifier: resourceIdentifier,
      });
      const response = await client.send(command);
      return {
                  policy: response.policy,
                  state: response.state,
              };
    } catch (err) {
      return { error: 'Failed to get an auth policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
