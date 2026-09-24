import { tool } from 'ai';
import { z } from 'zod';
import { CreateDomainCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsCreateCodeartifactDomain = tool({
  description: 'Create a new CodeArtifact domain. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain to create'),
    encryptionKey: z.string().optional().describe('The encryption key for the domain'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the domain'),
  }),
  execute: async ({ awsCredentials, region, domain, encryptionKey, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new CreateDomainCommand({
          domain: domain,
          encryptionKey: encryptionKey,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  domain: response.domain,
              };
    } catch (err) {
      return { error: 'Failed to create a new CodeArtifact domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
