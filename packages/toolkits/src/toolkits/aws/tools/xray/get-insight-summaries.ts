import { tool } from 'ai';
import { z } from 'zod';
import { GetInsightSummariesCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetInsightSummaries = tool({
  description: 'Retrieves the summaries of all insights in the specified group matching the provided filter values. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    states: z.array(z.string()).optional().describe('List of insight states'),
    groupARN: z.string().optional().describe('The Amazon Resource Name (ARN) of the group'),
    groupName: z.string().optional().describe('The name of the group'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format'),
    endTime: z.string().optional().describe('End time in ISO 8601 format'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, states, groupARN, groupName, startTime, endTime, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetInsightSummariesCommand({
          States: states,
          GroupARN: groupARN,
          GroupName: groupName,
          StartTime: startTime ? new Date(startTime) : undefined,
          EndTime: endTime ? new Date(endTime) : undefined,
          MaxResults: maxResults,
          NextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  insightSummaries: response.InsightSummaries || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the summaries of all insights in the specified group matching the provided filter values', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
