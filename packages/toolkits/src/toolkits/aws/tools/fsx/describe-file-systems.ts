import { tool } from 'ai';
import { z } from 'zod';
import { DescribeFileSystemsCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDescribeFsxFileSystems = tool({
  description: 'Get details about one or more FSx file systems. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemIds: z.array(z.string()).optional().describe('List of file system IDs to describe (optional, lists all if not provided)'),
    maxResults: z.number().optional().describe('Maximum number of file systems to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, fileSystemIds, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DescribeFileSystemsCommand({
          FileSystemIds: fileSystemIds,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  fileSystems: response.FileSystems || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more FSx file systems', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
