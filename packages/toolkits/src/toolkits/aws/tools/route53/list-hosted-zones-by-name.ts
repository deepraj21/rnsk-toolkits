import { tool } from 'ai';
import { z } from 'zod';
import { ListHostedZonesByNameCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53HostedZonesByName = tool({
  description: 'List Route 53 hosted zones by name. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dnsName: z.string().optional().describe('DNS name to filter by'),
    hostedZoneId: z.string().optional().describe('Hosted zone ID for pagination'),
    maxItems: z.number().optional().describe('Maximum number of hosted zones to return'),
  }),
  execute: async ({ awsCredentials, region, dnsName, hostedZoneId, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListHostedZonesByNameCommand({
          DNSName: dnsName,
          HostedZoneId: hostedZoneId,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  hostedZones: response.HostedZones,
                  dnsName: response.DNSName,
                  hostedZoneId: response.HostedZoneId,
                  isTruncated: response.IsTruncated,
                  nextDNSName: response.NextDNSName,
                  nextHostedZoneId: response.NextHostedZoneId,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list Route 53 hosted zones by name', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
