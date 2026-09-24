import { tool } from 'ai';
import { z } from 'zod';
import { CreateReportGroupCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsCreateCodebuildReportGroup = tool({
  description: 'Creates a report group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the report group'),
    type: z.enum(['TEST', 'CODE_COVERAGE']).describe('The type of report group'),
    exportConfig: z.enum(['S3', 'NO_EXPORT']).describe('A ReportExportConfig object'),
    tags: z.array(z.record(z.any())).optional().describe('tags'),
  }),
  execute: async ({ awsCredentials, region, name, type, exportConfig, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new CreateReportGroupCommand({
          name: name,
          type: type as any,
          exportConfig: exportConfig,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  reportGroup: (response as any).reportGroup,
              };
    } catch (err) {
      return { error: 'Failed to creates a report group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
