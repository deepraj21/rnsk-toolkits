import { tool } from 'ai';
import { z } from 'zod';
import { PutReportDefinitionCommand } from '@aws-sdk/client-cost-and-usage-report-service';
import { createCostAndUsageReportServiceClient } from '../client.js';

export const awsPutReportDefinition = tool({
  description: 'Creates a new report using the description that you provide. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportDefinition: z.enum(['HOURLY', 'DAILY', 'MONTHLY']).optional().describe('Represents the output of the PutReportDefinition operation. The content consists of the metadata, and report name and description'),
  }),
  execute: async ({ awsCredentials, region, reportDefinition }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostAndUsageReportServiceClient(awsCredentials, region);

      const command = new PutReportDefinitionCommand({
          ReportDefinition: reportDefinition,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
                  message: 'Report definition created successfully',
              };
    } catch (err) {
      return { error: 'Failed to creates a new report using the description that you provide', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
