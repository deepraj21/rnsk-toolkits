import { tool } from 'ai';
import { z } from 'zod';
import { DeleteInternetGatewayCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2InternetGateway = tool({
  description: 'Delete an internet gateway. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    internetGatewayId: z.string().describe('Internet gateway ID'),
  }),
  execute: async ({ awsCredentials, region, internetGatewayId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteInternetGatewayCommand({ InternetGatewayId: internetGatewayId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete an internet gateway', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
