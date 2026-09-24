import { tool } from 'ai';
import { z } from 'zod';
import { ListIPSetsCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsListGuarddutyIpSets = tool({
  description: 'List all IP sets for a detector. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    maxResults: z.number().optional().describe('Maximum number of IP sets to return (1-50)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, detectorId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new ListIPSetsCommand({
          DetectorId: detectorId,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all IP sets for a detector', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
