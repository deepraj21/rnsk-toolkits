import { tool } from 'ai';
import { z } from 'zod';
import { DeleteListenerCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeListener = tool({
  description: 'Delete a VPC Lattice listener. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    listenerIdentifier: z.string().describe('The listener identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
  }),
  execute: async ({ awsCredentials, region, listenerIdentifier, serviceIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteListenerCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Listener ${listenerIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a VPC Lattice listener', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
