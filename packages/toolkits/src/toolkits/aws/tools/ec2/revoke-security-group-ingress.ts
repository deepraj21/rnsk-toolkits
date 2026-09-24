import { tool } from 'ai';
import { z } from 'zod';
import { RevokeSecurityGroupIngressCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsRevokeEc2SecurityGroupIngress = tool({
  description: 'Remove inbound rules from a security group. Use it to remove access.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupId: z.string().describe('Security group ID'),
    groupName: z.string().optional().describe('Security group name'),
    ipPermissions: z.array(z.any()).optional().describe('IP permissions array'),
  }),
  execute: async ({ awsCredentials, region, groupId, groupName, ipPermissions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new RevokeSecurityGroupIngressCommand({
          GroupId: groupId,
          GroupName: groupName,
          IpPermissions: ipPermissions,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to remove inbound rules from a security group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
