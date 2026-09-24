import { defineToolkit, defineTool } from '../../core/define.js';
import { AWS_ICON } from './icon.js';
import { awsTools } from './tools/index.js';

export default defineToolkit({
  id: 'aws',
  displayName: 'AWS',
  shortDescription: 'Manage EC2, VPC, S3, Lambda, DynamoDB, SQS/SNS, IAM, ECS/EKS/ECR, RDS, ElastiCache, EBS, Route53, CloudFront, API Gateway, Auto Scaling, EventBridge, VPC Lattice; monitor CloudWatch.',
  category: 'Developer Tools & DevOps',
  icon: AWS_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'awsCredentials',
    provider: {
      fields: ['accessKeyId', 'secretAccessKey'],
      connectDescription:
        'Connect an AWS IAM access key with EC2 and CloudWatch read (and, for start/stop, write) permissions.',
    },
  },
  tools: awsTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: { since: '0.0.6', homepage: 'https://aws.amazon.com' },
});
