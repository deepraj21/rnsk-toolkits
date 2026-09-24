import { tool } from 'ai';
import { z } from 'zod';
import { UpdateHealthCheckCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsUpdateRoute53HealthCheck = tool({
  description: 'Update a Route 53 health check. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    healthCheckId: z.string().describe('The health check ID'),
    healthCheckVersion: z.number().optional().describe('The health check version'),
    resourcePath: z.string().optional().describe('The path to check'),
    fullyQualifiedDomainName: z.string().optional().describe('The fully qualified domain name'),
    port: z.number().optional().describe('The port to check'),
    regions: z.array(z.string()).optional().describe('Regions to check from'),
    alarmIdentifier: z.record(z.any()).optional().describe('CloudWatch alarm identifier (Region, Name)'),
    insufficientDataHealthStatus: z.enum(['Healthy', 'Unhealthy', 'LastKnownStatus']).optional().describe('Health status when data is insufficient'),
    resetElements: z.array(z.string()).optional().describe('Elements to reset'),
  }),
  execute: async ({ awsCredentials, region, healthCheckId, healthCheckVersion, resourcePath, fullyQualifiedDomainName, port, regions, alarmIdentifier, insufficientDataHealthStatus, resetElements }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new UpdateHealthCheckCommand({
          HealthCheckId: healthCheckId,
          HealthCheckVersion: healthCheckVersion,
          ResourcePath: resourcePath,
          FullyQualifiedDomainName: fullyQualifiedDomainName,
          Port: port,
          Regions: regions,
          AlarmIdentifier: alarmIdentifier,
          InsufficientDataHealthStatus: insufficientDataHealthStatus as any,
          ResetElements: resetElements as any,
      } as any);
      const response = await client.send(command);
      return {
                  healthCheck: response.HealthCheck,
              };
    } catch (err) {
      return { error: 'Failed to update a Route 53 health check', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
