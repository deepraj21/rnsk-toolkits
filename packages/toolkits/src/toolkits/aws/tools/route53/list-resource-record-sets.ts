import { tool } from 'ai';
import { z } from 'zod';
import { ListResourceRecordSetsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53ResourceRecordSets = tool({
  description: 'List resource record sets in a hosted zone. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    startRecordName: z.string().optional().describe('Start record name for pagination'),
    startRecordType: z.enum(['SOA', 'A', 'TXT', 'NS', 'CNAME', 'MX', 'NAPTR', 'PTR', 'SRV', 'SPF', 'AAAA', 'CAA', 'DS']).optional().describe('Start record type for pagination'),
    startRecordIdentifier: z.string().optional().describe('Start record identifier for pagination'),
    maxItems: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, startRecordName, startRecordType, startRecordIdentifier, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListResourceRecordSetsCommand({
          HostedZoneId: hostedZoneId,
          StartRecordName: startRecordName,
          StartRecordType: startRecordType,
          StartRecordIdentifier: startRecordIdentifier,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  resourceRecordSets: response.ResourceRecordSets,
                  isTruncated: response.IsTruncated,
                  nextRecordName: response.NextRecordName,
                  nextRecordType: response.NextRecordType,
                  nextRecordIdentifier: response.NextRecordIdentifier,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list resource record sets in a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
