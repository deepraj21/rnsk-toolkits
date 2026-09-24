import { tool } from 'ai';
import { z } from 'zod';
import { DescribeManagedRuleGroupCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsDescribeManagedRuleGroup = tool({
  description: 'Get information about an AWS managed rule group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    vendorName: z.string().describe('Vendor name (e.g., AWS)'),
    name: z.string().describe('Name of the managed rule group'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope'),
  }),
  execute: async ({ awsCredentials, region, vendorName, name, scope }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new DescribeManagedRuleGroupCommand({
          VendorName: vendorName,
          Name: name,
          Scope: scope,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get information about an AWS managed rule group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
