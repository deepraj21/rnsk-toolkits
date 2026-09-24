import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAffectedEntitiesCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthAffectedEntities = tool({
  description: 'Get information about entities affected by events. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filter: z.enum(['IMPAIRED', 'UNIMPAIRED', 'UNKNOWN']).optional().describe('Filter criteria'),
    locale: z.string().optional().describe('Locale for returning messages'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, filter, locale, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeAffectedEntitiesCommand({
          filter: filter,
          locale: locale,
          nextToken: nextToken,
          maxResults: maxResults,
      } as any);
      const response = await client.send(command);
      return {
                  entities: response.entities || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get information about entities affected by events', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
