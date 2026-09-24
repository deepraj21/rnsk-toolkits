import { tool } from 'ai';
import { z } from 'zod';
import { ListPackageVersionsCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsListCodeartifactPackageVersions = tool({
  description: 'List versions of a CodeArtifact package. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository'),
    format: z.enum(['npm', 'pypi', 'maven', 'nuget', 'generic']).describe('The format of the package'),
    namespace: z.string().optional().describe('The namespace of the package'),
    packageName: z.string().describe('The name of the package'),
    status: z.enum(['Published', 'Unfinished', 'Unlisted', 'Archived', 'Disposed', 'Deleted']).optional().describe('Filter by package version status'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    originType: z.enum(['INTERNAL', 'EXTERNAL', 'UNKNOWN']).optional().describe('Filter by origin type'),
    sortBy: z.enum(['PUBLISHED_TIME']).optional().describe('Sort order'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, format, namespace, packageName, status, maxResults, nextToken, originType, sortBy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new ListPackageVersionsCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          format: format,
          namespace: namespace,
          package: packageName,
          status: status,
          maxResults: maxResults,
          nextToken: nextToken,
          originType: originType,
          sortBy: sortBy,
      });
      const response = await client.send(command);
      return {
                  versions: response.versions || [],
                  defaultDisplayVersion: response.defaultDisplayVersion,
                  format: response.format,
                  namespace: response.namespace,
                  package: response.package,
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list versions of a CodeArtifact package', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
