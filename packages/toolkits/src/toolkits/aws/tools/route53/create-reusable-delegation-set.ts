import { tool } from 'ai';
import { z } from 'zod';
import { CreateReusableDelegationSetCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53ReusableDelegationSet = tool({
  description: 'Create a reusable delegation set. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    callerReference: z.string().describe('Unique identifier'),
    hostedZoneId: z.string().optional().describe('Hosted zone ID to copy name servers from'),
  }),
  execute: async ({ awsCredentials, region, callerReference, hostedZoneId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateReusableDelegationSetCommand({
          CallerReference: callerReference,
          HostedZoneId: hostedZoneId,
      });
      const response = await client.send(command);
      return {
                  delegationSet: response.DelegationSet,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a reusable delegation set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
