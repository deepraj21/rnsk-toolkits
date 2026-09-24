import { tool } from 'ai';
import { z } from 'zod';
import { CreatePackageGroupCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsCreateCodeartifactPackageGroup = tool({
  description: 'Create a new CodeArtifact package group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    packageGroup: z.string().describe('The name of the package group'),
    description: z.string().optional().describe('A description of the package group'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the package group'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, packageGroup, description, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new CreatePackageGroupCommand({
          domain: domain,
          domainOwner: domainOwner,
          packageGroup: packageGroup,
          description: description,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  packageGroup: response.packageGroup,
              };
    } catch (err) {
      return { error: 'Failed to create a new CodeArtifact package group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
