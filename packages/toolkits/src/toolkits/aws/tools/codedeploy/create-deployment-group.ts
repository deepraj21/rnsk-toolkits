import { tool } from 'ai';
import { z } from 'zod';
import { CreateDeploymentGroupCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsCreateCodedeployDeploymentGroup = tool({
  description: 'Create a new deployment group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    deploymentGroupName: z.string().describe('The name of the deployment group'),
    serviceRoleArn: z.string().describe('The ARN of the service role'),
    deploymentConfigName: z.string().optional().describe('The deployment configuration name'),
    ec2TagFilters: z.enum(['KEY_ONLY', 'VALUE_ONLY', 'KEY_AND_VALUE']).optional().describe('EC2 tag filters'),
    onPremisesInstanceTagFilters: z.enum(['KEY_ONLY', 'VALUE_ONLY', 'KEY_AND_VALUE']).optional().describe('On-premises instance tag filters'),
    autoScalingGroups: z.array(z.string()).optional().describe('Auto Scaling group names'),
    loadBalancerInfo: z.record(z.any()).optional().describe('Load balancer information'),
    ec2TagSet: z.record(z.any()).optional().describe('EC2 tag set'),
    onPremisesTagSet: z.record(z.any()).optional().describe('On-premises tag set'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    alarmConfiguration: z.record(z.any()).optional().describe('Alarm configuration'),
    autoRollbackConfiguration: z.record(z.any()).optional().describe('Auto rollback configuration'),
    deploymentStyle: z.record(z.any()).optional().describe('Deployment style'),
    blueGreenDeploymentConfiguration: z.record(z.any()).optional().describe('Blue/green deployment configuration'),
    ecsServices: z.array(z.record(z.any())).optional().describe('ECS services'),
  }),
  execute: async ({ awsCredentials, region, applicationName, deploymentGroupName, serviceRoleArn, deploymentConfigName, ec2TagFilters, onPremisesInstanceTagFilters, autoScalingGroups, loadBalancerInfo, ec2TagSet, onPremisesTagSet, tags, alarmConfiguration, autoRollbackConfiguration, deploymentStyle, blueGreenDeploymentConfiguration, ecsServices }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new CreateDeploymentGroupCommand({
          applicationName: applicationName,
          deploymentGroupName: deploymentGroupName,
          serviceRoleArn: serviceRoleArn,
          deploymentConfigName: deploymentConfigName,
          ec2TagFilters: ec2TagFilters,
          onPremisesInstanceTagFilters: onPremisesInstanceTagFilters,
          autoScalingGroups: autoScalingGroups,
          loadBalancerInfo: loadBalancerInfo,
          ec2TagSet: ec2TagSet,
          onPremisesTagSet: onPremisesTagSet,
          tags: tags,
          alarmConfiguration: alarmConfiguration,
          autoRollbackConfiguration: autoRollbackConfiguration,
          deploymentStyle: deploymentStyle,
          blueGreenDeploymentConfiguration: blueGreenDeploymentConfiguration,
          ecsServices: ecsServices,
      } as any);
      const response = await client.send(command);
      return {
                  deploymentGroupId: response.deploymentGroupId,
              };
    } catch (err) {
      return { error: 'Failed to create a new deployment group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
