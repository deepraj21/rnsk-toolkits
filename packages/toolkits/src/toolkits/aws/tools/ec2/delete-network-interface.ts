import { tool } from 'ai';
import { z } from 'zod';
import { DeleteNetworkInterfaceCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2NetworkInterface = tool({
  description: 'Delete a network interface. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    networkInterfaceId: z.string().describe('Network interface ID'),
  }),
  execute: async ({ awsCredentials, region, networkInterfaceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteNetworkInterfaceCommand({ NetworkInterfaceId: networkInterfaceId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a network interface', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
