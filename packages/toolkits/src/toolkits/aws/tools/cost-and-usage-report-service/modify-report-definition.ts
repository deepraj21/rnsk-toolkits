import { tool } from 'ai';
import { z } from 'zod';
import { ModifyReportDefinitionCommand } from '@aws-sdk/client-cost-and-usage-report-service';
import { createCostAndUsageReportServiceClient } from '../client.js';

export const awsModifyReportDefinition = tool({
  description: 'Allows you to programmatically update your report preferences. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportName: z.string().describe('The name of the report that you want to create'),
    reportDefinition: z.enum(['HOURLY', 'DAILY', 'MONTHLY']).optional().describe('Represents the output of the PutReportDefinition operation. The content consists of the metadata, and report name and description'),
  }),
  execute: async ({ awsCredentials, region, reportName, reportDefinition }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostAndUsageReportServiceClient(awsCredentials, region);

      const command = new ModifyReportDefinitionCommand({
          ReportName: reportName,
          ReportDefinition: reportDefinition,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
                  message: 'Report definition modified successfully',
              };
    } catch (err) {
      return { error: 'Failed to allows you to programmatically update your report preferences', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
