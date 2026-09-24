import { tool } from 'ai';
import { z } from 'zod';
import { DescribeInstanceAttributeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2InstanceAttribute = tool({
  description: 'Describe an attribute of an EC2 instance. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The ID of the EC2 instance'),
    attribute: z.string().describe('The attribute to describe'),
  }),
  execute: async ({ awsCredentials, region, instanceId, attribute }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeInstanceAttributeCommand({
          InstanceId: instanceId,
          Attribute: attribute as any,
      });
      const response = await client.send(command);
      return { attribute: response };
    } catch (err) {
      return { error: 'Failed to describe an attribute of an EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
