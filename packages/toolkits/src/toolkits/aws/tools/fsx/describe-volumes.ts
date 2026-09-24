import { tool } from 'ai';
import { z } from 'zod';
import { DescribeVolumesCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDescribeFsxVolumes = tool({
  description: 'Get details about volumes. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeIds: z.array(z.string()).optional().describe('List of volume IDs to describe'),
    filters: z.array(z.record(z.any())).optional().describe('Filters to apply'),
    maxResults: z.number().optional().describe('Maximum number of volumes to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, volumeIds, filters, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DescribeVolumesCommand({
          VolumeIds: volumeIds,
          Filters: filters,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  volumes: response.Volumes || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about volumes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
