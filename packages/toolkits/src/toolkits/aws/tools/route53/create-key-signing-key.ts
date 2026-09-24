import { tool } from 'ai';
import { z } from 'zod';
import { CreateKeySigningKeyCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53KeySigningKey = tool({
  description: 'Create a key signing key for a hosted zone. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    callerReference: z.string().describe('Unique identifier'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    keyManagementServiceArn: z.string().describe('KMS key ARN'),
    name: z.string().describe('The key signing key name'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().describe('Initial status of the key signing key'),
  }),
  execute: async ({ awsCredentials, region, callerReference, hostedZoneId, keyManagementServiceArn, name, status }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateKeySigningKeyCommand({
          CallerReference: callerReference,
          HostedZoneId: hostedZoneId,
          KeyManagementServiceArn: keyManagementServiceArn,
          Name: name,
          Status: status as any,
      });
      const response = await client.send(command);
      return {
                  changeInfo: response.ChangeInfo,
              };
    } catch (err) {
      return { error: 'Failed to create a key signing key for a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
