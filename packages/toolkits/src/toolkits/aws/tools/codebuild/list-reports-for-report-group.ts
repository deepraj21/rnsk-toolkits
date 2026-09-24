import { tool } from 'ai';
import { z } from 'zod';
import { ListReportsForReportGroupCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsListCodebuildReportsForReportGroup = tool({
  description: 'Returns a list of ARNs for the reports that belong to a ReportGroup. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportGroupArn: z.string().describe('The ARN of the report group'),
    nextToken: z.string().optional().describe('nextToken'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('sortOrder'),
    maxResults: z.number().optional().describe('maxResults'),
    filter: z.enum(['GENERATING', 'SUCCEEDED', 'FAILED', 'INCOMPLETE', 'DELETING']).optional().describe('filter'),
  }),
  execute: async ({ awsCredentials, region, reportGroupArn, nextToken, sortOrder, maxResults, filter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new ListReportsForReportGroupCommand({
          reportGroupArn: reportGroupArn,
          nextToken: nextToken,
          sortOrder: sortOrder as any,
          maxResults: maxResults,
          filter: filter,
      } as any);
      const response = await client.send(command);
      return {
                  reports: response.reports || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns a list of ARNs for the reports that belong to a ReportGroup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
