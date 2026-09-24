import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetReportsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsBatchGetCodebuildReports = tool({
  description: 'Returns an array of reports. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportArns: z.array(z.string()).describe('An array of ARNs that identify the reports'),
  }),
  execute: async ({ awsCredentials, region, reportArns }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetReportsCommand({
          reportArns: reportArns,
      });
      const response = await client.send(command);
      return {
                  reports: response.reports || [],
                  reportsNotFound: response.reportsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to returns an array of reports', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
