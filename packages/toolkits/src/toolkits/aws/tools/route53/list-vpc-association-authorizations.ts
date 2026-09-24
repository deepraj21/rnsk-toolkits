import { tool } from 'ai';
import { z } from 'zod';
import { ListVPCAssociationAuthorizationsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53VpcAssociationAuthorizations = tool({
  description: 'List VPCs that can be associated with a hosted zone. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of VPCs to return'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListVPCAssociationAuthorizationsCommand({
          HostedZoneId: hostedZoneId,
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  hostedZoneId: response.HostedZoneId,
                  nextToken: response.NextToken,
                  vpcs: response.VPCs,
              };
    } catch (err) {
      return { error: 'Failed to list VPCs that can be associated with a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
