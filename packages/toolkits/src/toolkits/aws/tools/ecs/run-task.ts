import { tool } from 'ai';
import { z } from 'zod';
import { RunTaskCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsRunEcsTask = tool({
  description: 'Run a new task in an ECS cluster. Use it to launch workloads.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    taskDefinition: z.string().describe('The family and revision of the task definition'),
    overrides: z.record(z.any()).optional().describe('Task overrides'),
    count: z.number().optional().describe('Number of tasks to run'),
    startedBy: z.string().optional().describe('Who started the task'),
    launchType: z.enum(['EC2', 'FARGATE', 'EXTERNAL']).optional().describe('Launch type (EC2, FARGATE, EXTERNAL)'),
    capacityProviderStrategy: z.array(z.record(z.any())).optional().describe('Capacity provider strategy'),
    platformVersion: z.string().optional().describe('Platform version for Fargate'),
    placementConstraints: z.array(z.record(z.any())).optional().describe('Placement constraints'),
    placementStrategy: z.array(z.record(z.any())).optional().describe('Placement strategy'),
    networkConfiguration: z.record(z.any()).optional().describe('Network configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the task'),
    enableExecuteCommand: z.boolean().optional().describe('Enable ECS Exec'),
    enableLogging: z.boolean().optional().describe('Enable logging'),
    propagateTags: z.enum(['TASK_DEFINITION', 'SERVICE', 'NONE']).optional().describe('Tag propagation (TASK_DEFINITION, SERVICE, NONE)'),
    referenceId: z.string().optional().describe('Reference ID for the task'),
  }),
  execute: async ({ awsCredentials, region, cluster, taskDefinition, overrides, count, startedBy, launchType, capacityProviderStrategy, platformVersion, placementConstraints, placementStrategy, networkConfiguration, tags, enableExecuteCommand, enableLogging, propagateTags, referenceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new RunTaskCommand({
          cluster: cluster,
          taskDefinition: taskDefinition,
          overrides: overrides,
          count: count,
          startedBy: startedBy,
          launchType: launchType as any,
          capacityProviderStrategy: capacityProviderStrategy,
          platformVersion: platformVersion,
          placementConstraints: placementConstraints,
          placementStrategy: placementStrategy,
          networkConfiguration: networkConfiguration,
          tags: tags,
          enableExecuteCommand: enableExecuteCommand,
          propagateTags: propagateTags as any,
          referenceId: referenceId,
      } as any);
      const response = await client.send(command);
      return {
                  tasks: response.tasks || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to run a new task in an ECS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
