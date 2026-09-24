import { tool } from 'ai';
import { z } from 'zod';
import { CopyImageCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCopyEc2Image = tool({
  description: 'Copy an AMI to another region. Use it to duplicate a resource, optionally across regions.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceRegion: z.string().describe('Source region'),
    sourceImageId: z.string().describe('Source AMI ID'),
    name: z.string().optional().describe('Name for the copied AMI'),
    description: z.string().optional().describe('Description for the copied AMI'),
  }),
  execute: async ({ awsCredentials, region, sourceRegion, sourceImageId, name, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CopyImageCommand({
          SourceRegion: sourceRegion,
          SourceImageId: sourceImageId,
          Name: name,
          Description: description,
      });
      const response = await client.send(command);
      return { imageId: response.ImageId };
    } catch (err) {
      return { error: 'Failed to copy an AMI to another region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
