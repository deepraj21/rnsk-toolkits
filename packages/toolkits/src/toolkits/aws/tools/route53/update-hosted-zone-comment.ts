import { tool } from 'ai';
import { z } from 'zod';
import { UpdateHostedZoneCommentCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsUpdateRoute53HostedZoneComment = tool({
  description: 'Update the comment for a Route 53 hosted zone. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The hosted zone ID'),
    comment: z.string().optional().describe('The new comment'),
  }),
  execute: async ({ awsCredentials, region, id, comment }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new UpdateHostedZoneCommentCommand({
          Id: id,
          Comment: comment,
      });
      const response = await client.send(command);
      return {
                  hostedZone: response.HostedZone,
              };
    } catch (err) {
      return { error: 'Failed to update the comment for a Route 53 hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
