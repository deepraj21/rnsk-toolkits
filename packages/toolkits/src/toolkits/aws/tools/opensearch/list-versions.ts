import { tool } from 'ai';
import { z } from 'zod';
import { ListVersionsCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsListVersions = tool({
  description: 'List available OpenSearch and Elasticsearch versions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of versions to return'),
  }),
  execute: async ({ awsCredentials, region, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new ListVersionsCommand({
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return response.Versions;
    } catch (err) {
      return { error: 'Failed to list available OpenSearch and Elasticsearch versions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
