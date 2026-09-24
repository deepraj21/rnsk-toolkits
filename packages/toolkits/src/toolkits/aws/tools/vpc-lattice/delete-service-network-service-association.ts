import { tool } from 'ai';
import { z } from 'zod';
import { DeleteServiceNetworkServiceAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeServiceNetworkServiceAssociation = tool({
  description: 'Delete a service network service association. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkServiceAssociationIdentifier: z.string().describe('The association identifier'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkServiceAssociationIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteServiceNetworkServiceAssociationCommand({
          serviceNetworkServiceAssociationIdentifier: serviceNetworkServiceAssociationIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Service network service association ${serviceNetworkServiceAssociationIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a service network service association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
