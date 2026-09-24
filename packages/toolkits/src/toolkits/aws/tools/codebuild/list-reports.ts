import { tool } from 'ai';
import { z } from 'zod';
import { ListReportsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsListCodebuildReports = tool({
  description: 'Returns a list of ARNs for the reports. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('sortOrder'),
    nextToken: z.string().optional().describe('nextToken'),
    maxResults: z.number().optional().describe('maxResults'),
    filter: z.enum(['GENERATING', 'SUCCEEDED', 'FAILED', 'INCOMPLETE', 'DELETING']).optional().describe('filter'),
  }),
  execute: async ({ awsCredentials, region, sortOrder, nextToken, maxResults, filter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new ListReportsCommand({
          sortOrder: sortOrder as any,
          nextToken: nextToken,
          maxResults: maxResults,
          filter: filter,
      } as any);
      const response = await client.send(command);
      return {
                  reports: response.reports || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns a list of ARNs for the reports', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
