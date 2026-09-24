import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetReportGroupsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsGetCodebuildReportGroup = tool({
  description: 'Returns a report group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('The ARN of the report group'),
  }),
  execute: async ({ awsCredentials, region, arn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetReportGroupsCommand({
          reportGroupArns: [arn],
      });
      const response = await client.send(command);
      return {
                  reportGroup: response.reportGroups?.[0] || null,
                  reportGroupsNotFound: response.reportGroupsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to returns a report group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
