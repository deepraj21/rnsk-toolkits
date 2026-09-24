import { tool } from 'ai';
import { z } from 'zod';
import { CreateClusterCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsCreateEcsCluster = tool({
  description: 'Create a new ECS cluster. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the cluster'),
    settings: z.array(z.record(z.any())).optional().describe('Cluster settings'),
    capacityProviders: z.array(z.string()).optional().describe('Capacity providers to associate with the cluster'),
    defaultCapacityProviderStrategy: z.array(z.record(z.any())).optional().describe('Default capacity provider strategy'),
    configuration: z.record(z.any()).optional().describe('Cluster configuration'),
    serviceConnectDefaults: z.record(z.any()).optional().describe('Service Connect defaults'),
  }),
  execute: async ({ awsCredentials, region, clusterName, tags, settings, capacityProviders, defaultCapacityProviderStrategy, configuration, serviceConnectDefaults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new CreateClusterCommand({
          clusterName: clusterName,
          tags: tags,
          settings: settings,
          capacityProviders: capacityProviders,
          defaultCapacityProviderStrategy: defaultCapacityProviderStrategy,
          configuration: configuration,
          serviceConnectDefaults: serviceConnectDefaults,
      } as any);
      const response = await client.send(command);
      return {
                  cluster: response.cluster,
              };
    } catch (err) {
      return { error: 'Failed to create a new ECS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
