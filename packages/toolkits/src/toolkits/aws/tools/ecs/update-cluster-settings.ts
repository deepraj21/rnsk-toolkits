import { tool } from 'ai';
import { z } from 'zod';
import { UpdateClusterSettingsCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsUpdateEcsClusterSettings = tool({
  description: 'Update cluster settings. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    settings: z.array(z.record(z.any())).describe('Cluster settings to update'),
  }),
  execute: async ({ awsCredentials, region, cluster, settings }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new UpdateClusterSettingsCommand({
          cluster: cluster,
          settings: settings,
      });
      const response = await client.send(command);
      return {
                  cluster: response.cluster,
              };
    } catch (err) {
      return { error: 'Failed to update cluster settings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
