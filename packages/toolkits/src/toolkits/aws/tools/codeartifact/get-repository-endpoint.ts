import { tool } from 'ai';
import { z } from 'zod';
import { GetRepositoryEndpointCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsGetCodeartifactRepositoryEndpoint = tool({
  description: 'Get the repository endpoint for CodeArtifact. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository'),
    format: z.enum(['npm', 'pypi', 'maven', 'nuget', 'generic']).describe('The format of the repository endpoint'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, format }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new GetRepositoryEndpointCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          format: format,
      });
      const response = await client.send(command);
      return {
                  repositoryEndpoint: response.repositoryEndpoint,
              };
    } catch (err) {
      return { error: 'Failed to get the repository endpoint for CodeArtifact', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
