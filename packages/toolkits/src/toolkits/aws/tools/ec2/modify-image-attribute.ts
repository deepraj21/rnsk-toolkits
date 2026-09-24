import { tool } from 'ai';
import { z } from 'zod';
import { ModifyImageAttributeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsModifyEc2ImageAttribute = tool({
  description: 'Modify an attribute of an EC2 AMI. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    imageId: z.string().describe('The ID of the AMI'),
    attribute: z.string().describe('The attribute to modify'),
    operationType: z.string().optional().describe('Operation type (add/remove)'),
    userIds: z.array(z.string()).optional().describe('User IDs for launch permission'),
  }),
  execute: async ({ awsCredentials, region, imageId, attribute, operationType, userIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new ModifyImageAttributeCommand({
          ImageId: imageId,
          Attribute: attribute,
          OperationType: operationType as any,
          UserIds: userIds,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to modify an attribute of an EC2 AMI', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
