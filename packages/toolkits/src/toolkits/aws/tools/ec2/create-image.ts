import { tool } from 'ai';
import { z } from 'zod';
import { CreateImageCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2Image = tool({
  description: 'Create an AMI from an EC2 instance. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The ID of the EC2 instance'),
    name: z.string().describe('The name of the AMI'),
    description: z.string().optional().describe('Description of the AMI'),
    noReboot: z.boolean().optional().describe('Whether to reboot the instance'),
  }),
  execute: async ({ awsCredentials, region, instanceId, name, description, noReboot }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateImageCommand({
          InstanceId: instanceId,
          Name: name,
          Description: description,
          NoReboot: noReboot,
      });
      const response = await client.send(command);
      return { imageId: response.ImageId };
    } catch (err) {
      return { error: 'Failed to create an AMI from an EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
