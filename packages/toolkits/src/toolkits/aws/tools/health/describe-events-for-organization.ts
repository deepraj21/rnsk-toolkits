import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEventsForOrganizationCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthEventsForOrganization = tool({
  description: 'Get information about events that affect your organization. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filter: z.enum(['issue', 'accountNotification', 'scheduledChange', 'investigation']).optional().describe('Filter criteria for events'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    locale: z.string().optional().describe('Locale for returning messages'),
  }),
  execute: async ({ awsCredentials, region, filter, nextToken, maxResults, locale }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeEventsForOrganizationCommand({
          filter: filter,
          nextToken: nextToken,
          maxResults: maxResults,
          locale: locale,
      } as any);
      const response = await client.send(command);
      return {
                  events: response.events || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get information about events that affect your organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
