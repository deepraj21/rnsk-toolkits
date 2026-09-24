import { tool } from 'ai';
import { z } from 'zod';
import { CreateIPSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsCreateGuarddutyIpSet = tool({
  description: 'Create an IP set of trusted or threat IP addresses. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    name: z.string().describe('Name of the IP set'),
    format: z.enum(['TXT', 'STIX', 'OTX_CSV', 'ALIEN_VAULT', 'PROOF_POINT', 'FIRE_EYE']).describe('Format of the IP set file'),
    location: z.string().describe('S3 URL of the IP set file'),
    activate: z.boolean().describe('Activate the IP set immediately'),
    tags: z.record(z.any()).optional().describe('Tags for the IP set'),
  }),
  execute: async ({ awsCredentials, region, detectorId, name, format, location, activate, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new CreateIPSetCommand({
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
      return { error: 'Failed to create an IP set of trusted or threat IP addresses', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
