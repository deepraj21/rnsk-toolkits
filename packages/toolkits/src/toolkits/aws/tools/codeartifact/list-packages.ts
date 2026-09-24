import { tool } from 'ai';
import { z } from 'zod';
import { ListPackagesCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsListCodeartifactPackages = tool({
  description: 'List packages in a CodeArtifact repository. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository'),
    format: z.enum(['npm', 'pypi', 'maven', 'nuget', 'generic']).describe('The format of the packages'),
    namespace: z.string().optional().describe('The namespace of the packages'),
    packagePrefix: z.string().optional().describe('Prefix to filter packages by name'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    publish: z.enum(['ALLOW', 'BLOCK']).optional().describe('Filter by publish status'),
    upstream: z.enum(['ALLOW', 'BLOCK']).optional().describe('Filter by upstream status'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, format, namespace, packagePrefix, maxResults, nextToken, publish, upstream }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new ListPackagesCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          format: format,
          namespace: namespace,
          packagePrefix: packagePrefix,
          maxResults: maxResults,
          nextToken: nextToken,
          publish: publish,
          upstream: upstream,
      });
      const response = await client.send(command);
      return {
                  packages: response.packages || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list packages in a CodeArtifact repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
