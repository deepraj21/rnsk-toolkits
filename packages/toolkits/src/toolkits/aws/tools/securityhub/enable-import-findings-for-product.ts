import { tool } from 'ai';
import { z } from 'zod';
import { EnableImportFindingsForProductCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsEnableImportFindingsForProduct = tool({
  description: 'Enable a product integration to send findings to Security Hub. Use it to enable a feature.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    productArn: z.string().describe('ARN of the product to enable'),
  }),
  execute: async ({ awsCredentials, region, productArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new EnableImportFindingsForProductCommand({
          ProductArn: productArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to enable a product integration to send findings to Security Hub', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
