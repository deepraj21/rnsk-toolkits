import { tool } from 'ai';
import { z } from 'zod';
import { GetServiceNetworkCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeServiceNetwork = tool({
  description: 'Get information about a VPC Lattice service network. Use it to inspect current state before making changes.',
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

      const command = new GetServiceNetworkCommand({
          serviceNetworkIdentifier: serviceNetworkIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  authType: response.authType,
                  createdAt: response.createdAt,
                  id: response.id,
                  lastUpdatedAt: response.lastUpdatedAt,
                  name: response.name,
                  numberOfAssociatedServices: response.numberOfAssociatedServices,
                  numberOfAssociatedVPCs: response.numberOfAssociatedVPCs,
              };
    } catch (err) {
      return { error: 'Failed to get information about a VPC Lattice service network', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
