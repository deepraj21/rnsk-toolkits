import { tool } from 'ai';
import { z } from 'zod';
import { AttachVolumeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAttachEc2Volume = tool({
  description: 'Attach an EBS volume to an instance. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeId: z.string().describe('The ID of the volume'),
    instanceId: z.string().describe('The ID of the instance'),
    device: z.string().describe('Device name (e.g., /dev/sdf)'),
  }),
  execute: async ({ awsCredentials, region, volumeId, instanceId, device }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AttachVolumeCommand({
          VolumeId: volumeId,
          InstanceId: instanceId,
          Device: device,
      });
      const response = await client.send(command);
      return { attachment: response };
    } catch (err) {
      return { error: 'Failed to attach an EBS volume to an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
