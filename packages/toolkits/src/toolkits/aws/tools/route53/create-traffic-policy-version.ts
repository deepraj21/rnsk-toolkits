import { tool } from 'ai';
import { z } from 'zod';
import { CreateTrafficPolicyVersionCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53TrafficPolicyVersion = tool({
  description: 'Create a new version of a Route 53 traffic policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The traffic policy ID'),
    document: z.string().describe('The traffic policy document (JSON)'),
    comment: z.string().optional().describe('Comment about the traffic policy version'),
  }),
  execute: async ({ awsCredentials, region, id, document, comment }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateTrafficPolicyVersionCommand({
          Id: id,
          Document: document,
          Comment: comment,
      });
      const response = await client.send(command);
      return {
                  trafficPolicy: response.TrafficPolicy,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a new version of a Route 53 traffic policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
