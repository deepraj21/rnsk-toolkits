import { tool } from 'ai';
import { z } from 'zod';
import { GetLayerVersionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsGetLambdaLayerVersion = tool({
  description: 'Get details about a specific Lambda layer version. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    layerName: z.string().describe('The name of the layer'),
    versionNumber: z.number().describe('The version number'),
  }),
  execute: async ({ awsCredentials, region, layerName, versionNumber }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new GetLayerVersionCommand({
          LayerName: layerName,
          VersionNumber: versionNumber,
      });
      const response = await client.send(command);
      return {
                  content: response.Content ? {
                      location: response.Content.Location,
                      codeSha256: response.Content.CodeSha256,
                      codeSize: response.Content.CodeSize,
                      signingProfileVersionArn: response.Content.SigningProfileVersionArn,
                      signingJobArn: response.Content.SigningJobArn,
                  } : null,
                  layerArn: response.LayerArn,
                  layerVersionArn: response.LayerVersionArn,
                  description: response.Description,
                  createdDate: response.CreatedDate,
                  version: response.Version,
                  compatibleRuntimes: response.CompatibleRuntimes,
                  licenseInfo: response.LicenseInfo,
                  compatibleArchitectures: response.CompatibleArchitectures,
              };
    } catch (err) {
      return { error: 'Failed to get details about a specific Lambda layer version', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
