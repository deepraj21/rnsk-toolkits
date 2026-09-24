import { tool } from 'ai';
import { z } from 'zod';
import { UpdateDeploymentGroupCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsUpdateCodedeployDeploymentGroup = tool({
  description: 'Update a deployment group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    currentDeploymentGroupName: z.string().describe('The current name of the deployment group'),
    newDeploymentGroupName: z.string().optional().describe('The new name for the deployment group'),
    deploymentConfigName: z.string().optional().describe('The deployment configuration name'),
    serviceRoleArn: z.string().optional().describe('The ARN of the service role'),
    ec2TagFilters: z.enum(['KEY_ONLY', 'VALUE_ONLY', 'KEY_AND_VALUE']).optional().describe('ec2TagFilters'),
    onPremisesInstanceTagFilters: z.enum(['KEY_ONLY', 'VALUE_ONLY', 'KEY_AND_VALUE']).optional().describe('onPremisesInstanceTagFilters'),
    autoScalingGroups: z.array(z.string()).optional().describe('autoScalingGroups'),
    loadBalancerInfo: z.record(z.any()).optional().describe('loadBalancerInfo'),
    ec2TagSet: z.record(z.any()).optional().describe('ec2TagSet'),
    onPremisesTagSet: z.record(z.any()).optional().describe('onPremisesTagSet'),
    alarmConfiguration: z.record(z.any()).optional().describe('alarmConfiguration'),
    autoRollbackConfiguration: z.record(z.any()).optional().describe('autoRollbackConfiguration'),
    deploymentStyle: z.record(z.any()).optional().describe('deploymentStyle'),
    blueGreenDeploymentConfiguration: z.record(z.any()).optional().describe('blueGreenDeploymentConfiguration'),
    ecsServices: z.array(z.record(z.any())).optional().describe('ecsServices'),
  }),
  execute: async ({ awsCredentials, region, applicationName, currentDeploymentGroupName, newDeploymentGroupName, deploymentConfigName, serviceRoleArn, ec2TagFilters, onPremisesInstanceTagFilters, autoScalingGroups, loadBalancerInfo, ec2TagSet, onPremisesTagSet, alarmConfiguration, autoRollbackConfiguration, deploymentStyle, blueGreenDeploymentConfiguration, ecsServices }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new UpdateDeploymentGroupCommand({
          applicationName: applicationName,
          currentDeploymentGroupName: currentDeploymentGroupName,
          newDeploymentGroupName: newDeploymentGroupName,
          deploymentConfigName: deploymentConfigName,
          serviceRoleArn: serviceRoleArn,
          ec2TagFilters: ec2TagFilters,
          onPremisesInstanceTagFilters: onPremisesInstanceTagFilters,
          autoScalingGroups: autoScalingGroups,
          loadBalancerInfo: loadBalancerInfo,
          ec2TagSet: ec2TagSet,
          onPremisesTagSet: onPremisesTagSet,
          alarmConfiguration: alarmConfiguration,
          autoRollbackConfiguration: autoRollbackConfiguration,
          deploymentStyle: deploymentStyle,
          blueGreenDeploymentConfiguration: blueGreenDeploymentConfiguration,
          ecsServices: ecsServices,
      } as any);
      const response = await client.send(command);
      return {
                  hooksNotCleanedUp: response.hooksNotCleanedUp || [],
              };
    } catch (err) {
      return { error: 'Failed to update a deployment group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
