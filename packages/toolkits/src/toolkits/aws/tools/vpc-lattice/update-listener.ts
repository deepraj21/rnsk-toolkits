import { tool } from 'ai';
import { z } from 'zod';
import { UpdateListenerCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeListener = tool({
  description: 'Update a VPC Lattice listener. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    listenerIdentifier: z.string().describe('The listener identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
    defaultAction: z.record(z.any()).optional().describe('Default action'),
  }),
  execute: async ({ awsCredentials, region, listenerIdentifier, serviceIdentifier, defaultAction }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateListenerCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
          defaultAction: defaultAction,
      } as any);
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  defaultAction: response.defaultAction,
                  id: response.id,
                  name: response.name,
                  port: response.port,
                  protocol: response.protocol,
                  serviceArn: response.serviceArn,
                  serviceId: response.serviceId,
              };
    } catch (err) {
      return { error: 'Failed to update a VPC Lattice listener', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
