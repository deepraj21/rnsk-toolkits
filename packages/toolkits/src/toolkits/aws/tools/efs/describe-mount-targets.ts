import { tool } from 'ai';
import { z } from 'zod';
import { DescribeMountTargetsCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDescribeEfsMountTargets = tool({
  description: 'Get details about mount targets. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().optional().describe('File system ID to filter by'),
    mountTargetId: z.string().optional().describe('Mount target ID to describe'),
    accessPointId: z.string().optional().describe('Access point ID to filter by'),
    maxItems: z.number().optional().describe('Maximum number of mount targets to return'),
    marker: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, mountTargetId, accessPointId, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DescribeMountTargetsCommand({
          FileSystemId: fileSystemId,
          MountTargetId: mountTargetId,
          AccessPointId: accessPointId,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return {
                  mountTargets: response.MountTargets || [],
                  marker: response.Marker,
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to get details about mount targets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
