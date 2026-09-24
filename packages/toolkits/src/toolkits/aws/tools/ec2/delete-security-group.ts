import { tool } from 'ai';
import { z } from 'zod';
import { DeleteSecurityGroupCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2SecurityGroup = tool({
  description: 'Delete a security group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupId: z.string().optional().describe('Security group ID'),
    groupName: z.string().optional().describe('Security group name'),
  }),
  execute: async ({ awsCredentials, region, groupId, groupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteSecurityGroupCommand({
          GroupId: groupId,
          GroupName: groupName,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a security group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
