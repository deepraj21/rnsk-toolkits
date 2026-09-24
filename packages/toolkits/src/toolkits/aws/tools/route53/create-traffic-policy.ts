import { tool } from 'ai';
import { z } from 'zod';
import { CreateTrafficPolicyCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53TrafficPolicy = tool({
  description: 'Create a Route 53 traffic policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the traffic policy'),
    document: z.string().describe('The traffic policy document (JSON)'),
    comment: z.string().optional().describe('Comment about the traffic policy'),
  }),
  execute: async ({ awsCredentials, region, name, document, comment }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateTrafficPolicyCommand({
          Name: name,
          Document: document,
          Comment: comment,
      });
      const response = await client.send(command);
      return {
                  trafficPolicy: response.TrafficPolicy,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a Route 53 traffic policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
