import { tool } from 'ai';
import { z } from 'zod';
import { DeleteReportGroupCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsDeleteCodebuildReportGroup = tool({
  description: 'Deletes a report group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('The ARN of the report group to delete'),
    deleteReports: z.boolean().optional().describe('If true, deletes any reports that belong to a report group'),
  }),
  execute: async ({ awsCredentials, region, arn, deleteReports }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      await client.send(new DeleteReportGroupCommand({
          arn: arn,
          deleteReports: deleteReports,
      }));
      return {
                  message: 'Report group deleted successfully',
                  arn: arn,
              };
    } catch (err) {
      return { error: 'Failed to deletes a report group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
