import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLaunchTemplatesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2LaunchTemplates = tool({
  description: 'Describe launch templates. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    launchTemplateIds: z.array(z.string()).optional().describe('Array of launch template IDs'),
    launchTemplateNames: z.array(z.string()).optional().describe('Array of launch template names'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, launchTemplateIds, launchTemplateNames, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeLaunchTemplatesCommand({
          LaunchTemplateIds: launchTemplateIds,
          LaunchTemplateNames: launchTemplateNames,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { launchTemplates: response.LaunchTemplates };
    } catch (err) {
      return { error: 'Failed to describe launch templates', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
