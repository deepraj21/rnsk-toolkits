import { tool } from 'ai';
import { z } from 'zod';
import { UpdateNotebookInstanceCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsUpdateSagemakerNotebookInstance = tool({
  description: 'Update a SageMaker notebook instance. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    notebookInstanceName: z.string().describe('Name of the notebook instance'),
    instanceType: z.string().optional().describe('EC2 instance type'),
    roleArn: z.string().optional().describe('IAM role ARN'),
    lifecycleConfigName: z.string().optional().describe('Lifecycle configuration name'),
    disassociateLifecycleConfig: z.boolean().optional().describe('Disassociate lifecycle config'),
    volumeSizeInGB: z.number().optional().describe('Volume size in GB'),
    defaultCodeRepository: z.string().optional().describe('Default code repository'),
    additionalCodeRepositories: z.array(z.string()).optional().describe('Additional code repositories'),
    acceleratorTypes: z.array(z.string()).optional().describe('Accelerator types'),
    disassociateAcceleratorTypes: z.boolean().optional().describe('Disassociate accelerator types'),
    disassociateDefaultCodeRepository: z.boolean().optional().describe('Disassociate default code repository'),
    disassociateAdditionalCodeRepositories: z.boolean().optional().describe('Disassociate additional code repositories'),
    rootAccess: z.enum(['Enabled', 'Disabled']).optional().describe('Root access'),
  }),
  execute: async ({ awsCredentials, region, notebookInstanceName, instanceType, roleArn, lifecycleConfigName, disassociateLifecycleConfig, volumeSizeInGB, defaultCodeRepository, additionalCodeRepositories, acceleratorTypes, disassociateAcceleratorTypes, disassociateDefaultCodeRepository, disassociateAdditionalCodeRepositories, rootAccess }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new UpdateNotebookInstanceCommand({
          NotebookInstanceName: notebookInstanceName,
          InstanceType: instanceType,
          RoleArn: roleArn,
          LifecycleConfigName: lifecycleConfigName,
          DisassociateLifecycleConfig: disassociateLifecycleConfig,
          VolumeSizeInGB: volumeSizeInGB,
          DefaultCodeRepository: defaultCodeRepository,
          AdditionalCodeRepositories: additionalCodeRepositories,
          AcceleratorTypes: acceleratorTypes,
          DisassociateAcceleratorTypes: disassociateAcceleratorTypes,
          DisassociateDefaultCodeRepository: disassociateDefaultCodeRepository,
          DisassociateAdditionalCodeRepositories: disassociateAdditionalCodeRepositories,
          RootAccess: rootAccess,
      } as any);
      await client.send(command);
      return {
                  message: 'Notebook instance updated successfully',
                  notebookInstanceName: notebookInstanceName,
              };
    } catch (err) {
      return { error: 'Failed to update a SageMaker notebook instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
