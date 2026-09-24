import { tool } from 'ai';
import { z } from 'zod';
import { CreateSecurityGroupCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2SecurityGroup = tool({
  description: 'Create a new security group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the security group'),
    description: z.string().describe('Description of the security group'),
    vpcId: z.string().optional().describe('VPC ID'),
  }),
  execute: async ({ awsCredentials, region, groupName, description, vpcId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateSecurityGroupCommand({
          GroupName: groupName,
          Description: description,
          VpcId: vpcId,
      });
      const response = await client.send(command);
      return { groupId: response.GroupId };
    } catch (err) {
      return { error: 'Failed to create a new security group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
