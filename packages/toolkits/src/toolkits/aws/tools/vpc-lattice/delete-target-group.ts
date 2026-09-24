import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTargetGroupCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeTargetGroup = tool({
  description: 'Delete a VPC Lattice target group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    targetGroupIdentifier: z.string().describe('The target group identifier'),
  }),
  execute: async ({ awsCredentials, region, targetGroupIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteTargetGroupCommand({
          targetGroupIdentifier: targetGroupIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Target group ${targetGroupIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a VPC Lattice target group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
