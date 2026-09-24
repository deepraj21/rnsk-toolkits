import { tool } from 'ai';
import { z } from 'zod';
import { UpdateClusterCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsUpdateEcsCluster = tool({
  description: 'Update an existing ECS cluster. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    settings: z.array(z.record(z.any())).optional().describe('Cluster settings to update'),
    configuration: z.record(z.any()).optional().describe('Cluster configuration to update'),
    serviceConnectDefaults: z.record(z.any()).optional().describe('Service Connect defaults to update'),
  }),
  execute: async ({ awsCredentials, region, cluster, settings, configuration, serviceConnectDefaults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new UpdateClusterCommand({
          cluster: cluster,
          settings: settings,
          configuration: configuration,
          serviceConnectDefaults: serviceConnectDefaults,
      } as any);
      const response = await client.send(command);
      return {
                  cluster: response.cluster,
              };
    } catch (err) {
      return { error: 'Failed to update an existing ECS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
