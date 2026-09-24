import { tool } from 'ai';
import { z } from 'zod';
import { GetQueryResultsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsGetLogsInsightQueryResults = tool({
  description: 'Retrieves the results of an executed CloudWatch insights query using the query ID. It is used after execute_log_insights_query has been called. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queryId: z.string().describe('The query ID returned from execute_log_insights_query'),
  }),
  execute: async ({ awsCredentials, region, queryId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new GetQueryResultsCommand({ queryId });
      const response = await client.send(command);
      return {
                  queryId,
                  status: response.status,
                  statistics: response.statistics,
                  results: response.results?.map((r: any) =>
                      r.reduce((acc: Record<string, string>, field: any) => {
                          acc[field.field || ''] = field.value || '';
                          return acc;
                      }, {})
                  ) || [],
              };
    } catch (err) {
      return { error: 'Failed to retrieve CloudWatch Logs insights query results', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
