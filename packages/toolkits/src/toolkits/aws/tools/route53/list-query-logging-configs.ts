import { tool } from 'ai';
import { z } from 'zod';
import { ListQueryLoggingConfigsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53QueryLoggingConfigs = tool({
  description: 'List all query logging configurations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().optional().describe('Filter by hosted zone ID'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of configs to return'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListQueryLoggingConfigsCommand({
          HostedZoneId: hostedZoneId,
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  queryLoggingConfigs: response.QueryLoggingConfigs,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all query logging configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
