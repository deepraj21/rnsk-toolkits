import { tool } from 'ai';
import { z } from 'zod';
import { GetListenerCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeListener = tool({
  description: 'Get information about a VPC Lattice listener. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    listenerIdentifier: z.string().describe('The listener identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
  }),
  execute: async ({ awsCredentials, region, listenerIdentifier, serviceIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new GetListenerCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  createdAt: response.createdAt,
                  defaultAction: response.defaultAction,
                  id: response.id,
                  lastUpdatedAt: response.lastUpdatedAt,
                  name: response.name,
                  port: response.port,
                  protocol: response.protocol,
                  serviceArn: response.serviceArn,
                  serviceId: response.serviceId,
              };
    } catch (err) {
      return { error: 'Failed to get information about a VPC Lattice listener', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
