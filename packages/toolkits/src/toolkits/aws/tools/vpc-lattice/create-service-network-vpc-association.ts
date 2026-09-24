import { tool } from 'ai';
import { z } from 'zod';
import { CreateServiceNetworkVpcAssociationCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeServiceNetworkVpcAssociation = tool({
  description: 'Create a service network VPC association. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkIdentifier: z.string().describe('The service network identifier'),
    vpcIdentifier: z.string().describe('The VPC identifier'),
    securityGroupIds: z.array(z.string()).optional().describe('Security group IDs'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkIdentifier, vpcIdentifier, securityGroupIds, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateServiceNetworkVpcAssociationCommand({
          serviceNetworkIdentifier: serviceNetworkIdentifier,
          vpcIdentifier: vpcIdentifier,
          securityGroupIds: securityGroupIds,
          tags: tags,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  createdBy: response.createdBy,
                  id: response.id,
                  securityGroupIds: response.securityGroupIds,
              };
    } catch (err) {
      return { error: 'Failed to create a service network VPC association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
