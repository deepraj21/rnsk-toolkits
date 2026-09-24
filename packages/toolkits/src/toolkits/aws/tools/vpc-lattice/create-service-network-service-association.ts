import { tool } from 'ai';
import { z } from 'zod';
import { CreateServiceNetworkServiceAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeServiceNetworkServiceAssociation = tool({
  description: 'Create a service network service association. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkIdentifier: z.string().describe('The service network identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkIdentifier, serviceIdentifier, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateServiceNetworkServiceAssociationCommand({
          serviceNetworkIdentifier: serviceNetworkIdentifier,
          serviceIdentifier: serviceIdentifier,
          tags: tags,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  dnsEntry: response.dnsEntry,
                  id: response.id,
              };
    } catch (err) {
      return { error: 'Failed to create a service network service association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
