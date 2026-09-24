import { tool } from 'ai';
import { z } from 'zod';
import { DeleteReportCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsDeleteCodebuildReport = tool({
  description: 'Deletes a report. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('The ARN of the report to delete'),
  }),
  execute: async ({ awsCredentials, region, arn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      await client.send(new DeleteReportCommand({
          arn: arn,
      }));
      return {
                  message: 'Report deleted successfully',
                  arn: arn,
              };
    } catch (err) {
      return { error: 'Failed to deletes a report', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
