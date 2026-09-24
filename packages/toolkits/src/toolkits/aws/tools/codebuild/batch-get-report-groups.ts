import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetReportGroupsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsBatchGetCodebuildReportGroups = tool({
  description: 'Returns an array of report groups. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportGroupArns: z.array(z.string()).describe('An array of report group ARNs'),
  }),
  execute: async ({ awsCredentials, region, reportGroupArns }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetReportGroupsCommand({
          reportGroupArns: reportGroupArns,
      });
      const response = await client.send(command);
      return {
                  reportGroups: response.reportGroups || [],
                  reportGroupsNotFound: response.reportGroupsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to returns an array of report groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
