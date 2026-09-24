import { tool } from 'ai';
import { z } from 'zod';
import { UpdateDetectorCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsUpdateGuarddutyDetector = tool({
  description: 'Update GuardDuty detector settings. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    enable: z.boolean().optional().describe('Enable or disable the detector'),
    findingPublishingFrequency: z.enum(['FIFTEEN_MINUTES', 'ONE_HOUR', 'SIX_HOURS']).optional().describe('Update notification frequency'),
  }),
  execute: async ({ awsCredentials, region, detectorId, enable, findingPublishingFrequency }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new UpdateDetectorCommand({
          DetectorId: detectorId,
          Enable: enable,
          FindingPublishingFrequency: findingPublishingFrequency,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update GuardDuty detector settings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
