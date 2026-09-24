import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEventDetailsCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthEventDetails = tool({
  description: 'Get detailed information about one or more events. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    eventArns: z.array(z.string()).describe('List of event ARNs'),
    locale: z.string().optional().describe('Locale for returning messages'),
  }),
  execute: async ({ awsCredentials, region, eventArns, locale }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeEventDetailsCommand({
          eventArns: eventArns,
          locale: locale,
      });
      const response = await client.send(command);
      return {
                  successfulSet: response.successfulSet || [],
                  failedSet: response.failedSet || [],
              };
    } catch (err) {
      return { error: 'Failed to get detailed information about one or more events', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
