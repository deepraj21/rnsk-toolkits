import { tool } from 'ai';
import { z } from 'zod';
import { DescribeFileSystemsCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDescribeEfsFileSystems = tool({
  description: 'Get details about one or more EFS file systems. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().optional().describe('File system ID to describe (optional, lists all if not provided)'),
    creationToken: z.string().optional().describe('Creation token to filter by'),
    maxItems: z.number().optional().describe('Maximum number of file systems to return'),
    marker: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, creationToken, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DescribeFileSystemsCommand({
          FileSystemId: fileSystemId,
          CreationToken: creationToken,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return {
                  fileSystems: response.FileSystems || [],
                  marker: response.Marker,
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more EFS file systems', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
