import { tool } from 'ai';
import { z } from 'zod';
import { DeleteServiceNetworkCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeServiceNetwork = tool({
  description: 'Delete a VPC Lattice service network. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkIdentifier: z.string().describe('The service network identifier'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteServiceNetworkCommand({
          serviceNetworkIdentifier: serviceNetworkIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Service network ${serviceNetworkIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a VPC Lattice service network', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
