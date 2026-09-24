import { tool } from 'ai';
import { z } from 'zod';
import { DeletePackageVersionsCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsDeleteCodeartifactPackageVersions = tool({
  description: 'Delete one or more CodeArtifact package versions. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository'),
    format: z.enum(['npm', 'pypi', 'maven', 'nuget', 'generic']).describe('The format of the package'),
    namespace: z.string().optional().describe('The namespace of the package'),
    packageName: z.string().describe('The name of the package'),
    versions: z.array(z.string()).describe('The versions of the package to delete'),
    expectedStatus: z.enum(['Published', 'Unfinished', 'Unlisted', 'Archived', 'Disposed', 'Deleted']).optional().describe('Expected status of the package versions'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, format, namespace, packageName, versions, expectedStatus }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new DeletePackageVersionsCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          format: format,
          namespace: namespace,
          package: packageName,
          versions: versions,
          expectedStatus: expectedStatus,
      });
      const response = await client.send(command);
      return {
                  successfulVersions: response.successfulVersions || [],
                  failedVersions: response.failedVersions || [],
              };
    } catch (err) {
      return { error: 'Failed to delete one or more CodeArtifact package versions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
