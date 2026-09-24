import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEntityAggregatesCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthEntityAggregates = tool({
  description: 'Get aggregated counts of entities affected by events. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    eventArns: z.array(z.string()).describe('List of event ARNs'),
  }),
  execute: async ({ awsCredentials, region, eventArns }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeEntityAggregatesCommand({
          eventArns: eventArns,
      });
      const response = await client.send(command);
      return {
                  entityAggregates: response.entityAggregates || [],
              };
    } catch (err) {
      return { error: 'Failed to get aggregated counts of entities affected by events', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
