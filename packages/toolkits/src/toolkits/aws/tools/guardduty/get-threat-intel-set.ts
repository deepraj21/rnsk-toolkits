import { tool } from 'ai';
import { z } from 'zod';
import { GetThreatIntelSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsGetThreatIntelSet = tool({
  description: 'Get details about a specific threat intelligence set. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    threatIntelSetId: z.string().describe('Threat intel set ID'),
  }),
  execute: async ({ awsCredentials, region, detectorId, threatIntelSetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new GetThreatIntelSetCommand({
          DetectorId: detectorId,
          ThreatIntelSetId: threatIntelSetId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get details about a specific threat intelligence set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
