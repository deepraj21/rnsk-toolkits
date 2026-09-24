import { tool } from 'ai';
import { z } from 'zod';
import { CreateLaunchConfigurationCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsCreateLaunchConfiguration = tool({
  description: 'Create a launch configuration. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    launchConfigurationName: z.string().describe('The name of the launch configuration'),
    imageId: z.string().optional().describe('AMI ID'),
    keyName: z.string().optional().describe('Key pair name'),
    securityGroups: z.array(z.string()).optional().describe('Security group IDs'),
    classicLinkVPCId: z.string().optional().describe('ClassicLink VPC ID'),
    classicLinkVPCSecurityGroups: z.array(z.string()).optional().describe('ClassicLink VPC security groups'),
    userData: z.string().optional().describe('User data (base64 encoded)'),
    instanceId: z.string().optional().describe('Instance ID to use as template'),
    instanceType: z.string().optional().describe('Instance type'),
    kernelId: z.string().optional().describe('Kernel ID'),
    ramdiskId: z.string().optional().describe('RAM disk ID'),
    blockDeviceMappings: z.array(z.record(z.any())).optional().describe('Block device mappings'),
    instanceMonitoring: z.record(z.any()).optional().describe('Instance monitoring configuration'),
    spotPrice: z.string().optional().describe('Spot price'),
    iamInstanceProfile: z.string().optional().describe('IAM instance profile'),
    ebsOptimized: z.boolean().optional().describe('Whether EBS optimized'),
    associatePublicIpAddress: z.boolean().optional().describe('Whether to associate public IP'),
    placementTenancy: z.enum(['default', 'dedicated', 'host']).optional().describe('Placement tenancy'),
    metadataOptions: z.record(z.any()).optional().describe('Metadata options'),
  }),
  execute: async ({ awsCredentials, region, launchConfigurationName, imageId, keyName, securityGroups, classicLinkVPCId, classicLinkVPCSecurityGroups, userData, instanceId, instanceType, kernelId, ramdiskId, blockDeviceMappings, instanceMonitoring, spotPrice, iamInstanceProfile, ebsOptimized, associatePublicIpAddress, placementTenancy, metadataOptions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new CreateLaunchConfigurationCommand({
          LaunchConfigurationName: launchConfigurationName,
          ImageId: imageId,
          KeyName: keyName,
          SecurityGroups: securityGroups,
          ClassicLinkVPCId: classicLinkVPCId,
          ClassicLinkVPCSecurityGroups: classicLinkVPCSecurityGroups,
          UserData: userData,
          InstanceId: instanceId,
          InstanceType: instanceType,
          KernelId: kernelId,
          RamdiskId: ramdiskId,
          BlockDeviceMappings: blockDeviceMappings,
          InstanceMonitoring: instanceMonitoring,
          SpotPrice: spotPrice,
          IamInstanceProfile: iamInstanceProfile,
          EbsOptimized: ebsOptimized,
          AssociatePublicIpAddress: associatePublicIpAddress,
          PlacementTenancy: placementTenancy,
          MetadataOptions: metadataOptions,
      } as any);
      await client.send(command);
      return {
                  success: true,
                  message: `Launch configuration ${launchConfigurationName} created successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create a launch configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
