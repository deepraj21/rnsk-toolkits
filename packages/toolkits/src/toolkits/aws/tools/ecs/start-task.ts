import { tool } from 'ai';
import { z } from 'zod';
import { StartTaskCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsStartEcsTask = tool({
  description: 'Start a stopped ECS task. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    taskDefinition: z.string().describe('The family and revision of the task definition'),
    containerInstances: z.array(z.string()).describe('Container instance ARNs'),
    overrides: z.record(z.any()).optional().describe('Task overrides'),
    startedBy: z.string().optional().describe('Who started the task'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the task'),
    enableExecuteCommand: z.boolean().optional().describe('Enable ECS Exec'),
    group: z.string().optional().describe('Task group'),
    networkConfiguration: z.record(z.any()).optional().describe('Network configuration'),
    propagateTags: z.enum(['TASK_DEFINITION', 'SERVICE', 'NONE']).optional().describe('Tag propagation (TASK_DEFINITION, SERVICE, NONE)'),
    referenceId: z.string().optional().describe('Reference ID for the task'),
  }),
  execute: async ({ awsCredentials, region, cluster, taskDefinition, containerInstances, overrides, startedBy, tags, enableExecuteCommand, group, networkConfiguration, propagateTags, referenceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new StartTaskCommand({
          cluster: cluster,
          taskDefinition: taskDefinition,
          containerInstances: containerInstances,
          overrides: overrides,
          startedBy: startedBy,
          tags: tags,
          enableExecuteCommand: enableExecuteCommand,
          group: group,
          networkConfiguration: networkConfiguration,
          propagateTags: propagateTags as any,
          referenceId: referenceId,
      });
      const response = await client.send(command);
      return {
                  tasks: response.tasks || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to start a stopped ECS task', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
