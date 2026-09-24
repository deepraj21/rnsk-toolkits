import { tool } from 'ai';
import { z } from 'zod';
import { DeregisterImageCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeregisterEc2Image = tool({
  description: 'Deregister an EC2 AMI. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    imageId: z.string().describe('The ID of the AMI'),
  }),
  execute: async ({ awsCredentials, region, imageId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeregisterImageCommand({ ImageId: imageId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to deregister an EC2 AMI', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
