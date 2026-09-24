import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDomainCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsDescribeOpensearchDomain = tool({
  description: 'Get detailed information about an OpenSearch domain. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().describe('Name of the OpenSearch domain'),
  }),
  execute: async ({ awsCredentials, region, domainName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new DescribeDomainCommand({
          DomainName: domainName,
      });
      const response = await client.send(command);
      return response.DomainStatus;
    } catch (err) {
      return { error: 'Failed to get detailed information about an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
