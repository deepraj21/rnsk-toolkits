import { tool } from 'ai';
import { z } from 'zod';
import { CreateRepositoryCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsCreateCodeartifactRepository = tool({
  description: 'Create a new CodeArtifact repository. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain that contains the repository'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository to create'),
    description: z.string().optional().describe('A description of the repository'),
    upstreams: z.array(z.record(z.any())).optional().describe('A list of upstream repositories'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the repository'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, description, upstreams, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new CreateRepositoryCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          description: description,
          upstreams: upstreams,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  repository: response.repository,
              };
    } catch (err) {
      return { error: 'Failed to create a new CodeArtifact repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
