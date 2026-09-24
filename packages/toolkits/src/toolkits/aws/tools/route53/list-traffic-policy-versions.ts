import { tool } from 'ai';
import { z } from 'zod';
import { ListTrafficPolicyVersionsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53TrafficPolicyVersions = tool({
  description: 'List all versions of a Route 53 traffic policy. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The traffic policy ID'),
    trafficPolicyVersionMarker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of versions to return'),
  }),
  execute: async ({ awsCredentials, region, id, trafficPolicyVersionMarker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListTrafficPolicyVersionsCommand({
          Id: id,
          TrafficPolicyVersionMarker: trafficPolicyVersionMarker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  trafficPolicies: response.TrafficPolicies,
                  isTruncated: response.IsTruncated,
                  trafficPolicyVersionMarker: response.TrafficPolicyVersionMarker,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all versions of a Route 53 traffic policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
