import { tool } from 'ai';
import { z } from 'zod';
import { UpdateTrafficPolicyInstanceCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsUpdateRoute53TrafficPolicyInstance = tool({
  description: 'Update a Route 53 traffic policy instance. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The traffic policy instance ID'),
    ttl: z.number().describe('TTL value'),
    trafficPolicyId: z.string().describe('The traffic policy ID'),
    trafficPolicyVersion: z.number().describe('The traffic policy version'),
  }),
  execute: async ({ awsCredentials, region, id, ttl, trafficPolicyId, trafficPolicyVersion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new UpdateTrafficPolicyInstanceCommand({
          Id: id,
          TTL: ttl,
          TrafficPolicyId: trafficPolicyId,
          TrafficPolicyVersion: trafficPolicyVersion,
      });
      const response = await client.send(command);
      return {
                  trafficPolicyInstance: response.TrafficPolicyInstance,
              };
    } catch (err) {
      return { error: 'Failed to update a Route 53 traffic policy instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
