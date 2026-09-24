import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAccessPointCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDeleteEfsAccessPoint = tool({
  description: 'Delete an access point. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accessPointId: z.string().describe('The ID of the access point to delete'),
  }),
  execute: async ({ awsCredentials, region, accessPointId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DeleteAccessPointCommand({
          AccessPointId: accessPointId,
      });
      await client.send(command);
      return {
                  message: 'Access point deleted successfully',
                  accessPointId: accessPointId,
              };
    } catch (err) {
      return { error: 'Failed to delete an access point', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
