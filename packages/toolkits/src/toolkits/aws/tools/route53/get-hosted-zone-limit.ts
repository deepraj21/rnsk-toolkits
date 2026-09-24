import { tool } from 'ai';
import { z } from 'zod';
import { GetHostedZoneLimitCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53HostedZoneLimit = tool({
  description: 'Get the limit for a specific hosted zone setting. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    type: z.string().describe('Limit type (e.g. MAX_RRSETS_BY_ZONE, MAX_VPCS_ASSOCIATED_BY_ZONE)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new GetHostedZoneLimitCommand({
          Type: type as any,
          HostedZoneId: hostedZoneId,
      });
      const response = await client.send(command);
      return {
                  limit: response.Limit,
                  count: response.Count,
              };
    } catch (err) {
      return { error: 'Failed to get the limit for a specific hosted zone setting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
