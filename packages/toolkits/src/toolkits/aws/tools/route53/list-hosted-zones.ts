import { tool } from 'ai';
import { z } from 'zod';
import { ListHostedZonesCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53HostedZones = tool({
  description: 'List all Route 53 hosted zones. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of hosted zones to return'),
    delegationSetId: z.string().optional().describe('Filter by delegation set ID'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems, delegationSetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListHostedZonesCommand({
          Marker: marker,
          MaxItems: maxItems,
          DelegationSetId: delegationSetId,
      });
      const response = await client.send(command);
      return {
                  hostedZones: response.HostedZones,
                  marker: response.Marker,
                  isTruncated: response.IsTruncated,
                  nextMarker: response.NextMarker,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all Route 53 hosted zones', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
