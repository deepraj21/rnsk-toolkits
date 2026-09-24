import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAffectedAccountsForOrganizationCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthAffectedAccountsForOrganization = tool({
  description: 'Get accounts affected by events in your organization. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    eventArn: z.string().describe('The ARN of the event'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, eventArn, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeAffectedAccountsForOrganizationCommand({
          eventArn: eventArn,
          nextToken: nextToken,
          maxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  affectedAccounts: response.affectedAccounts || [],
                  nextToken: response.nextToken,
                  eventScopeCode: response.eventScopeCode,
              };
    } catch (err) {
      return { error: 'Failed to get accounts affected by events in your organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
