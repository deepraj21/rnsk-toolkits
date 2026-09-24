import { tool } from 'ai';
import { z } from 'zod';
import { GetAccountLimitCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53AccountLimit = tool({
  description: 'Get the limit for a specific account setting. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    type: z.string().describe('Limit type (e.g. MAX_HEALTH_CHECKS_BY_OWNER, MAX_HOSTED_ZONES_BY_OWNER, MAX_TRAFFIC_POLICIES_BY_OWNER)'),
  }),
  execute: async ({ awsCredentials, region, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new GetAccountLimitCommand({
          Type: type as any,
      });
      const response = await client.send(command);
      return {
                  limit: response.Limit,
                  count: response.Count,
              };
    } catch (err) {
      return { error: 'Failed to get the limit for a specific account setting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
