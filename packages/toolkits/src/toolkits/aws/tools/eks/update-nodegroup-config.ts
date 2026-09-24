import { tool } from 'ai';
import { z } from 'zod';
import { UpdateNodegroupConfigCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksNodegroupConfig = tool({
  description: 'Update the configuration of a nodegroup. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    nodegroupName: z.string().describe('The name of the nodegroup'),
    labels: z.record(z.any()).optional().describe('Kubernetes labels'),
    taints: z.array(z.record(z.any())).optional().describe('Kubernetes taints'),
    scalingConfig: z.record(z.any()).optional().describe('Scaling configuration'),
    updateConfig: z.record(z.any()).optional().describe('Update configuration'),
  }),
  execute: async ({ awsCredentials, region, clusterName, nodegroupName, labels, taints, scalingConfig, updateConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdateNodegroupConfigCommand({
          clusterName: clusterName,
          nodegroupName: nodegroupName,
          labels: labels,
          taints: taints,
          scalingConfig: scalingConfig,
          updateConfig: updateConfig,
      } as any);
      const response = await client.send(command);
      return {
                  update: response.update,
              };
    } catch (err) {
      return { error: 'Failed to update the configuration of a nodegroup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
