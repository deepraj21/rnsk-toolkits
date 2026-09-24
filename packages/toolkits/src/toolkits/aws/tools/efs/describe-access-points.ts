import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAccessPointsCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDescribeEfsAccessPoints = tool({
  description: 'Get details about access points. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accessPointId: z.string().optional().describe('Access point ID to describe'),
    fileSystemId: z.string().optional().describe('File system ID to filter by'),
    maxResults: z.number().optional().describe('Maximum number of access points to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, accessPointId, fileSystemId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DescribeAccessPointsCommand({
          AccessPointId: accessPointId,
          FileSystemId: fileSystemId,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  accessPoints: response.AccessPoints || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about access points', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
