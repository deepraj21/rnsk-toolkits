import { tool } from 'ai';
import { z } from 'zod';
import { CreateNotebookInstanceCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerNotebookInstance = tool({
  description: 'Create a new SageMaker notebook instance. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    notebookInstanceName: z.string().describe('Name of the notebook instance'),
    instanceType: z.string().describe('EC2 instance type'),
    roleArn: z.string().describe('IAM role ARN'),
    subnetId: z.string().optional().describe('VPC subnet ID'),
    securityGroupIds: z.array(z.string()).optional().describe('Security group IDs'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    lifecycleConfigName: z.string().optional().describe('Lifecycle configuration name'),
    directInternetAccess: z.enum(['Enabled', 'Disabled']).optional().describe('Direct internet access'),
    volumeSizeInGB: z.number().optional().describe('Volume size in GB'),
    acceleratorTypes: z.array(z.string()).optional().describe('Accelerator types'),
    defaultCodeRepository: z.string().optional().describe('Default code repository'),
    additionalCodeRepositories: z.array(z.string()).optional().describe('Additional code repositories'),
    rootAccess: z.enum(['Enabled', 'Disabled']).optional().describe('Root access'),
    platformIdentifier: z.string().optional().describe('Platform identifier'),
  }),
  execute: async ({ awsCredentials, region, notebookInstanceName, instanceType, roleArn, subnetId, securityGroupIds, kmsKeyId, tags, lifecycleConfigName, directInternetAccess, volumeSizeInGB, acceleratorTypes, defaultCodeRepository, additionalCodeRepositories, rootAccess, platformIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateNotebookInstanceCommand({
          NotebookInstanceName: notebookInstanceName,
          InstanceType: instanceType,
          RoleArn: roleArn,
          SubnetId: subnetId,
          SecurityGroupIds: securityGroupIds,
          KmsKeyId: kmsKeyId,
          Tags: tags,
          LifecycleConfigName: lifecycleConfigName,
          DirectInternetAccess: directInternetAccess,
          VolumeSizeInGB: volumeSizeInGB,
          AcceleratorTypes: acceleratorTypes,
          DefaultCodeRepository: defaultCodeRepository,
          AdditionalCodeRepositories: additionalCodeRepositories,
          RootAccess: rootAccess,
          PlatformIdentifier: platformIdentifier,
      } as any);
      const response = await client.send(command);
      return {
                  notebookInstanceArn: response.NotebookInstanceArn,
              };
    } catch (err) {
      return { error: 'Failed to create a new SageMaker notebook instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
