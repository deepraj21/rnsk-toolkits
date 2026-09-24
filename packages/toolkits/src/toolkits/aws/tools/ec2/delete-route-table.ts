import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRouteTableCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2RouteTable = tool({
  description: 'Delete a route table. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    routeTableId: z.string().describe('Route table ID'),
  }),
  execute: async ({ awsCredentials, region, routeTableId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteRouteTableCommand({ RouteTableId: routeTableId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a route table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
