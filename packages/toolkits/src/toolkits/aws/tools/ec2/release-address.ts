import { tool } from 'ai';
import { z } from 'zod';
import { ReleaseAddressCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsReleaseEc2Address = tool({
  description: 'Release an Elastic IP address. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    allocationId: z.string().describe('Allocation ID'),
  }),
  execute: async ({ awsCredentials, region, allocationId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new ReleaseAddressCommand({ AllocationId: allocationId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to release an Elastic IP address', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
