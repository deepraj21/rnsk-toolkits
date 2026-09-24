import { tool } from 'ai';
import { z } from 'zod';
import { DeleteHealthCheckCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDeleteRoute53HealthCheck = tool({
  description: 'Delete a Route 53 health check. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    healthCheckId: z.string().describe('The health check ID'),
  }),
  execute: async ({ awsCredentials, region, healthCheckId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new DeleteHealthCheckCommand({
          HealthCheckId: healthCheckId,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Health check ${healthCheckId} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a Route 53 health check', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
