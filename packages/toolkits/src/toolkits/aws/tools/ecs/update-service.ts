import { tool } from 'ai';
import { z } from 'zod';
import { UpdateServiceCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsUpdateEcsService = tool({
  description: 'Update an existing ECS service. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service'),
    desiredCount: z.number().optional().describe('The number of tasks to run'),
    taskDefinition: z.string().optional().describe('The family and revision of the task definition'),
    capacityProviderStrategy: z.array(z.record(z.any())).optional().describe('Capacity provider strategy'),
    deploymentConfiguration: z.record(z.any()).optional().describe('Deployment configuration'),
    networkConfiguration: z.record(z.any()).optional().describe('Network configuration'),
    placementConstraints: z.array(z.record(z.any())).optional().describe('Placement constraints'),
    placementStrategy: z.array(z.record(z.any())).optional().describe('Placement strategy'),
    platformVersion: z.string().optional().describe('Platform version for Fargate'),
    forceNewDeployment: z.boolean().optional().describe('Force a new deployment'),
    healthCheckGracePeriodSeconds: z.number().optional().describe('Health check grace period'),
    enableExecuteCommand: z.boolean().optional().describe('Enable ECS Exec'),
    enableECSManagedTags: z.boolean().optional().describe('Enable ECS managed tags'),
    loadBalancers: z.array(z.record(z.any())).optional().describe('Load balancer configuration'),
    propagateTags: z.enum(['SERVICE', 'TASK_DEFINITION']).optional().describe('Tag propagation (SERVICE, TASK_DEFINITION)'),
    serviceRegistries: z.array(z.record(z.any())).optional().describe('Service registry configuration'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, desiredCount, taskDefinition, capacityProviderStrategy, deploymentConfiguration, networkConfiguration, placementConstraints, placementStrategy, platformVersion, forceNewDeployment, healthCheckGracePeriodSeconds, enableExecuteCommand, enableECSManagedTags, loadBalancers, propagateTags, serviceRegistries }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new UpdateServiceCommand({
          cluster: cluster,
          service: service,
          desiredCount: desiredCount,
          taskDefinition: taskDefinition,
          capacityProviderStrategy: capacityProviderStrategy,
          deploymentConfiguration: deploymentConfiguration,
          networkConfiguration: networkConfiguration,
          placementConstraints: placementConstraints,
          placementStrategy: placementStrategy,
          platformVersion: platformVersion,
          forceNewDeployment: forceNewDeployment,
          healthCheckGracePeriodSeconds: healthCheckGracePeriodSeconds,
          enableExecuteCommand: enableExecuteCommand,
          enableECSManagedTags: enableECSManagedTags,
          loadBalancers: loadBalancers,
          propagateTags: propagateTags as any,
          serviceRegistries: serviceRegistries,
      } as any);
      const response = await client.send(command);
      return {
                  service: response.service,
              };
    } catch (err) {
      return { error: 'Failed to update an existing ECS service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
