import { tool } from 'ai';
import { z } from 'zod';
import { ListDomainsCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsListCodeartifactDomains = tool({
  description: 'List all CodeArtifact domains. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new ListDomainsCommand({
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  domains: response.domains || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all CodeArtifact domains', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
