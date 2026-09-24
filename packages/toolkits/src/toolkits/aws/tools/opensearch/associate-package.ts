import { tool } from 'ai';
import { z } from 'zod';
import { AssociatePackageCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsAssociatePackage = tool({
  description: 'Associate a custom package with an OpenSearch domain. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    packageId: z.string().describe('Package ID'),
    domainName: z.string().describe('OpenSearch domain name'),
  }),
  execute: async ({ awsCredentials, region, packageId, domainName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new AssociatePackageCommand({
          PackageID: packageId,
          DomainName: domainName,
      });
      const response = await client.send(command);
      return response.DomainPackageDetails;
    } catch (err) {
      return { error: 'Failed to associate a custom package with an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
