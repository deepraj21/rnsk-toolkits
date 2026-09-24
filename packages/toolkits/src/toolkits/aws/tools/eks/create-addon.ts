import { tool } from 'ai';
import { z } from 'zod';
import { CreateAddonCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsCreateEksAddon = tool({
  description: 'Create a new addon. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    addonName: z.string().describe('The name of the addon'),
    addonVersion: z.string().optional().describe('Addon version'),
    serviceAccountRoleArn: z.string().optional().describe('IAM role ARN for the addon'),
    resolveConflicts: z.enum(['OVERWRITE', 'NONE']).optional().describe('Conflict resolution strategy (OVERWRITE, NONE)'),
    tags: z.record(z.any()).optional().describe('Tags to apply to the addon'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
    configurationValues: z.string().optional().describe('Addon configuration values'),
  }),
  execute: async ({ awsCredentials, region, clusterName, addonName, addonVersion, serviceAccountRoleArn, resolveConflicts, tags, clientRequestToken, configurationValues }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new CreateAddonCommand({
          clusterName: clusterName,
          addonName: addonName,
          addonVersion: addonVersion,
          serviceAccountRoleArn: serviceAccountRoleArn,
          resolveConflicts: resolveConflicts as any,
          tags: tags,
          clientRequestToken: clientRequestToken,
          configurationValues: configurationValues,
      });
      const response = await client.send(command);
      return {
                  addon: response.addon,
              };
    } catch (err) {
      return { error: 'Failed to create a new addon', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
