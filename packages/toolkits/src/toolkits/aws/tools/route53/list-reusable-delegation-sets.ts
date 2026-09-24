import { tool } from 'ai';
import { z } from 'zod';
import { ListReusableDelegationSetsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53ReusableDelegationSets = tool({
  description: 'List all reusable delegation sets. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of delegation sets to return'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListReusableDelegationSetsCommand({
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  delegationSets: response.DelegationSets,
                  marker: response.Marker,
                  isTruncated: response.IsTruncated,
                  nextMarker: response.NextMarker,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all reusable delegation sets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
