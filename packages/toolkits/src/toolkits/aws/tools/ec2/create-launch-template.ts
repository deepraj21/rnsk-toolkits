import { tool } from 'ai';
import { z } from 'zod';
import { CreateLaunchTemplateCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2LaunchTemplate = tool({
  description: 'Create a launch template. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    launchTemplateName: z.string().describe('Launch template name'),
    launchTemplateData: z.record(z.any()).describe('Launch template data'),
    description: z.string().optional().describe('Description'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, launchTemplateName, launchTemplateData, description, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateLaunchTemplateCommand({
          LaunchTemplateName: launchTemplateName,
          LaunchTemplateData: launchTemplateData,
          VersionDescription: description,
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { launchTemplate: response.LaunchTemplate };
    } catch (err) {
      return { error: 'Failed to create a launch template', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
