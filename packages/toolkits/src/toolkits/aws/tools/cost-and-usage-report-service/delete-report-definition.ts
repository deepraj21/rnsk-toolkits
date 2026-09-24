import { tool } from 'ai';
import { z } from 'zod';
import { DeleteReportDefinitionCommand } from '@aws-sdk/client-cost-and-usage-report-service';
import { createCostAndUsageReportServiceClient } from '../client.js';

export const awsDeleteReportDefinition = tool({
  description: 'Deletes the specified report. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    reportName: z.string().describe('The name of the report that you want to delete'),
  }),
  execute: async ({ awsCredentials, region, reportName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostAndUsageReportServiceClient(awsCredentials, region);

      const command = new DeleteReportDefinitionCommand({
          ReportName: reportName,
      });
      const response = await client.send(command);
      return {
                  success: true,
                  message: `Report definition ${reportName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to deletes the specified report', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
