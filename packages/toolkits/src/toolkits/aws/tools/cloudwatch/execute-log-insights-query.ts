import { tool } from 'ai';
import { z } from 'zod';
import { StartQueryCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsExecuteLogInsightsQuery = tool({
  description: 'Executes CloudWatch Logs insights query on CloudWatch log group(s) with specified time range and query syntax, returns a unique ID used to retrieve results. Use it to start a query, then poll for results with the query ID.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupNames: z.array(z.string()).describe('Array of log group names to query'),
    queryString: z.string().describe('The query string to execute'),
    startTime: z.number().describe('Start time in Unix timestamp (seconds)'),
    endTime: z.number().describe('End time in Unix timestamp (seconds)'),
    limit: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, logGroupNames, queryString, startTime, endTime, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new StartQueryCommand({
          logGroupNames,
          queryString,
          startTime,
          endTime,
          limit,
      });
      const response = await client.send(command);
      return {
                  queryId: response.queryId,
                  status: 'RUNNING',
              };
    } catch (err) {
      return { error: 'Failed to execute CloudWatch Logs insights query', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
