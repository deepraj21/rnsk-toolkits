import { tool } from 'ai';
import { z } from 'zod';
import { GetServiceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeService = tool({
  description: 'Get information about a VPC Lattice service. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceIdentifier: z.string().describe('The service identifier'),
  }),
  execute: async ({ awsCredentials, region, serviceIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new GetServiceCommand({
          serviceIdentifier: serviceIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  authType: response.authType,
                  certificateArn: response.certificateArn,
                  createdAt: response.createdAt,
                  customDomainName: response.customDomainName,
                  dnsEntry: response.dnsEntry,
                  failureCode: response.failureCode,
                  failureMessage: response.failureMessage,
                  id: response.id,
                  lastUpdatedAt: response.lastUpdatedAt,
                  name: response.name,
              };
    } catch (err) {
      return { error: 'Failed to get information about a VPC Lattice service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
