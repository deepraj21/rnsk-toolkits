import { tool } from 'ai';
import { z } from 'zod';
import { CreateCacheClusterCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsCreateCacheCluster = tool({
  description: 'Create a new Memcached cache cluster. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheClusterId: z.string().describe('Unique identifier for the cache cluster'),
    cacheNodeType: z.string().describe('Node type (e.g., cache.t3.micro, cache.r6g.large)'),
    engine: z.string().describe('Cache engine (memcached)'),
    numCacheNodes: z.number().describe('Number of cache nodes (1-40)'),
    cacheParameterGroupName: z.string().optional().describe('Parameter group name'),
    cacheSubnetGroupName: z.string().optional().describe('Subnet group name for VPC'),
    securityGroupIds: z.array(z.string()).optional().describe('VPC security group IDs'),
    azMode: z.string().optional().describe('Availability zone mode (single-az or cross-az)'),
  }),
  execute: async ({ awsCredentials, region, cacheClusterId, cacheNodeType, engine, numCacheNodes, cacheParameterGroupName, cacheSubnetGroupName, securityGroupIds, azMode }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new CreateCacheClusterCommand({
          CacheClusterId: cacheClusterId,
          CacheNodeType: cacheNodeType,
          Engine: engine,
          NumCacheNodes: numCacheNodes,
          CacheParameterGroupName: cacheParameterGroupName,
          CacheSubnetGroupName: cacheSubnetGroupName,
          SecurityGroupIds: securityGroupIds,
          AZMode: azMode,
      } as any);
      const response = await client.send(command);
      return response.CacheCluster;
    } catch (err) {
      return { error: 'Failed to create a new Memcached cache cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
