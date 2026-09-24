import { tool } from 'ai';
import { z } from 'zod';
import { DescribeVolumesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2Volumes = tool({
  description: 'Describe EBS volumes. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeIds: z.array(z.string()).optional().describe('Array of volume IDs'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, volumeIds, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeVolumesCommand({
          VolumeIds: volumeIds,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { volumes: response.Volumes };
    } catch (err) {
      return { error: 'Failed to describe EBS volumes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
