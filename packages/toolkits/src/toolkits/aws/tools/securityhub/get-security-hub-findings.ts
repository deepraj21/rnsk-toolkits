import { tool } from 'ai';
import { z } from 'zod';
import { GetFindingsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsGetSecurityHubFindings = tool({
  description: 'Retrieve security findings with optional filters. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filters: z.record(z.any()).optional().describe('Filters to apply to findings (severity, status, resource type, etc.)'),
    sortCriteria: z.enum(['asc', 'desc']).optional().describe('Criteria for sorting findings'),
    maxResults: z.number().optional().describe('Maximum number of findings to return (1-100)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, filters, sortCriteria, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new GetFindingsCommand({
          Filters: filters,
          SortCriteria: sortCriteria,
          MaxResults: maxResults,
          NextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to retrieve security findings with optional filters', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
