import { tool } from 'ai';
import { z } from 'zod';
import { GetTrafficPolicyInstanceCountCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53TrafficPolicyInstanceCount = tool({
  description: 'Get the number of traffic policy instances for the current AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new GetTrafficPolicyInstanceCountCommand({});
      const response = await client.send(command);
      return {
                  trafficPolicyInstanceCount: response.TrafficPolicyInstanceCount,
              };
    } catch (err) {
      return { error: 'Failed to get the number of traffic policy instances for the current AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
