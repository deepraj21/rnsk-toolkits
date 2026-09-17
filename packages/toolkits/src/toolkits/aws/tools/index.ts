import { awsListEc2Instances } from './ec2/list-instances.js';
import { awsGetEc2Instance } from './ec2/get-instance.js';
import { awsStartEc2Instance } from './ec2/start-instance.js';
import { awsStopEc2Instance } from './ec2/stop-instance.js';
import { awsGetCloudwatchMetricData } from './cloudwatch/get-metric-data.js';
import { awsListCloudwatchAlarms } from './cloudwatch/list-alarms.js';
import { awsListCloudwatchLogGroups } from './cloudwatch/list-log-groups.js';
import { awsFilterCloudwatchLogEvents } from './cloudwatch/filter-log-events.js';

export {
  awsListEc2Instances,
  awsGetEc2Instance,
  awsStartEc2Instance,
  awsStopEc2Instance,
  awsGetCloudwatchMetricData,
  awsListCloudwatchAlarms,
  awsListCloudwatchLogGroups,
  awsFilterCloudwatchLogEvents,
};

export const awsTools = [
  {
    name: 'awsListEc2Instances',
    description: 'List EC2 instances, optionally filtered by state.',
    tool: awsListEc2Instances,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetEc2Instance',
    description: 'Get detailed information about a specific EC2 instance.',
    tool: awsGetEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsStartEc2Instance',
    description: 'Start a stopped EC2 instance.',
    tool: awsStartEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopEc2Instance',
    description: 'Stop a running EC2 instance.',
    tool: awsStopEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudwatchMetricData',
    description: 'Retrieve CloudWatch metric statistics for a namespace and metric name.',
    tool: awsGetCloudwatchMetricData,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudwatchAlarms',
    description: 'List CloudWatch alarms, optionally filtered by name prefix or state.',
    tool: awsListCloudwatchAlarms,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudwatchLogGroups',
    description: 'List CloudWatch log groups, optionally filtered by name prefix.',
    tool: awsListCloudwatchLogGroups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsFilterCloudwatchLogEvents',
    description: 'Search CloudWatch log events with an optional filter pattern and time range.',
    tool: awsFilterCloudwatchLogEvents,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
];
