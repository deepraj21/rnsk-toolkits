import { tool } from 'ai';
import { z } from 'zod';
import { BatchEnableStandardsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsBatchEnableStandards = tool({
  description: 'Enable one or more security standards. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    standardsSubscriptionRequests: z.array(z.record(z.any())).describe('Standards to enable'),
  }),
  execute: async ({ awsCredentials, region, standardsSubscriptionRequests }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new BatchEnableStandardsCommand({
          StandardsSubscriptionRequests: standardsSubscriptionRequests,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to enable one or more security standards', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
