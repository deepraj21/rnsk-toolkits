import { tool } from 'ai';
import { z } from 'zod';
import { CreateHealthCheckCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53HealthCheck = tool({
  description: 'Create a Route 53 health check. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    callerReference: z.string().describe('Unique identifier'),
    healthCheckConfig: z.record(z.any()).describe('Health check configuration (Type, ResourcePath, FullyQualifiedDomainName, Port, etc.)'),
  }),
  execute: async ({ awsCredentials, region, callerReference, healthCheckConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateHealthCheckCommand({
          CallerReference: callerReference,
          HealthCheckConfig: healthCheckConfig,
      } as any);
      const response = await client.send(command);
      return {
                  healthCheck: response.HealthCheck,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a Route 53 health check', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
