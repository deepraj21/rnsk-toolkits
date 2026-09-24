import { tool } from 'ai';
import { z } from 'zod';
import { ModifyVpcAttributeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsModifyEc2VpcAttribute = tool({
  description: 'Modify a VPC attribute. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    vpcId: z.string().describe('The ID of the VPC'),
    enableDnsHostnames: z.boolean().optional().describe('Enable DNS hostnames'),
    enableDnsSupport: z.boolean().optional().describe('Enable DNS support'),
  }),
  execute: async ({ awsCredentials, region, vpcId, enableDnsHostnames, enableDnsSupport }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new ModifyVpcAttributeCommand({
          VpcId: vpcId,
          EnableDnsHostnames: enableDnsHostnames !== undefined ? { Value: enableDnsHostnames } : undefined,
          EnableDnsSupport: enableDnsSupport !== undefined ? { Value: enableDnsSupport } : undefined,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to modify a VPC attribute', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
