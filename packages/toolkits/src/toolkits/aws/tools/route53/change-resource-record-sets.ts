import { tool } from 'ai';
import { z } from 'zod';
import { ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsChangeRoute53ResourceRecordSets = tool({
  description: 'Create, update, or delete resource record sets',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    changeBatch: z.record(z.any()).describe('Change batch with changes array (Action, ResourceRecordSet)'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, changeBatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ChangeResourceRecordSetsCommand({
          HostedZoneId: hostedZoneId,
          ChangeBatch: changeBatch,
      } as any);
      const response = await client.send(command);
      return {
                  changeInfo: response.ChangeInfo,
              };
    } catch (err) {
      return { error: 'Failed to create, update, or delete resource record sets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
