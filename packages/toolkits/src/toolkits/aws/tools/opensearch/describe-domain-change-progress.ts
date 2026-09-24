import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDomainChangeProgressCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsDescribeDomainChangeProgress = tool({
  description: 'Check progress of OpenSearch domain configuration updates. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    domainName: z.string().describe('Name of the OpenSearch domain'),
    changeId: z.string().optional().describe('Change ID (optional)'),
  }),
  execute: async ({ awsCredentials, region, domainName, changeId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new DescribeDomainChangeProgressCommand({
          DomainName: domainName,
          ChangeId: changeId,
      });
      const response = await client.send(command);
      return response.ChangeProgressStatus;
    } catch (err) {
      return { error: 'Failed to check progress of OpenSearch domain configuration updates', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
