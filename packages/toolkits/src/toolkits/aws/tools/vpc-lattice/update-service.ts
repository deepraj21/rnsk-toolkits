import { tool } from 'ai';
import { z } from 'zod';
import { UpdateServiceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeService = tool({
  description: 'Update a VPC Lattice service. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceIdentifier: z.string().describe('The service identifier'),
    authType: z.enum(['NONE', 'AWS_IAM']).optional().describe('Authentication type'),
    certificateArn: z.string().optional().describe('Certificate ARN'),
  }),
  execute: async ({ awsCredentials, region, serviceIdentifier, authType, certificateArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateServiceCommand({
          serviceIdentifier: serviceIdentifier,
          authType: authType,
          certificateArn: certificateArn,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  authType: response.authType,
                  id: response.id,
                  name: response.name,
              };
    } catch (err) {
      return { error: 'Failed to update a VPC Lattice service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
