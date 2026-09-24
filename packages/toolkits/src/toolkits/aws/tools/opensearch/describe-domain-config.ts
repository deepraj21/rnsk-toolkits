import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDomainConfigCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsDescribeDomainConfig = tool({
  description: 'Get current configuration of an OpenSearch domain. Use it to inspect current state before making changes.',
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

      const command = new DescribeDomainConfigCommand({
          DomainName: domainName,
      });
      const response = await client.send(command);
      return response.DomainConfig;
    } catch (err) {
      return { error: 'Failed to get current configuration of an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
