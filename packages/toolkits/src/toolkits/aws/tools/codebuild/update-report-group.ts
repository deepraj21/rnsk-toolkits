import { tool } from 'ai';
import { z } from 'zod';
import { UpdateReportGroupCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsUpdateCodebuildReportGroup = tool({
  description: 'Updates a report group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('The ARN of the report group'),
    exportConfig: z.enum(['S3', 'NO_EXPORT']).optional().describe('Used to specify an updated export type'),
    tags: z.array(z.record(z.any())).optional().describe('tags'),
  }),
  execute: async ({ awsCredentials, region, arn, exportConfig, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new UpdateReportGroupCommand({
          arn: arn,
          exportConfig: exportConfig,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  reportGroup: (response as any).reportGroup,
              };
    } catch (err) {
      return { error: 'Failed to updates a report group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
