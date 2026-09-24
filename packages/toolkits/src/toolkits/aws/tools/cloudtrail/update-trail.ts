import { tool } from 'ai';
import { z } from 'zod';
import { UpdateTrailCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsUpdateTrail = tool({
  description: 'Updates trail settings that control what events you are logging, and how to handle log files. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the trail'),
    s3BucketName: z.string().optional().describe('The name of the Amazon S3 bucket designated for publishing log files'),
    s3KeyPrefix: z.string().optional().describe('The prefix for the specified S3 bucket'),
    snsTopicName: z.string().optional().describe('The name of the Amazon SNS topic'),
    includeGlobalServiceEvents: z.boolean().optional().describe('Whether the trail is publishing events from global services'),
    isMultiRegionTrail: z.boolean().optional().describe('Whether the trail is created in the current region or in all regions'),
    enableLogFileValidation: z.boolean().optional().describe('Whether log file integrity validation is enabled'),
    cloudWatchLogsLogGroupArn: z.string().optional().describe('The Amazon Resource Name (ARN) of the log group'),
    cloudWatchLogsRoleArn: z.string().optional().describe('The role ARN for CloudWatch Logs'),
    kmsKeyId: z.string().optional().describe('The KMS key ID to use to encrypt the logs'),
  }),
  execute: async ({ awsCredentials, region, name, s3BucketName, s3KeyPrefix, snsTopicName, includeGlobalServiceEvents, isMultiRegionTrail, enableLogFileValidation, cloudWatchLogsLogGroupArn, cloudWatchLogsRoleArn, kmsKeyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new UpdateTrailCommand({
          Name: name,
          S3BucketName: s3BucketName,
          S3KeyPrefix: s3KeyPrefix,
          SnsTopicName: snsTopicName,
          IncludeGlobalServiceEvents: includeGlobalServiceEvents,
          IsMultiRegionTrail: isMultiRegionTrail,
          EnableLogFileValidation: enableLogFileValidation,
          CloudWatchLogsLogGroupArn: cloudWatchLogsLogGroupArn,
          CloudWatchLogsRoleArn: cloudWatchLogsRoleArn,
          KmsKeyId: kmsKeyId,
      });
      const response = await client.send(command);
      return {
                  name: response.Name,
                  s3BucketName: response.S3BucketName,
                  s3KeyPrefix: response.S3KeyPrefix,
                  snsTopicARN: response.SnsTopicARN,
                  snsTopicName: response.SnsTopicName,
                  includeGlobalServiceEvents: response.IncludeGlobalServiceEvents,
                  isMultiRegionTrail: response.IsMultiRegionTrail,
                  trailARN: response.TrailARN,
                  logFileValidationEnabled: response.LogFileValidationEnabled,
                  cloudWatchLogsLogGroupArn: response.CloudWatchLogsLogGroupArn,
                  cloudWatchLogsRoleArn: response.CloudWatchLogsRoleArn,
                  kmsKeyId: response.KmsKeyId,
              };
    } catch (err) {
      return { error: 'Failed to updates trail settings that control what events you are logging, and how to handle log files', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
