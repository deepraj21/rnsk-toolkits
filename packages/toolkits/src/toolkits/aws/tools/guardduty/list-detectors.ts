import { tool } from 'ai';
import { z } from 'zod';
import { ListDetectorsCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsListGuarddutyDetectors = tool({
  description: 'List all GuardDuty detectors in the current region. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of detectors to return (1-50)'),
    nextToken: z.string().optional().describe('Pagination token from previous response'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new ListDetectorsCommand({
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all GuardDuty detectors in the current region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
