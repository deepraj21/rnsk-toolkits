import { tool } from 'ai';
import { z } from 'zod';
import { PutResourcePolicyCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsPutVpcLatticeResourcePolicy = tool({
  description: 'Put a resource policy. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('Resource ARN'),
    policy: z.string().describe('Policy document (JSON string)'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, policy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new PutResourcePolicyCommand({
          resourceArn: resourceArn,
          policy: policy,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Resource policy put successfully for resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to put a resource policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
