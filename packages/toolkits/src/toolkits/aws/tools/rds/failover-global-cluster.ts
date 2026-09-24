import { tool } from 'ai';
import { z } from 'zod';
import { FailoverGlobalClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsFailoverGlobalCluster = tool({
  description: 'Promote a secondary Aurora cluster to primary in a Global Database. Use it to trigger a failover (causes downtime).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalClusterIdentifier: z.string().describe('Global cluster identifier'),
    targetDbClusterIdentifier: z.string().describe('Secondary cluster to promote to primary'),
  }),
  execute: async ({ awsCredentials, region, globalClusterIdentifier, targetDbClusterIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new FailoverGlobalClusterCommand({
          GlobalClusterIdentifier: globalClusterIdentifier,
          TargetDbClusterIdentifier: targetDbClusterIdentifier,
      });
      const response = await client.send(command);
      return response.GlobalCluster;
    } catch (err) {
      return { error: 'Failed to promote a secondary Aurora cluster to primary in a Global Database', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
