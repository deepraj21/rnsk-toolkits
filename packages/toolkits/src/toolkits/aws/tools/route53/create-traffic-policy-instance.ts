import { tool } from 'ai';
import { z } from 'zod';
import { CreateTrafficPolicyInstanceCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53TrafficPolicyInstance = tool({
  description: 'Create a Route 53 traffic policy instance. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    name: z.string().describe('The DNS name'),
    ttl: z.number().describe('TTL value'),
    trafficPolicyId: z.string().describe('The traffic policy ID'),
    trafficPolicyVersion: z.number().describe('The traffic policy version'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, name, ttl, trafficPolicyId, trafficPolicyVersion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateTrafficPolicyInstanceCommand({
          HostedZoneId: hostedZoneId,
          Name: name,
          TTL: ttl,
          TrafficPolicyId: trafficPolicyId,
          TrafficPolicyVersion: trafficPolicyVersion,
      });
      const response = await client.send(command);
      return {
                  trafficPolicyInstance: response.TrafficPolicyInstance,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a Route 53 traffic policy instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
