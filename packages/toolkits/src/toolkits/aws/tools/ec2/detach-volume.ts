import { tool } from 'ai';
import { z } from 'zod';
import { DetachVolumeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDetachEc2Volume = tool({
  description: 'Detach an EBS volume from an instance. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeId: z.string().describe('The ID of the volume'),
    instanceId: z.string().optional().describe('The ID of the instance'),
    device: z.string().optional().describe('Device name'),
    force: z.boolean().optional().describe('Force detachment'),
  }),
  execute: async ({ awsCredentials, region, volumeId, instanceId, device, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DetachVolumeCommand({
          VolumeId: volumeId,
          InstanceId: instanceId,
          Device: device,
          Force: force,
      });
      const response = await client.send(command);
      return { attachment: response };
    } catch (err) {
      return { error: 'Failed to detach an EBS volume from an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
