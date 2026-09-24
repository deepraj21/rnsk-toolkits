import { tool } from 'ai';
import { z } from 'zod';
import { ListTrafficPolicyInstancesCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53TrafficPolicyInstances = tool({
  description: 'List all Route 53 traffic policy instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneIdMarker: z.string().optional().describe('Token for pagination'),
    trafficPolicyInstanceNameMarker: z.string().optional().describe('Token for pagination'),
    trafficPolicyInstanceTypeMarker: z.enum(['SOA', 'A', 'TXT', 'NS', 'CNAME', 'MX', 'NAPTR', 'PTR', 'SRV', 'SPF', 'AAAA', 'CAA', 'DS']).optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of instances to return'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneIdMarker, trafficPolicyInstanceNameMarker, trafficPolicyInstanceTypeMarker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListTrafficPolicyInstancesCommand({
          HostedZoneIdMarker: hostedZoneIdMarker,
          TrafficPolicyInstanceNameMarker: trafficPolicyInstanceNameMarker,
          TrafficPolicyInstanceTypeMarker: trafficPolicyInstanceTypeMarker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  trafficPolicyInstances: response.TrafficPolicyInstances,
                  hostedZoneIdMarker: response.HostedZoneIdMarker,
                  trafficPolicyInstanceNameMarker: response.TrafficPolicyInstanceNameMarker,
                  trafficPolicyInstanceTypeMarker: response.TrafficPolicyInstanceTypeMarker,
                  isTruncated: response.IsTruncated,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all Route 53 traffic policy instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
