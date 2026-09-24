import { tool } from 'ai';
import { z } from 'zod';
import { DescribeReportDefinitionsCommand } from '@aws-sdk/client-cost-and-usage-report-service';
import { createCostAndUsageReportServiceClient } from '../client.js';

export const awsDescribeReportDefinitions = tool({
  description: 'Lists the AWS Cost and Usage reports available to the account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('The maximum number of results that AWS returns for the operation'),
    nextToken: z.string().optional().describe('A generic pagination token that is used in a subsequent request to retrieve the next page of results'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostAndUsageReportServiceClient(awsCredentials, region);

      const command = new DescribeReportDefinitionsCommand({
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  reportDefinitions: response.ReportDefinitions || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to lists the AWS Cost and Usage reports available to the account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
