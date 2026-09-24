import { tool } from 'ai';
import { z } from 'zod';
import { StartDBInstanceCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsStartDbInstance = tool({
  description: 'Start a stopped RDS database instance. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('DB instance identifier to start'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new StartDBInstanceCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to start a stopped RDS database instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
