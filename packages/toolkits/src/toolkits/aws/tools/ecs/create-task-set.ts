import { tool } from 'ai';
import { z } from 'zod';
import { CreateTaskSetCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsCreateEcsTaskSet = tool({
  description: 'Create a new task set. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service'),
    taskDefinition: z.string().describe('The family and revision of the task definition'),
    externalId: z.string().optional().describe('External ID for the task set'),
    networkConfiguration: z.record(z.any()).optional().describe('Network configuration'),
    loadBalancers: z.array(z.record(z.any())).optional().describe('Load balancer configuration'),
    serviceRegistries: z.array(z.record(z.any())).optional().describe('Service registry configuration'),
    launchType: z.enum(['EC2', 'FARGATE', 'EXTERNAL']).optional().describe('Launch type (EC2, FARGATE, EXTERNAL)'),
    capacityProviderStrategy: z.array(z.record(z.any())).optional().describe('Capacity provider strategy'),
    platformVersion: z.string().optional().describe('Platform version for Fargate'),
    scale: z.record(z.any()).optional().describe('Scale configuration'),
    clientToken: z.string().optional().describe('Unique identifier for the task set'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the task set'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, taskDefinition, externalId, networkConfiguration, loadBalancers, serviceRegistries, launchType, capacityProviderStrategy, platformVersion, scale, clientToken, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new CreateTaskSetCommand({
          cluster: cluster,
          service: service,
          taskDefinition: taskDefinition,
          externalId: externalId,
          networkConfiguration: networkConfiguration,
          loadBalancers: loadBalancers,
          serviceRegistries: serviceRegistries,
          launchType: launchType as any,
          capacityProviderStrategy: capacityProviderStrategy,
          platformVersion: platformVersion,
          scale: scale,
          clientToken: clientToken,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  taskSet: response.taskSet,
              };
    } catch (err) {
      return { error: 'Failed to create a new task set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
