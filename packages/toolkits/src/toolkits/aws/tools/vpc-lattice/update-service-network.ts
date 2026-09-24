import { tool } from 'ai';
import { z } from 'zod';
import { UpdateServiceNetworkCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeServiceNetwork = tool({
  description: 'Update a VPC Lattice service network. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkIdentifier: z.string().describe('The service network identifier'),
    authType: z.enum(['NONE', 'AWS_IAM']).optional().describe('Authentication type'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkIdentifier, authType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateServiceNetworkCommand({
          serviceNetworkIdentifier: serviceNetworkIdentifier,
          authType: authType,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  authType: response.authType,
                  id: response.id,
                  name: response.name,
              };
    } catch (err) {
      return { error: 'Failed to update a VPC Lattice service network', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
