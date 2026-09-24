import { tool } from 'ai';
import { z } from 'zod';
import { AssociateAddressCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAssociateEc2Address = tool({
  description: 'Associate an Elastic IP with an instance. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    allocationId: z.string().describe('Allocation ID'),
    instanceId: z.string().optional().describe('Instance ID'),
    networkInterfaceId: z.string().optional().describe('Network interface ID'),
    privateIpAddress: z.string().optional().describe('Private IP address'),
  }),
  execute: async ({ awsCredentials, region, allocationId, instanceId, networkInterfaceId, privateIpAddress }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AssociateAddressCommand({
          AllocationId: allocationId,
          InstanceId: instanceId,
          NetworkInterfaceId: networkInterfaceId,
          PrivateIpAddress: privateIpAddress,
      });
      const response = await client.send(command);
      return { associationId: response.AssociationId };
    } catch (err) {
      return { error: 'Failed to associate an Elastic IP with an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
