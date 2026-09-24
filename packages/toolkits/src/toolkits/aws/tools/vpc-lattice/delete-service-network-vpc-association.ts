import { tool } from 'ai';
import { z } from 'zod';
import { DeleteServiceNetworkVpcAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeServiceNetworkVpcAssociation = tool({
  description: 'Delete a service network VPC association. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkVpcAssociationIdentifier: z.string().describe('The association identifier'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkVpcAssociationIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteServiceNetworkVpcAssociationCommand({
          serviceNetworkVpcAssociationIdentifier: serviceNetworkVpcAssociationIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Service network VPC association ${serviceNetworkVpcAssociationIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a service network VPC association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
