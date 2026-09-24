import { tool } from 'ai';
import { z } from 'zod';
import { DeleteHostedZoneCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDeleteRoute53HostedZone = tool({
  description: 'Delete a Route 53 hosted zone. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The hosted zone ID'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new DeleteHostedZoneCommand({
          Id: id,
      });
      const response = await client.send(command);
      return {
                  changeInfo: response.ChangeInfo,
              };
    } catch (err) {
      return { error: 'Failed to delete a Route 53 hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
