import { tool } from 'ai';
import { z } from 'zod';
import { AllocateAddressCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAllocateEc2Address = tool({
  description: 'Allocate an Elastic IP address. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().optional().describe('Domain (vpc or standard)'),
    address: z.string().optional().describe('Specific IP address'),
  }),
  execute: async ({ awsCredentials, region, domain, address }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AllocateAddressCommand({
          Domain: domain as any,
          Address: address,
      });
      const response = await client.send(command);
      return { allocationId: response.AllocationId, publicIp: response.PublicIp };
    } catch (err) {
      return { error: 'Failed to allocate an Elastic IP address', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
