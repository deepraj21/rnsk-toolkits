import { tool } from 'ai';
import { z } from 'zod';
import { GetQueryResultsCommand, StartQueryCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsAnalyzeLogGroup = tool({
  description: 'Analyzes CloudWatch logs for anomalies, message patterns, and error patterns. Use it to analyze trends, patterns, and anomalies.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the CloudWatch log group'),
    startTime: z.number().optional().describe('Start time in Unix timestamp (seconds)'),
    endTime: z.number().optional().describe('End time in Unix timestamp (seconds)'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, startTime, endTime }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      // Use a query to analyze logs for patterns
      const defaultStartTime = startTime || Math.floor((Date.now() - 24 * 3600000) / 1000);
      const defaultEndTime = endTime || Math.floor(Date.now() / 1000);

      // Query for errors and patterns
      const errorQuery = `fields @timestamp, @message
      | filter @message like /(?i)(error|exception|fail|fatal)/
      | stats count() as errorCount by bin(5m)`;

      const queryCommand = new StartQueryCommand({
          logGroupNames: [logGroupName],
          queryString: errorQuery,
          startTime: defaultStartTime,
          endTime: defaultEndTime,
      });

      const queryResponse = await client.send(queryCommand);
      const queryId = queryResponse.queryId;

      if (!queryId) {
          return {
                      error: 'Failed to start query',
                  };
      }

      // Wait a bit and get results
      await new Promise(resolve => setTimeout(resolve, 2000));

      const resultsCommand = new GetQueryResultsCommand({ queryId });
      const resultsResponse = await client.send(resultsCommand);

      const results = resultsResponse.results || [];
      const totalErrors = results.reduce((sum: number, r: any) => {
          const countField = r.find((f: any) => f.field === 'errorCount');
          return sum + (countField ? parseFloat(countField.value || '0') : 0);
      }, 0);

      return {
                  logGroupName,
                  analysisPeriod: {
                      startTime: new Date(defaultStartTime * 1000).toISOString(),
                      endTime: new Date(defaultEndTime * 1000).toISOString(),
                  },
                  errorAnalysis: {
                      totalErrorEvents: totalErrors,
                      errorTimeSeries: results.map((r: any) => {
                          const timeField = r.find((f: any) => f.field === 'bin(5m)');
                          const countField = r.find((f: any) => f.field === 'errorCount');
                          return {
                              timestamp: timeField?.value,
                              errorCount: countField ? parseFloat(countField.value || '0') : 0,
                          };
                      }),
                  },
                  patterns: {
                      hasErrors: totalErrors > 0,
                      errorFrequency: totalErrors > 0 ? 'high' : 'low',
                  },
              };
    } catch (err) {
      return { error: 'Failed to analyze CloudWatch log group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
