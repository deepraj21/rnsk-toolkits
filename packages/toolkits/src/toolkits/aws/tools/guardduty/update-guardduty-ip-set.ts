import { tool } from 'ai';
import { z } from 'zod';
import { UpdateIPSetCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsUpdateGuarddutyIpSet = tool({
  description: 'Update an IP set. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    ipSetId: z.string().describe('IP set ID'),
    name: z.string().optional().describe('New name for the IP set'),
    location: z.string().optional().describe('New S3 URL for the IP set file'),
    activate: z.boolean().optional().describe('Activate or deactivate the IP set'),
  }),
  execute: async ({ awsCredentials, region, detectorId, ipSetId, name, location, activate }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new UpdateIPSetCommand({
          DetectorId: detectorId,
          IpSetId: ipSetId,
          Name: name,
          Location: location,
          Activate: activate,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update an IP set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
