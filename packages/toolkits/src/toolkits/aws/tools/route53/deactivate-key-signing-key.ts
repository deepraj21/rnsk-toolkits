import { tool } from 'ai';
import { z } from 'zod';
import { DeactivateKeySigningKeyCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDeactivateRoute53KeySigningKey = tool({
  description: 'Deactivate a key signing key for a hosted zone. Use it to disable a feature.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    name: z.string().describe('The key signing key name'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new DeactivateKeySigningKeyCommand({
          HostedZoneId: hostedZoneId,
          Name: name,
      });
      const response = await client.send(command);
      return {
                  changeInfo: response.ChangeInfo,
              };
    } catch (err) {
      return { error: 'Failed to deactivate a key signing key for a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
