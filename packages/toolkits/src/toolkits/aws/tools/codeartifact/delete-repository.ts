import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRepositoryCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsDeleteCodeartifactRepository = tool({
  description: 'Delete a CodeArtifact repository. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository to delete'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new DeleteRepositoryCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
      });
      const response = await client.send(command);
      return {
                  repository: response.repository,
              };
    } catch (err) {
      return { error: 'Failed to delete a CodeArtifact repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
