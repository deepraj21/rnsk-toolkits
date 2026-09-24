import { awsListEc2Instances } from './ec2/list-instances.js';
import { awsGetEc2Instance } from './ec2/get-instance.js';
import { awsStartEc2Instance } from './ec2/start-instance.js';
import { awsStopEc2Instance } from './ec2/stop-instance.js';
import { awsGetCloudwatchMetricData } from './cloudwatch/get-metric-data.js';
import { awsListCloudwatchAlarms } from './cloudwatch/list-alarms.js';
import { awsListCloudwatchLogGroups } from './cloudwatch/list-log-groups.js';
import { awsFilterCloudwatchLogEvents } from './cloudwatch/filter-log-events.js';
import { awsGetCloudwatchMetrics } from './cloudwatch/get-metrics.js';
import { awsGetMetricMetadata } from './cloudwatch/get-metric-metadata.js';
import { awsPutMetricData } from './cloudwatch/put-metric-data.js';
import { awsGetRecommendedMetricAlarms } from './cloudwatch/get-recommended-metric-alarms.js';
import { awsAnalyzeMetric } from './cloudwatch/analyze-metric.js';
import { awsGetAlarmHistory } from './cloudwatch/get-alarm-history.js';
import { awsPutMetricAlarm } from './cloudwatch/put-metric-alarm.js';
import { awsDeleteCloudwatchAlarms } from './cloudwatch/delete-alarms.js';
import { awsSetAlarmState } from './cloudwatch/set-alarm-state.js';
import { awsCreateLogGroup } from './cloudwatch/create-log-group.js';
import { awsDeleteLogGroup } from './cloudwatch/delete-log-group.js';
import { awsDescribeLogStreams } from './cloudwatch/describe-log-streams.js';
import { awsCreateLogStream } from './cloudwatch/create-log-stream.js';
import { awsGetLogEvents } from './cloudwatch/get-log-events.js';
import { awsPutLogEvents } from './cloudwatch/put-log-events.js';
import { awsPutRetentionPolicy } from './cloudwatch/put-retention-policy.js';
import { awsAnalyzeLogGroup } from './cloudwatch/analyze-log-group.js';
import { awsExecuteLogInsightsQuery } from './cloudwatch/execute-log-insights-query.js';
import { awsGetLogsInsightQueryResults } from './cloudwatch/get-logs-insight-query-results.js';
import { awsCancelLogsInsightQuery } from './cloudwatch/cancel-logs-insight-query.js';
import { awsCreateEc2Instance } from './ec2/create-instance.js';
import { awsTerminateEc2Instance } from './ec2/terminate-instance.js';
import { awsRebootEc2Instance } from './ec2/reboot-instance.js';
import { awsDescribeEc2InstanceStatus } from './ec2/describe-instance-status.js';
import { awsDescribeEc2InstanceTypes } from './ec2/describe-instance-types.js';
import { awsModifyEc2InstanceAttribute } from './ec2/modify-instance-attribute.js';
import { awsDescribeEc2InstanceAttribute } from './ec2/describe-instance-attribute.js';
import { awsMonitorEc2Instance } from './ec2/monitor-instance.js';
import { awsUnmonitorEc2Instance } from './ec2/unmonitor-instance.js';
import { awsDescribeEc2Images } from './ec2/describe-images.js';
import { awsCreateEc2Image } from './ec2/create-image.js';
import { awsDeregisterEc2Image } from './ec2/deregister-image.js';
import { awsCopyEc2Image } from './ec2/copy-image.js';
import { awsModifyEc2ImageAttribute } from './ec2/modify-image-attribute.js';
import { awsDescribeEc2Snapshots } from './ec2/describe-snapshots.js';
import { awsCreateEc2Snapshot } from './ec2/create-snapshot.js';
import { awsDeleteEc2Snapshot } from './ec2/delete-snapshot.js';
import { awsCopyEc2Snapshot } from './ec2/copy-snapshot.js';
import { awsDescribeEc2Volumes } from './ec2/describe-volumes.js';
import { awsCreateEc2Volume } from './ec2/create-volume.js';
import { awsAttachEc2Volume } from './ec2/attach-volume.js';
import { awsDetachEc2Volume } from './ec2/detach-volume.js';
import { awsDeleteEc2Volume } from './ec2/delete-volume.js';
import { awsModifyEc2Volume } from './ec2/modify-volume.js';
import { awsDescribeEc2SecurityGroups } from './ec2/describe-security-groups.js';
import { awsCreateEc2SecurityGroup } from './ec2/create-security-group.js';
import { awsDeleteEc2SecurityGroup } from './ec2/delete-security-group.js';
import { awsAuthorizeEc2SecurityGroupIngress } from './ec2/authorize-security-group-ingress.js';
import { awsRevokeEc2SecurityGroupIngress } from './ec2/revoke-security-group-ingress.js';
import { awsAuthorizeEc2SecurityGroupEgress } from './ec2/authorize-security-group-egress.js';
import { awsRevokeEc2SecurityGroupEgress } from './ec2/revoke-security-group-egress.js';
import { awsDescribeEc2KeyPairs } from './ec2/describe-key-pairs.js';
import { awsCreateEc2KeyPair } from './ec2/create-key-pair.js';
import { awsDeleteEc2KeyPair } from './ec2/delete-key-pair.js';
import { awsImportEc2KeyPair } from './ec2/import-key-pair.js';
import { awsDescribeEc2Vpcs } from './ec2/describe-vpcs.js';
import { awsCreateEc2Vpc } from './ec2/create-vpc.js';
import { awsDeleteEc2Vpc } from './ec2/delete-vpc.js';
import { awsModifyEc2VpcAttribute } from './ec2/modify-vpc-attribute.js';
import { awsDescribeEc2Subnets } from './ec2/describe-subnets.js';
import { awsCreateEc2Subnet } from './ec2/create-subnet.js';
import { awsDeleteEc2Subnet } from './ec2/delete-subnet.js';
import { awsDescribeEc2NetworkInterfaces } from './ec2/describe-network-interfaces.js';
import { awsCreateEc2NetworkInterface } from './ec2/create-network-interface.js';
import { awsDeleteEc2NetworkInterface } from './ec2/delete-network-interface.js';
import { awsAttachEc2NetworkInterface } from './ec2/attach-network-interface.js';
import { awsDetachEc2NetworkInterface } from './ec2/detach-network-interface.js';
import { awsDescribeEc2InternetGateways } from './ec2/describe-internet-gateways.js';
import { awsCreateEc2InternetGateway } from './ec2/create-internet-gateway.js';
import { awsDeleteEc2InternetGateway } from './ec2/delete-internet-gateway.js';
import { awsAttachEc2InternetGateway } from './ec2/attach-internet-gateway.js';
import { awsDetachEc2InternetGateway } from './ec2/detach-internet-gateway.js';
import { awsDescribeEc2RouteTables } from './ec2/describe-route-tables.js';
import { awsCreateEc2RouteTable } from './ec2/create-route-table.js';
import { awsDeleteEc2RouteTable } from './ec2/delete-route-table.js';
import { awsCreateEc2Route } from './ec2/create-route.js';
import { awsDeleteEc2Route } from './ec2/delete-route.js';
import { awsAssociateEc2RouteTable } from './ec2/associate-route-table.js';
import { awsDisassociateEc2RouteTable } from './ec2/disassociate-route-table.js';
import { awsDescribeEc2NatGateways } from './ec2/describe-nat-gateways.js';
import { awsCreateEc2NatGateway } from './ec2/create-nat-gateway.js';
import { awsDeleteEc2NatGateway } from './ec2/delete-nat-gateway.js';
import { awsDescribeEc2Addresses } from './ec2/describe-addresses.js';
import { awsAllocateEc2Address } from './ec2/allocate-address.js';
import { awsReleaseEc2Address } from './ec2/release-address.js';
import { awsAssociateEc2Address } from './ec2/associate-address.js';
import { awsDisassociateEc2Address } from './ec2/disassociate-address.js';
import { awsDescribeEc2PlacementGroups } from './ec2/describe-placement-groups.js';
import { awsCreateEc2PlacementGroup } from './ec2/create-placement-group.js';
import { awsDeleteEc2PlacementGroup } from './ec2/delete-placement-group.js';
import { awsDescribeEc2Tags } from './ec2/describe-tags.js';
import { awsCreateEc2Tags } from './ec2/create-tags.js';
import { awsDeleteEc2Tags } from './ec2/delete-tags.js';
import { awsDescribeEc2Regions } from './ec2/describe-regions.js';
import { awsDescribeEc2AvailabilityZones } from './ec2/describe-availability-zones.js';
import { awsDescribeEc2AccountAttributes } from './ec2/describe-account-attributes.js';
import { awsDescribeEc2LaunchTemplates } from './ec2/describe-launch-templates.js';
import { awsCreateEc2LaunchTemplate } from './ec2/create-launch-template.js';
import { awsDeleteEc2LaunchTemplate } from './ec2/delete-launch-template.js';
import { awsDescribeEc2LaunchTemplateVersions } from './ec2/describe-launch-template-versions.js';

