import { tool } from 'ai';
import { z } from 'zod';
import { CreateNatGatewayCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2NatGateway = tool({
  description: 'Create a NAT gateway. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subnetId: z.string().describe('Subnet ID'),
    allocationId: z.string().describe('Elastic IP allocation ID'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, subnetId, allocationId, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateNatGatewayCommand({
          SubnetId: subnetId,
          AllocationId: allocationId,
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { natGateway: response.NatGateway };
    } catch (err) {
      return { error: 'Failed to create a NAT gateway', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
