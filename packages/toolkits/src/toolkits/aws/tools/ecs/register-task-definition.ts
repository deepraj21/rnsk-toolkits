import { tool } from 'ai';
import { z } from 'zod';
import { RegisterTaskDefinitionCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsRegisterEcsTaskDefinition = tool({
  description: 'Register a new task definition. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    family: z.string().describe('The family name of the task definition'),
    taskRoleArn: z.string().optional().describe('IAM role ARN for the task'),
    executionRoleArn: z.string().optional().describe('IAM role ARN for task execution'),
    networkMode: z.enum(['bridge', 'host', 'awsvpc', 'none']).optional().describe('Network mode (bridge, host, awsvpc, none)'),
    containerDefinitions: z.array(z.record(z.any())).describe('Container definitions'),
    volumes: z.array(z.record(z.any())).optional().describe('Volume definitions'),
    placementConstraints: z.array(z.record(z.any())).optional().describe('Placement constraints'),
    requiresCompatibilities: z.array(z.string()).optional().describe('Required compatibilities (EC2, FARGATE, EXTERNAL)'),
    cpu: z.string().optional().describe('CPU units'),
    memory: z.string().optional().describe('Memory in MB'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the task definition'),
    pidMode: z.enum(['host', 'task']).optional().describe('PID mode (host, task)'),
    ipcMode: z.enum(['host', 'task', 'none']).optional().describe('IPC mode (host, task, none)'),
    proxyConfiguration: z.record(z.any()).optional().describe('Proxy configuration'),
    inferenceAccelerators: z.array(z.record(z.any())).optional().describe('Inference accelerators'),
    ephemeralStorage: z.record(z.any()).optional().describe('Ephemeral storage configuration'),
    runtimePlatform: z.record(z.any()).optional().describe('Runtime platform configuration'),
  }),
  execute: async ({ awsCredentials, region, family, taskRoleArn, executionRoleArn, networkMode, containerDefinitions, volumes, placementConstraints, requiresCompatibilities, cpu, memory, tags, pidMode, ipcMode, proxyConfiguration, inferenceAccelerators, ephemeralStorage, runtimePlatform }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new RegisterTaskDefinitionCommand({
          family: family,
          taskRoleArn: taskRoleArn,
          executionRoleArn: executionRoleArn,
          networkMode: networkMode as any,
          containerDefinitions: containerDefinitions,
          volumes: volumes,
          placementConstraints: placementConstraints,
          requiresCompatibilities: requiresCompatibilities as any,
          cpu: cpu,
          memory: memory,
          tags: tags,
          pidMode: pidMode as any,
          ipcMode: ipcMode as any,
          proxyConfiguration: proxyConfiguration,
          inferenceAccelerators: inferenceAccelerators,
          ephemeralStorage: ephemeralStorage,
          runtimePlatform: runtimePlatform,
      } as any);
      const response = await client.send(command);
      return {
                  taskDefinition: response.taskDefinition,
                  tags: response.tags || [],
              };
    } catch (err) {
      return { error: 'Failed to register a new task definition', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
