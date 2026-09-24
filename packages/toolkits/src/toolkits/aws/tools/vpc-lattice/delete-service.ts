import { tool } from 'ai';
import { z } from 'zod';
import { DeleteServiceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeService = tool({
  description: 'Delete a VPC Lattice service. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceIdentifier: z.string().describe('The service identifier'),
  }),
  execute: async ({ awsCredentials, region, serviceIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteServiceCommand({
          serviceIdentifier: serviceIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Service ${serviceIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a VPC Lattice service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
