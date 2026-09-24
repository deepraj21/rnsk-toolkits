import { tool } from 'ai';
import { z } from 'zod';
import { ListFindingsCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsListGuarddutyFindings = tool({
  description: 'List GuardDuty findings with optional filtering. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    findingCriteria: z.record(z.any()).optional().describe('Criteria to filter findings'),
    sortCriteria: z.record(z.any()).optional().describe('Criteria to sort findings'),
    maxResults: z.number().optional().describe('Maximum number of findings to return (1-50)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, detectorId, findingCriteria, sortCriteria, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new ListFindingsCommand({
          DetectorId: detectorId,
          FindingCriteria: findingCriteria,
          SortCriteria: sortCriteria,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list GuardDuty findings with optional filtering', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
