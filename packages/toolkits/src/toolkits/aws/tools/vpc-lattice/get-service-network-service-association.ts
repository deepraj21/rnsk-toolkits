import { tool } from 'ai';
import { z } from 'zod';
import { GetServiceNetworkServiceAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeServiceNetworkServiceAssociation = tool({
  description: 'Get information about a service network service association. Use it to inspect current state before making changes.',
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

      const command = new GetServiceNetworkServiceAssociationCommand({
          serviceNetworkServiceAssociationIdentifier: serviceNetworkServiceAssociationIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  createdAt: response.createdAt,
                  createdBy: response.createdBy,
                  dnsEntry: response.dnsEntry,
                  failureCode: response.failureCode,
                  failureMessage: response.failureMessage,
                  id: response.id,
                  serviceArn: response.serviceArn,
                  serviceId: response.serviceId,
                  serviceName: response.serviceName,
                  serviceNetworkArn: response.serviceNetworkArn,
                  serviceNetworkId: response.serviceNetworkId,
                  serviceNetworkName: response.serviceNetworkName,
              };
    } catch (err) {
      return { error: 'Failed to get information about a service network service association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
