import { tool } from 'ai';
import { z } from 'zod';
import { DisableImportFindingsForProductCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDisableImportFindingsForProduct = tool({
  description: 'Disable a product integration',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    productSubscriptionArn: z.string().describe('ARN of the product subscription to disable'),
  }),
  execute: async ({ awsCredentials, region, productSubscriptionArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DisableImportFindingsForProductCommand({
          ProductSubscriptionArn: productSubscriptionArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to disable a product integration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
