import { tool } from 'ai';
import { z } from 'zod';
import { GetDetectorCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsGetGuarddutyDetector = tool({
  description: 'Get detailed information about a GuardDuty detector. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
  }),
  execute: async ({ awsCredentials, region, detectorId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new GetDetectorCommand({
          DetectorId: detectorId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a GuardDuty detector', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
