import { tool } from 'ai';
import { z } from 'zod';
import { CreateSnapshotCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2Snapshot = tool({
  description: 'Create a snapshot of an EBS volume. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeId: z.string().describe('The ID of the volume'),
    description: z.string().optional().describe('Description of the snapshot'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply to the snapshot'),
  }),
  execute: async ({ awsCredentials, region, volumeId, description, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateSnapshotCommand({
          VolumeId: volumeId,
          Description: description,
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { snapshotId: response.SnapshotId };
    } catch (err) {
      return { error: 'Failed to create a snapshot of an EBS volume', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
