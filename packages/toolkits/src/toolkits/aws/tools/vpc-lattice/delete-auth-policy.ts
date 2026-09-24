import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAuthPolicyCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeAuthPolicy = tool({
  description: 'Delete an auth policy. Use it to permanently remove the resource.',
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

      await client.send(new DeleteAuthPolicyCommand({
          resourceIdentifier: resourceIdentifier,
      }));
      return {
                  success: true,
                  message: `Auth policy deleted successfully for resource ${resourceIdentifier}`,
              };
    } catch (err) {
      return { error: 'Failed to delete an auth policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
