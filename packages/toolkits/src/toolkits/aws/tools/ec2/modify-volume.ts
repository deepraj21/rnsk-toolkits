import { tool } from 'ai';
import { z } from 'zod';
import { ModifyVolumeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsModifyEc2Volume = tool({
  description: 'Modify an EBS volume (size, type, IOPS). Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeId: z.string().describe('The ID of the volume'),
    size: z.number().optional().describe('New size in GiB'),
    volumeType: z.string().optional().describe('New volume type'),
    iops: z.number().optional().describe('New IOPS'),
  }),
  execute: async ({ awsCredentials, region, volumeId, size, volumeType, iops }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new ModifyVolumeCommand({
          VolumeId: volumeId,
          Size: size,
          VolumeType: volumeType as any,
          Iops: iops,
      });
      const response = await client.send(command);
      return { volumeModification: response.VolumeModification };
    } catch (err) {
      return { error: 'Failed to modify an EBS volume (size, type, IOPS)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
