import { tool } from 'ai';
import { z } from 'zod';
import { PutAuthPolicyCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsPutVpcLatticeAuthPolicy = tool({
  description: 'Put an auth policy. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceIdentifier: z.string().describe('Resource identifier'),
    policy: z.string().describe('Policy document (JSON string)'),
  }),
  execute: async ({ awsCredentials, region, resourceIdentifier, policy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new PutAuthPolicyCommand({
          resourceIdentifier: resourceIdentifier,
          policy: policy,
      });
      const response = await client.send(command);
      return {
                  policy: response.policy,
                  state: response.state,
              };
    } catch (err) {
      return { error: 'Failed to put an auth policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
