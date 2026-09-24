import { tool } from 'ai';
import { z } from 'zod';
import { ModifyCacheParameterGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsModifyCacheParameterGroup = tool({
  description: 'Modify parameters in a cache parameter group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheParameterGroupName: z.string().describe('Parameter group name to modify'),
    parameterNameValues: z.array(z.record(z.any())).describe('Parameters to modify'),
    properties: z.string().optional().describe('Parameter name'),
    ParameterName: z.string().optional().describe('Parameter name'),
    ParameterValue: z.string().optional().describe('Parameter value'),
  }),
  execute: async ({ awsCredentials, region, cacheParameterGroupName, parameterNameValues, properties, ParameterName, ParameterValue }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new ModifyCacheParameterGroupCommand({
          CacheParameterGroupName: cacheParameterGroupName,
          ParameterNameValues: parameterNameValues,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to modify parameters in a cache parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
