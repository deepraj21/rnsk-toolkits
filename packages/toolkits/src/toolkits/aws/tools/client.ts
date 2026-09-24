import { EC2Client } from '@aws-sdk/client-ec2';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { S3Client } from '@aws-sdk/client-s3';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';
import { IAMClient } from '@aws-sdk/client-iam';

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

const DEFAULT_REGION = 'us-east-1';

/** awsCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseAwsCredentials(awsCredentials: string): AwsCredentials {
  const parsed = JSON.parse(awsCredentials) as Partial<AwsCredentials>;
  if (!parsed.accessKeyId || !parsed.secretAccessKey) {
    throw new Error('AWS credentials must include accessKeyId and secretAccessKey');
  }
  return { accessKeyId: parsed.accessKeyId, secretAccessKey: parsed.secretAccessKey };
}

export function createEc2Client(awsCredentials: string, region?: string): EC2Client {
  return new EC2Client({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createCloudWatchClient(awsCredentials: string, region?: string): CloudWatchClient {
  return new CloudWatchClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createCloudWatchLogsClient(awsCredentials: string, region?: string): CloudWatchLogsClient {
  return new CloudWatchLogsClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createS3Client(awsCredentials: string, region?: string): S3Client {
  return new S3Client({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createLambdaClient(awsCredentials: string, region?: string): LambdaClient {
  return new LambdaClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createDynamoDbClient(awsCredentials: string, region?: string): DynamoDBClient {
  return new DynamoDBClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createDynamoDbDocClient(awsCredentials: string, region?: string): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(createDynamoDbClient(awsCredentials, region));
}

export function createSqsClient(awsCredentials: string, region?: string): SQSClient {
  return new SQSClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createSnsClient(awsCredentials: string, region?: string): SNSClient {
  return new SNSClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createIamClient(awsCredentials: string, region?: string): IAMClient {
  return new IAMClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}
