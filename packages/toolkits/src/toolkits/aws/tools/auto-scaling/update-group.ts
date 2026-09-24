import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAutoScalingGroupCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsUpdateAutoscalingGroup = tool({
  description: 'Update an Auto Scaling group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    launchConfigurationName: z.string().optional().describe('The name of the launch configuration'),
    launchTemplate: z.record(z.any()).optional().describe('Launch template specification'),
    mixedInstancesPolicy: z.record(z.any()).optional().describe('Mixed instances policy'),
    minSize: z.number().optional().describe('Minimum size of the group'),
    maxSize: z.number().optional().describe('Maximum size of the group'),
    desiredCapacity: z.number().optional().describe('Desired capacity'),
    defaultCooldown: z.number().optional().describe('Default cooldown period'),
    availabilityZones: z.array(z.string()).optional().describe('Availability zones'),
    healthCheckType: z.enum(['EC2', 'ELB']).optional().describe('Health check type'),
    healthCheckGracePeriod: z.number().optional().describe('Health check grace period'),
    placementGroup: z.string().optional().describe('Placement group name'),
    vpcZoneIdentifier: z.string().optional().describe('VPC zone identifier'),
    terminationPolicies: z.array(z.string()).optional().describe('Termination policies'),
    newInstancesProtectedFromScaleIn: z.boolean().optional().describe('Whether new instances are protected from scale in'),
    capacityRebalance: z.boolean().optional().describe('Whether capacity rebalancing is enabled'),
    serviceLinkedRoleARN: z.string().optional().describe('Service linked role ARN'),
    maxInstanceLifetime: z.number().optional().describe('Maximum instance lifetime'),
    context: z.string().optional().describe('Context information'),
    desiredCapacityType: z.string().optional().describe('Desired capacity type'),
    defaultInstanceWarmup: z.number().optional().describe('Default instance warmup'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, launchConfigurationName, launchTemplate, mixedInstancesPolicy, minSize, maxSize, desiredCapacity, defaultCooldown, availabilityZones, healthCheckType, healthCheckGracePeriod, placementGroup, vpcZoneIdentifier, terminationPolicies, newInstancesProtectedFromScaleIn, capacityRebalance, serviceLinkedRoleARN, maxInstanceLifetime, context, desiredCapacityType, defaultInstanceWarmup }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new UpdateAutoScalingGroupCommand({
          AutoScalingGroupName: autoScalingGroupName,
          LaunchConfigurationName: launchConfigurationName,
          LaunchTemplate: launchTemplate,
          MixedInstancesPolicy: mixedInstancesPolicy,
          MinSize: minSize,
          MaxSize: maxSize,
          DesiredCapacity: desiredCapacity,
          DefaultCooldown: defaultCooldown,
          AvailabilityZones: availabilityZones,
          HealthCheckType: healthCheckType,
          HealthCheckGracePeriod: healthCheckGracePeriod,
          PlacementGroup: placementGroup,
          VPCZoneIdentifier: vpcZoneIdentifier,
          TerminationPolicies: terminationPolicies,
          NewInstancesProtectedFromScaleIn: newInstancesProtectedFromScaleIn,
          CapacityRebalance: capacityRebalance,
          ServiceLinkedRoleARN: serviceLinkedRoleARN,
          MaxInstanceLifetime: maxInstanceLifetime,
          Context: context,
          DesiredCapacityType: desiredCapacityType,
          DefaultInstanceWarmup: defaultInstanceWarmup,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Auto Scaling group ${autoScalingGroupName} updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to update an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
