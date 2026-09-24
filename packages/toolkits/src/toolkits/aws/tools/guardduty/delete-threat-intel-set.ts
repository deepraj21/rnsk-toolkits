import { tool } from 'ai';
import { z } from 'zod';
import { DeleteThreatIntelSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsDeleteThreatIntelSet = tool({
  description: 'Delete a threat intelligence set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    threatIntelSetId: z.string().describe('Threat intel set ID to delete'),
  }),
  execute: async ({ awsCredentials, region, detectorId, threatIntelSetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new DeleteThreatIntelSetCommand({
          DetectorId: detectorId,
          ThreatIntelSetId: threatIntelSetId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete a threat intelligence set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
