import { tool } from 'ai';
import { z } from 'zod';
import { DeleteResourcePolicyCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeResourcePolicy = tool({
  description: 'Delete a resource policy. Use it to permanently remove the resource.',
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

      await client.send(new DeleteResourcePolicyCommand({
          resourceArn: resourceArn,
      }));
      return {
                  success: true,
                  message: `Resource policy deleted successfully for resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to delete a resource policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
