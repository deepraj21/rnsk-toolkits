import { tool } from 'ai';
import { z } from 'zod';
import { CreateInsightCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsCreateInsight = tool({
  description: 'Create a custom insight to group findings. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the insight'),
    filters: z.record(z.any()).describe('Filters to identify findings for the insight'),
    groupByAttribute: z.string().describe('Attribute to group findings by (e.g., ResourceId, SeverityLabel)'),
  }),
  execute: async ({ awsCredentials, region, name, filters, groupByAttribute }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new CreateInsightCommand({
          Name: name,
          Filters: filters,
          GroupByAttribute: groupByAttribute,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a custom insight to group findings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
