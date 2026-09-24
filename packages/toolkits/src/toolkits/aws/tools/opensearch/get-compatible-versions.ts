import { tool } from 'ai';
import { z } from 'zod';
import { GetCompatibleVersionsCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsGetCompatibleVersions = tool({
  description: 'Get compatible OpenSearch versions for domain upgrade. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().optional().describe('Name of the OpenSearch domain (optional - returns all if not specified)'),
  }),
  execute: async ({ awsCredentials, region, domainName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new GetCompatibleVersionsCommand({
          DomainName: domainName,
      });
      const response = await client.send(command);
      return response.CompatibleVersions;
    } catch (err) {
      return { error: 'Failed to get compatible OpenSearch versions for domain upgrade', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
