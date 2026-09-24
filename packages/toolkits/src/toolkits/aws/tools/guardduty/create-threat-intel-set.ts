import { tool } from 'ai';
import { z } from 'zod';
import { CreateThreatIntelSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsCreateThreatIntelSet = tool({
  description: 'Create a threat intelligence set from external sources. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    name: z.string().describe('Name of the threat intel set'),
    format: z.enum(['TXT', 'STIX', 'OTX_CSV', 'ALIEN_VAULT', 'PROOF_POINT', 'FIRE_EYE']).describe('Format of the threat intel file'),
    location: z.string().describe('S3 URL of the threat intel file'),
    activate: z.boolean().describe('Activate the threat intel set immediately'),
    tags: z.record(z.any()).optional().describe('Tags for the threat intel set'),
  }),
  execute: async ({ awsCredentials, region, detectorId, name, format, location, activate, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new CreateThreatIntelSetCommand({
          DetectorId: detectorId,
          Name: name,
          Format: format,
          Location: location,
          Activate: activate,
          Tags: tags,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a threat intelligence set from external sources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
