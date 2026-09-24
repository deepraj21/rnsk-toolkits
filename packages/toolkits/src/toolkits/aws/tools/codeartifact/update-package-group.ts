import { tool } from 'ai';
import { z } from 'zod';
import { UpdatePackageGroupCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsUpdateCodeartifactPackageGroup = tool({
  description: 'Update a CodeArtifact package group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    packageGroup: z.string().describe('The name of the package group to update'),
    description: z.string().optional().describe('An updated description of the package group'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, packageGroup, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new UpdatePackageGroupCommand({
          domain: domain,
          domainOwner: domainOwner,
          packageGroup: packageGroup,
          description: description,
      });
      const response = await client.send(command);
      return {
                  packageGroup: response.packageGroup,
              };
    } catch (err) {
      return { error: 'Failed to update a CodeArtifact package group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
