import { tool } from 'ai';
import { z } from 'zod';
import { GetAuthorizationTokenCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsGetCodeartifactAuthorizationToken = tool({
  description: 'Get an authorization token for CodeArtifact. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    durationSeconds: z.number().optional().describe('The time, in seconds, that the generated authorization token is valid'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, durationSeconds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new GetAuthorizationTokenCommand({
          domain: domain,
          domainOwner: domainOwner,
          durationSeconds: durationSeconds,
      });
      const response = await client.send(command);
      return {
                  authorizationToken: response.authorizationToken,
                  expiration: response.expiration,
              };
    } catch (err) {
      return { error: 'Failed to get an authorization token for CodeArtifact', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
