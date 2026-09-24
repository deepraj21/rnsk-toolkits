import { tool } from 'ai';
import { z } from 'zod';
import { CreateNetworkInterfaceCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2NetworkInterface = tool({
  description: 'Create a network interface. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subnetId: z.string().describe('Subnet ID'),
    description: z.string().optional().describe('Description'),
    privateIpAddress: z.string().optional().describe('Private IP address'),
    groups: z.array(z.string()).optional().describe('Security group IDs'),
  }),
  execute: async ({ awsCredentials, region, subnetId, description, privateIpAddress, groups }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateNetworkInterfaceCommand({
          SubnetId: subnetId,
          Description: description,
          PrivateIpAddress: privateIpAddress,
          Groups: groups,
      });
      const response = await client.send(command);
      return { networkInterface: response.NetworkInterface };
    } catch (err) {
      return { error: 'Failed to create a network interface', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
