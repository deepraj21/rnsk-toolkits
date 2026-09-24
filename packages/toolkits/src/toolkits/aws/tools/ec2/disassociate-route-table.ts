import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateRouteTableCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDisassociateEc2RouteTable = tool({
  description: 'Disassociate a route table from a subnet. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    associationId: z.string().describe('Association ID'),
  }),
  execute: async ({ awsCredentials, region, associationId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DisassociateRouteTableCommand({ AssociationId: associationId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to disassociate a route table from a subnet', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
