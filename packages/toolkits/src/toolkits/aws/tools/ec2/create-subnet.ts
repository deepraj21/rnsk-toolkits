import { tool } from 'ai';
import { z } from 'zod';
import { CreateSubnetCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2Subnet = tool({
  description: 'Create a new subnet. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    vpcId: z.string().describe('VPC ID'),
    cidrBlock: z.string().describe('CIDR block for the subnet'),
    availabilityZone: z.string().optional().describe('Availability zone'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, vpcId, cidrBlock, availabilityZone, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateSubnetCommand({
          VpcId: vpcId,
          CidrBlock: cidrBlock,
          AvailabilityZone: availabilityZone,
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { subnet: response.Subnet };
    } catch (err) {
      return { error: 'Failed to create a new subnet', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
