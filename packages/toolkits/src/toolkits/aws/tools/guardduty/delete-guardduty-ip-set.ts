import { tool } from 'ai';
import { z } from 'zod';
import { DeleteIPSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsDeleteGuarddutyIpSet = tool({
  description: 'Delete an IP set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    ipSetId: z.string().describe('IP set ID to delete'),
  }),
  execute: async ({ awsCredentials, region, detectorId, ipSetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new DeleteIPSetCommand({
          DetectorId: detectorId,
          IpSetId: ipSetId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an IP set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
