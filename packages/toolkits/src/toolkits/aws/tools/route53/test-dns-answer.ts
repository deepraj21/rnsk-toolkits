import { tool } from 'ai';
import { z } from 'zod';
import { TestDNSAnswerCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsTestRoute53DnsAnswer = tool({
  description: 'Test DNS answer for a specific record. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    recordName: z.string().describe('The record name'),
    recordType: z.enum(['SOA', 'A', 'TXT', 'NS', 'CNAME', 'MX', 'NAPTR', 'PTR', 'SRV', 'SPF', 'AAAA', 'CAA', 'DS']).describe('The record type'),
    resolverIP: z.string().optional().describe('Resolver IP address'),
    eDNS0ClientSubnetIP: z.string().optional().describe('EDNS0 client subnet IP'),
    eDNS0ClientSubnetMask: z.string().optional().describe('EDNS0 client subnet mask'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, recordName, recordType, resolverIP, eDNS0ClientSubnetIP, eDNS0ClientSubnetMask }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new TestDNSAnswerCommand({
          HostedZoneId: hostedZoneId,
          RecordName: recordName,
          RecordType: recordType,
          ResolverIP: resolverIP,
          EDNS0ClientSubnetIP: eDNS0ClientSubnetIP,
          EDNS0ClientSubnetMask: eDNS0ClientSubnetMask,
      });
      const response = await client.send(command);
      return {
                  nameserver: response.Nameserver,
                  recordName: response.RecordName,
                  recordType: response.RecordType,
                  recordData: response.RecordData,
                  responseCode: response.ResponseCode,
                  protocol: response.Protocol,
              };
    } catch (err) {
      return { error: 'Failed to test DNS answer for a specific record', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
