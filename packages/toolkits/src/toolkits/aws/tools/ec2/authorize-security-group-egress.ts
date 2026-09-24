import { tool } from 'ai';
import { z } from 'zod';
import { AuthorizeSecurityGroupEgressCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAuthorizeEc2SecurityGroupEgress = tool({
  description: 'Add outbound rules to a security group. Use it to grant access.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupId: z.string().describe('Security group ID'),
    ipPermissions: z.array(z.any()).optional().describe('IP permissions array'),
  }),
  execute: async ({ awsCredentials, region, groupId, ipPermissions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AuthorizeSecurityGroupEgressCommand({
          GroupId: groupId,
          IpPermissions: ipPermissions,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to add outbound rules to a security group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
