import { tool } from 'ai';
import { z } from 'zod';
import { UpdateServiceNetworkVpcAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeServiceNetworkVpcAssociation = tool({
  description: 'Update a service network VPC association. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkVpcAssociationIdentifier: z.string().describe('The association identifier'),
    securityGroupIds: z.array(z.string()).optional().describe('Security group IDs'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkVpcAssociationIdentifier, securityGroupIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateServiceNetworkVpcAssociationCommand({
          serviceNetworkVpcAssociationIdentifier: serviceNetworkVpcAssociationIdentifier,
          securityGroupIds: securityGroupIds,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  createdBy: response.createdBy,
                  id: response.id,
                  securityGroupIds: response.securityGroupIds,
              };
    } catch (err) {
      return { error: 'Failed to update a service network VPC association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
