import { tool } from 'ai';
import { z } from 'zod';
import { ListAttacksCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsListAttacks = tool({
  description: 'List DDoS attacks detected on protected resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArns: z.array(z.string()).optional().describe('Filter by resource ARNs'),
    startTime: z.record(z.any()).optional().describe('Start of time period to search'),
    endTime: z.record(z.any()).optional().describe('End of time period to search'),
    maxResults: z.number().optional().describe('Maximum number of attacks to return'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, resourceArns, startTime, endTime, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new ListAttacksCommand({
          ResourceArns: resourceArns,
          StartTime: startTime,
          EndTime: endTime,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list DDoS attacks detected on protected resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
