import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDomainCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsDescribeCodeartifactDomain = tool({
  description: 'Get details about a CodeArtifact domain. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new DescribeDomainCommand({
          domain: domain,
          domainOwner: domainOwner,
      });
      const response = await client.send(command);
      return {
                  domain: response.domain,
              };
    } catch (err) {
      return { error: 'Failed to get details about a CodeArtifact domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
