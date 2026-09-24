import { tool } from 'ai';
import { z } from 'zod';
import { ListDomainNamesCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsListDomainNames = tool({
  description: 'List all OpenSearch domain names in the region. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    engineType: z.string().optional().describe('Filter by engine type (OpenSearch or Elasticsearch)'),
  }),
  execute: async ({ awsCredentials, region, engineType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new ListDomainNamesCommand({
          EngineType: engineType,
      } as any);
      const response = await client.send(command);
      return response.DomainNames;
    } catch (err) {
      return { error: 'Failed to list all OpenSearch domain names in the region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
