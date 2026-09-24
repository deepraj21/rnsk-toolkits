import { tool } from 'ai';
import { z } from 'zod';
import { CreateNodegroupCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsCreateEksNodegroup = tool({
  description: 'Create a new nodegroup. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    nodegroupName: z.string().describe('The name of the nodegroup'),
    nodeRole: z.string().describe('IAM role ARN for the nodegroup'),
    subnets: z.array(z.string()).describe('Subnet IDs'),
    instanceTypes: z.array(z.string()).optional().describe('EC2 instance types'),
    amiType: z.string().optional().describe('AMI type (AL2_x86_64, AL2_x86_64_GPU, AL2_ARM_64, CUSTOM, BOTTLEROCKET_ARM_64, BOTTLEROCKET_x86_64)'),
    capacityType: z.enum(['ON_DEMAND', 'SPOT']).optional().describe('Capacity type (ON_DEMAND, SPOT)'),
    diskSize: z.number().optional().describe('Disk size in GB'),
    remoteAccess: z.record(z.any()).optional().describe('Remote access configuration'),
    scalingConfig: z.record(z.any()).optional().describe('Scaling configuration'),
    labels: z.record(z.any()).optional().describe('Kubernetes labels'),
    taints: z.array(z.record(z.any())).optional().describe('Kubernetes taints'),
    tags: z.record(z.any()).optional().describe('Tags to apply to the nodegroup'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
    launchTemplate: z.record(z.any()).optional().describe('Launch template configuration'),
    updateConfig: z.record(z.any()).optional().describe('Update configuration'),
  }),
  execute: async ({ awsCredentials, region, clusterName, nodegroupName, nodeRole, subnets, instanceTypes, amiType, capacityType, diskSize, remoteAccess, scalingConfig, labels, taints, tags, clientRequestToken, launchTemplate, updateConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new CreateNodegroupCommand({
          clusterName: clusterName,
          nodegroupName: nodegroupName,
          nodeRole: nodeRole,
          subnets: subnets,
          instanceTypes: instanceTypes,
          amiType: amiType as any,
          capacityType: capacityType as any,
          diskSize: diskSize,
          remoteAccess: remoteAccess,
          scalingConfig: scalingConfig,
          labels: labels,
          taints: taints,
          tags: tags,
          clientRequestToken: clientRequestToken,
          launchTemplate: launchTemplate,
          updateConfig: updateConfig,
      });
      const response = await client.send(command);
      return {
                  nodegroup: response.nodegroup,
              };
    } catch (err) {
      return { error: 'Failed to create a new nodegroup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
