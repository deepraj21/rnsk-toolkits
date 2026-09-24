import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAvailabilityZonesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2AvailabilityZones = tool({
  description: 'Describe availability zones. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    zoneNames: z.array(z.string()).optional().describe('Array of zone names'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, zoneNames, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeAvailabilityZonesCommand({
          ZoneNames: zoneNames,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { availabilityZones: response.AvailabilityZones };
    } catch (err) {
      return { error: 'Failed to describe availability zones', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
