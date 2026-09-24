import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDetectorCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsDeleteGuarddutyDetector = tool({
  description: 'Delete a GuardDuty detector and disable threat detection. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID to delete'),
  }),
  execute: async ({ awsCredentials, region, detectorId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new DeleteDetectorCommand({
          DetectorId: detectorId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete a GuardDuty detector and disable threat detection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
