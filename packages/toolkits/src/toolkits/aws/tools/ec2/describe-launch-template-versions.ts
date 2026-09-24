import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLaunchTemplateVersionsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2LaunchTemplateVersions = tool({
  description: 'Describe launch template versions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    launchTemplateId: z.string().optional().describe('Launch template ID'),
    launchTemplateName: z.string().optional().describe('Launch template name'),
    versions: z.array(z.string()).optional().describe('Array of version numbers'),
  }),
  execute: async ({ awsCredentials, region, launchTemplateId, launchTemplateName, versions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeLaunchTemplateVersionsCommand({
          LaunchTemplateId: launchTemplateId,
          LaunchTemplateName: launchTemplateName,
          Versions: versions,
      });
      const response = await client.send(command);
      return { launchTemplateVersions: response.LaunchTemplateVersions };
    } catch (err) {
      return { error: 'Failed to describe launch template versions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
