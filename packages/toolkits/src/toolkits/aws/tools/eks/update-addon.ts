import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAddonCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksAddon = tool({
  description: 'Update an addon. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    addonName: z.string().describe('The name of the addon'),
    addonVersion: z.string().optional().describe('Addon version to update to'),
    serviceAccountRoleArn: z.string().optional().describe('IAM role ARN for the addon'),
    resolveConflicts: z.enum(['OVERWRITE', 'NONE']).optional().describe('Conflict resolution strategy (OVERWRITE, NONE)'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
    configurationValues: z.string().optional().describe('Addon configuration values'),
  }),
  execute: async ({ awsCredentials, region, clusterName, addonName, addonVersion, serviceAccountRoleArn, resolveConflicts, clientRequestToken, configurationValues }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdateAddonCommand({
          clusterName: clusterName,
          addonName: addonName,
          addonVersion: addonVersion,
          serviceAccountRoleArn: serviceAccountRoleArn,
          resolveConflicts: resolveConflicts as any,
          clientRequestToken: clientRequestToken,
          configurationValues: configurationValues,
      });
      const response = await client.send(command);
      return {
                  update: response.update,
              };
    } catch (err) {
      return { error: 'Failed to update an addon', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
