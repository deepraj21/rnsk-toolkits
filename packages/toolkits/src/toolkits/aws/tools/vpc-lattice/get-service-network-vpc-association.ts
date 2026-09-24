import { tool } from 'ai';
import { z } from 'zod';
import { GetServiceNetworkVpcAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeServiceNetworkVpcAssociation = tool({
  description: 'Get information about a service network VPC association. Use it to inspect current state before making changes.',
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

      const command = new GetServiceNetworkVpcAssociationCommand({
          serviceNetworkVpcAssociationIdentifier: serviceNetworkVpcAssociationIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  createdAt: response.createdAt,
                  createdBy: response.createdBy,
                  failureCode: response.failureCode,
                  failureMessage: response.failureMessage,
                  id: response.id,
                  lastUpdatedAt: response.lastUpdatedAt,
                  securityGroupIds: response.securityGroupIds,
              };
    } catch (err) {
      return { error: 'Failed to get information about a service network VPC association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
