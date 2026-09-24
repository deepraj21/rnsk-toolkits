import { tool } from 'ai';
import { z } from 'zod';
import { GetDNSSECCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53Dnssec = tool({
  description: 'Get DNSSEC information for a hosted zone. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new GetDNSSECCommand({
          HostedZoneId: hostedZoneId,
      });
      const response = await client.send(command);
      return {
                  status: response.Status,
                  keySigningKeys: response.KeySigningKeys,
              };
    } catch (err) {
      return { error: 'Failed to get DNSSEC information for a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
