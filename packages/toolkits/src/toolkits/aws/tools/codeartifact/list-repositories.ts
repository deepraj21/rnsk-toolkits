import { tool } from 'ai';
import { z } from 'zod';
import { ListRepositoriesCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsListCodeartifactRepositories = tool({
  description: 'List CodeArtifact repositories. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().optional().describe('Filter by domain name'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    repositoryPrefix: z.string().optional().describe('Prefix to filter repositories by name'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, maxResults, nextToken, repositoryPrefix }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new ListRepositoriesCommand({
          domain: domain,
          domainOwner: domainOwner,
          maxResults: maxResults,
          nextToken: nextToken,
          repositoryPrefix: repositoryPrefix,
      } as any);
      const response = await client.send(command);
      return {
                  repositories: response.repositories || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list CodeArtifact repositories', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
