import { tool } from 'ai';
import { z } from 'zod';
import { UpdateDomainAssociationCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsUpdateAmplifyDomainAssociation = tool({
  description: 'Updates the domain association for an Amplify app. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    domainName: z.string().describe('The name of the domain'),
    enableAutoSubDomain: z.boolean().optional().describe('Enables the automated creation of subdomains for branches'),
    subDomainSettings: z.array(z.record(z.any())).optional().describe('The setting for the subdomain'),
    autoSubDomainCreationPatterns: z.array(z.string()).optional().describe('Sets the branch patterns for automatic subdomain creation'),
    autoSubDomainIAMRole: z.string().optional().describe('The required AWS Identity and Access Management (IAM) service role for the Amazon Resource Name (ARN) for automatically creating subdomains'),
  }),
  execute: async ({ awsCredentials, region, appId, domainName, enableAutoSubDomain, subDomainSettings, autoSubDomainCreationPatterns, autoSubDomainIAMRole }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new UpdateDomainAssociationCommand({
          appId: appId,
          domainName: domainName,
          enableAutoSubDomain: enableAutoSubDomain,
          subDomainSettings: subDomainSettings,
          autoSubDomainCreationPatterns: autoSubDomainCreationPatterns,
          autoSubDomainIAMRole: autoSubDomainIAMRole,
      } as any);
      const response = await client.send(command);
      return {
                  domainAssociation: response.domainAssociation,
              };
    } catch (err) {
      return { error: 'Failed to updates the domain association for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
