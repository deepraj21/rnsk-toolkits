import { tool } from 'ai';
import { z } from 'zod';
import { AttachNetworkInterfaceCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAttachEc2NetworkInterface = tool({
  description: 'Attach a network interface to an instance. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    networkInterfaceId: z.string().describe('Network interface ID'),
    instanceId: z.string().describe('Instance ID'),
    deviceIndex: z.number().describe('Device index'),
  }),
  execute: async ({ awsCredentials, region, networkInterfaceId, instanceId, deviceIndex }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AttachNetworkInterfaceCommand({
          NetworkInterfaceId: networkInterfaceId,
          InstanceId: instanceId,
          DeviceIndex: deviceIndex,
      });
      const response = await client.send(command);
      return { attachmentId: response.AttachmentId };
    } catch (err) {
      return { error: 'Failed to attach a network interface to an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
