import { tool } from 'ai';
import { z } from 'zod';
import { RebootDBInstanceCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsRebootDbInstance = tool({
  description: 'Reboot an RDS database instance. Use it to restart the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('DB instance identifier to reboot'),
    forceFailover: z.boolean().optional().describe('Force a failover from primary to standby (Multi-AZ only)'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, forceFailover }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new RebootDBInstanceCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          ForceFailover: forceFailover,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to reboot an RDS database instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
