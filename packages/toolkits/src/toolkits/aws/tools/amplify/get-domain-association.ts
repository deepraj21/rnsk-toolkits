import { tool } from 'ai';
import { z } from 'zod';
import { GetDomainAssociationCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsGetAmplifyDomainAssociation = tool({
  description: 'Returns the domain information for an Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    domainName: z.string().describe('The name of the domain'),
  }),
  execute: async ({ awsCredentials, region, appId, domainName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new GetDomainAssociationCommand({
          appId,
          domainName,
      });
      const response = await client.send(command);
      return {
                  domainAssociation: response.domainAssociation,
              };
    } catch (err) {
      return { error: 'Failed to returns the domain information for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
