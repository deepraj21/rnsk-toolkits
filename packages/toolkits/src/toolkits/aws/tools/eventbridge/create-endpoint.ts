import { tool } from 'ai';
import { z } from 'zod';
import { CreateEndpointCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsCreateEventbridgeEndpoint = tool({
  description: 'Create an EventBridge endpoint. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the endpoint'),
    description: z.string().optional().describe('Endpoint description'),
    routingConfig: z.record(z.any()).describe('Routing configuration'),
    replicationConfig: z.record(z.any()).optional().describe('Replication configuration'),
    eventBuses: z.array(z.record(z.any())).describe('Event buses'),
    roleArn: z.string().optional().describe('IAM role ARN'),
  }),
  execute: async ({ awsCredentials, region, name, description, routingConfig, replicationConfig, eventBuses, roleArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new CreateEndpointCommand({
          Name: name,
          Description: description,
          RoutingConfig: routingConfig,
          ReplicationConfig: replicationConfig,
          EventBuses: eventBuses,
          RoleArn: roleArn,
      } as any);
      const response = await client.send(command);
      return {
                  name: response.Name,
                  arn: response.Arn,
                  routingConfig: response.RoutingConfig,
                  replicationConfig: response.ReplicationConfig,
                  eventBuses: response.EventBuses,
                  roleArn: response.RoleArn,
                  state: response.State,
              };
    } catch (err) {
      return { error: 'Failed to create an EventBridge endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
