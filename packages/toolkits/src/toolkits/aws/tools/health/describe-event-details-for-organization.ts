import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEventDetailsForOrganizationCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthEventDetailsForOrganization = tool({
  description: 'Get detailed information about events for your organization. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    organizationEventDetailFilters: z.array(z.record(z.any())).describe('List of organization event detail filters'),
    locale: z.string().optional().describe('Locale for returning messages'),
  }),
  execute: async ({ awsCredentials, region, organizationEventDetailFilters, locale }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeEventDetailsForOrganizationCommand({
          organizationEventDetailFilters: organizationEventDetailFilters,
          locale: locale,
      } as any);
      const response = await client.send(command);
      return {
                  successfulSet: response.successfulSet || [],
                  failedSet: response.failedSet || [],
              };
    } catch (err) {
      return { error: 'Failed to get detailed information about events for your organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
