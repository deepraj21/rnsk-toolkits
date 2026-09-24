import { tool } from 'ai';
import { z } from 'zod';
import { CreateRouteTableCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2RouteTable = tool({
  description: 'Create a route table. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    vpcId: z.string().describe('VPC ID'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, vpcId, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateRouteTableCommand({
          VpcId: vpcId,
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { routeTable: response.RouteTable };
    } catch (err) {
      return { error: 'Failed to create a route table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
