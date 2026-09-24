import { tool } from 'ai';
import { z } from 'zod';
import { DescribePackageVersionCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsDescribeCodeartifactPackageVersion = tool({
  description: 'Get details about a CodeArtifact package version. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository'),
    format: z.enum(['npm', 'pypi', 'maven', 'nuget', 'generic']).describe('The format of the package'),
    namespace: z.string().optional().describe('The namespace of the package'),
    packageName: z.string().describe('The name of the package'),
    packageVersion: z.string().describe('The version of the package'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, format, namespace, packageName, packageVersion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new DescribePackageVersionCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          format: format,
          namespace: namespace,
          package: packageName,
          packageVersion: packageVersion,
      });
      const response = await client.send(command);
      return {
                  packageVersion: response.packageVersion,
              };
    } catch (err) {
      return { error: 'Failed to get details about a CodeArtifact package version', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
