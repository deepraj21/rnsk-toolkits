import { tool } from 'ai';
import { z } from 'zod';
import { ModifyInstanceAttributeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsModifyEc2InstanceAttribute = tool({
  description: 'Modify an attribute of an EC2 instance. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The ID of the EC2 instance'),
    attribute: z.string().describe('The attribute to modify'),
    value: z.string().optional().describe('The new value for the attribute'),
  }),
  execute: async ({ awsCredentials, region, instanceId, attribute, value }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new ModifyInstanceAttributeCommand({
          InstanceId: instanceId,
          [attribute]: value,
      } as any);
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to modify an attribute of an EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
