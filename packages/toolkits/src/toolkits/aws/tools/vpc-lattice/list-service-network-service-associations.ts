import { tool } from 'ai';
import { z } from 'zod';
import { ListServiceNetworkServiceAssociationsCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsListVpcLatticeServiceNetworkServiceAssociations = tool({
  description: 'List service network service associations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceNetworkIdentifier: z.string().optional().describe('Filter by service network identifier'),
    serviceIdentifier: z.string().optional().describe('Filter by service identifier'),
    maxResults: z.number().optional().describe('Maximum number of results'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, serviceNetworkIdentifier, serviceIdentifier, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new ListServiceNetworkServiceAssociationsCommand({
          serviceNetworkIdentifier: serviceNetworkIdentifier,
          serviceIdentifier: serviceIdentifier,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  items: response.items,
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list service network service associations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
