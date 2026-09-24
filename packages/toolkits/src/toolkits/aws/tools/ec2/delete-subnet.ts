import { tool } from 'ai';
import { z } from 'zod';
import { DeleteSubnetCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2Subnet = tool({
  description: 'Delete a subnet. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subnetId: z.string().describe('The ID of the subnet'),
  }),
  execute: async ({ awsCredentials, region, subnetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteSubnetCommand({ SubnetId: subnetId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a subnet', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
