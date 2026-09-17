import { EC2Client } from '@aws-sdk/client-ec2';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';

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
