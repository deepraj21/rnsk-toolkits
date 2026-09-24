import { tool } from 'ai';
import { z } from 'zod';
import { ArchiveFindingsCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsArchiveGuarddutyFindings = tool({
  description: 'Archive findings to suppress future notifications',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    findingIds: z.array(z.string()).describe('List of finding IDs to archive'),
  }),
  execute: async ({ awsCredentials, region, detectorId, findingIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new ArchiveFindingsCommand({
          DetectorId: detectorId,
          FindingIds: findingIds,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to archive findings to suppress future notifications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
