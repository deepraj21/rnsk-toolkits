import { tool } from 'ai';
import { z } from 'zod';
import { UpdateThreatIntelSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsUpdateThreatIntelSet = tool({
  description: 'Update a threat intelligence set. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    threatIntelSetId: z.string().describe('Threat intel set ID'),
    name: z.string().optional().describe('New name for the threat intel set'),
    location: z.string().optional().describe('New S3 URL for the threat intel file'),
    activate: z.boolean().optional().describe('Activate or deactivate the threat intel set'),
  }),
  execute: async ({ awsCredentials, region, detectorId, threatIntelSetId, name, location, activate }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new UpdateThreatIntelSetCommand({
          DetectorId: detectorId,
          ThreatIntelSetId: threatIntelSetId,
          Name: name,
          Location: location,
          Activate: activate,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update a threat intelligence set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
