import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateExternalConnectionCommand } from '@aws-sdk/client-codeartifact';
import { createCodeArtifactClient } from '../client.js';

export const awsDisassociateCodeartifactExternalConnection = tool({
  description: 'Disassociate an external connection from a repository. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domain: z.string().describe('The name of the domain'),
    domainOwner: z.string().optional().describe('The 12-digit account number of the AWS account that owns the domain'),
    repository: z.string().describe('The name of the repository'),
    externalConnection: z.string().describe('The name of the external connection'),
  }),
  execute: async ({ awsCredentials, region, domain, domainOwner, repository, externalConnection }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeArtifactClient(awsCredentials, region);

      const command = new DisassociateExternalConnectionCommand({
          domain: domain,
          domainOwner: domainOwner,
          repository: repository,
          externalConnection: externalConnection,
      });
      const response = await client.send(command);
      return {
                  repository: response.repository,
              };
    } catch (err) {
      return { error: 'Failed to disassociate an external connection from a repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
