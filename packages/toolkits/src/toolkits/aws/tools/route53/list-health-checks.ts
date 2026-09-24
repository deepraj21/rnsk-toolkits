import { tool } from 'ai';
import { z } from 'zod';
import { ListHealthChecksCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53HealthChecks = tool({
  description: 'List all Route 53 health checks. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of health checks to return'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListHealthChecksCommand({
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  healthChecks: response.HealthChecks,
                  marker: response.Marker,
                  isTruncated: response.IsTruncated,
                  nextMarker: response.NextMarker,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all Route 53 health checks', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
