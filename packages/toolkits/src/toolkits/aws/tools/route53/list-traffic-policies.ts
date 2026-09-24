import { tool } from 'ai';
import { z } from 'zod';
import { ListTrafficPoliciesCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53TrafficPolicies = tool({
  description: 'List all Route 53 traffic policies. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    trafficPolicyIdMarker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of policies to return'),
  }),
  execute: async ({ awsCredentials, region, trafficPolicyIdMarker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListTrafficPoliciesCommand({
          TrafficPolicyIdMarker: trafficPolicyIdMarker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  trafficPolicySummaries: response.TrafficPolicySummaries,
                  isTruncated: response.IsTruncated,
                  trafficPolicyIdMarker: response.TrafficPolicyIdMarker,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all Route 53 traffic policies', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
