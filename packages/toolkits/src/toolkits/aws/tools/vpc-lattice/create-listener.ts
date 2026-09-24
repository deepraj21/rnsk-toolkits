import { tool } from 'ai';
import { z } from 'zod';
import { CreateListenerCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeListener = tool({
  description: 'Create a new VPC Lattice listener. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    serviceIdentifier: z.string().describe('The service identifier'),
    name: z.string().describe('The name of the listener'),
    protocol: z.enum(['HTTP', 'HTTPS', 'TLS_PASSTHROUGH']).describe('Protocol'),
    port: z.number().describe('Port number'),
    defaultAction: z.record(z.any()).describe('Default action'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, serviceIdentifier, name, protocol, port, defaultAction, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateListenerCommand({
          serviceIdentifier: serviceIdentifier,
          name: name,
          protocol: protocol,
          port: port,
          defaultAction: defaultAction,
          tags: tags,
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
      return { error: 'Failed to create a new VPC Lattice listener', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
