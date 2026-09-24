import { tool } from 'ai';
import { z } from 'zod';
import { UpdateRepositoryCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsUpdateCodeartifactRepository = tool({
  description: 'Update a CodeArtifact repository. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository to update'),
    description: z.string().optional().describe('An updated repository description'),
    upstreams: z.array(z.record(z.any())).optional().describe('A list of upstream repositories'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, description, upstreams }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new UpdateRepositoryCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          description: description,
          upstreams: upstreams,
      } as any);
      const response = await client.send(command);
      return {
                  repository: response.repository,
              };
    } catch (err) {
      return { error: 'Failed to update a CodeArtifact repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
