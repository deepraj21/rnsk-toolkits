import { tool } from 'ai';
import { z } from 'zod';
import { AssociateRouteTableCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAssociateEc2RouteTable = tool({
  description: 'Associate a route table with a subnet. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    routeTableId: z.string().describe('Route table ID'),
    subnetId: z.string().describe('Subnet ID'),
  }),
  execute: async ({ awsCredentials, region, routeTableId, subnetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AssociateRouteTableCommand({
          RouteTableId: routeTableId,
          SubnetId: subnetId,
      });
      const response = await client.send(command);
      return { associationId: response.AssociationId };
    } catch (err) {
      return { error: 'Failed to associate a route table with a subnet', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
