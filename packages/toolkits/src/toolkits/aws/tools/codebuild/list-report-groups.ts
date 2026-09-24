import { tool } from 'ai';
import { z } from 'zod';
import { ListReportGroupsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsListCodebuildReportGroups = tool({
  description: 'Returns a list of report groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('sortOrder'),
    sortBy: z.enum(['NAME', 'CREATED_TIME', 'LAST_MODIFIED_TIME']).optional().describe('sortBy'),
    nextToken: z.string().optional().describe('nextToken'),
    maxResults: z.number().optional().describe('maxResults'),
  }),
  execute: async ({ awsCredentials, region, sortOrder, sortBy, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new ListReportGroupsCommand({
          sortOrder: sortOrder as any,
          sortBy: sortBy as any,
          nextToken: nextToken,
          maxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  reportGroups: response.reportGroups || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns a list of report groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
