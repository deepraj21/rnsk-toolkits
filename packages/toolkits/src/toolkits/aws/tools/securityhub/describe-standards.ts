import { tool } from 'ai';
import { z } from 'zod';
import { DescribeStandardsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDescribeStandards = tool({
  description: 'List available security standards (CIS, PCI-DSS, AWS Foundational). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of standards to return (1-100)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DescribeStandardsCommand({
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list available security standards (CIS, PCI-DSS, AWS Foundational)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
