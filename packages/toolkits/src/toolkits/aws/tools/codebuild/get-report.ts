import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetReportsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsGetCodebuildReport = tool({
  description: 'Returns a list of ARNs for the reports in the current account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportArn: z.string().describe('The ARN of the report to return'),
  }),
  execute: async ({ awsCredentials, region, reportArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetReportsCommand({
          reportArns: [reportArn],
      });
      const response = await client.send(command);
      return {
                  report: response.reports?.[0] || null,
                  reportsNotFound: response.reportsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to returns a list of ARNs for the reports in the current account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
