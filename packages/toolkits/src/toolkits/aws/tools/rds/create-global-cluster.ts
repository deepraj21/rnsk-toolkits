import { tool } from 'ai';
import { z } from 'zod';
import { CreateGlobalClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateGlobalCluster = tool({
  description: 'Create a multi-region Aurora Global Database. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalClusterIdentifier: z.string().describe('Global cluster identifier'),
    sourceDBClusterIdentifier: z.string().optional().describe('Existing cluster to use as primary (optional)'),
    engine: z.string().optional().describe('Database engine (aurora-mysql, aurora-postgresql)'),
    engineVersion: z.string().optional().describe('Engine version'),
    storageEncrypted: z.boolean().optional().describe('Enable storage encryption'),
  }),
  execute: async ({ awsCredentials, region, globalClusterIdentifier, sourceDBClusterIdentifier, engine, engineVersion, storageEncrypted }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateGlobalClusterCommand({
          GlobalClusterIdentifier: globalClusterIdentifier,
          SourceDBClusterIdentifier: sourceDBClusterIdentifier,
          Engine: engine,
          EngineVersion: engineVersion,
          StorageEncrypted: storageEncrypted,
      });
      const response = await client.send(command);
      return response.GlobalCluster;
    } catch (err) {
      return { error: 'Failed to create a multi-region Aurora Global Database', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
