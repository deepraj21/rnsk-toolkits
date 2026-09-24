import { tool } from 'ai';
import { z } from 'zod';
import { UpgradeDomainCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsUpgradeDomain = tool({
  description: 'Upgrade OpenSearch domain to a newer version',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().describe('Name of the OpenSearch domain'),
    targetVersion: z.string().describe('Target OpenSearch version (e.g., OpenSearch_2.5)'),
    performCheckOnly: z.boolean().optional().describe('Perform compatibility check only without upgrading'),
  }),
  execute: async ({ awsCredentials, region, domainName, targetVersion, performCheckOnly }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new UpgradeDomainCommand({
          DomainName: domainName,
          TargetVersion: targetVersion,
          PerformCheckOnly: performCheckOnly,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to upgrade OpenSearch domain to a newer version', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
