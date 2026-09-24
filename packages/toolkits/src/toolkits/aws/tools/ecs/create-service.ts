import { tool } from 'ai';
import { z } from 'zod';
import { CreateServiceCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsCreateEcsService = tool({
  description: 'Create a new ECS service. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    serviceName: z.string().describe('The name of the service'),
    taskDefinition: z.string().describe('The family and revision of the task definition'),
    loadBalancers: z.array(z.record(z.any())).optional().describe('Load balancer configuration'),
    serviceRegistries: z.array(z.record(z.any())).optional().describe('Service registry configuration'),
    desiredCount: z.number().optional().describe('The number of tasks to run'),
    clientToken: z.string().optional().describe('Unique identifier for the service'),
    launchType: z.enum(['EC2', 'FARGATE', 'EXTERNAL']).optional().describe('Launch type (EC2, FARGATE, EXTERNAL)'),
    capacityProviderStrategy: z.array(z.record(z.any())).optional().describe('Capacity provider strategy'),
    platformVersion: z.string().optional().describe('Platform version for Fargate'),
    role: z.string().optional().describe('IAM role ARN for the service'),
    deploymentConfiguration: z.record(z.any()).optional().describe('Deployment configuration'),
    placementConstraints: z.array(z.record(z.any())).optional().describe('Placement constraints'),
    placementStrategy: z.array(z.record(z.any())).optional().describe('Placement strategy'),
    networkConfiguration: z.record(z.any()).optional().describe('Network configuration'),
    healthCheckGracePeriodSeconds: z.number().optional().describe('Health check grace period'),
    schedulingStrategy: z.enum(['REPLICA', 'DAEMON']).optional().describe('Scheduling strategy (REPLICA, DAEMON)'),
    enableECSManagedTags: z.boolean().optional().describe('Enable ECS managed tags'),
    propagateTags: z.enum(['SERVICE', 'TASK_DEFINITION']).optional().describe('Tag propagation (SERVICE, TASK_DEFINITION)'),
    enableExecuteCommand: z.boolean().optional().describe('Enable ECS Exec'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the service'),
  }),
  execute: async ({ awsCredentials, region, cluster, serviceName, taskDefinition, loadBalancers, serviceRegistries, desiredCount, clientToken, launchType, capacityProviderStrategy, platformVersion, role, deploymentConfiguration, placementConstraints, placementStrategy, networkConfiguration, healthCheckGracePeriodSeconds, schedulingStrategy, enableECSManagedTags, propagateTags, enableExecuteCommand, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new CreateServiceCommand({
          cluster: cluster,
          serviceName: serviceName,
          taskDefinition: taskDefinition,
          loadBalancers: loadBalancers,
          serviceRegistries: serviceRegistries,
          desiredCount: desiredCount,
          clientToken: clientToken,
          launchType: launchType as any,
          capacityProviderStrategy: capacityProviderStrategy,
          platformVersion: platformVersion,
          role: role,
          deploymentConfiguration: deploymentConfiguration,
          placementConstraints: placementConstraints,
          placementStrategy: placementStrategy,
          networkConfiguration: networkConfiguration,
          healthCheckGracePeriodSeconds: healthCheckGracePeriodSeconds,
          schedulingStrategy: schedulingStrategy as any,
          enableECSManagedTags: enableECSManagedTags,
          propagateTags: propagateTags as any,
          enableExecuteCommand: enableExecuteCommand,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  service: response.service,
              };
    } catch (err) {
      return { error: 'Failed to create a new ECS service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