export {
  awsListEc2Instances,
  awsGetEc2Instance,
  awsStartEc2Instance,
  awsStopEc2Instance,
  awsGetCloudwatchMetricData,
  awsListCloudwatchAlarms,
  awsListCloudwatchLogGroups,
  awsFilterCloudwatchLogEvents,
  awsCreateEc2Instance,
  awsTerminateEc2Instance,
  awsRebootEc2Instance,
  awsDescribeEc2InstanceStatus,
  awsDescribeEc2InstanceTypes,
  awsModifyEc2InstanceAttribute,
  awsDescribeEc2InstanceAttribute,
  awsMonitorEc2Instance,
  awsUnmonitorEc2Instance,
  awsDescribeEc2Images,
  awsCreateEc2Image,
  awsDeregisterEc2Image,
  awsCopyEc2Image,
  awsModifyEc2ImageAttribute,
  awsDescribeEc2Snapshots,
  awsCreateEc2Snapshot,
  awsDeleteEc2Snapshot,
  awsCopyEc2Snapshot,
  awsDescribeEc2Volumes,
  awsCreateEc2Volume,
  awsAttachEc2Volume,
  awsDetachEc2Volume,
  awsDeleteEc2Volume,
  awsModifyEc2Volume,
  awsDescribeEc2SecurityGroups,
  awsCreateEc2SecurityGroup,
  awsDeleteEc2SecurityGroup,
  awsAuthorizeEc2SecurityGroupIngress,
  awsRevokeEc2SecurityGroupIngress,
  awsAuthorizeEc2SecurityGroupEgress,
  awsRevokeEc2SecurityGroupEgress,
  awsDescribeEc2KeyPairs,
  awsCreateEc2KeyPair,
  awsDeleteEc2KeyPair,
  awsImportEc2KeyPair,
  awsDescribeEc2Vpcs,
  awsCreateEc2Vpc,
  awsDeleteEc2Vpc,
  awsModifyEc2VpcAttribute,
  awsDescribeEc2Subnets,
  awsCreateEc2Subnet,
  awsDeleteEc2Subnet,
  awsDescribeEc2NetworkInterfaces,
  awsCreateEc2NetworkInterface,
  awsDeleteEc2NetworkInterface,
  awsAttachEc2NetworkInterface,
  awsDetachEc2NetworkInterface,
  awsDescribeEc2InternetGateways,
  awsCreateEc2InternetGateway,
  awsDeleteEc2InternetGateway,
  awsAttachEc2InternetGateway,
  awsDetachEc2InternetGateway,
  awsDescribeEc2RouteTables,
  awsCreateEc2RouteTable,
  awsDeleteEc2RouteTable,
  awsCreateEc2Route,
  awsDeleteEc2Route,
  awsAssociateEc2RouteTable,
  awsDisassociateEc2RouteTable,
  awsDescribeEc2NatGateways,
  awsCreateEc2NatGateway,
  awsDeleteEc2NatGateway,
  awsDescribeEc2Addresses,
  awsAllocateEc2Address,
  awsReleaseEc2Address,
  awsAssociateEc2Address,
  awsDisassociateEc2Address,
  awsDescribeEc2PlacementGroups,
  awsCreateEc2PlacementGroup,
  awsDeleteEc2PlacementGroup,
  awsDescribeEc2Tags,
  awsCreateEc2Tags,
  awsDeleteEc2Tags,
  awsDescribeEc2Regions,
  awsDescribeEc2AvailabilityZones,
  awsDescribeEc2AccountAttributes,
  awsDescribeEc2LaunchTemplates,
  awsCreateEc2LaunchTemplate,
  awsDeleteEc2LaunchTemplate,
  awsDescribeEc2LaunchTemplateVersions,
  awsGetCloudwatchMetrics,
  awsGetMetricMetadata,
  awsPutMetricData,
  awsGetRecommendedMetricAlarms,
  awsAnalyzeMetric,
  awsGetAlarmHistory,
  awsPutMetricAlarm,
  awsDeleteCloudwatchAlarms,
  awsSetAlarmState,
  awsCreateLogGroup,
  awsDeleteLogGroup,
  awsDescribeLogStreams,
  awsCreateLogStream,
  awsGetLogEvents,
  awsPutLogEvents,
  awsPutRetentionPolicy,
  awsAnalyzeLogGroup,
  awsExecuteLogInsightsQuery,
  awsGetLogsInsightQueryResults,
  awsCancelLogsInsightQuery,
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
  {
    name: 'awsCreateEc2Instance',
    description: 'Launch a new EC2 instance Use it to provision a new resource.',
    tool: awsCreateEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsTerminateEc2Instance',
    description: 'Terminate an EC2 instance Use it to permanently remove the resource.',
    tool: awsTerminateEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRebootEc2Instance',
    description: 'Reboot an EC2 instance Use it to restart a running instance.',
    tool: awsRebootEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2InstanceStatus',
    description: 'Describe the status of EC2 instances Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InstanceStatus,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2InstanceTypes',
    description: 'Describe EC2 instance types Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InstanceTypes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsModifyEc2InstanceAttribute',
    description: 'Modify an attribute of an EC2 instance Use it to change an existing resource.',
    tool: awsModifyEc2InstanceAttribute,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2InstanceAttribute',
    description: 'Describe an attribute of an EC2 instance Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InstanceAttribute,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsMonitorEc2Instance',
    description: 'Enable detailed monitoring for an EC2 instance Use it to toggle detailed monitoring.',
    tool: awsMonitorEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUnmonitorEc2Instance',
    description: 'Disable detailed monitoring for an EC2 instance Use it to toggle detailed monitoring.',
    tool: awsUnmonitorEc2Instance,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Images',
    description: 'Describe EC2 images (AMIs) Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Images,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Image',
    description: 'Create an AMI from an EC2 instance Use it to provision a new resource.',
    tool: awsCreateEc2Image,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeregisterEc2Image',
    description: 'Deregister an EC2 AMI Use it to permanently remove the resource.',
    tool: awsDeregisterEc2Image,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopyEc2Image',
    description: 'Copy an AMI to another region Use it to duplicate a resource, optionally across regions.',
    tool: awsCopyEc2Image,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyEc2ImageAttribute',
    description: 'Modify an attribute of an EC2 AMI Use it to change an existing resource.',
    tool: awsModifyEc2ImageAttribute,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Snapshots',
    description: 'Describe EC2 snapshots Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Snapshots,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Snapshot',
    description: 'Create a snapshot of an EBS volume Use it to provision a new resource.',
    tool: awsCreateEc2Snapshot,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Snapshot',
    description: 'Delete an EC2 snapshot Use it to permanently remove the resource.',
    tool: awsDeleteEc2Snapshot,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopyEc2Snapshot',
    description: 'Copy an EBS snapshot to another region Use it to duplicate a resource, optionally across regions.',
    tool: awsCopyEc2Snapshot,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Volumes',
    description: 'Describe EBS volumes Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Volumes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Volume',
    description: 'Create an EBS volume Use it to provision a new resource.',
    tool: awsCreateEc2Volume,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAttachEc2Volume',
    description: 'Attach an EBS volume to an instance Use it to connect resources.',
    tool: awsAttachEc2Volume,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachEc2Volume',
    description: 'Detach an EBS volume from an instance Use it to disconnect resources.',
    tool: awsDetachEc2Volume,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Volume',
    description: 'Delete an EBS volume Use it to permanently remove the resource.',
    tool: awsDeleteEc2Volume,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsModifyEc2Volume',
    description: 'Modify an EBS volume (size, type, IOPS) Use it to change an existing resource.',
    tool: awsModifyEc2Volume,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2SecurityGroups',
    description: 'Describe EC2 security groups Use it to inspect current state before making changes.',
    tool: awsDescribeEc2SecurityGroups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2SecurityGroup',
    description: 'Create a new security group Use it to provision a new resource.',
    tool: awsCreateEc2SecurityGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2SecurityGroup',
    description: 'Delete a security group Use it to permanently remove the resource.',
    tool: awsDeleteEc2SecurityGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAuthorizeEc2SecurityGroupIngress',
    description: 'Add inbound rules to a security group Use it to grant access.',
    tool: awsAuthorizeEc2SecurityGroupIngress,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRevokeEc2SecurityGroupIngress',
    description: 'Remove inbound rules from a security group Use it to remove access.',
    tool: awsRevokeEc2SecurityGroupIngress,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAuthorizeEc2SecurityGroupEgress',
    description: 'Add outbound rules to a security group Use it to grant access.',
    tool: awsAuthorizeEc2SecurityGroupEgress,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRevokeEc2SecurityGroupEgress',
    description: 'Remove outbound rules from a security group Use it to remove access.',
    tool: awsRevokeEc2SecurityGroupEgress,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2KeyPairs',
    description: 'Describe EC2 key pairs Use it to inspect current state before making changes.',
    tool: awsDescribeEc2KeyPairs,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2KeyPair',
    description: 'Create a new key pair Use it to provision a new resource.',
    tool: awsCreateEc2KeyPair,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2KeyPair',
    description: 'Delete a key pair Use it to permanently remove the resource.',
    tool: awsDeleteEc2KeyPair,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsImportEc2KeyPair',
    description: 'Import a public key to create a key pair Use it to provision a new resource.',
    tool: awsImportEc2KeyPair,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Vpcs',
    description: 'Describe VPCs Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Vpcs,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Vpc',
    description: 'Create a new VPC Use it to provision a new resource.',
    tool: awsCreateEc2Vpc,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Vpc',
    description: 'Delete a VPC Use it to permanently remove the resource.',
    tool: awsDeleteEc2Vpc,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsModifyEc2VpcAttribute',
    description: 'Modify a VPC attribute Use it to change an existing resource.',
    tool: awsModifyEc2VpcAttribute,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Subnets',
    description: 'Describe subnets Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Subnets,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Subnet',
    description: 'Create a new subnet Use it to provision a new resource.',
    tool: awsCreateEc2Subnet,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Subnet',
    description: 'Delete a subnet Use it to permanently remove the resource.',
    tool: awsDeleteEc2Subnet,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2NetworkInterfaces',
    description: 'Describe network interfaces Use it to inspect current state before making changes.',
    tool: awsDescribeEc2NetworkInterfaces,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2NetworkInterface',
    description: 'Create a network interface Use it to provision a new resource.',
    tool: awsCreateEc2NetworkInterface,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2NetworkInterface',
    description: 'Delete a network interface Use it to permanently remove the resource.',
    tool: awsDeleteEc2NetworkInterface,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAttachEc2NetworkInterface',
    description: 'Attach a network interface to an instance Use it to connect resources.',
    tool: awsAttachEc2NetworkInterface,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachEc2NetworkInterface',
    description: 'Detach a network interface from an instance Use it to disconnect resources.',
    tool: awsDetachEc2NetworkInterface,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2InternetGateways',
    description: 'Describe internet gateways Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InternetGateways,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2InternetGateway',
    description: 'Create an internet gateway Use it to provision a new resource.',
    tool: awsCreateEc2InternetGateway,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2InternetGateway',
    description: 'Delete an internet gateway Use it to permanently remove the resource.',
    tool: awsDeleteEc2InternetGateway,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAttachEc2InternetGateway',
    description: 'Attach an internet gateway to a VPC Use it to connect resources.',
    tool: awsAttachEc2InternetGateway,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachEc2InternetGateway',
    description: 'Detach an internet gateway from a VPC Use it to disconnect resources.',
    tool: awsDetachEc2InternetGateway,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2RouteTables',
    description: 'Describe route tables Use it to inspect current state before making changes.',
    tool: awsDescribeEc2RouteTables,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2RouteTable',
    description: 'Create a route table Use it to provision a new resource.',
    tool: awsCreateEc2RouteTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2RouteTable',
    description: 'Delete a route table Use it to permanently remove the resource.',
    tool: awsDeleteEc2RouteTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateEc2Route',
    description: 'Create a route in a route table Use it to provision a new resource.',
    tool: awsCreateEc2Route,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Route',
    description: 'Delete a route from a route table Use it to permanently remove the resource.',
    tool: awsDeleteEc2Route,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateEc2RouteTable',
    description: 'Associate a route table with a subnet Use it to connect resources.',
    tool: awsAssociateEc2RouteTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateEc2RouteTable',
    description: 'Disassociate a route table from a subnet Use it to disconnect resources.',
    tool: awsDisassociateEc2RouteTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2NatGateways',
    description: 'Describe NAT gateways Use it to inspect current state before making changes.',
    tool: awsDescribeEc2NatGateways,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2NatGateway',
    description: 'Create a NAT gateway Use it to provision a new resource.',
    tool: awsCreateEc2NatGateway,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2NatGateway',
    description: 'Delete a NAT gateway Use it to permanently remove the resource.',
    tool: awsDeleteEc2NatGateway,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2Addresses',
    description: 'Describe Elastic IP addresses Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Addresses,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAllocateEc2Address',
    description: 'Allocate an Elastic IP address Use it to provision a new resource.',
    tool: awsAllocateEc2Address,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsReleaseEc2Address',
    description: 'Release an Elastic IP address Use it to permanently remove the resource.',
    tool: awsReleaseEc2Address,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateEc2Address',
    description: 'Associate an Elastic IP with an instance Use it to connect resources.',
    tool: awsAssociateEc2Address,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateEc2Address',
    description: 'Disassociate an Elastic IP from an instance Use it to disconnect resources.',
    tool: awsDisassociateEc2Address,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2PlacementGroups',
    description: 'Describe placement groups Use it to inspect current state before making changes.',
    tool: awsDescribeEc2PlacementGroups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2PlacementGroup',
    description: 'Create a placement group Use it to provision a new resource.',
    tool: awsCreateEc2PlacementGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2PlacementGroup',
    description: 'Delete a placement group Use it to permanently remove the resource.',
    tool: awsDeleteEc2PlacementGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2Tags',
    description: 'Describe tags for EC2 resources Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Tags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Tags',
    description: 'Create tags for EC2 resources Use it to provision a new resource.',
    tool: awsCreateEc2Tags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Tags',
    description: 'Delete tags from EC2 resources Use it to permanently remove the resource.',
    tool: awsDeleteEc2Tags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2Regions',
    description: 'Describe available AWS regions Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Regions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2AvailabilityZones',
    description: 'Describe availability zones Use it to inspect current state before making changes.',
    tool: awsDescribeEc2AvailabilityZones,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2AccountAttributes',
    description: 'Describe EC2 account attributes Use it to inspect current state before making changes.',
    tool: awsDescribeEc2AccountAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2LaunchTemplates',
    description: 'Describe launch templates Use it to inspect current state before making changes.',
    tool: awsDescribeEc2LaunchTemplates,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2LaunchTemplate',
    description: 'Create a launch template Use it to provision a new resource.',
    tool: awsCreateEc2LaunchTemplate,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2LaunchTemplate',
    description: 'Delete a launch template Use it to permanently remove the resource.',
    tool: awsDeleteEc2LaunchTemplate,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2LaunchTemplateVersions',
    description: 'Describe launch template versions Use it to inspect current state before making changes.',
    tool: awsDescribeEc2LaunchTemplateVersions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudwatchMetrics',
    description: 'Retrieve CloudWatch metrics Use it to inspect current state before making changes.',
    tool: awsGetCloudwatchMetrics,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetMetricMetadata',
    description: 'Retrieves comprehensive metadata about a specific CloudWatch metric Use it to inspect current state before making changes.',
    tool: awsGetMetricMetadata,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutMetricData',
    description: 'Publish custom metric data points to CloudWatch Use it to publish data or configure the resource.',
    tool: awsPutMetricData,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRecommendedMetricAlarms',
    description: 'Gets recommended alarms for a CloudWatch metric based on best practice, and trend, seasonality and statistical analysis Use it to inspect current state before making changes.',
    tool: awsGetRecommendedMetricAlarms,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAnalyzeMetric',
    description: 'Analyzes CloudWatch metric data to determine trend, seasonality, and statistical properties Use it to analyze trends, patterns, and anomalies.',
    tool: awsAnalyzeMetric,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetAlarmHistory',
    description: 'Retrieves historical state changes and patterns for a given CloudWatch alarm Use it to inspect current state before making changes.',
    tool: awsGetAlarmHistory,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutMetricAlarm',
    description: 'Create or update a CloudWatch metric alarm Use it to publish data or configure the resource.',
    tool: awsPutMetricAlarm,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudwatchAlarms',
    description: 'Delete one or more CloudWatch alarms Use it to permanently remove the resource.',
    tool: awsDeleteCloudwatchAlarms,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSetAlarmState',
    description: 'Temporarily set the state of a CloudWatch alarm Use it to change the state or configuration of the resource.',
    tool: awsSetAlarmState,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateLogGroup',
    description: 'Create a new CloudWatch log group Use it to provision a new resource.',
    tool: awsCreateLogGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLogGroup',
    description: 'Delete a CloudWatch log group Use it to permanently remove the resource.',
    tool: awsDeleteLogGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeLogStreams',
    description: 'List log streams in a log group Use it to inspect current state before making changes.',
    tool: awsDescribeLogStreams,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLogStream',
    description: 'Create a new log stream in a log group Use it to provision a new resource.',
    tool: awsCreateLogStream,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetLogEvents',
    description: 'Retrieve log events from a log stream Use it to inspect current state before making changes.',
    tool: awsGetLogEvents,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLogEvents',
    description: 'Upload log events to a log stream Use it to publish data or configure the resource.',
    tool: awsPutLogEvents,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutRetentionPolicy',
    description: 'Set retention policy for a log group Use it to publish data or configure the resource.',
    tool: awsPutRetentionPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAnalyzeLogGroup',
    description: 'Analyzes CloudWatch logs for anomalies, message patterns, and error patterns Use it to analyze trends, patterns, and anomalies.',
    tool: awsAnalyzeLogGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsExecuteLogInsightsQuery',
    description: 'Executes CloudWatch Logs insights query on CloudWatch log group(s) with specified time range and query syntax, returns a unique ID used to retrieve results Use it to start a query, then poll for results with the query ID.',
    tool: awsExecuteLogInsightsQuery,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetLogsInsightQueryResults',
    description: 'Retrieves the results of an executed CloudWatch insights query using the query ID. It is used after execute_log_insights_query has been called Use it to inspect current state before making changes.',
    tool: awsGetLogsInsightQueryResults,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCancelLogsInsightQuery',
    description: 'Cancels in progress CloudWatch logs insights query Use it to stop a running query.',
    tool: awsCancelLogsInsightQuery,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
];
