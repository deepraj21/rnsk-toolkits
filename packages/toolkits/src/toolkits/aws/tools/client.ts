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
import { ECSClient } from '@aws-sdk/client-ecs';
import { EKSClient } from '@aws-sdk/client-eks';
import { ECRClient } from '@aws-sdk/client-ecr';
import { RDSClient } from '@aws-sdk/client-rds';
import { ElastiCacheClient } from '@aws-sdk/client-elasticache';
import { EBSClient } from '@aws-sdk/client-ebs';
import { Route53Client } from '@aws-sdk/client-route-53';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { APIGatewayClient } from '@aws-sdk/client-api-gateway';
import { AutoScalingClient } from '@aws-sdk/client-auto-scaling';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { VPCLatticeClient } from '@aws-sdk/client-vpc-lattice';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { CodeBuildClient } from '@aws-sdk/client-codebuild';
import { CodeDeployClient } from '@aws-sdk/client-codedeploy';
import { CodePipelineClient } from '@aws-sdk/client-codepipeline';
import { CodeartifactClient } from '@aws-sdk/client-codeartifact';
import { CloudTrailClient } from '@aws-sdk/client-cloudtrail';
import { XRayClient } from '@aws-sdk/client-xray';

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

export function createEcsClient(awsCredentials: string, region?: string): ECSClient {
  return new ECSClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createEksClient(awsCredentials: string, region?: string): EKSClient {
  return new EKSClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createEcrClient(awsCredentials: string, region?: string): ECRClient {
  return new ECRClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createRdsClient(awsCredentials: string, region?: string): RDSClient {
  return new RDSClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createElastiCacheClient(awsCredentials: string, region?: string): ElastiCacheClient {
  return new ElastiCacheClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createEbsClient(awsCredentials: string, region?: string): EBSClient {
  return new EBSClient({ region: region || DEFAULT_REGION, credentials: parseAwsCredentials(awsCredentials) });
}

export function createRoute53Client(awsCredentials: string, region?: string): Route53Client {
  return new Route53Client({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCloudFrontClient(awsCredentials: string, region?: string): CloudFrontClient {
  return new CloudFrontClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createApiGatewayClient(awsCredentials: string, region?: string): APIGatewayClient {
  return new APIGatewayClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createAutoScalingClient(awsCredentials: string, region?: string): AutoScalingClient {
  return new AutoScalingClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createEventBridgeClient(awsCredentials: string, region?: string): EventBridgeClient {
  return new EventBridgeClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createVpcLatticeClient(awsCredentials: string, region?: string): VPCLatticeClient {
  return new VPCLatticeClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCloudFormationClient(awsCredentials: string, region?: string): CloudFormationClient {
  return new CloudFormationClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCodeBuildClient(awsCredentials: string, region?: string): CodeBuildClient {
  return new CodeBuildClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCodeDeployClient(awsCredentials: string, region?: string): CodeDeployClient {
  return new CodeDeployClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCodePipelineClient(awsCredentials: string, region?: string): CodePipelineClient {
  return new CodePipelineClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCodeArtifactClient(awsCredentials: string, region?: string): CodeartifactClient {
  return new CodeartifactClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createCloudTrailClient(awsCredentials: string, region?: string): CloudTrailClient {
  return new CloudTrailClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}

export function createXRayClient(awsCredentials: string, region?: string): XRayClient {
  return new XRayClient({
    region: region || DEFAULT_REGION,
    credentials: parseAwsCredentials(awsCredentials),
  });
}
