import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDomainCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsDeleteDomain = tool({
  description: 'Delete an OpenSearch domain. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().describe('Name of the OpenSearch domain to delete'),
  }),
  execute: async ({ awsCredentials, region, domainName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new DeleteDomainCommand({
          DomainName: domainName,
      });
      const response = await client.send(command);
      return response.DomainStatus;
    } catch (err) {
      return { error: 'Failed to delete an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
