import { tool } from 'ai';
import { z } from 'zod';
import { UpdateNodegroupVersionCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksNodegroupVersion = tool({
  description: 'Update the Kubernetes version of a nodegroup. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    nodegroupName: z.string().describe('The name of the nodegroup'),
    version: z.string().optional().describe('Kubernetes version to update to'),
    releaseVersion: z.string().optional().describe('AMI release version'),
    launchTemplate: z.record(z.any()).optional().describe('Launch template configuration'),
    force: z.boolean().optional().describe('Force update'),
  }),
  execute: async ({ awsCredentials, region, clusterName, nodegroupName, version, releaseVersion, launchTemplate, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdateNodegroupVersionCommand({
          clusterName: clusterName,
          nodegroupName: nodegroupName,
          version: version,
          releaseVersion: releaseVersion,
          launchTemplate: launchTemplate,
          force: force,
      });
      const response = await client.send(command);
      return {
                  update: response.update,
              };
    } catch (err) {
      return { error: 'Failed to update the Kubernetes version of a nodegroup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
