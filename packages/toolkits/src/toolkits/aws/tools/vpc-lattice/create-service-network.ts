import { tool } from 'ai';
import { z } from 'zod';
import { CreateServiceNetworkCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeServiceNetwork = tool({
  description: 'Create a new VPC Lattice service network. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the service network'),
    authType: z.enum(['NONE', 'AWS_IAM']).describe('Authentication type'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, name, authType, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateServiceNetworkCommand({
          name: name,
          authType: authType,
          tags: tags,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  authType: response.authType,
                  id: response.id,
                  name: response.name,
              };
    } catch (err) {
      return { error: 'Failed to create a new VPC Lattice service network', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
