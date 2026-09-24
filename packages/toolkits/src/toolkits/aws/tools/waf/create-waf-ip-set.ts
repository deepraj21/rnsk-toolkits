import { tool } from 'ai';
import { z } from 'zod';
import { CreateIPSetCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsCreateWafIpSet = tool({
  description: 'Create an IP set with IPv4 or IPv6 addresses. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the IP set'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of the IP set'),
    ipAddressVersion: z.enum(['IPV4', 'IPV6']).describe('IP version'),
    addresses: z.array(z.string()).describe('IP addresses in CIDR notation (e.g., 192.0.2.0/24)'),
    description: z.string().optional().describe('Description of the IP set'),
  }),
  execute: async ({ awsCredentials, region, name, scope, ipAddressVersion, addresses, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new CreateIPSetCommand({
          Name: name,
          Scope: scope,
          IPAddressVersion: ipAddressVersion,
          Addresses: addresses,
          Description: description,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create an IP set with IPv4 or IPv6 addresses', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
