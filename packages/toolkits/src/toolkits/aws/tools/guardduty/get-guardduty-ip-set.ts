import { tool } from 'ai';
import { z } from 'zod';
import { GetIPSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsGetGuarddutyIpSet = tool({
  description: 'Get details about a specific IP set. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    ipSetId: z.string().describe('IP set ID'),
  }),
  execute: async ({ awsCredentials, region, detectorId, ipSetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new GetIPSetCommand({
          DetectorId: detectorId,
          IpSetId: ipSetId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get details about a specific IP set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
