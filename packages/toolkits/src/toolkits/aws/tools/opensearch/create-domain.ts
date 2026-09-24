import { tool } from 'ai';
import { z } from 'zod';
import { CreateDomainCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsCreateDomain = tool({
  description: 'Create a new OpenSearch domain. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().describe('Name of the OpenSearch domain'),
    engineVersion: z.string().optional().describe('OpenSearch version (e.g., OpenSearch_2.5, Elasticsearch_7.10)'),
    clusterConfig: z.record(z.any()).optional().describe('Cluster configuration'),
    ebsOptions: z.record(z.any()).optional().describe('EBS storage configuration'),
    vpcOptions: z.record(z.any()).optional().describe('VPC configuration'),
    encryptionAtRestOptions: z.record(z.any()).optional().describe('Encryption at rest configuration'),
    nodeToNodeEncryptionOptions: z.record(z.any()).optional().describe('Node-to-node encryption configuration'),
    domainEndpointOptions: z.record(z.any()).optional().describe('Domain endpoint configuration'),
    accessPolicies: z.string().optional().describe('IAM access policy JSON'),
  }),
  execute: async ({ awsCredentials, region, domainName, engineVersion, clusterConfig, ebsOptions, vpcOptions, encryptionAtRestOptions, nodeToNodeEncryptionOptions, domainEndpointOptions, accessPolicies }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new CreateDomainCommand({
          DomainName: domainName,
          EngineVersion: engineVersion,
          ClusterConfig: clusterConfig,
          EBSOptions: ebsOptions,
          VPCOptions: vpcOptions,
          EncryptionAtRestOptions: encryptionAtRestOptions,
          NodeToNodeEncryptionOptions: nodeToNodeEncryptionOptions,
          DomainEndpointOptions: domainEndpointOptions,
          AccessPolicies: accessPolicies,
      });
      const response = await client.send(command);
      return response.DomainStatus;
    } catch (err) {
      return { error: 'Failed to create a new OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
