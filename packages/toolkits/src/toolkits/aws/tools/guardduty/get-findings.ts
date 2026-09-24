import { tool } from 'ai';
import { z } from 'zod';
import { GetFindingsCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsGetGuarddutyFindings = tool({
  description: 'Get detailed information about specific findings. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    findingIds: z.array(z.string()).describe('List of finding IDs to retrieve'),
    sortCriteria: z.record(z.any()).optional().describe('Criteria to sort findings'),
  }),
  execute: async ({ awsCredentials, region, detectorId, findingIds, sortCriteria }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new GetFindingsCommand({
          DetectorId: detectorId,
          FindingIds: findingIds,
          SortCriteria: sortCriteria,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about specific findings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
