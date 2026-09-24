import { tool } from 'ai';
import { z } from 'zod';
import { DeleteNatGatewayCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2NatGateway = tool({
  description: 'Delete a NAT gateway. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    natGatewayId: z.string().describe('NAT gateway ID'),
  }),
  execute: async ({ awsCredentials, region, natGatewayId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteNatGatewayCommand({ NatGatewayId: natGatewayId });
      const response = await client.send(command);
      return { natGatewayId: response.NatGatewayId };
    } catch (err) {
      return { error: 'Failed to delete a NAT gateway', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
