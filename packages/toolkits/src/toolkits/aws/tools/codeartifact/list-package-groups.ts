import { tool } from 'ai';
import { z } from 'zod';
import { ListPackageGroupsCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsListCodeartifactPackageGroups = tool({
  description: 'List CodeArtifact package groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    packageGroupPrefix: z.string().optional().describe('Prefix to filter package groups by name'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, maxResults, nextToken, packageGroupPrefix }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new ListPackageGroupsCommand({
          domain: domain,
          domainOwner: domainOwner,
          maxResults: maxResults,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  packageGroups: response.packageGroups || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list CodeArtifact package groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
