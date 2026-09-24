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
import { awsListS3Buckets } from './s3/list-buckets.js';
import { awsCreateS3Bucket } from './s3/create-bucket.js';
import { awsDeleteS3Bucket } from './s3/delete-bucket.js';
import { awsCheckS3BucketExists } from './s3/check-bucket-exists.js';
import { awsListS3Objects } from './s3/list-objects.js';
import { awsGetS3Object } from './s3/get-object.js';
import { awsUploadS3Object } from './s3/upload-object.js';
import { awsDeleteS3Object } from './s3/delete-object.js';
import { awsCopyS3Object } from './s3/copy-object.js';
import { awsHeadS3Object } from './s3/head-object.js';
import { awsListLambdaFunctions } from './lambda/list-functions.js';
import { awsGetLambdaFunction } from './lambda/get-function.js';
import { awsInvokeLambdaFunction } from './lambda/invoke-function.js';
import { awsCreateLambdaFunction } from './lambda/create-function.js';
import { awsUpdateLambdaFunctionCode } from './lambda/update-function-code.js';
import { awsUpdateLambdaFunctionConfiguration } from './lambda/update-function-configuration.js';
import { awsDeleteLambdaFunction } from './lambda/delete-function.js';
import { awsListLambdaFunctionVersions } from './lambda/list-function-versions.js';
import { awsListDynamodbTables } from './dynamodb/list-tables.js';
import { awsDescribeDynamodbTable } from './dynamodb/describe-table.js';
import { awsCreateDynamodbTable } from './dynamodb/create-table.js';
import { awsUpdateDynamodbTable } from './dynamodb/update-table.js';
import { awsDeleteDynamodbTable } from './dynamodb/delete-table.js';
import { awsDynamodbGetItem } from './dynamodb/get-item.js';
import { awsDynamodbPutItem } from './dynamodb/put-item.js';
import { awsDynamodbUpdateItem } from './dynamodb/update-item.js';
import { awsDynamodbDeleteItem } from './dynamodb/delete-item.js';
import { awsDynamodbQuery } from './dynamodb/query.js';
import { awsDynamodbScan } from './dynamodb/scan.js';
import { awsDynamodbBatchGetItem } from './dynamodb/batch-get-item.js';
import { awsDynamodbBatchWriteItem } from './dynamodb/batch-write-item.js';
import { awsCreateSqsQueue } from './sqs/create-queue.js';
import { awsListSqsQueues } from './sqs/list-queues.js';
import { awsGetSqsQueueUrl } from './sqs/get-queue-url.js';
import { awsGetSqsQueueAttributes } from './sqs/get-queue-attributes.js';
import { awsSetSqsQueueAttributes } from './sqs/set-queue-attributes.js';
import { awsDeleteSqsQueue } from './sqs/delete-queue.js';
import { awsPurgeSqsQueue } from './sqs/purge-queue.js';
import { awsSendSqsMessage } from './sqs/send-message.js';
import { awsSendSqsMessageBatch } from './sqs/send-message-batch.js';
import { awsReceiveSqsMessages } from './sqs/receive-messages.js';
import { awsDeleteSqsMessage } from './sqs/delete-message.js';
import { awsDeleteSqsMessageBatch } from './sqs/delete-message-batch.js';
import { awsChangeSqsMessageVisibility } from './sqs/change-message-visibility.js';
import { awsChangeSqsMessageVisibilityBatch } from './sqs/change-message-visibility-batch.js';
import { awsAddSqsPermission } from './sqs/add-permission.js';
import { awsRemoveSqsPermission } from './sqs/remove-permission.js';
import { awsListSqsQueueTags } from './sqs/list-queue-tags.js';
import { awsTagSqsQueue } from './sqs/tag-queue.js';
import { awsUntagSqsQueue } from './sqs/untag-queue.js';
import { awsCreateSnsTopic } from './sns/create-topic.js';
import { awsListSnsTopics } from './sns/list-topics.js';
import { awsGetSnsTopicAttributes } from './sns/get-topic-attributes.js';
import { awsDeleteSnsTopic } from './sns/delete-topic.js';
import { awsSubscribeSnsTopic } from './sns/subscribe-topic.js';
import { awsUnsubscribeSnsTopic } from './sns/unsubscribe-topic.js';
import { awsPublishSnsMessage } from './sns/publish-message.js';
import { awsListSnsSubscriptions } from './sns/list-subscriptions.js';
import { awsListSnsSubscriptionsByTopic } from './sns/list-subscriptions-by-topic.js';
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
import { awsGetS3BucketVersioning } from './s3/get-bucket-versioning.js';
import { awsPutS3BucketVersioning } from './s3/put-bucket-versioning.js';
import { awsGetS3BucketPolicy } from './s3/get-bucket-policy.js';
import { awsPutS3BucketPolicy } from './s3/put-bucket-policy.js';
import { awsDeleteS3BucketPolicy } from './s3/delete-bucket-policy.js';
import { awsGetS3BucketTagging } from './s3/get-bucket-tagging.js';
import { awsPutS3BucketTagging } from './s3/put-bucket-tagging.js';
import { awsDeleteS3BucketTagging } from './s3/delete-bucket-tagging.js';
import { awsGetS3BucketCors } from './s3/get-bucket-cors.js';
import { awsPutS3BucketCors } from './s3/put-bucket-cors.js';
import { awsDeleteS3BucketCors } from './s3/delete-bucket-cors.js';
import { awsGetS3BucketEncryption } from './s3/get-bucket-encryption.js';
import { awsPutS3BucketEncryption } from './s3/put-bucket-encryption.js';
import { awsDeleteS3BucketEncryption } from './s3/delete-bucket-encryption.js';
import { awsGetS3BucketLifecycle } from './s3/get-bucket-lifecycle.js';
import { awsPutS3BucketLifecycle } from './s3/put-bucket-lifecycle.js';
import { awsDeleteS3BucketLifecycle } from './s3/delete-bucket-lifecycle.js';
import { awsGetS3BucketWebsite } from './s3/get-bucket-website.js';
import { awsPutS3BucketWebsite } from './s3/put-bucket-website.js';
import { awsDeleteS3BucketWebsite } from './s3/delete-bucket-website.js';
import { awsGetS3BucketLogging } from './s3/get-bucket-logging.js';
import { awsPutS3BucketLogging } from './s3/put-bucket-logging.js';
import { awsGetS3BucketNotification } from './s3/get-bucket-notification.js';
import { awsPutS3BucketNotification } from './s3/put-bucket-notification.js';
import { awsGetS3BucketReplication } from './s3/get-bucket-replication.js';
import { awsPutS3BucketReplication } from './s3/put-bucket-replication.js';
import { awsDeleteS3BucketReplication } from './s3/delete-bucket-replication.js';
import { awsListS3ObjectVersions } from './s3/list-object-versions.js';
import { awsDeleteS3Objects } from './s3/delete-objects.js';
import { awsCreateS3MultipartUpload } from './s3/create-multipart-upload.js';
import { awsUploadS3Part } from './s3/upload-part.js';
import { awsCompleteS3MultipartUpload } from './s3/complete-multipart-upload.js';
import { awsAbortS3MultipartUpload } from './s3/abort-multipart-upload.js';
import { awsListS3MultipartUploads } from './s3/list-multipart-uploads.js';
import { awsListS3Parts } from './s3/list-parts.js';
import { awsGetS3ObjectTagging } from './s3/get-object-tagging.js';
import { awsPutS3ObjectTagging } from './s3/put-object-tagging.js';
import { awsDeleteS3ObjectTagging } from './s3/delete-object-tagging.js';
import { awsGetS3ObjectAcl } from './s3/get-object-acl.js';
import { awsPutS3ObjectAcl } from './s3/put-object-acl.js';
import { awsGetS3BucketAcl } from './s3/get-bucket-acl.js';
import { awsPutS3BucketAcl } from './s3/put-bucket-acl.js';
import { awsGetS3PublicAccessBlock } from './s3/get-public-access-block.js';
import { awsPutS3PublicAccessBlock } from './s3/put-public-access-block.js';
import { awsDeleteS3PublicAccessBlock } from './s3/delete-public-access-block.js';
import { awsGetLambdaFunctionConfiguration } from './lambda/get-function-configuration.js';
import { awsPublishLambdaFunctionVersion } from './lambda/publish-function-version.js';
import { awsListLambdaFunctionAliases } from './lambda/list-function-aliases.js';
import { awsGetLambdaFunctionAlias } from './lambda/get-function-alias.js';
import { awsCreateLambdaFunctionAlias } from './lambda/create-function-alias.js';
import { awsUpdateLambdaFunctionAlias } from './lambda/update-function-alias.js';
import { awsDeleteLambdaFunctionAlias } from './lambda/delete-function-alias.js';
import { awsGetLambdaFunctionPolicy } from './lambda/get-function-policy.js';
import { awsAddLambdaFunctionPermission } from './lambda/add-function-permission.js';
import { awsRemoveLambdaFunctionPermission } from './lambda/remove-function-permission.js';
import { awsListLambdaEventSourceMappings } from './lambda/list-event-source-mappings.js';
import { awsCreateLambdaEventSourceMapping } from './lambda/create-event-source-mapping.js';
import { awsUpdateLambdaEventSourceMapping } from './lambda/update-event-source-mapping.js';
import { awsDeleteLambdaEventSourceMapping } from './lambda/delete-event-source-mapping.js';
import { awsListLambdaFunctionEventInvokeConfigs } from './lambda/list-function-event-invoke-configs.js';
import { awsGetLambdaFunctionEventInvokeConfig } from './lambda/get-function-event-invoke-config.js';
import { awsPutLambdaFunctionEventInvokeConfig } from './lambda/put-function-event-invoke-config.js';
import { awsDeleteLambdaFunctionEventInvokeConfig } from './lambda/delete-function-event-invoke-config.js';
import { awsListLambdaLayers } from './lambda/list-layers.js';
import { awsListLambdaLayerVersions } from './lambda/list-layer-versions.js';
import { awsGetLambdaLayerVersion } from './lambda/get-layer-version.js';
import { awsListLambdaProvisionedConcurrencyConfigs } from './lambda/list-provisioned-concurrency-configs.js';
import { awsGetLambdaProvisionedConcurrencyConfig } from './lambda/get-provisioned-concurrency-config.js';
import { awsPutLambdaProvisionedConcurrencyConfig } from './lambda/put-provisioned-concurrency-config.js';
import { awsDeleteLambdaProvisionedConcurrencyConfig } from './lambda/delete-provisioned-concurrency-config.js';
import { awsListLambdaFunctionTags } from './lambda/list-function-tags.js';
import { awsTagLambdaFunction } from './lambda/tag-function.js';
import { awsUntagLambdaFunction } from './lambda/untag-function.js';
import { awsGetLambdaFunctionUrlConfig } from './lambda/get-function-url-config.js';
import { awsCreateLambdaFunctionUrlConfig } from './lambda/create-function-url-config.js';
import { awsUpdateLambdaFunctionUrlConfig } from './lambda/update-function-url-config.js';
import { awsDeleteLambdaFunctionUrlConfig } from './lambda/delete-function-url-config.js';
import { awsListDynamodbBackups } from './dynamodb/list-backups.js';
import { awsDescribeDynamodbBackup } from './dynamodb/describe-backup.js';
import { awsCreateDynamodbBackup } from './dynamodb/create-backup.js';
import { awsDeleteDynamodbBackup } from './dynamodb/delete-backup.js';
import { awsRestoreDynamodbTableFromBackup } from './dynamodb/restore-dynamodb-table-from-backup.js';
import { awsDescribeContinuousBackups } from './dynamodb/describe-continuous-backups.js';
import { awsUpdateContinuousBackups } from './dynamodb/update-continuous-backups.js';
import { awsDescribeGlobalTable } from './dynamodb/describe-global-table.js';
import { awsCreateGlobalTable } from './dynamodb/create-global-table.js';
import { awsUpdateGlobalTable } from './dynamodb/update-global-table.js';
import { awsDescribeTimeToLive } from './dynamodb/describe-time-to-live.js';
import { awsUpdateTimeToLive } from './dynamodb/update-time-to-live.js';
import { awsListDynamodbTags } from './dynamodb/list-dynamodb-tags.js';
import { awsTagDynamodbResource } from './dynamodb/tag-dynamodb-resource.js';
import { awsUntagDynamodbResource } from './dynamodb/untag-dynamodb-resource.js';
import { awsSetSnsTopicAttributes } from './sns/set-topic-attributes.js';
import { awsGetSnsSubscriptionAttributes } from './sns/get-subscription-attributes.js';
import { awsSetSnsSubscriptionAttributes } from './sns/set-subscription-attributes.js';
import { awsConfirmSnsSubscription } from './sns/confirm-subscription.js';
import { awsPublishSnsBatch } from './sns/publish-batch.js';
import { awsCreateSnsPlatformApplication } from './sns/create-platform-application.js';
import { awsListSnsPlatformApplications } from './sns/list-platform-applications.js';
import { awsGetSnsPlatformApplicationAttributes } from './sns/get-platform-application-attributes.js';
import { awsSetSnsPlatformApplicationAttributes } from './sns/set-platform-application-attributes.js';
import { awsDeleteSnsPlatformApplication } from './sns/delete-platform-application.js';
import { awsCreateSnsPlatformEndpoint } from './sns/create-platform-endpoint.js';
import { awsListSnsEndpointsByPlatformApplication } from './sns/list-endpoints-by-platform-application.js';
import { awsGetSnsEndpointAttributes } from './sns/get-endpoint-attributes.js';
import { awsSetSnsEndpointAttributes } from './sns/set-endpoint-attributes.js';
import { awsDeleteSnsEndpoint } from './sns/delete-endpoint.js';
import { awsCheckSnsPhoneOptedOut } from './sns/check-phone-opted-out.js';
import { awsListSnsOptedOutPhoneNumbers } from './sns/list-opted-out-phone-numbers.js';
import { awsOptInSnsPhoneNumber } from './sns/opt-in-phone-number.js';
import { awsGetSnsSmsAttributes } from './sns/get-sms-attributes.js';
import { awsSetSnsSmsAttributes } from './sns/set-sms-attributes.js';
import { awsAddSnsPermission } from './sns/add-permission.js';
import { awsRemoveSnsPermission } from './sns/remove-permission.js';
import { awsListSnsTags } from './sns/list-tags.js';
import { awsTagSnsResource } from './sns/tag-resource.js';
import { awsUntagSnsResource } from './sns/untag-resource.js';
import { awsListIamUsers } from './iam/list-users.js';
import { awsGetIamUser } from './iam/get-user.js';
import { awsListIamRoles } from './iam/list-roles.js';
import { awsGetIamRole } from './iam/get-role.js';
import { awsListIamPolicies } from './iam/list-policies.js';
import { awsGetIamPolicy } from './iam/get-policy.js';
import { awsGetPolicyVersion } from './iam/get-policy-version.js';
import { awsListPolicyVersions } from './iam/list-policy-versions.js';
import { awsListIamGroups } from './iam/list-groups.js';
import { awsGetIamGroup } from './iam/get-group.js';
import { awsListAttachedRolePolicies } from './iam/list-attached-role-policies.js';
import { awsGetAccountPasswordPolicy } from './iam/get-account-password-policy.js';

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
  awsCancelLogsInsightQuery,  awsListS3Buckets,
  awsCreateS3Bucket,
  awsDeleteS3Bucket,
  awsCheckS3BucketExists,
  awsListS3Objects,
  awsGetS3Object,
  awsUploadS3Object,
  awsDeleteS3Object,
  awsCopyS3Object,
  awsHeadS3Object,
  awsListLambdaFunctions,
  awsGetLambdaFunction,
  awsInvokeLambdaFunction,
  awsCreateLambdaFunction,
  awsUpdateLambdaFunctionCode,
  awsUpdateLambdaFunctionConfiguration,
  awsDeleteLambdaFunction,
  awsListLambdaFunctionVersions,
  awsListDynamodbTables,
  awsDescribeDynamodbTable,
  awsCreateDynamodbTable,
  awsUpdateDynamodbTable,
  awsDeleteDynamodbTable,
  awsDynamodbGetItem,
  awsDynamodbPutItem,
  awsDynamodbUpdateItem,
  awsDynamodbDeleteItem,
  awsDynamodbQuery,
  awsDynamodbScan,
  awsDynamodbBatchGetItem,
  awsDynamodbBatchWriteItem,
  awsCreateSqsQueue,
  awsListSqsQueues,
  awsGetSqsQueueUrl,
  awsGetSqsQueueAttributes,
  awsSetSqsQueueAttributes,
  awsDeleteSqsQueue,
  awsPurgeSqsQueue,
  awsSendSqsMessage,
  awsSendSqsMessageBatch,
  awsReceiveSqsMessages,
  awsDeleteSqsMessage,
  awsDeleteSqsMessageBatch,
  awsChangeSqsMessageVisibility,
  awsChangeSqsMessageVisibilityBatch,
  awsAddSqsPermission,
  awsRemoveSqsPermission,
  awsListSqsQueueTags,
  awsTagSqsQueue,
  awsUntagSqsQueue,
  awsCreateSnsTopic,
  awsListSnsTopics,
  awsGetSnsTopicAttributes,
  awsDeleteSnsTopic,
  awsSubscribeSnsTopic,
  awsUnsubscribeSnsTopic,
  awsPublishSnsMessage,
  awsListSnsSubscriptions,
  awsListSnsSubscriptionsByTopic,
  awsGetS3BucketVersioning,
  awsPutS3BucketVersioning,
  awsGetS3BucketPolicy,
  awsPutS3BucketPolicy,
  awsDeleteS3BucketPolicy,
  awsGetS3BucketTagging,
  awsPutS3BucketTagging,
  awsDeleteS3BucketTagging,
  awsGetS3BucketCors,
  awsPutS3BucketCors,
  awsDeleteS3BucketCors,
  awsGetS3BucketEncryption,
  awsPutS3BucketEncryption,
  awsDeleteS3BucketEncryption,
  awsGetS3BucketLifecycle,
  awsPutS3BucketLifecycle,
  awsDeleteS3BucketLifecycle,
  awsGetS3BucketWebsite,
  awsPutS3BucketWebsite,
  awsDeleteS3BucketWebsite,
  awsGetS3BucketLogging,
  awsPutS3BucketLogging,
  awsGetS3BucketNotification,
  awsPutS3BucketNotification,
  awsGetS3BucketReplication,
  awsPutS3BucketReplication,
  awsDeleteS3BucketReplication,
  awsListS3ObjectVersions,
  awsDeleteS3Objects,
  awsCreateS3MultipartUpload,
  awsUploadS3Part,
  awsCompleteS3MultipartUpload,
  awsAbortS3MultipartUpload,
  awsListS3MultipartUploads,
  awsListS3Parts,
  awsGetS3ObjectTagging,
  awsPutS3ObjectTagging,
  awsDeleteS3ObjectTagging,
  awsGetS3ObjectAcl,
  awsPutS3ObjectAcl,
  awsGetS3BucketAcl,
  awsPutS3BucketAcl,
  awsGetS3PublicAccessBlock,
  awsPutS3PublicAccessBlock,
  awsDeleteS3PublicAccessBlock,
  awsGetLambdaFunctionConfiguration,
  awsPublishLambdaFunctionVersion,
  awsListLambdaFunctionAliases,
  awsGetLambdaFunctionAlias,
  awsCreateLambdaFunctionAlias,
  awsUpdateLambdaFunctionAlias,
  awsDeleteLambdaFunctionAlias,
  awsGetLambdaFunctionPolicy,
  awsAddLambdaFunctionPermission,
  awsRemoveLambdaFunctionPermission,
  awsListLambdaEventSourceMappings,
  awsCreateLambdaEventSourceMapping,
  awsUpdateLambdaEventSourceMapping,
  awsDeleteLambdaEventSourceMapping,
  awsListLambdaFunctionEventInvokeConfigs,
  awsGetLambdaFunctionEventInvokeConfig,
  awsPutLambdaFunctionEventInvokeConfig,
  awsDeleteLambdaFunctionEventInvokeConfig,
  awsListLambdaLayers,
  awsListLambdaLayerVersions,
  awsGetLambdaLayerVersion,
  awsListLambdaProvisionedConcurrencyConfigs,
  awsGetLambdaProvisionedConcurrencyConfig,
  awsPutLambdaProvisionedConcurrencyConfig,
  awsDeleteLambdaProvisionedConcurrencyConfig,
  awsListLambdaFunctionTags,
  awsTagLambdaFunction,
  awsUntagLambdaFunction,
  awsGetLambdaFunctionUrlConfig,
  awsCreateLambdaFunctionUrlConfig,
  awsUpdateLambdaFunctionUrlConfig,
  awsDeleteLambdaFunctionUrlConfig,
  awsListDynamodbBackups,
  awsDescribeDynamodbBackup,
  awsCreateDynamodbBackup,
  awsDeleteDynamodbBackup,
  awsRestoreDynamodbTableFromBackup,
  awsDescribeContinuousBackups,
  awsUpdateContinuousBackups,
  awsDescribeGlobalTable,
  awsCreateGlobalTable,
  awsUpdateGlobalTable,
  awsDescribeTimeToLive,
  awsUpdateTimeToLive,
  awsListDynamodbTags,
  awsTagDynamodbResource,
  awsUntagDynamodbResource,
  awsSetSnsTopicAttributes,
  awsGetSnsSubscriptionAttributes,
  awsSetSnsSubscriptionAttributes,
  awsConfirmSnsSubscription,
  awsPublishSnsBatch,
  awsCreateSnsPlatformApplication,
  awsListSnsPlatformApplications,
  awsGetSnsPlatformApplicationAttributes,
  awsSetSnsPlatformApplicationAttributes,
  awsDeleteSnsPlatformApplication,
  awsCreateSnsPlatformEndpoint,
  awsListSnsEndpointsByPlatformApplication,
  awsGetSnsEndpointAttributes,
  awsSetSnsEndpointAttributes,
  awsDeleteSnsEndpoint,
  awsCheckSnsPhoneOptedOut,
  awsListSnsOptedOutPhoneNumbers,
  awsOptInSnsPhoneNumber,
  awsGetSnsSmsAttributes,
  awsSetSnsSmsAttributes,
  awsAddSnsPermission,
  awsRemoveSnsPermission,
  awsListSnsTags,
  awsTagSnsResource,
  awsUntagSnsResource,
  awsListIamUsers,
  awsGetIamUser,
  awsListIamRoles,
  awsGetIamRole,
  awsListIamPolicies,
  awsGetIamPolicy,
  awsGetPolicyVersion,
  awsListPolicyVersions,
  awsListIamGroups,
  awsGetIamGroup,
  awsListAttachedRolePolicies,
  awsGetAccountPasswordPolicy,
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
  {
    name: 'awsListS3Buckets',
    description: 'List all S3 buckets in your AWS account Use it to inspect current state before making changes.',
    tool: awsListS3Buckets,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateS3Bucket',
    description: 'Create a new S3 bucket Use it to provision a new resource.',
    tool: awsCreateS3Bucket,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3Bucket',
    description: 'Delete an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3Bucket,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCheckS3BucketExists',
    description: 'Check if an S3 bucket exists Use it to inspect current state before making changes.',
    tool: awsCheckS3BucketExists,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListS3Objects',
    description: 'List objects in an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3Objects,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3Object',
    description: 'Retrieve an object from S3 Use it to inspect current state before making changes.',
    tool: awsGetS3Object,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUploadS3Object',
    description: 'Upload an object to S3 Use it to store data.',
    tool: awsUploadS3Object,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3Object',
    description: 'Delete an object from S3 Use it to permanently remove the resource.',
    tool: awsDeleteS3Object,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopyS3Object',
    description: 'Copy an object from one S3 location to another Use it to duplicate data.',
    tool: awsCopyS3Object,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsHeadS3Object',
    description: 'Retrieve metadata about an S3 object without returning the object itself',
    tool: awsHeadS3Object,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListLambdaFunctions',
    description: 'List all Lambda functions in your AWS account Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaFunction',
    description: 'Get details about a Lambda function including code location Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunction,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsInvokeLambdaFunction',
    description: 'Invoke a Lambda function synchronously or asynchronously Use it to execute the function.',
    tool: awsInvokeLambdaFunction,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateLambdaFunction',
    description: 'Create a new Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaFunction,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionCode',
    description: 'Update the code of a Lambda function Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionCode,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionConfiguration',
    description: 'Update configuration settings of a Lambda function Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionConfiguration,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunction',
    description: 'Delete a Lambda function Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunction,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaFunctionVersions',
    description: 'List all versions of a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionVersions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListDynamodbTables',
    description: 'List all DynamoDB tables in the region Use it to inspect current state before making changes.',
    tool: awsListDynamodbTables,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeDynamodbTable',
    description: 'Get detailed information about a DynamoDB table including schema, status, and metrics Use it to inspect current state before making changes.',
    tool: awsDescribeDynamodbTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDynamodbTable',
    description: 'Create a new DynamoDB table with attributes and keys Use it to provision a new resource.',
    tool: awsCreateDynamodbTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateDynamodbTable',
    description: 'Modify DynamoDB table settings (capacity, TTL, streams, PITR) Use it to change an existing resource.',
    tool: awsUpdateDynamodbTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDynamodbTable',
    description: 'Delete a DynamoDB table Use it to permanently remove the resource.',
    tool: awsDeleteDynamodbTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDynamodbGetItem',
    description: 'Retrieve a single item from DynamoDB table by primary key. Use it to inspect current state before making changes.',
    tool: awsDynamodbGetItem,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbPutItem',
    description: 'Create or replace an item in DynamoDB table. Use it to write data.',
    tool: awsDynamodbPutItem,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDynamodbUpdateItem',
    description: 'Update specific attributes of an item in DynamoDB. Use it to change an existing resource.',
    tool: awsDynamodbUpdateItem,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDynamodbDeleteItem',
    description: 'Delete an item from DynamoDB table. Use it to permanently remove the resource.',
    tool: awsDynamodbDeleteItem,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDynamodbQuery',
    description: 'Query DynamoDB table by partition key with optional sort key conditions. Use it to inspect current state before making changes.',
    tool: awsDynamodbQuery,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbScan',
    description: 'Scan entire DynamoDB table (use with caution on large tables). Use it to inspect current state before making changes.',
    tool: awsDynamodbScan,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbBatchGetItem',
    description: 'Retrieve up to 100 items from one or more DynamoDB tables. Use it to inspect current state before making changes.',
    tool: awsDynamodbBatchGetItem,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbBatchWriteItem',
    description: 'Write or delete up to 25 items across one or more DynamoDB tables. Use it to write data.',
    tool: awsDynamodbBatchWriteItem,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateSqsQueue',
    description: 'Create a new SQS queue Use it to provision a new resource.',
    tool: awsCreateSqsQueue,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSqsQueues',
    description: 'List all SQS queues Use it to inspect current state before making changes.',
    tool: awsListSqsQueues,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSqsQueueUrl',
    description: 'Get the URL of an SQS queue Use it to inspect current state before making changes.',
    tool: awsGetSqsQueueUrl,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSqsQueueAttributes',
    description: 'Get attributes of an SQS queue Use it to inspect current state before making changes.',
    tool: awsGetSqsQueueAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSqsQueueAttributes',
    description: 'Set attributes of an SQS queue Use it to change the configuration of the resource.',
    tool: awsSetSqsQueueAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSqsQueue',
    description: 'Delete an SQS queue Use it to permanently remove the resource.',
    tool: awsDeleteSqsQueue,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPurgeSqsQueue',
    description: 'Delete all messages in an SQS queue Use it to permanently remove all messages (cannot be undone).',
    tool: awsPurgeSqsQueue,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSendSqsMessage',
    description: 'Send a message to an SQS queue Use it to send a message.',
    tool: awsSendSqsMessage,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsSendSqsMessageBatch',
    description: 'Send multiple messages to an SQS queue in a batch Use it to send a message.',
    tool: awsSendSqsMessageBatch,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsReceiveSqsMessages',
    description: 'Receive messages from an SQS queue Use it to poll for new messages.',
    tool: awsReceiveSqsMessages,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteSqsMessage',
    description: 'Delete a message from an SQS queue Use it to permanently remove the resource.',
    tool: awsDeleteSqsMessage,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDeleteSqsMessageBatch',
    description: 'Delete multiple messages from an SQS queue in a batch Use it to permanently remove the resource.',
    tool: awsDeleteSqsMessageBatch,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsChangeSqsMessageVisibility',
    description: 'Change the visibility timeout of a message Use it to change the configuration of the resource.',
    tool: awsChangeSqsMessageVisibility,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsChangeSqsMessageVisibilityBatch',
    description: 'Change the visibility timeout of multiple messages in a batch Use it to change the configuration of the resource.',
    tool: awsChangeSqsMessageVisibilityBatch,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAddSqsPermission',
    description: 'Add a permission to an SQS queue Use it to grant access or attach configuration.',
    tool: awsAddSqsPermission,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveSqsPermission',
    description: 'Remove a permission from an SQS queue',
    tool: awsRemoveSqsPermission,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListSqsQueueTags',
    description: 'List tags for an SQS queue Use it to inspect current state before making changes.',
    tool: awsListSqsQueueTags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagSqsQueue',
    description: 'Add tags to an SQS queue Use it to label the resource.',
    tool: awsTagSqsQueue,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagSqsQueue',
    description: 'Remove tags from an SQS queue',
    tool: awsUntagSqsQueue,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateSnsTopic',
    description: 'Create a new SNS topic Use it to provision a new resource.',
    tool: awsCreateSnsTopic,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsTopics',
    description: 'List all SNS topics Use it to inspect current state before making changes.',
    tool: awsListSnsTopics,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSnsTopicAttributes',
    description: 'Get attributes of an SNS topic Use it to inspect current state before making changes.',
    tool: awsGetSnsTopicAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteSnsTopic',
    description: 'Delete an SNS topic Use it to permanently remove the resource.',
    tool: awsDeleteSnsTopic,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSubscribeSnsTopic',
    description: 'Subscribe to an SNS topic Use it to subscribe an endpoint.',
    tool: awsSubscribeSnsTopic,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUnsubscribeSnsTopic',
    description: 'Unsubscribe from an SNS topic Use it to remove a subscription.',
    tool: awsUnsubscribeSnsTopic,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPublishSnsMessage',
    description: 'Publish a message to an SNS topic Use it to publish a message.',
    tool: awsPublishSnsMessage,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsSubscriptions',
    description: 'List all SNS subscriptions Use it to inspect current state before making changes.',
    tool: awsListSnsSubscriptions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListSnsSubscriptionsByTopic',
    description: 'List subscriptions for a specific topic Use it to inspect current state before making changes.',
    tool: awsListSnsSubscriptionsByTopic,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketVersioning',
    description: 'Get the versioning configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketVersioning,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketVersioning',
    description: 'Set the versioning configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketVersioning,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketPolicy',
    description: 'Get the bucket policy for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketPolicy',
    description: 'Set the bucket policy for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketPolicy',
    description: 'Delete the bucket policy for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketTagging',
    description: 'Get tags for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketTagging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketTagging',
    description: 'Set tags for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketTagging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketTagging',
    description: 'Delete tags from an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketTagging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketCors',
    description: 'Get the CORS configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketCors,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketCors',
    description: 'Set the CORS configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketCors,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketCors',
    description: 'Delete the CORS configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketCors,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketEncryption',
    description: 'Get the encryption configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketEncryption,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketEncryption',
    description: 'Set the encryption configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketEncryption,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketEncryption',
    description: 'Delete the encryption configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketEncryption,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketLifecycle',
    description: 'Get the lifecycle configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketLifecycle,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketLifecycle',
    description: 'Set the lifecycle configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketLifecycle,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketLifecycle',
    description: 'Delete the lifecycle configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketLifecycle,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketWebsite',
    description: 'Get the website configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketWebsite,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketWebsite',
    description: 'Set the website configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketWebsite,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketWebsite',
    description: 'Delete the website configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketWebsite,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketLogging',
    description: 'Get the logging configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketLogging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketLogging',
    description: 'Set the logging configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketLogging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketNotification',
    description: 'Get the notification configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketNotification,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketNotification',
    description: 'Set the notification configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketNotification,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketReplication',
    description: 'Get the replication configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketReplication,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketReplication',
    description: 'Set the replication configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketReplication,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketReplication',
    description: 'Delete the replication configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketReplication,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListS3ObjectVersions',
    description: 'List all versions of objects in an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3ObjectVersions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteS3Objects',
    description: 'Delete multiple objects from S3 in a single request Use it to permanently remove the resource.',
    tool: awsDeleteS3Objects,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateS3MultipartUpload',
    description: 'Initiate a multipart upload to S3 Use it to provision a new resource.',
    tool: awsCreateS3MultipartUpload,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUploadS3Part',
    description: 'Upload a part in a multipart upload Use it to store data.',
    tool: awsUploadS3Part,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCompleteS3MultipartUpload',
    description: 'Complete a multipart upload',
    tool: awsCompleteS3MultipartUpload,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAbortS3MultipartUpload',
    description: 'Abort a multipart upload',
    tool: awsAbortS3MultipartUpload,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListS3MultipartUploads',
    description: 'List in-progress multipart uploads Use it to inspect current state before making changes.',
    tool: awsListS3MultipartUploads,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListS3Parts',
    description: 'List parts that have been uploaded for a multipart upload Use it to inspect current state before making changes.',
    tool: awsListS3Parts,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3ObjectTagging',
    description: 'Get tags for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectTagging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectTagging',
    description: 'Set tags for an S3 object Use it to write data or configuration.',
    tool: awsPutS3ObjectTagging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3ObjectTagging',
    description: 'Delete tags from an S3 object Use it to permanently remove the resource.',
    tool: awsDeleteS3ObjectTagging,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3ObjectAcl',
    description: 'Get the ACL (Access Control List) for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectAcl,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectAcl',
    description: 'Set the ACL (Access Control List) for an S3 object Use it to write data or configuration.',
    tool: awsPutS3ObjectAcl,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketAcl',
    description: 'Get the ACL (Access Control List) for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketAcl,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketAcl',
    description: 'Set the ACL (Access Control List) for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketAcl,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3PublicAccessBlock',
    description: 'Get public access block configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3PublicAccessBlock,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3PublicAccessBlock',
    description: 'Set public access block configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3PublicAccessBlock,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3PublicAccessBlock',
    description: 'Delete public access block configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3PublicAccessBlock,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLambdaFunctionConfiguration',
    description: 'Get configuration details of a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionConfiguration,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPublishLambdaFunctionVersion',
    description: 'Publish a new version of a Lambda function Use it to publish or release.',
    tool: awsPublishLambdaFunctionVersion,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListLambdaFunctionAliases',
    description: 'List all aliases for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionAliases,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaFunctionAlias',
    description: 'Get details about a Lambda function alias Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionAlias,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLambdaFunctionAlias',
    description: 'Create an alias for a Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaFunctionAlias,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionAlias',
    description: 'Update a Lambda function alias Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionAlias,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunctionAlias',
    description: 'Delete a Lambda function alias Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunctionAlias,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLambdaFunctionPolicy',
    description: 'Get the resource-based policy for a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAddLambdaFunctionPermission',
    description: 'Add a permission to a Lambda function resource-based policy Use it to grant access or attach configuration.',
    tool: awsAddLambdaFunctionPermission,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveLambdaFunctionPermission',
    description: 'Remove a permission from a Lambda function resource-based policy Use it to remove access or configuration.',
    tool: awsRemoveLambdaFunctionPermission,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaEventSourceMappings',
    description: 'List event source mappings for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaEventSourceMappings,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLambdaEventSourceMapping',
    description: 'Create an event source mapping for a Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaEventSourceMapping,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaEventSourceMapping',
    description: 'Update an event source mapping configuration Use it to change an existing resource.',
    tool: awsUpdateLambdaEventSourceMapping,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaEventSourceMapping',
    description: 'Delete an event source mapping Use it to permanently remove the resource.',
    tool: awsDeleteLambdaEventSourceMapping,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaFunctionEventInvokeConfigs',
    description: 'List async invocation configurations for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionEventInvokeConfigs,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaFunctionEventInvokeConfig',
    description: 'Get async invocation configuration for a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionEventInvokeConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLambdaFunctionEventInvokeConfig',
    description: 'Configure async invocation settings for a Lambda function Use it to write data or configuration.',
    tool: awsPutLambdaFunctionEventInvokeConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunctionEventInvokeConfig',
    description: 'Delete async invocation configuration for a Lambda function Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunctionEventInvokeConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaLayers',
    description: 'List Lambda layers Use it to inspect current state before making changes.',
    tool: awsListLambdaLayers,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListLambdaLayerVersions',
    description: 'List versions of a Lambda layer Use it to inspect current state before making changes.',
    tool: awsListLambdaLayerVersions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaLayerVersion',
    description: 'Get details about a specific Lambda layer version Use it to inspect current state before making changes.',
    tool: awsGetLambdaLayerVersion,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListLambdaProvisionedConcurrencyConfigs',
    description: 'List provisioned concurrency configurations for a function Use it to inspect current state before making changes.',
    tool: awsListLambdaProvisionedConcurrencyConfigs,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaProvisionedConcurrencyConfig',
    description: 'Get provisioned concurrency configuration for a function version Use it to inspect current state before making changes.',
    tool: awsGetLambdaProvisionedConcurrencyConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLambdaProvisionedConcurrencyConfig',
    description: 'Configure provisioned concurrency for a function version Use it to write data or configuration.',
    tool: awsPutLambdaProvisionedConcurrencyConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaProvisionedConcurrencyConfig',
    description: 'Delete provisioned concurrency configuration Use it to permanently remove the resource.',
    tool: awsDeleteLambdaProvisionedConcurrencyConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaFunctionTags',
    description: 'List tags for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionTags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagLambdaFunction',
    description: 'Add tags to a Lambda function Use it to label the resource.',
    tool: awsTagLambdaFunction,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagLambdaFunction',
    description: 'Remove tags from a Lambda function Use it to remove tags from the resource.',
    tool: awsUntagLambdaFunction,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLambdaFunctionUrlConfig',
    description: 'Get function URL configuration for a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionUrlConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLambdaFunctionUrlConfig',
    description: 'Create a function URL for a Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaFunctionUrlConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionUrlConfig',
    description: 'Update function URL configuration Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionUrlConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunctionUrlConfig',
    description: 'Delete function URL configuration Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunctionUrlConfig,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListDynamodbBackups',
    description: 'List on-demand backups for DynamoDB tables Use it to inspect current state before making changes.',
    tool: awsListDynamodbBackups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeDynamodbBackup',
    description: 'Get details about a specific DynamoDB backup Use it to inspect current state before making changes.',
    tool: awsDescribeDynamodbBackup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDynamodbBackup',
    description: 'Create an on-demand backup of a DynamoDB table Use it to provision a new resource.',
    tool: awsCreateDynamodbBackup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDynamodbBackup',
    description: 'Delete an on-demand DynamoDB backup Use it to permanently remove the resource.',
    tool: awsDeleteDynamodbBackup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRestoreDynamodbTableFromBackup',
    description: 'Restore a DynamoDB table from a backup Use it to restore from a backup.',
    tool: awsRestoreDynamodbTableFromBackup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeContinuousBackups',
    description: 'Check Point-in-Time Recovery (PITR) status for a DynamoDB table Use it to inspect current state before making changes.',
    tool: awsDescribeContinuousBackups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateContinuousBackups',
    description: 'Enable or disable Point-in-Time Recovery (PITR) for a DynamoDB table Use it to change an existing resource.',
    tool: awsUpdateContinuousBackups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeGlobalTable',
    description: 'Get details about a DynamoDB Global Table Use it to inspect current state before making changes.',
    tool: awsDescribeGlobalTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateGlobalTable',
    description: 'Create a multi-region DynamoDB Global Table Use it to provision a new resource.',
    tool: awsCreateGlobalTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateGlobalTable',
    description: 'Add or remove regions from a DynamoDB Global Table Use it to change an existing resource.',
    tool: awsUpdateGlobalTable,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeTimeToLive',
    description: 'Get Time To Live (TTL) configuration for a DynamoDB table Use it to inspect current state before making changes.',
    tool: awsDescribeTimeToLive,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateTimeToLive',
    description: 'Enable or disable Time To Live (TTL) for a DynamoDB table Use it to change an existing resource.',
    tool: awsUpdateTimeToLive,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListDynamodbTags',
    description: 'List tags for a DynamoDB table Use it to inspect current state before making changes.',
    tool: awsListDynamodbTags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagDynamodbResource',
    description: 'Add tags to a DynamoDB table Use it to label the resource.',
    tool: awsTagDynamodbResource,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagDynamodbResource',
    description: 'Remove tags from a DynamoDB table Use it to remove tags from the resource.',
    tool: awsUntagDynamodbResource,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSetSnsTopicAttributes',
    description: 'Set attributes of an SNS topic Use it to change the configuration of the resource.',
    tool: awsSetSnsTopicAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetSnsSubscriptionAttributes',
    description: 'Get attributes of an SNS subscription Use it to inspect current state before making changes.',
    tool: awsGetSnsSubscriptionAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsSubscriptionAttributes',
    description: 'Set attributes of an SNS subscription Use it to change the configuration of the resource.',
    tool: awsSetSnsSubscriptionAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsConfirmSnsSubscription',
    description: 'Confirm an SNS subscription (for HTTP/HTTPS) Use it to confirm a pending subscription.',
    tool: awsConfirmSnsSubscription,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPublishSnsBatch',
    description: 'Publish multiple messages to an SNS topic in a batch Use it to publish or release.',
    tool: awsPublishSnsBatch,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateSnsPlatformApplication',
    description: 'Create a platform application for push notifications Use it to provision a new resource.',
    tool: awsCreateSnsPlatformApplication,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsPlatformApplications',
    description: 'List all platform applications Use it to inspect current state before making changes.',
    tool: awsListSnsPlatformApplications,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSnsPlatformApplicationAttributes',
    description: 'Get attributes of a platform application Use it to inspect current state before making changes.',
    tool: awsGetSnsPlatformApplicationAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsPlatformApplicationAttributes',
    description: 'Set attributes of a platform application Use it to change the configuration of the resource.',
    tool: awsSetSnsPlatformApplicationAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSnsPlatformApplication',
    description: 'Delete a platform application Use it to permanently remove the resource.',
    tool: awsDeleteSnsPlatformApplication,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateSnsPlatformEndpoint',
    description: 'Create a platform endpoint for push notifications Use it to provision a new resource.',
    tool: awsCreateSnsPlatformEndpoint,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsEndpointsByPlatformApplication',
    description: 'List endpoints for a platform application Use it to inspect current state before making changes.',
    tool: awsListSnsEndpointsByPlatformApplication,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSnsEndpointAttributes',
    description: 'Get attributes of a platform endpoint Use it to inspect current state before making changes.',
    tool: awsGetSnsEndpointAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsEndpointAttributes',
    description: 'Set attributes of a platform endpoint Use it to change the configuration of the resource.',
    tool: awsSetSnsEndpointAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSnsEndpoint',
    description: 'Delete a platform endpoint Use it to permanently remove the resource.',
    tool: awsDeleteSnsEndpoint,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCheckSnsPhoneOptedOut',
    description: 'Check if a phone number is opted out of SMS Use it to inspect current state before making changes.',
    tool: awsCheckSnsPhoneOptedOut,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListSnsOptedOutPhoneNumbers',
    description: 'List phone numbers opted out of SMS Use it to inspect current state before making changes.',
    tool: awsListSnsOptedOutPhoneNumbers,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsOptInSnsPhoneNumber',
    description: 'Opt in a phone number to receive SMS Use it to manage SMS opt-in status.',
    tool: awsOptInSnsPhoneNumber,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetSnsSmsAttributes',
    description: 'Get SMS attributes for the account Use it to inspect current state before making changes.',
    tool: awsGetSnsSmsAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsSmsAttributes',
    description: 'Set SMS attributes for the account Use it to change the configuration of the resource.',
    tool: awsSetSnsSmsAttributes,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAddSnsPermission',
    description: 'Add a permission to an SNS topic Use it to grant access or attach configuration.',
    tool: awsAddSnsPermission,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveSnsPermission',
    description: 'Remove a permission from an SNS topic Use it to remove access or configuration.',
    tool: awsRemoveSnsPermission,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListSnsTags',
    description: 'List tags for an SNS resource Use it to inspect current state before making changes.',
    tool: awsListSnsTags,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagSnsResource',
    description: 'Add tags to an SNS resource Use it to label the resource.',
    tool: awsTagSnsResource,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagSnsResource',
    description: 'Remove tags from an SNS resource Use it to remove tags from the resource.',
    tool: awsUntagSnsResource,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListIamUsers',
    description: 'List all IAM users in the AWS account Use it to inspect current state before making changes.',
    tool: awsListIamUsers,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamUser',
    description: 'Get detailed information about a specific IAM user Use it to inspect current state before making changes.',
    tool: awsGetIamUser,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListIamRoles',
    description: 'List all IAM roles in the AWS account Use it to inspect current state before making changes.',
    tool: awsListIamRoles,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamRole',
    description: 'Get detailed information about a specific IAM role Use it to inspect current state before making changes.',
    tool: awsGetIamRole,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListIamPolicies',
    description: 'List all customer managed and AWS managed policies Use it to inspect current state before making changes.',
    tool: awsListIamPolicies,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamPolicy',
    description: 'Get metadata about a managed policy Use it to inspect current state before making changes.',
    tool: awsGetIamPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetPolicyVersion',
    description: 'Get the content of a specific policy version Use it to inspect current state before making changes.',
    tool: awsGetPolicyVersion,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListPolicyVersions',
    description: 'List all versions of a policy Use it to inspect current state before making changes.',
    tool: awsListPolicyVersions,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListIamGroups',
    description: 'List all IAM groups in the AWS account Use it to inspect current state before making changes.',
    tool: awsListIamGroups,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamGroup',
    description: 'Get detailed information about a specific IAM group Use it to inspect current state before making changes.',
    tool: awsGetIamGroup,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListAttachedRolePolicies',
    description: 'List all managed policies attached to an IAM role Use it to inspect current state before making changes.',
    tool: awsListAttachedRolePolicies,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetAccountPasswordPolicy',
    description: 'Get the password policy for the AWS account Use it to inspect current state before making changes.',
    tool: awsGetAccountPasswordPolicy,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
];
