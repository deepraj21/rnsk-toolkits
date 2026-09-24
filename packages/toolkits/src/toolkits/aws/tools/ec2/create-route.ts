import { tool } from 'ai';
import { z } from 'zod';
import { CreateRouteCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2Route = tool({
  description: 'Create a route in a route table. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    routeTableId: z.string().describe('Route table ID'),
    destinationCidrBlock: z.string().describe('Destination CIDR block'),
    gatewayId: z.string().optional().describe('Internet gateway ID'),
    instanceId: z.string().optional().describe('Instance ID'),
    natGatewayId: z.string().optional().describe('NAT gateway ID'),
  }),
  execute: async ({ awsCredentials, region, routeTableId, destinationCidrBlock, gatewayId, instanceId, natGatewayId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateRouteCommand({
          RouteTableId: routeTableId,
          DestinationCidrBlock: destinationCidrBlock,
          GatewayId: gatewayId,
          InstanceId: instanceId,
          NatGatewayId: natGatewayId,
      });
      const response = await client.send(command);
      return { return: response.Return };
    } catch (err) {
      return { error: 'Failed to create a route in a route table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
