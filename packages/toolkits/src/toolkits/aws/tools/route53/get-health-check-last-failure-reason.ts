import { tool } from 'ai';
import { z } from 'zod';
import { GetHealthCheckLastFailureReasonCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53HealthCheckLastFailureReason = tool({
  description: 'Get the last failure reason for a Route 53 health check. Use it to inspect current state before making changes.',
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

      const command = new GetHealthCheckLastFailureReasonCommand({
          HealthCheckId: healthCheckId,
      });
      const response = await client.send(command);
      return {
                  healthCheckObservations: response.HealthCheckObservations,
              };
    } catch (err) {
      return { error: 'Failed to get the last failure reason for a Route 53 health check', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
