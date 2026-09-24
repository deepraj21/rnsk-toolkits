import { tool } from 'ai';
import { z } from 'zod';
import { BatchDisableStandardsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsBatchDisableStandards = tool({
  description: 'Disable one or more security standards. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    standardsSubscriptionArns: z.array(z.string()).describe('ARNs of standards subscriptions to disable'),
  }),
  execute: async ({ awsCredentials, region, standardsSubscriptionArns }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new BatchDisableStandardsCommand({
          StandardsSubscriptionArns: standardsSubscriptionArns,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to disable one or more security standards', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
