import { tool } from 'ai';
import { z } from 'zod';
import { UpdateDomainConfigCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsUpdateDomainConfig = tool({
  description: 'Modify OpenSearch domain settings (instance types, storage, replicas). Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().describe('Name of the OpenSearch domain'),
    clusterConfig: z.record(z.any()).optional().describe('Updated cluster configuration'),
    ebsOptions: z.record(z.any()).optional().describe('Updated EBS storage configuration'),
    accessPolicies: z.string().optional().describe('Updated IAM access policy JSON'),
    autoTuneOptions: z.record(z.any()).optional().describe('Auto-Tune configuration'),
  }),
  execute: async ({ awsCredentials, region, domainName, clusterConfig, ebsOptions, accessPolicies, autoTuneOptions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new UpdateDomainConfigCommand({
          DomainName: domainName,
          ClusterConfig: clusterConfig,
          EBSOptions: ebsOptions,
          AccessPolicies: accessPolicies,
          AutoTuneOptions: autoTuneOptions,
      });
      const response = await client.send(command);
      return response.DomainConfig;
    } catch (err) {
      return { error: 'Failed to modify OpenSearch domain settings (instance types, storage, replicas)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
