import type { Tool } from 'ai';
import type { ToolDefinition } from '../../../core/types.js';
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
import { awsListS3DirectoryBuckets } from './s3/list-directory-buckets.js';
import { awsGetS3BucketLocation } from './s3/get-bucket-location.js';
import { awsGetS3BucketPolicyStatus } from './s3/get-bucket-policy-status.js';
import { awsListS3ObjectsV1 } from './s3/list-objects-v1.js';
import { awsGetS3ObjectAttributes } from './s3/get-object-attributes.js';
import { awsGetS3ObjectTorrent } from './s3/get-object-torrent.js';
import { awsRenameS3Object } from './s3/rename-object.js';
import { awsUploadS3PartCopy } from './s3/upload-part-copy.js';
import { awsGetS3BucketRequestPayment } from './s3/get-bucket-request-payment.js';
import { awsPutS3BucketRequestPayment } from './s3/put-bucket-request-payment.js';
import { awsGetS3BucketOwnershipControls } from './s3/get-bucket-ownership-controls.js';
import { awsPutS3BucketOwnershipControls } from './s3/put-bucket-ownership-controls.js';
import { awsDeleteS3BucketOwnershipControls } from './s3/delete-bucket-ownership-controls.js';
import { awsGetS3BucketAccelerate } from './s3/get-bucket-accelerate.js';
import { awsPutS3BucketAccelerate } from './s3/put-bucket-accelerate.js';
import { awsGetS3BucketIntelligentTiering } from './s3/get-bucket-intelligent-tiering.js';
import { awsPutS3BucketIntelligentTiering } from './s3/put-bucket-intelligent-tiering.js';
import { awsDeleteS3BucketIntelligentTiering } from './s3/delete-bucket-intelligent-tiering.js';
import { awsListS3BucketIntelligentTiering } from './s3/list-bucket-intelligent-tiering.js';
import { awsGetS3BucketInventory } from './s3/get-bucket-inventory.js';
import { awsPutS3BucketInventory } from './s3/put-bucket-inventory.js';
import { awsDeleteS3BucketInventory } from './s3/delete-bucket-inventory.js';
import { awsListS3BucketInventory } from './s3/list-bucket-inventory.js';
import { awsGetS3BucketMetrics } from './s3/get-bucket-metrics.js';
import { awsPutS3BucketMetrics } from './s3/put-bucket-metrics.js';
import { awsDeleteS3BucketMetrics } from './s3/delete-bucket-metrics.js';
import { awsListS3BucketMetrics } from './s3/list-bucket-metrics.js';
import { awsGetS3BucketAnalytics } from './s3/get-bucket-analytics.js';
import { awsPutS3BucketAnalytics } from './s3/put-bucket-analytics.js';
import { awsDeleteS3BucketAnalytics } from './s3/delete-bucket-analytics.js';
import { awsListS3BucketAnalytics } from './s3/list-bucket-analytics.js';
import { awsGetS3BucketMetadataConfig } from './s3/get-bucket-metadata-config.js';
import { awsCreateS3BucketMetadataConfig } from './s3/create-bucket-metadata-config.js';
import { awsDeleteS3BucketMetadataConfig } from './s3/delete-bucket-metadata-config.js';
import { awsGetS3BucketMetadataTable } from './s3/get-bucket-metadata-table.js';
import { awsCreateS3BucketMetadataTable } from './s3/create-bucket-metadata-table.js';
import { awsDeleteS3BucketMetadataTable } from './s3/delete-bucket-metadata-table.js';
import { awsUpdateS3BucketMetadataInventoryTable } from './s3/update-bucket-metadata-inventory-table.js';
import { awsUpdateS3BucketMetadataJournalTable } from './s3/update-bucket-metadata-journal-table.js';
import { awsGetS3BucketAbac } from './s3/get-bucket-abac.js';
import { awsGetS3ObjectLegalHold } from './s3/get-object-legal-hold.js';
import { awsPutS3ObjectLegalHold } from './s3/put-object-legal-hold.js';
import { awsGetS3ObjectRetention } from './s3/get-object-retention.js';
import { awsPutS3ObjectRetention } from './s3/put-object-retention.js';
import { awsGetS3ObjectLockConfig } from './s3/get-object-lock-config.js';
import { awsPutS3ObjectLockConfig } from './s3/put-object-lock-config.js';
import { awsRestoreS3Object } from './s3/restore-object.js';
import { awsSelectS3ObjectContent } from './s3/select-object-content.js';
import { awsWriteS3GetObjectResponse } from './s3/write-get-object-response.js';
import { awsCreateS3Session } from './s3/create-session.js';
import { awsCreateIamUser } from './iam/create-user.js';
import { awsDeleteIamUser } from './iam/delete-user.js';
import { awsUpdateIamUser } from './iam/update-user.js';
import { awsCreateIamRole } from './iam/create-role.js';
import { awsDeleteIamRole } from './iam/delete-role.js';
import { awsUpdateAssumeRolePolicy } from './iam/update-assume-role-policy.js';
import { awsAttachRolePolicy } from './iam/attach-role-policy.js';
import { awsDetachRolePolicy } from './iam/detach-role-policy.js';
import { awsCreateIamPolicy } from './iam/create-policy.js';
import { awsDeleteIamPolicy } from './iam/delete-policy.js';
import { awsCreatePolicyVersion } from './iam/create-policy-version.js';
import { awsCreateIamGroup } from './iam/create-group.js';
import { awsDeleteIamGroup } from './iam/delete-group.js';
import { awsAddUserToGroup } from './iam/add-user-to-group.js';
import { awsRemoveUserFromGroup } from './iam/remove-user-from-group.js';
import { awsAttachGroupPolicy } from './iam/attach-group-policy.js';
import { awsDetachGroupPolicy } from './iam/detach-group-policy.js';
import { awsListAccessKeys } from './iam/list-access-keys.js';
import { awsCreateAccessKey } from './iam/create-access-key.js';
import { awsDeleteAccessKey } from './iam/delete-access-key.js';
import { awsUpdateAccessKey } from './iam/update-access-key.js';
import { awsUpdateAccountPasswordPolicy } from './iam/update-account-password-policy.js';
import { awsListMfaDevices } from './iam/list-mfa-devices.js';
import { awsEnableMfaDevice } from './iam/enable-mfa-device.js';
import { awsDeactivateMfaDevice } from './iam/deactivate-mfa-device.js';
import { awsPutS3BucketAbac } from './s3/put-bucket-abac.js';
import { awsListEcsClusters } from './ecs/list-clusters.js';
import { awsDescribeEcsClusters } from './ecs/describe-clusters.js';
import { awsCreateEcsCluster } from './ecs/create-cluster.js';
import { awsUpdateEcsCluster } from './ecs/update-cluster.js';
import { awsUpdateEcsClusterSettings } from './ecs/update-cluster-settings.js';
import { awsDeleteEcsCluster } from './ecs/delete-cluster.js';
import { awsListEcsServices } from './ecs/list-services.js';
import { awsDescribeEcsServices } from './ecs/describe-services.js';
import { awsCreateEcsService } from './ecs/create-service.js';
import { awsUpdateEcsService } from './ecs/update-service.js';
import { awsDeleteEcsService } from './ecs/delete-service.js';
import { awsListEcsTasks } from './ecs/list-tasks.js';
import { awsDescribeEcsTasks } from './ecs/describe-tasks.js';
import { awsRunEcsTask } from './ecs/run-task.js';
import { awsStopEcsTask } from './ecs/stop-task.js';
import { awsStartEcsTask } from './ecs/start-task.js';
import { awsListEcsTaskDefinitions } from './ecs/list-task-definitions.js';
import { awsDescribeEcsTaskDefinition } from './ecs/describe-task-definition.js';
import { awsRegisterEcsTaskDefinition } from './ecs/register-task-definition.js';
import { awsDeregisterEcsTaskDefinition } from './ecs/deregister-task-definition.js';
import { awsListEcsContainerInstances } from './ecs/list-container-instances.js';
import { awsDescribeEcsContainerInstances } from './ecs/describe-container-instances.js';
import { awsUpdateEcsContainerInstancesState } from './ecs/update-container-instances-state.js';
import { awsListEcsCapacityProviders } from './ecs/list-capacity-providers.js';
import { awsDescribeEcsCapacityProviders } from './ecs/describe-capacity-providers.js';
import { awsCreateEcsCapacityProvider } from './ecs/create-capacity-provider.js';
import { awsUpdateEcsCapacityProvider } from './ecs/update-capacity-provider.js';
import { awsDeleteEcsCapacityProvider } from './ecs/delete-capacity-provider.js';
import { awsPutEcsClusterCapacityProviders } from './ecs/put-cluster-capacity-providers.js';
import { awsListEcsTags } from './ecs/list-tags.js';
import { awsTagEcsResource } from './ecs/tag-resource.js';
import { awsUntagEcsResource } from './ecs/untag-resource.js';
import { awsListEcsAccountSettings } from './ecs/list-account-settings.js';
import { awsPutEcsAccountSetting } from './ecs/put-account-setting.js';
import { awsPutEcsAccountSettingDefault } from './ecs/put-account-setting-default.js';
import { awsDeleteEcsAccountSetting } from './ecs/delete-account-setting.js';
import { awsListEcsTaskSets } from './ecs/list-task-sets.js';
import { awsDescribeEcsTaskSets } from './ecs/describe-task-sets.js';
import { awsCreateEcsTaskSet } from './ecs/create-task-set.js';
import { awsUpdateEcsTaskSet } from './ecs/update-task-set.js';
import { awsDeleteEcsTaskSet } from './ecs/delete-task-set.js';
import { awsListEcsAttributes } from './ecs/list-attributes.js';
import { awsPutEcsAttributes } from './ecs/put-attributes.js';
import { awsDeleteEcsAttributes } from './ecs/delete-attributes.js';
import { awsListEksClusters } from './eks/list-clusters.js';
import { awsDescribeEksCluster } from './eks/describe-cluster.js';
import { awsCreateEksCluster } from './eks/create-cluster.js';
import { awsUpdateEksClusterVersion } from './eks/update-cluster-version.js';
import { awsUpdateEksClusterConfig } from './eks/update-cluster-config.js';
import { awsDeleteEksCluster } from './eks/delete-cluster.js';
import { awsListEksNodegroups } from './eks/list-nodegroups.js';
import { awsDescribeEksNodegroup } from './eks/describe-nodegroup.js';
import { awsCreateEksNodegroup } from './eks/create-nodegroup.js';
import { awsUpdateEksNodegroupVersion } from './eks/update-nodegroup-version.js';
import { awsUpdateEksNodegroupConfig } from './eks/update-nodegroup-config.js';
import { awsDeleteEksNodegroup } from './eks/delete-nodegroup.js';
import { awsListEksFargateProfiles } from './eks/list-fargate-profiles.js';
import { awsDescribeEksFargateProfile } from './eks/describe-fargate-profile.js';
import { awsCreateEksFargateProfile } from './eks/create-fargate-profile.js';
import { awsDeleteEksFargateProfile } from './eks/delete-fargate-profile.js';
import { awsListEksAddons } from './eks/list-addons.js';
import { awsDescribeEksAddon } from './eks/describe-addon.js';
import { awsDescribeEksAddonVersions } from './eks/describe-addon-versions.js';
import { awsCreateEksAddon } from './eks/create-addon.js';
import { awsUpdateEksAddon } from './eks/update-addon.js';
import { awsDeleteEksAddon } from './eks/delete-addon.js';
import { awsListEksIdentityProviderConfigs } from './eks/list-identity-provider-configs.js';
import { awsDescribeEksIdentityProviderConfig } from './eks/describe-identity-provider-config.js';
import { awsAssociateEksIdentityProviderConfig } from './eks/associate-identity-provider-config.js';
import { awsDisassociateEksIdentityProviderConfig } from './eks/disassociate-identity-provider-config.js';
import { awsListEksTags } from './eks/list-tags.js';
import { awsTagEksResource } from './eks/tag-resource.js';
import { awsUntagEksResource } from './eks/untag-resource.js';
import { awsListEksAccessEntries } from './eks/list-access-entries.js';
import { awsDescribeEksAccessEntry } from './eks/describe-access-entry.js';
import { awsCreateEksAccessEntry } from './eks/create-access-entry.js';
import { awsUpdateEksAccessEntry } from './eks/update-access-entry.js';
import { awsDeleteEksAccessEntry } from './eks/delete-access-entry.js';
import { awsAssociateEksAccessPolicy } from './eks/associate-access-policy.js';
import { awsDisassociateEksAccessPolicy } from './eks/disassociate-access-policy.js';
import { awsListEksAssociatedAccessPolicies } from './eks/list-associated-access-policies.js';
import { awsListEksPodIdentityAssociations } from './eks/list-pod-identity-associations.js';
import { awsDescribeEksPodIdentityAssociation } from './eks/describe-pod-identity-association.js';
import { awsCreateEksPodIdentityAssociation } from './eks/create-pod-identity-association.js';
import { awsUpdateEksPodIdentityAssociation } from './eks/update-pod-identity-association.js';
import { awsDeleteEksPodIdentityAssociation } from './eks/delete-pod-identity-association.js';
import { awsListRepositories } from './ecr/list-repositories.js';
import { awsDescribeRepositories } from './ecr/describe-repositories.js';
import { awsCreateRepository } from './ecr/create-repository.js';
import { awsUpdateEcrRepository } from './ecr/update-ecr-repository.js';
import { awsDeleteRepository } from './ecr/delete-repository.js';
import { awsListImages } from './ecr/list-images.js';
import { awsDescribeImages } from './ecr/describe-images.js';
import { awsBatchGetImage } from './ecr/batch-get-image.js';
import { awsPutImage } from './ecr/put-image.js';
import { awsDeleteImages } from './ecr/delete-images.js';
import { awsBatchDeleteImage } from './ecr/batch-delete-image.js';
import { awsPutLifecyclePolicy } from './ecr/put-lifecycle-policy.js';
import { awsGetLifecyclePolicy } from './ecr/get-lifecycle-policy.js';
import { awsDeleteLifecyclePolicy } from './ecr/delete-lifecycle-policy.js';
import { awsStartLifecyclePolicyPreview } from './ecr/start-lifecycle-policy-preview.js';
import { awsGetLifecyclePolicyPreview } from './ecr/get-lifecycle-policy-preview.js';
import { awsPutImageTagMutability } from './ecr/put-image-tag-mutability.js';
import { awsGetImageTagMutability } from './ecr/get-image-tag-mutability.js';
import { awsPutImageScanningConfiguration } from './ecr/put-image-scanning-configuration.js';
import { awsGetImageScanningConfiguration } from './ecr/get-image-scanning-configuration.js';
import { awsDescribeImageScanFindings } from './ecr/describe-image-scan-findings.js';
import { awsSetRepositoryPolicy } from './ecr/set-repository-policy.js';
import { awsGetRepositoryPolicy } from './ecr/get-repository-policy.js';
import { awsDeleteRepositoryPolicy } from './ecr/delete-repository-policy.js';
import { awsPutReplicationConfiguration } from './ecr/put-replication-configuration.js';
import { awsGetReplicationConfiguration } from './ecr/get-replication-configuration.js';
import { awsPutRegistryPolicy } from './ecr/put-registry-policy.js';
import { awsGetRegistryPolicy } from './ecr/get-registry-policy.js';
import { awsDeleteRegistryPolicy } from './ecr/delete-registry-policy.js';
import { awsPutRegistryScanningConfiguration } from './ecr/put-registry-scanning-configuration.js';
import { awsGetRegistryScanningConfiguration } from './ecr/get-registry-scanning-configuration.js';
import { awsDescribeRegistry } from './ecr/describe-registry.js';
import { awsDescribeImageReplicationStatus } from './ecr/describe-image-replication-status.js';
import { awsListEcrTags } from './ecr/list-tags.js';
import { awsTagEcrResource } from './ecr/tag-resource.js';
import { awsUntagEcrResource } from './ecr/untag-resource.js';
import { awsDescribeRdsInstances } from './rds/describe-instances.js';
import { awsCreateDbInstance } from './rds/create-db-instance.js';
import { awsModifyDbInstance } from './rds/modify-db-instance.js';
import { awsDeleteDbInstance } from './rds/delete-db-instance.js';
import { awsStartDbInstance } from './rds/start-db-instance.js';
import { awsStopDbInstance } from './rds/stop-db-instance.js';
import { awsRebootDbInstance } from './rds/reboot-db-instance.js';
import { awsDescribeDbSnapshots } from './rds/describe-db-snapshots.js';
import { awsCreateDbSnapshot } from './rds/create-db-snapshot.js';
import { awsDeleteDbSnapshot } from './rds/delete-db-snapshot.js';
import { awsRestoreDbInstanceFromDbSnapshot } from './rds/restore-db-instance-from-db-snapshot.js';
import { awsCopyDbSnapshot } from './rds/copy-db-snapshot.js';
import { awsDescribeDbAutomatedBackups } from './rds/describe-db-automated-backups.js';
import { awsDescribeDbClusters } from './rds/describe-db-clusters.js';
import { awsCreateDbCluster } from './rds/create-db-cluster.js';
import { awsModifyDbCluster } from './rds/modify-db-cluster.js';
import { awsDeleteDbCluster } from './rds/delete-db-cluster.js';
import { awsStartDbCluster } from './rds/start-db-cluster.js';
import { awsStopDbCluster } from './rds/stop-db-cluster.js';
import { awsCreateDbClusterSnapshot } from './rds/create-db-cluster-snapshot.js';
import { awsRestoreDbClusterFromSnapshot } from './rds/restore-db-cluster-from-snapshot.js';
import { awsDescribeDbParameterGroups } from './rds/describe-db-parameter-groups.js';
import { awsCreateDbParameterGroup } from './rds/create-db-parameter-group.js';
import { awsModifyDbParameterGroup } from './rds/modify-db-parameter-group.js';
import { awsDeleteDbParameterGroup } from './rds/delete-db-parameter-group.js';
import { awsDescribeDbParameters } from './rds/describe-db-parameters.js';
import { awsDescribeDbSubnetGroups } from './rds/describe-db-subnet-groups.js';
import { awsCreateDbSubnetGroup } from './rds/create-db-subnet-group.js';
import { awsModifyDbSubnetGroup } from './rds/modify-db-subnet-group.js';
import { awsDeleteDbSubnetGroup } from './rds/delete-db-subnet-group.js';
import { awsCreateGlobalCluster } from './rds/create-global-cluster.js';
import { awsDescribeGlobalClusters } from './rds/describe-global-clusters.js';
import { awsModifyGlobalCluster } from './rds/modify-global-cluster.js';
import { awsDeleteGlobalCluster } from './rds/delete-global-cluster.js';
import { awsRemoveFromGlobalCluster } from './rds/remove-from-global-cluster.js';
import { awsFailoverGlobalCluster } from './rds/failover-global-cluster.js';
import { awsRestoreDbClusterToPointInTime } from './rds/restore-db-cluster-to-point-in-time.js';
import { awsDescribeElasticacheCacheClusters } from './elasticache/describe-cache-clusters.js';
import { awsCreateCacheCluster } from './elasticache/create-cache-cluster.js';
import { awsModifyCacheCluster } from './elasticache/modify-cache-cluster.js';
import { awsDeleteCacheCluster } from './elasticache/delete-cache-cluster.js';
import { awsRebootCacheCluster } from './elasticache/reboot-cache-cluster.js';
import { awsDescribeReplicationGroups } from './elasticache/describe-replication-groups.js';
import { awsCreateReplicationGroup } from './elasticache/create-replication-group.js';
import { awsModifyReplicationGroup } from './elasticache/modify-replication-group.js';
import { awsDeleteReplicationGroup } from './elasticache/delete-replication-group.js';
import { awsIncreaseReplicaCount } from './elasticache/increase-replica-count.js';
import { awsDecreaseReplicaCount } from './elasticache/decrease-replica-count.js';
import { awsDescribeCacheParameterGroups } from './elasticache/describe-cache-parameter-groups.js';
import { awsCreateCacheParameterGroup } from './elasticache/create-cache-parameter-group.js';
import { awsModifyCacheParameterGroup } from './elasticache/modify-cache-parameter-group.js';
import { awsDeleteCacheParameterGroup } from './elasticache/delete-cache-parameter-group.js';
import { awsDescribeCacheParameters } from './elasticache/describe-cache-parameters.js';
import { awsDescribeCacheSubnetGroups } from './elasticache/describe-cache-subnet-groups.js';
import { awsCreateCacheSubnetGroup } from './elasticache/create-cache-subnet-group.js';
import { awsModifyCacheSubnetGroup } from './elasticache/modify-cache-subnet-group.js';
import { awsDeleteCacheSubnetGroup } from './elasticache/delete-cache-subnet-group.js';
import { awsDescribeSnapshots } from './elasticache/describe-snapshots.js';
import { awsCreateSnapshot } from './elasticache/create-snapshot.js';
import { awsDeleteSnapshot } from './elasticache/delete-snapshot.js';
import { awsCopySnapshot } from './elasticache/copy-snapshot.js';
import { awsListTagsForResource } from './elasticache/list-tags-for-resource.js';
import { awsAddTagsToResource } from './elasticache/add-tags-to-resource.js';
import { awsRemoveTagsFromResource } from './elasticache/remove-tags-from-resource.js';
import { awsStartEbsSnapshot } from './ebs/start-snapshot.js';
import { awsPutEbsSnapshotBlock } from './ebs/put-snapshot-block.js';
import { awsGetEbsSnapshotBlock } from './ebs/get-snapshot-block.js';
import { awsListEbsSnapshotBlocks } from './ebs/list-snapshot-blocks.js';
import { awsListEbsChangedBlocks } from './ebs/list-changed-blocks.js';
import { awsCompleteEbsSnapshot } from './ebs/complete-snapshot.js';
import { awsCreateRoute53HostedZone } from './route53/create-hosted-zone.js';
import { awsGetRoute53HostedZone } from './route53/get-hosted-zone.js';
import { awsListRoute53HostedZones } from './route53/list-hosted-zones.js';
import { awsDeleteRoute53HostedZone } from './route53/delete-hosted-zone.js';
import { awsUpdateRoute53HostedZoneComment } from './route53/update-hosted-zone-comment.js';
import { awsListRoute53HostedZonesByName } from './route53/list-hosted-zones-by-name.js';
import { awsListRoute53ResourceRecordSets } from './route53/list-resource-record-sets.js';
import { awsChangeRoute53ResourceRecordSets } from './route53/change-resource-record-sets.js';
import { awsGetRoute53Change } from './route53/get-change.js';
import { awsListRoute53TagsForResource } from './route53/list-tags-for-resource.js';
import { awsChangeRoute53TagsForResource } from './route53/change-tags-for-resource.js';
import { awsCreateRoute53HealthCheck } from './route53/create-health-check.js';
import { awsGetRoute53HealthCheck } from './route53/get-health-check.js';
import { awsListRoute53HealthChecks } from './route53/list-health-checks.js';
import { awsDeleteRoute53HealthCheck } from './route53/delete-health-check.js';
import { awsUpdateRoute53HealthCheck } from './route53/update-health-check.js';
import { awsGetRoute53HealthCheckStatus } from './route53/get-health-check-status.js';
import { awsGetRoute53HealthCheckLastFailureReason } from './route53/get-health-check-last-failure-reason.js';
import { awsGetRoute53HealthCheckCount } from './route53/get-health-check-count.js';
import { awsCreateRoute53ReusableDelegationSet } from './route53/create-reusable-delegation-set.js';
import { awsGetRoute53ReusableDelegationSet } from './route53/get-reusable-delegation-set.js';
import { awsListRoute53ReusableDelegationSets } from './route53/list-reusable-delegation-sets.js';
import { awsDeleteRoute53ReusableDelegationSet } from './route53/delete-reusable-delegation-set.js';
import { awsCreateRoute53TrafficPolicy } from './route53/create-traffic-policy.js';
import { awsGetRoute53TrafficPolicy } from './route53/get-traffic-policy.js';
import { awsListRoute53TrafficPolicies } from './route53/list-traffic-policies.js';
import { awsDeleteRoute53TrafficPolicy } from './route53/delete-traffic-policy.js';
import { awsCreateRoute53TrafficPolicyInstance } from './route53/create-traffic-policy-instance.js';
import { awsGetRoute53TrafficPolicyInstance } from './route53/get-traffic-policy-instance.js';
import { awsListRoute53TrafficPolicyInstances } from './route53/list-traffic-policy-instances.js';
import { awsDeleteRoute53TrafficPolicyInstance } from './route53/delete-traffic-policy-instance.js';
import { awsUpdateRoute53TrafficPolicyInstance } from './route53/update-traffic-policy-instance.js';
import { awsGetRoute53TrafficPolicyInstanceCount } from './route53/get-traffic-policy-instance-count.js';
import { awsCreateRoute53TrafficPolicyVersion } from './route53/create-traffic-policy-version.js';
import { awsListRoute53TrafficPolicyVersions } from './route53/list-traffic-policy-versions.js';
import { awsGetRoute53AccountLimit } from './route53/get-account-limit.js';
import { awsGetRoute53HostedZoneLimit } from './route53/get-hosted-zone-limit.js';
import { awsGetRoute53ReusableDelegationSetLimit } from './route53/get-reusable-delegation-set-limit.js';
import { awsCreateRoute53QueryLoggingConfig } from './route53/create-query-logging-config.js';
import { awsGetRoute53QueryLoggingConfig } from './route53/get-query-logging-config.js';
import { awsListRoute53QueryLoggingConfigs } from './route53/list-query-logging-configs.js';
import { awsDeleteRoute53QueryLoggingConfig } from './route53/delete-query-logging-config.js';
import { awsGetRoute53CheckerIpRanges } from './route53/get-checker-ip-ranges.js';
import { awsGetRoute53GeoLocation } from './route53/get-geo-location.js';
import { awsListRoute53GeoLocations } from './route53/list-geo-locations.js';
import { awsGetRoute53Dnssec } from './route53/get-dnssec.js';
import { awsAssociateRoute53VpcWithHostedZone } from './route53/associate-vpc-with-hosted-zone.js';
import { awsDisassociateRoute53VpcFromHostedZone } from './route53/disassociate-vpc-from-hosted-zone.js';
import { awsListRoute53VpcAssociationAuthorizations } from './route53/list-vpc-association-authorizations.js';
import { awsTestRoute53DnsAnswer } from './route53/test-dns-answer.js';
import { awsGetRoute53HostedZoneCount } from './route53/get-hosted-zone-count.js';
import { awsListRoute53HostedZonesByVpc } from './route53/list-hosted-zones-by-vpc.js';
import { awsActivateRoute53KeySigningKey } from './route53/activate-key-signing-key.js';
import { awsCreateRoute53KeySigningKey } from './route53/create-key-signing-key.js';
import { awsDeactivateRoute53KeySigningKey } from './route53/deactivate-key-signing-key.js';
import { awsDeleteRoute53KeySigningKey } from './route53/delete-key-signing-key.js';
import { awsCreateCloudfrontDistribution } from './cloudfront/create-distribution.js';
import { awsGetCloudfrontDistribution } from './cloudfront/get-distribution.js';
import { awsGetCloudfrontDistributionConfig } from './cloudfront/get-distribution-config.js';
import { awsUpdateCloudfrontDistribution } from './cloudfront/update-distribution.js';
import { awsDeleteCloudfrontDistribution } from './cloudfront/delete-distribution.js';
import { awsListCloudfrontDistributions } from './cloudfront/list-distributions.js';
import { awsCreateCloudfrontDistributionWithTags } from './cloudfront/create-distribution-with-tags.js';
import { awsCopyCloudfrontDistribution } from './cloudfront/copy-distribution.js';
import { awsCreateCloudfrontInvalidation } from './cloudfront/create-invalidation.js';
import { awsGetCloudfrontInvalidation } from './cloudfront/get-invalidation.js';
import { awsListCloudfrontInvalidations } from './cloudfront/list-invalidations.js';
import { awsCreateCloudfrontOriginAccessIdentity } from './cloudfront/create-origin-access-identity.js';
import { awsGetCloudfrontOriginAccessIdentity } from './cloudfront/get-origin-access-identity.js';
import { awsUpdateCloudfrontOriginAccessIdentity } from './cloudfront/update-origin-access-identity.js';
import { awsDeleteCloudfrontOriginAccessIdentity } from './cloudfront/delete-origin-access-identity.js';
import { awsListCloudfrontOriginAccessIdentities } from './cloudfront/list-origin-access-identities.js';
import { awsCreateCloudfrontCachePolicy } from './cloudfront/create-cache-policy.js';
import { awsGetCloudfrontCachePolicy } from './cloudfront/get-cache-policy.js';
import { awsUpdateCloudfrontCachePolicy } from './cloudfront/update-cache-policy.js';
import { awsDeleteCloudfrontCachePolicy } from './cloudfront/delete-cache-policy.js';
import { awsListCloudfrontCachePolicies } from './cloudfront/list-cache-policies.js';
import { awsCreateCloudfrontResponseHeadersPolicy } from './cloudfront/create-response-headers-policy.js';
import { awsGetCloudfrontResponseHeadersPolicy } from './cloudfront/get-response-headers-policy.js';
import { awsUpdateCloudfrontResponseHeadersPolicy } from './cloudfront/update-response-headers-policy.js';
import { awsDeleteCloudfrontResponseHeadersPolicy } from './cloudfront/delete-response-headers-policy.js';
import { awsListCloudfrontResponseHeadersPolicies } from './cloudfront/list-response-headers-policies.js';
import { awsCreateCloudfrontFunction } from './cloudfront/create-function.js';
import { awsGetCloudfrontFunction } from './cloudfront/get-function.js';
import { awsDescribeCloudfrontFunction } from './cloudfront/describe-function.js';
import { awsUpdateCloudfrontFunction } from './cloudfront/update-function.js';
import { awsDeleteCloudfrontFunction } from './cloudfront/delete-function.js';
import { awsListCloudfrontFunctions } from './cloudfront/list-functions.js';
import { awsPublishCloudfrontFunction } from './cloudfront/publish-function.js';
import { awsTestCloudfrontFunction } from './cloudfront/test-function.js';
import { awsCreateCloudfrontKeyGroup } from './cloudfront/create-key-group.js';
import { awsGetCloudfrontKeyGroup } from './cloudfront/get-key-group.js';
import { awsUpdateCloudfrontKeyGroup } from './cloudfront/update-key-group.js';
import { awsDeleteCloudfrontKeyGroup } from './cloudfront/delete-key-group.js';
import { awsListCloudfrontKeyGroups } from './cloudfront/list-key-groups.js';
import { awsCreateCloudfrontPublicKey } from './cloudfront/create-public-key.js';
import { awsGetCloudfrontPublicKey } from './cloudfront/get-public-key.js';
import { awsUpdateCloudfrontPublicKey } from './cloudfront/update-public-key.js';
import { awsDeleteCloudfrontPublicKey } from './cloudfront/delete-public-key.js';
import { awsListCloudfrontPublicKeys } from './cloudfront/list-public-keys.js';
import { awsCreateCloudfrontStreamingDistribution } from './cloudfront/create-streaming-distribution.js';
import { awsGetCloudfrontStreamingDistribution } from './cloudfront/get-streaming-distribution.js';
import { awsGetCloudfrontStreamingDistributionConfig } from './cloudfront/get-streaming-distribution-config.js';
import { awsUpdateCloudfrontStreamingDistribution } from './cloudfront/update-streaming-distribution.js';
import { awsDeleteCloudfrontStreamingDistribution } from './cloudfront/delete-streaming-distribution.js';
import { awsListCloudfrontStreamingDistributions } from './cloudfront/list-streaming-distributions.js';
import { awsCreateCloudfrontStreamingDistributionWithTags } from './cloudfront/create-streaming-distribution-with-tags.js';
import { awsListCloudfrontTags } from './cloudfront/list-tags.js';
import { awsTagCloudfrontResource } from './cloudfront/tag-resource.js';
import { awsUntagCloudfrontResource } from './cloudfront/untag-resource.js';
import { awsGetCloudfrontContinuousDeploymentPolicy } from './cloudfront/get-continuous-deployment-policy.js';
import { awsCreateCloudfrontContinuousDeploymentPolicy } from './cloudfront/create-continuous-deployment-policy.js';
import { awsUpdateCloudfrontContinuousDeploymentPolicy } from './cloudfront/update-continuous-deployment-policy.js';
import { awsDeleteCloudfrontContinuousDeploymentPolicy } from './cloudfront/delete-continuous-deployment-policy.js';
import { awsListCloudfrontContinuousDeploymentPolicies } from './cloudfront/list-continuous-deployment-policies.js';
import { awsGetCloudfrontRealtimeLogConfig } from './cloudfront/get-realtime-log-config.js';
import { awsCreateCloudfrontRealtimeLogConfig } from './cloudfront/create-realtime-log-config.js';
import { awsUpdateCloudfrontRealtimeLogConfig } from './cloudfront/update-realtime-log-config.js';
import { awsDeleteCloudfrontRealtimeLogConfig } from './cloudfront/delete-realtime-log-config.js';
import { awsListCloudfrontRealtimeLogConfigs } from './cloudfront/list-realtime-log-configs.js';
import { awsGetCloudfrontMonitoringSubscription } from './cloudfront/get-monitoring-subscription.js';
import { awsCreateCloudfrontMonitoringSubscription } from './cloudfront/create-monitoring-subscription.js';
import { awsDeleteCloudfrontMonitoringSubscription } from './cloudfront/delete-monitoring-subscription.js';
import { awsListRestApis } from './api-gateway/list-rest-apis.js';
import { awsGetRestApi } from './api-gateway/get-rest-api.js';
import { awsCreateRestApi } from './api-gateway/create-rest-api.js';
import { awsUpdateRestApi } from './api-gateway/update-rest-api.js';
import { awsDeleteRestApi } from './api-gateway/delete-rest-api.js';
import { awsImportRestApi } from './api-gateway/import-rest-api.js';
import { awsPutRestApi } from './api-gateway/put-rest-api.js';
import { awsListResources } from './api-gateway/list-resources.js';
import { awsGetResource } from './api-gateway/get-resource.js';
import { awsCreateResource } from './api-gateway/create-resource.js';
import { awsUpdateResource } from './api-gateway/update-resource.js';
import { awsDeleteResource } from './api-gateway/delete-resource.js';
import { awsPutMethod } from './api-gateway/put-method.js';
import { awsGetMethod } from './api-gateway/get-method.js';
import { awsDeleteMethod } from './api-gateway/delete-method.js';
import { awsUpdateMethod } from './api-gateway/update-method.js';
import { awsPutIntegration } from './api-gateway/put-integration.js';
import { awsGetIntegration } from './api-gateway/get-integration.js';
import { awsDeleteIntegration } from './api-gateway/delete-integration.js';
import { awsUpdateIntegration } from './api-gateway/update-integration.js';
import { awsListDeployments } from './api-gateway/list-deployments.js';
import { awsGetDeployment } from './api-gateway/get-deployment.js';
import { awsCreateDeployment } from './api-gateway/create-deployment.js';
import { awsUpdateDeployment } from './api-gateway/update-deployment.js';
import { awsDeleteDeployment } from './api-gateway/delete-deployment.js';
import { awsListStages } from './api-gateway/list-stages.js';
import { awsGetStage } from './api-gateway/get-stage.js';
import { awsCreateStage } from './api-gateway/create-stage.js';
import { awsUpdateStage } from './api-gateway/update-stage.js';
import { awsDeleteStage } from './api-gateway/delete-stage.js';
import { awsCreateAutoscalingGroup } from './auto-scaling/create-group.js';
import { awsDescribeAutoscalingGroups } from './auto-scaling/describe-groups.js';
import { awsUpdateAutoscalingGroup } from './auto-scaling/update-group.js';
import { awsDeleteAutoscalingGroup } from './auto-scaling/delete-group.js';
import { awsAttachInstancesToAutoscalingGroup } from './auto-scaling/attach-instances-to-group.js';
import { awsDetachInstancesFromAutoscalingGroup } from './auto-scaling/detach-instances-from-group.js';
import { awsEnterStandbyAutoscalingGroup } from './auto-scaling/enter-standby-group.js';
import { awsExitStandbyAutoscalingGroup } from './auto-scaling/exit-standby-group.js';
import { awsSetAutoscalingGroupDesiredCapacity } from './auto-scaling/set-group-desired-capacity.js';
import { awsSetAutoscalingInstanceHealth } from './auto-scaling/set-instance-health.js';
import { awsTerminateAutoscalingInstance } from './auto-scaling/terminate-instance.js';
import { awsCreateLaunchConfiguration } from './auto-scaling/create-launch-configuration.js';
import { awsDescribeLaunchConfigurations } from './auto-scaling/describe-launch-configurations.js';
import { awsDeleteLaunchConfiguration } from './auto-scaling/delete-launch-configuration.js';
import { awsPutAutoscalingScalingPolicy } from './auto-scaling/put-scaling-policy.js';
import { awsDescribeAutoscalingPolicies } from './auto-scaling/describe-policies.js';
import { awsDeleteAutoscalingPolicy } from './auto-scaling/delete-policy.js';
import { awsExecuteAutoscalingPolicy } from './auto-scaling/execute-policy.js';
import { awsPutAutoscalingScheduledAction } from './auto-scaling/put-scheduled-action.js';
import { awsDescribeAutoscalingScheduledActions } from './auto-scaling/describe-scheduled-actions.js';
import { awsDeleteAutoscalingScheduledAction } from './auto-scaling/delete-scheduled-action.js';
import { awsPutAutoscalingLifecycleHook } from './auto-scaling/put-lifecycle-hook.js';
import { awsDescribeAutoscalingLifecycleHooks } from './auto-scaling/describe-lifecycle-hooks.js';
import { awsDeleteAutoscalingLifecycleHook } from './auto-scaling/delete-lifecycle-hook.js';
import { awsCompleteAutoscalingLifecycleAction } from './auto-scaling/complete-lifecycle-action.js';
import { awsRecordAutoscalingLifecycleActionHeartbeat } from './auto-scaling/record-lifecycle-action-heartbeat.js';
import { awsCreateOrUpdateAutoscalingTags } from './auto-scaling/create-or-update-tags.js';
import { awsDescribeAutoscalingTags } from './auto-scaling/describe-tags.js';
import { awsDeleteAutoscalingTags } from './auto-scaling/delete-tags.js';
import { awsDescribeAutoscalingActivities } from './auto-scaling/describe-activities.js';
import { awsDescribeAutoscalingInstances } from './auto-scaling/describe-instances.js';
import { awsDescribeAutoscalingNotificationConfigurations } from './auto-scaling/describe-notification-configurations.js';
import { awsPutAutoscalingNotificationConfiguration } from './auto-scaling/put-notification-configuration.js';
import { awsDeleteAutoscalingNotificationConfiguration } from './auto-scaling/delete-notification-configuration.js';
import { awsDescribeAutoscalingAccountLimits } from './auto-scaling/describe-account-limits.js';
import { awsDescribeAutoscalingAdjustmentTypes } from './auto-scaling/describe-adjustment-types.js';
import { awsDescribeAutoscalingMetricCollectionTypes } from './auto-scaling/describe-metric-collection-types.js';
import { awsEnableAutoscalingMetricsCollection } from './auto-scaling/enable-metrics-collection.js';
import { awsDisableAutoscalingMetricsCollection } from './auto-scaling/disable-metrics-collection.js';
import { awsDescribeAutoscalingTerminationPolicyTypes } from './auto-scaling/describe-termination-policy-types.js';
import { awsDescribeAutoscalingScalingProcessTypes } from './auto-scaling/describe-scaling-process-types.js';
import { awsSuspendAutoscalingProcesses } from './auto-scaling/suspend-processes.js';
import { awsResumeAutoscalingProcesses } from './auto-scaling/resume-processes.js';
import { awsBatchPutAutoscalingScheduledAction } from './auto-scaling/batch-put-scheduled-action.js';
import { awsBatchDeleteAutoscalingScheduledAction } from './auto-scaling/batch-delete-scheduled-action.js';
import { awsStartAutoscalingInstanceRefresh } from './auto-scaling/start-instance-refresh.js';
import { awsCancelAutoscalingInstanceRefresh } from './auto-scaling/cancel-instance-refresh.js';
import { awsDescribeAutoscalingInstanceRefreshes } from './auto-scaling/describe-instance-refreshes.js';
import { awsDescribeAutoscalingWarmPool } from './auto-scaling/describe-warm-pool.js';
import { awsPutAutoscalingWarmPool } from './auto-scaling/put-warm-pool.js';
import { awsDeleteAutoscalingWarmPool } from './auto-scaling/delete-warm-pool.js';
import { awsPutEventbridgeEvents } from './eventbridge/put-events.js';
import { awsPutEventbridgeRule } from './eventbridge/put-rule.js';
import { awsListEventbridgeRules } from './eventbridge/list-rules.js';
import { awsDescribeEventbridgeRule } from './eventbridge/describe-rule.js';
import { awsDeleteEventbridgeRule } from './eventbridge/delete-rule.js';
import { awsEnableEventbridgeRule } from './eventbridge/enable-rule.js';
import { awsDisableEventbridgeRule } from './eventbridge/disable-rule.js';
import { awsPutEventbridgeTargets } from './eventbridge/put-targets.js';
import { awsListEventbridgeTargets } from './eventbridge/list-targets.js';
import { awsRemoveEventbridgeTargets } from './eventbridge/remove-targets.js';
import { awsCreateEventbridgeEventBus } from './eventbridge/create-event-bus.js';
import { awsListEventbridgeEventBuses } from './eventbridge/list-event-buses.js';
import { awsDescribeEventbridgeEventBus } from './eventbridge/describe-event-bus.js';
import { awsDeleteEventbridgeEventBus } from './eventbridge/delete-event-bus.js';
import { awsCreateEventbridgeArchive } from './eventbridge/create-archive.js';
import { awsListEventbridgeArchives } from './eventbridge/list-archives.js';
import { awsDescribeEventbridgeArchive } from './eventbridge/describe-archive.js';
import { awsUpdateEventbridgeArchive } from './eventbridge/update-archive.js';
import { awsDeleteEventbridgeArchive } from './eventbridge/delete-archive.js';
import { awsStartEventbridgeReplay } from './eventbridge/start-replay.js';
import { awsListEventbridgeReplays } from './eventbridge/list-replays.js';
import { awsDescribeEventbridgeReplay } from './eventbridge/describe-replay.js';
import { awsCancelEventbridgeReplay } from './eventbridge/cancel-replay.js';
import { awsCreateEventbridgeConnection } from './eventbridge/create-connection.js';
import { awsListEventbridgeConnections } from './eventbridge/list-connections.js';
import { awsDescribeEventbridgeConnection } from './eventbridge/describe-connection.js';
import { awsUpdateEventbridgeConnection } from './eventbridge/update-connection.js';
import { awsDeleteEventbridgeConnection } from './eventbridge/delete-connection.js';
import { awsCreateEventbridgeEndpoint } from './eventbridge/create-endpoint.js';
import { awsListEventbridgeEndpoints } from './eventbridge/list-endpoints.js';
import { awsDescribeEventbridgeEndpoint } from './eventbridge/describe-endpoint.js';
import { awsUpdateEventbridgeEndpoint } from './eventbridge/update-endpoint.js';
import { awsDeleteEventbridgeEndpoint } from './eventbridge/delete-endpoint.js';
import { awsListEventbridgeTags } from './eventbridge/list-tags.js';
import { awsTagEventbridgeResource } from './eventbridge/tag-resource.js';
import { awsUntagEventbridgeResource } from './eventbridge/untag-resource.js';
import { awsCreateVpcLatticeService } from './vpc-lattice/create-service.js';
import { awsGetVpcLatticeService } from './vpc-lattice/get-service.js';
import { awsUpdateVpcLatticeService } from './vpc-lattice/update-service.js';
import { awsDeleteVpcLatticeService } from './vpc-lattice/delete-service.js';
import { awsListVpcLatticeServices } from './vpc-lattice/list-services.js';
import { awsCreateVpcLatticeServiceNetwork } from './vpc-lattice/create-service-network.js';
import { awsGetVpcLatticeServiceNetwork } from './vpc-lattice/get-service-network.js';
import { awsUpdateVpcLatticeServiceNetwork } from './vpc-lattice/update-service-network.js';
import { awsDeleteVpcLatticeServiceNetwork } from './vpc-lattice/delete-service-network.js';
import { awsListVpcLatticeServiceNetworks } from './vpc-lattice/list-service-networks.js';
import { awsCreateVpcLatticeListener } from './vpc-lattice/create-listener.js';
import { awsGetVpcLatticeListener } from './vpc-lattice/get-listener.js';
import { awsUpdateVpcLatticeListener } from './vpc-lattice/update-listener.js';
import { awsDeleteVpcLatticeListener } from './vpc-lattice/delete-listener.js';
import { awsListVpcLatticeListeners } from './vpc-lattice/list-listeners.js';
import { awsCreateVpcLatticeRule } from './vpc-lattice/create-rule.js';
import { awsGetVpcLatticeRule } from './vpc-lattice/get-rule.js';
import { awsUpdateVpcLatticeRule } from './vpc-lattice/update-rule.js';
import { awsDeleteVpcLatticeRule } from './vpc-lattice/delete-rule.js';
import { awsListVpcLatticeRules } from './vpc-lattice/list-rules.js';
import { awsCreateVpcLatticeTargetGroup } from './vpc-lattice/create-target-group.js';
import { awsGetVpcLatticeTargetGroup } from './vpc-lattice/get-target-group.js';
import { awsUpdateVpcLatticeTargetGroup } from './vpc-lattice/update-target-group.js';
import { awsDeleteVpcLatticeTargetGroup } from './vpc-lattice/delete-target-group.js';
import { awsListVpcLatticeTargetGroups } from './vpc-lattice/list-target-groups.js';
import { awsRegisterVpcLatticeTargets } from './vpc-lattice/register-targets.js';
import { awsDeregisterVpcLatticeTargets } from './vpc-lattice/deregister-targets.js';
import { awsGetVpcLatticeTargets } from './vpc-lattice/get-targets.js';
import { awsCreateVpcLatticeServiceNetworkServiceAssociation } from './vpc-lattice/create-service-network-service-association.js';
import { awsGetVpcLatticeServiceNetworkServiceAssociation } from './vpc-lattice/get-service-network-service-association.js';
import { awsDeleteVpcLatticeServiceNetworkServiceAssociation } from './vpc-lattice/delete-service-network-service-association.js';
import { awsListVpcLatticeServiceNetworkServiceAssociations } from './vpc-lattice/list-service-network-service-associations.js';
import { awsCreateVpcLatticeServiceNetworkVpcAssociation } from './vpc-lattice/create-service-network-vpc-association.js';
import { awsGetVpcLatticeServiceNetworkVpcAssociation } from './vpc-lattice/get-service-network-vpc-association.js';
import { awsUpdateVpcLatticeServiceNetworkVpcAssociation } from './vpc-lattice/update-service-network-vpc-association.js';
import { awsDeleteVpcLatticeServiceNetworkVpcAssociation } from './vpc-lattice/delete-service-network-vpc-association.js';
import { awsListVpcLatticeServiceNetworkVpcAssociations } from './vpc-lattice/list-service-network-vpc-associations.js';
import { awsCreateVpcLatticeAccessLogSubscription } from './vpc-lattice/create-access-log-subscription.js';
import { awsGetVpcLatticeAccessLogSubscription } from './vpc-lattice/get-access-log-subscription.js';
import { awsUpdateVpcLatticeAccessLogSubscription } from './vpc-lattice/update-access-log-subscription.js';
import { awsDeleteVpcLatticeAccessLogSubscription } from './vpc-lattice/delete-access-log-subscription.js';
import { awsListVpcLatticeAccessLogSubscriptions } from './vpc-lattice/list-access-log-subscriptions.js';
import { awsPutVpcLatticeAuthPolicy } from './vpc-lattice/put-auth-policy.js';
import { awsGetVpcLatticeAuthPolicy } from './vpc-lattice/get-auth-policy.js';
import { awsDeleteVpcLatticeAuthPolicy } from './vpc-lattice/delete-auth-policy.js';
import { awsPutVpcLatticeResourcePolicy } from './vpc-lattice/put-resource-policy.js';
import { awsGetVpcLatticeResourcePolicy } from './vpc-lattice/get-resource-policy.js';
import { awsDeleteVpcLatticeResourcePolicy } from './vpc-lattice/delete-resource-policy.js';
import { awsListVpcLatticeTags } from './vpc-lattice/list-tags.js';
import { awsTagVpcLatticeResource } from './vpc-lattice/tag-resource.js';
import { awsUntagVpcLatticeResource } from './vpc-lattice/untag-resource.js';
import { awsCreateCloudformationStack } from './cloudformation/create-stack.js';
import { awsUpdateCloudformationStack } from './cloudformation/update-stack.js';
import { awsDeleteCloudformationStack } from './cloudformation/delete-stack.js';
import { awsDescribeCloudformationStacks } from './cloudformation/describe-stacks.js';
import { awsListCloudformationStacks } from './cloudformation/list-stacks.js';
import { awsDescribeCloudformationStackEvents } from './cloudformation/describe-stack-events.js';
import { awsDescribeCloudformationStackResource } from './cloudformation/describe-stack-resource.js';
import { awsDescribeCloudformationStackResources } from './cloudformation/describe-stack-resources.js';
import { awsListCloudformationStackResources } from './cloudformation/list-stack-resources.js';
import { awsCreateCloudformationChangeset } from './cloudformation/create-changeset.js';
import { awsDescribeCloudformationChangeset } from './cloudformation/describe-changeset.js';
import { awsExecuteCloudformationChangeset } from './cloudformation/execute-changeset.js';
import { awsDeleteCloudformationChangeset } from './cloudformation/delete-changeset.js';
import { awsListCloudformationChangesets } from './cloudformation/list-changesets.js';
import { awsGetCloudformationTemplate } from './cloudformation/get-template.js';
import { awsGetCloudformationTemplateSummary } from './cloudformation/get-template-summary.js';
import { awsValidateCloudformationTemplate } from './cloudformation/validate-template.js';
import { awsCreateCloudformationStackSet } from './cloudformation/create-stack-set.js';
import { awsUpdateCloudformationStackSet } from './cloudformation/update-stack-set.js';
import { awsDeleteCloudformationStackSet } from './cloudformation/delete-stack-set.js';
import { awsDescribeCloudformationStackSet } from './cloudformation/describe-stack-set.js';
import { awsListCloudformationStackSets } from './cloudformation/list-stack-sets.js';
import { awsCreateCloudformationStackInstances } from './cloudformation/create-stack-instances.js';
import { awsDeleteCloudformationStackInstances } from './cloudformation/delete-stack-instances.js';
import { awsDescribeCloudformationStackInstance } from './cloudformation/describe-stack-instance.js';
import { awsListCloudformationStackInstances } from './cloudformation/list-stack-instances.js';
import { awsDetectCloudformationStackDrift } from './cloudformation/detect-stack-drift.js';
import { awsDetectCloudformationStackResourceDrift } from './cloudformation/detect-stack-resource-drift.js';
import { awsDescribeCloudformationStackResourceDrifts } from './cloudformation/describe-stack-resource-drifts.js';
import { awsListCloudformationExports } from './cloudformation/list-exports.js';
import { awsListCloudformationImports } from './cloudformation/list-imports.js';
import { awsDescribeCloudformationAccountLimits } from './cloudformation/describe-account-limits.js';
import { awsCreateCodebuildProject } from './codebuild/create-project.js';
import { awsGetCodebuildProject } from './codebuild/get-project.js';
import { awsListCodebuildProjects } from './codebuild/list-projects.js';
import { awsUpdateCodebuildProject } from './codebuild/update-project.js';
import { awsDeleteCodebuildProject } from './codebuild/delete-project.js';
import { awsBatchGetCodebuildProjects } from './codebuild/batch-get-projects.js';
import { awsStartCodebuildBuild } from './codebuild/start-build.js';
import { awsStopCodebuildBuild } from './codebuild/stop-build.js';
import { awsListCodebuildBuilds } from './codebuild/list-builds.js';
import { awsListCodebuildBuildsForProject } from './codebuild/list-builds-for-project.js';
import { awsBatchGetCodebuildBuilds } from './codebuild/batch-get-builds.js';
import { awsRetryCodebuildBuild } from './codebuild/retry-build.js';
import { awsStartCodebuildBuildBatch } from './codebuild/start-build-batch.js';
import { awsStopCodebuildBuildBatch } from './codebuild/stop-build-batch.js';
import { awsListCodebuildBuildBatches } from './codebuild/list-build-batches.js';
import { awsListCodebuildBuildBatchesForProject } from './codebuild/list-build-batches-for-project.js';
import { awsBatchGetCodebuildBuildBatches } from './codebuild/batch-get-build-batches.js';
import { awsRetryCodebuildBuildBatch } from './codebuild/retry-build-batch.js';
import { awsListCodebuildReports } from './codebuild/list-reports.js';
import { awsListCodebuildReportsForReportGroup } from './codebuild/list-reports-for-report-group.js';
import { awsGetCodebuildReport } from './codebuild/get-report.js';
import { awsBatchGetCodebuildReports } from './codebuild/batch-get-reports.js';
import { awsDeleteCodebuildReport } from './codebuild/delete-report.js';
import { awsCreateCodebuildReportGroup } from './codebuild/create-report-group.js';
import { awsGetCodebuildReportGroup } from './codebuild/get-report-group.js';
import { awsUpdateCodebuildReportGroup } from './codebuild/update-report-group.js';
import { awsDeleteCodebuildReportGroup } from './codebuild/delete-report-group.js';
import { awsListCodebuildReportGroups } from './codebuild/list-report-groups.js';
import { awsBatchGetCodebuildReportGroups } from './codebuild/batch-get-report-groups.js';
import { awsCreateCodedeployApplication } from './codedeploy/create-application.js';
import { awsGetCodedeployApplication } from './codedeploy/get-application.js';
import { awsListCodedeployApplications } from './codedeploy/list-applications.js';
import { awsUpdateCodedeployApplication } from './codedeploy/update-application.js';
import { awsDeleteCodedeployApplication } from './codedeploy/delete-application.js';
import { awsBatchGetCodedeployApplications } from './codedeploy/batch-get-applications.js';
import { awsCreateCodedeployDeploymentGroup } from './codedeploy/create-deployment-group.js';
import { awsGetCodedeployDeploymentGroup } from './codedeploy/get-deployment-group.js';
import { awsListCodedeployDeploymentGroups } from './codedeploy/list-deployment-groups.js';
import { awsUpdateCodedeployDeploymentGroup } from './codedeploy/update-deployment-group.js';
import { awsDeleteCodedeployDeploymentGroup } from './codedeploy/delete-deployment-group.js';
import { awsBatchGetCodedeployDeploymentGroups } from './codedeploy/batch-get-deployment-groups.js';
import { awsCreateCodedeployDeployment } from './codedeploy/create-deployment.js';
import { awsGetCodedeployDeployment } from './codedeploy/get-deployment.js';
import { awsListCodedeployDeployments } from './codedeploy/list-deployments.js';
import { awsStopCodedeployDeployment } from './codedeploy/stop-deployment.js';
import { awsContinueCodedeployDeployment } from './codedeploy/continue-deployment.js';
import { awsBatchGetCodedeployDeployments } from './codedeploy/batch-get-deployments.js';
import { awsListCodedeployApplicationRevisions } from './codedeploy/list-application-revisions.js';
import { awsGetCodedeployApplicationRevision } from './codedeploy/get-application-revision.js';
import { awsRegisterCodedeployApplicationRevision } from './codedeploy/register-application-revision.js';
import { awsListCodedeployOnPremisesInstances } from './codedeploy/list-on-premises-instances.js';
import { awsBatchGetCodedeployOnPremisesInstances } from './codedeploy/batch-get-on-premises-instances.js';
import { awsAddTagsToCodedeployOnPremisesInstances } from './codedeploy/add-tags-to-on-premises-instances.js';
import { awsRemoveTagsFromCodedeployOnPremisesInstances } from './codedeploy/remove-tags-from-on-premises-instances.js';
import { awsListCodedeployTags } from './codedeploy/list-tags.js';
import { awsTagCodedeployResource } from './codedeploy/tag-resource.js';
import { awsUntagCodedeployResource } from './codedeploy/untag-resource.js';
import { awsCreateCodepipelinePipeline } from './codepipeline/create-pipeline.js';
import { awsGetCodepipelinePipeline } from './codepipeline/get-pipeline.js';
import { awsListCodepipelinePipelines } from './codepipeline/list-pipelines.js';
import { awsUpdateCodepipelinePipeline } from './codepipeline/update-pipeline.js';
import { awsDeleteCodepipelinePipeline } from './codepipeline/delete-pipeline.js';
import { awsGetCodepipelinePipelineState } from './codepipeline/get-pipeline-state.js';
import { awsStartCodepipelineExecution } from './codepipeline/start-execution.js';
import { awsGetCodepipelineExecution } from './codepipeline/get-execution.js';
import { awsListCodepipelineExecutions } from './codepipeline/list-executions.js';
import { awsStopCodepipelineExecution } from './codepipeline/stop-execution.js';
import { awsListCodepipelineActionExecutions } from './codepipeline/list-action-executions.js';
import { awsListCodepipelineActionTypes } from './codepipeline/list-action-types.js';
import { awsGetCodepipelineActionType } from './codepipeline/get-action-type.js';
import { awsCreateCodepipelineWebhook } from './codepipeline/create-webhook.js';
import { awsListCodepipelineWebhooks } from './codepipeline/list-webhooks.js';
import { awsDeleteCodepipelineWebhook } from './codepipeline/delete-webhook.js';
import { awsDeregisterCodepipelineWebhookWithThirdParty } from './codepipeline/deregister-webhook-with-third-party.js';
import { awsRegisterCodepipelineWebhookWithThirdParty } from './codepipeline/register-webhook-with-third-party.js';
import { awsPutCodepipelineApprovalResult } from './codepipeline/put-approval-result.js';
import { awsPutCodepipelineJobSuccessResult } from './codepipeline/put-job-success-result.js';
import { awsPutCodepipelineJobFailureResult } from './codepipeline/put-job-failure-result.js';
import { awsPutCodepipelineThirdPartyJobSuccessResult } from './codepipeline/put-third-party-job-success-result.js';
import { awsPutCodepipelineThirdPartyJobFailureResult } from './codepipeline/put-third-party-job-failure-result.js';
import { awsListCodepipelineTags } from './codepipeline/list-tags.js';
import { awsTagCodepipelineResource } from './codepipeline/tag-resource.js';
import { awsUntagCodepipelineResource } from './codepipeline/untag-resource.js';
import { awsCreateCodeartifactDomain } from './codeartifact/create-domain.js';
import { awsDescribeCodeartifactDomain } from './codeartifact/describe-domain.js';
import { awsListCodeartifactDomains } from './codeartifact/list-domains.js';
import { awsDeleteCodeartifactDomain } from './codeartifact/delete-domain.js';
import { awsCreateCodeartifactRepository } from './codeartifact/create-repository.js';
import { awsDescribeCodeartifactRepository } from './codeartifact/describe-repository.js';
import { awsListCodeartifactRepositories } from './codeartifact/list-repositories.js';
import { awsUpdateCodeartifactRepository } from './codeartifact/update-repository.js';
import { awsDeleteCodeartifactRepository } from './codeartifact/delete-repository.js';
import { awsListCodeartifactPackages } from './codeartifact/list-packages.js';
import { awsDescribeCodeartifactPackage } from './codeartifact/describe-package.js';
import { awsDeleteCodeartifactPackage } from './codeartifact/delete-package.js';
import { awsListCodeartifactPackageVersions } from './codeartifact/list-package-versions.js';
import { awsDescribeCodeartifactPackageVersion } from './codeartifact/describe-package-version.js';
import { awsDeleteCodeartifactPackageVersions } from './codeartifact/delete-package-versions.js';
import { awsGetCodeartifactAuthorizationToken } from './codeartifact/get-authorization-token.js';
import { awsGetCodeartifactRepositoryEndpoint } from './codeartifact/get-repository-endpoint.js';
import { awsCreateCodeartifactPackageGroup } from './codeartifact/create-package-group.js';
import { awsDescribeCodeartifactPackageGroup } from './codeartifact/describe-package-group.js';
import { awsListCodeartifactPackageGroups } from './codeartifact/list-package-groups.js';
import { awsUpdateCodeartifactPackageGroup } from './codeartifact/update-package-group.js';
import { awsDeleteCodeartifactPackageGroup } from './codeartifact/delete-package-group.js';
import { awsAssociateCodeartifactExternalConnection } from './codeartifact/associate-external-connection.js';
import { awsDisassociateCodeartifactExternalConnection } from './codeartifact/disassociate-external-connection.js';
import { awsListCodeartifactTags } from './codeartifact/list-tags.js';
import { awsTagCodeartifactResource } from './codeartifact/tag-resource.js';
import { awsUntagCodeartifactResource } from './codeartifact/untag-resource.js';
import { awsListTrails } from './cloudtrail/list-trails.js';
import { awsGetTrail } from './cloudtrail/get-trail.js';
import { awsCreateTrail } from './cloudtrail/create-trail.js';
import { awsUpdateTrail } from './cloudtrail/update-trail.js';
import { awsDeleteTrail } from './cloudtrail/delete-trail.js';
import { awsDescribeTrails } from './cloudtrail/describe-trails.js';
import { awsGetTrailStatus } from './cloudtrail/get-trail-status.js';
import { awsStartLogging } from './cloudtrail/start-logging.js';
import { awsStopLogging } from './cloudtrail/stop-logging.js';
import { awsLookupEvents } from './cloudtrail/lookup-events.js';
import { awsCreateEventDataStore } from './cloudtrail/create-event-data-store.js';
import { awsDeleteEventDataStore } from './cloudtrail/delete-event-data-store.js';
import { awsUpdateEventDataStore } from './cloudtrail/update-event-data-store.js';
import { awsGetEventDataStore } from './cloudtrail/get-event-data-store.js';
import { awsListEventDataStores } from './cloudtrail/list-event-data-stores.js';
import { awsRestoreEventDataStore } from './cloudtrail/restore-event-data-store.js';
import { awsCreateChannel } from './cloudtrail/create-channel.js';
import { awsDeleteChannel } from './cloudtrail/delete-channel.js';
import { awsUpdateChannel } from './cloudtrail/update-channel.js';
import { awsGetChannel } from './cloudtrail/get-channel.js';
import { awsListChannels } from './cloudtrail/list-channels.js';
import { awsPutResourcePolicy } from './cloudtrail/put-resource-policy.js';
import { awsGetResourcePolicy } from './cloudtrail/get-resource-policy.js';
import { awsDeleteResourcePolicy } from './cloudtrail/delete-resource-policy.js';
import { awsAddTags } from './cloudtrail/add-tags.js';
import { awsRemoveTags } from './cloudtrail/remove-tags.js';
import { awsListTags } from './cloudtrail/list-tags.js';
import { awsBatchGetTraces } from './xray/batch-get-traces.js';
import { awsGetTraceSummaries } from './xray/get-trace-summaries.js';
import { awsGetServiceGraph } from './xray/get-service-graph.js';
import { awsPutTraceSegments } from './xray/put-trace-segments.js';
import { awsGetTraceGraph } from './xray/get-trace-graph.js';
import { awsGetGroups } from './xray/get-groups.js';
import { awsCreateGroup } from './xray/create-group.js';
import { awsUpdateGroup } from './xray/update-group.js';
import { awsDeleteGroup } from './xray/delete-group.js';
import { awsGetGroup } from './xray/get-group.js';
import { awsGetSamplingRules } from './xray/get-sampling-rules.js';
import { awsGetSamplingTargets } from './xray/get-sampling-targets.js';
import { awsPutTelemetryRecords } from './xray/put-telemetry-records.js';
import { awsGetInsight } from './xray/get-insight.js';
import { awsGetInsightSummaries } from './xray/get-insight-summaries.js';
import { awsGetInsightEvents } from './xray/get-insight-events.js';
import { awsGetInsightImpactGraph } from './xray/get-insight-impact-graph.js';
import { awsGetCostAndUsage } from './cost-explorer/get-cost-and-usage.js';
import { awsGetCostAndUsageWithResources } from './cost-explorer/get-cost-and-usage-with-resources.js';
import { awsGetReservationCoverage } from './cost-explorer/get-reservation-coverage.js';
import { awsGetReservationPurchaseRecommendation } from './cost-explorer/get-reservation-purchase-recommendation.js';
import { awsGetReservationUtilization } from './cost-explorer/get-reservation-utilization.js';
import { awsGetRightsizingRecommendation } from './cost-explorer/get-rightsizing-recommendation.js';
import { awsGetSavingsPlansCoverage } from './cost-explorer/get-savings-plans-coverage.js';
import { awsGetSavingsPlansPurchaseRecommendation } from './cost-explorer/get-savings-plans-purchase-recommendation.js';
import { awsGetSavingsPlansUtilization } from './cost-explorer/get-savings-plans-utilization.js';
import { awsGetSavingsPlansUtilizationDetails } from './cost-explorer/get-savings-plans-utilization-details.js';
import { awsListCostCategoryDefinitions } from './cost-explorer/list-cost-category-definitions.js';
import { awsGetCostCategories } from './cost-explorer/get-cost-categories.js';
import { awsCreateCostCategoryDefinition } from './cost-explorer/create-cost-category-definition.js';
import { awsUpdateCostCategoryDefinition } from './cost-explorer/update-cost-category-definition.js';
import { awsDeleteCostCategoryDefinition } from './cost-explorer/delete-cost-category-definition.js';
import { awsDescribeCostCategoryDefinition } from './cost-explorer/describe-cost-category-definition.js';
import { awsGetDimensionValues } from './cost-explorer/get-dimension-values.js';
import { awsGetTags } from './cost-explorer/get-tags.js';
import { awsGetAnomalies } from './cost-explorer/get-anomalies.js';
import { awsGetAnomalyMonitors } from './cost-explorer/get-anomaly-monitors.js';
import { awsGetAnomalySubscriptions } from './cost-explorer/get-anomaly-subscriptions.js';
import { awsCreateAnomalyMonitor } from './cost-explorer/create-anomaly-monitor.js';
import { awsUpdateAnomalyMonitor } from './cost-explorer/update-anomaly-monitor.js';
import { awsDeleteAnomalyMonitor } from './cost-explorer/delete-anomaly-monitor.js';
import { awsCreateAnomalySubscription } from './cost-explorer/create-anomaly-subscription.js';
import { awsUpdateAnomalySubscription } from './cost-explorer/update-anomaly-subscription.js';
import { awsDeleteAnomalySubscription } from './cost-explorer/delete-anomaly-subscription.js';
import { awsListBudgets } from './budgets/list-budgets.js';
import { awsDescribeBudget } from './budgets/describe-budget.js';
import { awsCreateBudget } from './budgets/create-budget.js';
import { awsUpdateBudget } from './budgets/update-budget.js';
import { awsDeleteBudget } from './budgets/delete-budget.js';
import { awsDescribeBudgetPerformanceHistory } from './budgets/describe-budget-performance-history.js';
import { awsCreateBudgetAction } from './budgets/create-budget-action.js';
import { awsUpdateBudgetAction } from './budgets/update-budget-action.js';
import { awsDeleteBudgetAction } from './budgets/delete-budget-action.js';
import { awsDescribeBudgetAction } from './budgets/describe-budget-action.js';
import { awsListBudgetActionsForBudget } from './budgets/list-budget-actions-for-budget.js';
import { awsListBudgetActionsForAccount } from './budgets/list-budget-actions-for-account.js';
import { awsExecuteBudgetAction } from './budgets/execute-budget-action.js';
import { awsCreateBudgetNotification } from './budgets/create-budget-notification.js';
import { awsUpdateBudgetNotification } from './budgets/update-budget-notification.js';
import { awsDeleteBudgetNotification } from './budgets/delete-budget-notification.js';
import { awsListBudgetNotificationsForBudget } from './budgets/list-budget-notifications-for-budget.js';
import { awsListBudgetNotificationsForAccount } from './budgets/list-budget-notifications-for-account.js';
import { awsCreateBudgetSubscriber } from './budgets/create-budget-subscriber.js';
import { awsUpdateBudgetSubscriber } from './budgets/update-budget-subscriber.js';
import { awsDeleteBudgetSubscriber } from './budgets/delete-budget-subscriber.js';
import { awsListSubscribersForNotification } from './budgets/list-subscribers-for-notification.js';
import { awsListBillingViews } from './billing/list-billing-views.js';
import { awsGetBillingView } from './billing/get-billing-view.js';
import { awsCreateBillingView } from './billing/create-billing-view.js';
import { awsUpdateBillingView } from './billing/update-billing-view.js';
import { awsDeleteBillingView } from './billing/delete-billing-view.js';
import { awsGetBillingViewResourcePolicy } from './billing/get-billing-view-resource-policy.js';
import { awsListSourceViewsForBillingView } from './billing/list-source-views-for-billing-view.js';
import { awsListBillingViewTags } from './billing/list-billing-view-tags.js';
import { awsTagBillingView } from './billing/tag-billing-view.js';
import { awsUntagBillingView } from './billing/untag-billing-view.js';
import { awsDescribeReportDefinitions } from './cost-and-usage-report-service/describe-report-definitions.js';
import { awsPutReportDefinition } from './cost-and-usage-report-service/put-report-definition.js';
import { awsModifyReportDefinition } from './cost-and-usage-report-service/modify-report-definition.js';
import { awsDeleteReportDefinition } from './cost-and-usage-report-service/delete-report-definition.js';
import { awsListKmsKeys } from './kms/list-keys.js';
import { awsDescribeKmsKey } from './kms/describe-key.js';
import { awsCreateKmsKey } from './kms/create-key.js';
import { awsScheduleKeyDeletion } from './kms/schedule-key-deletion.js';
import { awsCancelKeyDeletion } from './kms/cancel-key-deletion.js';
import { awsEnableKmsKey } from './kms/enable-key.js';
import { awsDisableKmsKey } from './kms/disable-key.js';
import { awsUpdateKeyDescription } from './kms/update-key-description.js';
import { awsKmsEncrypt } from './kms/kms-encrypt.js';
import { awsKmsDecrypt } from './kms/kms-decrypt.js';
import { awsKmsReEncrypt } from './kms/kms-re-encrypt.js';
import { awsGenerateDataKey } from './kms/generate-data-key.js';
import { awsGenerateDataKeyWithoutPlaintext } from './kms/generate-data-key-without-plaintext.js';
import { awsGetKeyPolicy } from './kms/get-key-policy.js';
import { awsPutKeyPolicy } from './kms/put-key-policy.js';
import { awsListKeyPolicies } from './kms/list-key-policies.js';
import { awsCreateGrant } from './kms/create-grant.js';
import { awsListGrants } from './kms/list-grants.js';
import { awsRevokeGrant } from './kms/revoke-grant.js';
import { awsRetireGrant } from './kms/retire-grant.js';
import { awsListKmsAliases } from './kms/list-aliases.js';
import { awsCreateKmsAlias } from './kms/create-alias.js';
import { awsDeleteKmsAlias } from './kms/delete-alias.js';
import { awsUpdateKmsAlias } from './kms/update-alias.js';
import { awsListKmsResourceTags } from './kms/list-resource-tags.js';
import { awsTagKmsResource } from './kms/tag-resource.js';
import { awsUntagKmsResource } from './kms/untag-resource.js';
import { awsCreateGuarddutyDetector } from './guardduty/create-detector.js';
import { awsListGuarddutyDetectors } from './guardduty/list-detectors.js';
import { awsGetGuarddutyDetector } from './guardduty/get-detector.js';
import { awsUpdateGuarddutyDetector } from './guardduty/update-detector.js';
import { awsDeleteGuarddutyDetector } from './guardduty/delete-detector.js';
import { awsListGuarddutyFindings } from './guardduty/list-findings.js';
import { awsGetGuarddutyFindings } from './guardduty/get-findings.js';
import { awsUpdateGuarddutyFindingsFeedback } from './guardduty/update-findings-feedback.js';
import { awsArchiveGuarddutyFindings } from './guardduty/archive-findings.js';
import { awsUnarchiveGuarddutyFindings } from './guardduty/unarchive-findings.js';
import { awsCreateGuarddutyIpSet } from './guardduty/create-guardduty-ip-set.js';
import { awsListGuarddutyIpSets } from './guardduty/list-guardduty-ip-sets.js';
import { awsGetGuarddutyIpSet } from './guardduty/get-guardduty-ip-set.js';
import { awsUpdateGuarddutyIpSet } from './guardduty/update-guardduty-ip-set.js';
import { awsDeleteGuarddutyIpSet } from './guardduty/delete-guardduty-ip-set.js';
import { awsCreateThreatIntelSet } from './guardduty/create-threat-intel-set.js';
import { awsListThreatIntelSets } from './guardduty/list-threat-intel-sets.js';
import { awsGetThreatIntelSet } from './guardduty/get-threat-intel-set.js';
import { awsUpdateThreatIntelSet } from './guardduty/update-threat-intel-set.js';
import { awsDeleteThreatIntelSet } from './guardduty/delete-threat-intel-set.js';
import { awsEnableSecurityHub } from './securityhub/enable-security-hub.js';
import { awsDisableSecurityHub } from './securityhub/disable-security-hub.js';
import { awsDescribeHub } from './securityhub/describe-hub.js';
import { awsUpdateSecurityHubConfiguration } from './securityhub/update-security-hub-configuration.js';
import { awsGetSecurityHubFindings } from './securityhub/get-security-hub-findings.js';
import { awsUpdateSecurityHubFindings } from './securityhub/update-security-hub-findings.js';
import { awsBatchImportFindings } from './securityhub/batch-import-findings.js';
import { awsBatchUpdateFindings } from './securityhub/batch-update-findings.js';
import { awsGetSecurityHubInsights } from './securityhub/get-security-hub-insights.js';
import { awsCreateInsight } from './securityhub/create-insight.js';
import { awsUpdateInsight } from './securityhub/update-insight.js';
import { awsDeleteInsight } from './securityhub/delete-insight.js';
import { awsGetInsightResults } from './securityhub/get-insight-results.js';
import { awsDescribeStandards } from './securityhub/describe-standards.js';
import { awsGetEnabledStandards } from './securityhub/get-enabled-standards.js';
import { awsBatchEnableStandards } from './securityhub/batch-enable-standards.js';
import { awsBatchDisableStandards } from './securityhub/batch-disable-standards.js';
import { awsDescribeProducts } from './securityhub/describe-products.js';
import { awsListEnabledProductsForImport } from './securityhub/list-enabled-products-for-import.js';
import { awsEnableImportFindingsForProduct } from './securityhub/enable-import-findings-for-product.js';
import { awsDisableImportFindingsForProduct } from './securityhub/disable-import-findings-for-product.js';
import { awsCreateMembers } from './securityhub/create-members.js';
import { awsListMembers } from './securityhub/list-members.js';
import { awsGetMembers } from './securityhub/get-members.js';
import { awsDeleteMembers } from './securityhub/delete-members.js';
import { awsListWebAcls } from './waf/list-web-acls.js';
import { awsGetWebAcl } from './waf/get-web-acl.js';
import { awsCreateWebAcl } from './waf/create-web-acl.js';
import { awsUpdateWebAcl } from './waf/update-web-acl.js';
import { awsDeleteWebAcl } from './waf/delete-web-acl.js';
import { awsAssociateWebAcl } from './waf/associate-web-acl.js';
import { awsDisassociateWebAcl } from './waf/disassociate-web-acl.js';
import { awsListResourcesForWebAcl } from './waf/list-resources-for-web-acl.js';
import { awsListWafIpSets } from './waf/list-waf-ip-sets.js';
import { awsGetWafIpSet } from './waf/get-waf-ip-set.js';
import { awsCreateWafIpSet } from './waf/create-waf-ip-set.js';
import { awsUpdateWafIpSet } from './waf/update-waf-ip-set.js';
import { awsDeleteWafIpSet } from './waf/delete-waf-ip-set.js';
import { awsListRegexPatternSets } from './waf/list-regex-pattern-sets.js';
import { awsGetRegexPatternSet } from './waf/get-regex-pattern-set.js';
import { awsCreateRegexPatternSet } from './waf/create-regex-pattern-set.js';
import { awsUpdateRegexPatternSet } from './waf/update-regex-pattern-set.js';
import { awsDeleteRegexPatternSet } from './waf/delete-regex-pattern-set.js';
import { awsListRuleGroups } from './waf/list-rule-groups.js';
import { awsGetRuleGroup } from './waf/get-rule-group.js';
import { awsCreateRuleGroup } from './waf/create-rule-group.js';
import { awsUpdateRuleGroup } from './waf/update-rule-group.js';
import { awsDeleteRuleGroup } from './waf/delete-rule-group.js';
import { awsGetLoggingConfiguration } from './waf/get-logging-configuration.js';
import { awsPutLoggingConfiguration } from './waf/put-logging-configuration.js';
import { awsDeleteLoggingConfiguration } from './waf/delete-logging-configuration.js';
import { awsListLoggingConfigurations } from './waf/list-logging-configurations.js';
import { awsDescribeManagedRuleGroup } from './waf/describe-managed-rule-group.js';
import { awsListAvailableManagedRuleGroups } from './waf/list-available-managed-rule-groups.js';
import { awsGetSampledRequests } from './waf/get-sampled-requests.js';
import { awsDescribeSubscription } from './shield/describe-subscription.js';
import { awsCreateSubscription } from './shield/create-subscription.js';
import { awsDeleteSubscription } from './shield/delete-subscription.js';
import { awsListProtections } from './shield/list-protections.js';
import { awsDescribeProtection } from './shield/describe-protection.js';
import { awsCreateProtection } from './shield/create-protection.js';
import { awsDeleteProtection } from './shield/delete-protection.js';
import { awsListAttacks } from './shield/list-attacks.js';
import { awsDescribeAttack } from './shield/describe-attack.js';
import { awsDescribeAttackStatistics } from './shield/describe-attack-statistics.js';
import { awsDescribeEmergencyContactSettings } from './shield/describe-emergency-contact-settings.js';
import { awsUpdateEmergencyContactSettings } from './shield/update-emergency-contact-settings.js';
import { awsDescribeDrtAccess } from './shield/describe-drt-access.js';
import { awsAssociateDrtRole } from './shield/associate-drt-role.js';
import { awsDisassociateDrtRole } from './shield/disassociate-drt-role.js';

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
  awsListS3DirectoryBuckets,
  awsGetS3BucketLocation,
  awsGetS3BucketPolicyStatus,
  awsListS3ObjectsV1,
  awsGetS3ObjectAttributes,
  awsGetS3ObjectTorrent,
  awsRenameS3Object,
  awsUploadS3PartCopy,
  awsGetS3BucketRequestPayment,
  awsPutS3BucketRequestPayment,
  awsGetS3BucketOwnershipControls,
  awsPutS3BucketOwnershipControls,
  awsDeleteS3BucketOwnershipControls,
  awsGetS3BucketAccelerate,
  awsPutS3BucketAccelerate,
  awsGetS3BucketIntelligentTiering,
  awsPutS3BucketIntelligentTiering,
  awsDeleteS3BucketIntelligentTiering,
  awsListS3BucketIntelligentTiering,
  awsGetS3BucketInventory,
  awsPutS3BucketInventory,
  awsDeleteS3BucketInventory,
  awsListS3BucketInventory,
  awsGetS3BucketMetrics,
  awsPutS3BucketMetrics,
  awsDeleteS3BucketMetrics,
  awsListS3BucketMetrics,
  awsGetS3BucketAnalytics,
  awsPutS3BucketAnalytics,
  awsDeleteS3BucketAnalytics,
  awsListS3BucketAnalytics,
  awsGetS3BucketMetadataConfig,
  awsCreateS3BucketMetadataConfig,
  awsDeleteS3BucketMetadataConfig,
  awsGetS3BucketMetadataTable,
  awsCreateS3BucketMetadataTable,
  awsDeleteS3BucketMetadataTable,
  awsUpdateS3BucketMetadataInventoryTable,
  awsUpdateS3BucketMetadataJournalTable,
  awsGetS3BucketAbac,
  awsGetS3ObjectLegalHold,
  awsPutS3ObjectLegalHold,
  awsGetS3ObjectRetention,
  awsPutS3ObjectRetention,
  awsGetS3ObjectLockConfig,
  awsPutS3ObjectLockConfig,
  awsRestoreS3Object,
  awsSelectS3ObjectContent,
  awsWriteS3GetObjectResponse,
  awsCreateS3Session,
  awsCreateIamUser,
  awsDeleteIamUser,
  awsUpdateIamUser,
  awsCreateIamRole,
  awsDeleteIamRole,
  awsUpdateAssumeRolePolicy,
  awsAttachRolePolicy,
  awsDetachRolePolicy,
  awsCreateIamPolicy,
  awsDeleteIamPolicy,
  awsCreatePolicyVersion,
  awsCreateIamGroup,
  awsDeleteIamGroup,
  awsAddUserToGroup,
  awsRemoveUserFromGroup,
  awsAttachGroupPolicy,
  awsDetachGroupPolicy,
  awsListAccessKeys,
  awsCreateAccessKey,
  awsDeleteAccessKey,
  awsUpdateAccessKey,
  awsUpdateAccountPasswordPolicy,
  awsListMfaDevices,
  awsEnableMfaDevice,
  awsDeactivateMfaDevice,
  awsPutS3BucketAbac,
  awsListEcsClusters,
  awsDescribeEcsClusters,
  awsCreateEcsCluster,
  awsUpdateEcsCluster,
  awsUpdateEcsClusterSettings,
  awsDeleteEcsCluster,
  awsListEcsServices,
  awsDescribeEcsServices,
  awsCreateEcsService,
  awsUpdateEcsService,
  awsDeleteEcsService,
  awsListEcsTasks,
  awsDescribeEcsTasks,
  awsRunEcsTask,
  awsStopEcsTask,
  awsStartEcsTask,
  awsListEcsTaskDefinitions,
  awsDescribeEcsTaskDefinition,
  awsRegisterEcsTaskDefinition,
  awsDeregisterEcsTaskDefinition,
  awsListEcsContainerInstances,
  awsDescribeEcsContainerInstances,
  awsUpdateEcsContainerInstancesState,
  awsListEcsCapacityProviders,
  awsDescribeEcsCapacityProviders,
  awsCreateEcsCapacityProvider,
  awsUpdateEcsCapacityProvider,
  awsDeleteEcsCapacityProvider,
  awsPutEcsClusterCapacityProviders,
  awsListEcsTags,
  awsTagEcsResource,
  awsUntagEcsResource,
  awsListEcsAccountSettings,
  awsPutEcsAccountSetting,
  awsPutEcsAccountSettingDefault,
  awsDeleteEcsAccountSetting,
  awsListEcsTaskSets,
  awsDescribeEcsTaskSets,
  awsCreateEcsTaskSet,
  awsUpdateEcsTaskSet,
  awsDeleteEcsTaskSet,
  awsListEcsAttributes,
  awsPutEcsAttributes,
  awsDeleteEcsAttributes,
  awsListEksClusters,
  awsDescribeEksCluster,
  awsCreateEksCluster,
  awsUpdateEksClusterVersion,
  awsUpdateEksClusterConfig,
  awsDeleteEksCluster,
  awsListEksNodegroups,
  awsDescribeEksNodegroup,
  awsCreateEksNodegroup,
  awsUpdateEksNodegroupVersion,
  awsUpdateEksNodegroupConfig,
  awsDeleteEksNodegroup,
  awsListEksFargateProfiles,
  awsDescribeEksFargateProfile,
  awsCreateEksFargateProfile,
  awsDeleteEksFargateProfile,
  awsListEksAddons,
  awsDescribeEksAddon,
  awsDescribeEksAddonVersions,
  awsCreateEksAddon,
  awsUpdateEksAddon,
  awsDeleteEksAddon,
  awsListEksIdentityProviderConfigs,
  awsDescribeEksIdentityProviderConfig,
  awsAssociateEksIdentityProviderConfig,
  awsDisassociateEksIdentityProviderConfig,
  awsListEksTags,
  awsTagEksResource,
  awsUntagEksResource,
  awsListEksAccessEntries,
  awsDescribeEksAccessEntry,
  awsCreateEksAccessEntry,
  awsUpdateEksAccessEntry,
  awsDeleteEksAccessEntry,
  awsAssociateEksAccessPolicy,
  awsDisassociateEksAccessPolicy,
  awsListEksAssociatedAccessPolicies,
  awsListEksPodIdentityAssociations,
  awsDescribeEksPodIdentityAssociation,
  awsCreateEksPodIdentityAssociation,
  awsUpdateEksPodIdentityAssociation,
  awsDeleteEksPodIdentityAssociation,
  awsListRepositories,
  awsDescribeRepositories,
  awsCreateRepository,
  awsUpdateEcrRepository,
  awsDeleteRepository,
  awsListImages,
  awsDescribeImages,
  awsBatchGetImage,
  awsPutImage,
  awsDeleteImages,
  awsBatchDeleteImage,
  awsPutLifecyclePolicy,
  awsGetLifecyclePolicy,
  awsDeleteLifecyclePolicy,
  awsStartLifecyclePolicyPreview,
  awsGetLifecyclePolicyPreview,
  awsPutImageTagMutability,
  awsGetImageTagMutability,
  awsPutImageScanningConfiguration,
  awsGetImageScanningConfiguration,
  awsDescribeImageScanFindings,
  awsSetRepositoryPolicy,
  awsGetRepositoryPolicy,
  awsDeleteRepositoryPolicy,
  awsPutReplicationConfiguration,
  awsGetReplicationConfiguration,
  awsPutRegistryPolicy,
  awsGetRegistryPolicy,
  awsDeleteRegistryPolicy,
  awsPutRegistryScanningConfiguration,
  awsGetRegistryScanningConfiguration,
  awsDescribeRegistry,
  awsDescribeImageReplicationStatus,
  awsListEcrTags,
  awsTagEcrResource,
  awsUntagEcrResource,
  awsDescribeRdsInstances,
  awsCreateDbInstance,
  awsModifyDbInstance,
  awsDeleteDbInstance,
  awsStartDbInstance,
  awsStopDbInstance,
  awsRebootDbInstance,
  awsDescribeDbSnapshots,
  awsCreateDbSnapshot,
  awsDeleteDbSnapshot,
  awsRestoreDbInstanceFromDbSnapshot,
  awsCopyDbSnapshot,
  awsDescribeDbAutomatedBackups,
  awsDescribeDbClusters,
  awsCreateDbCluster,
  awsModifyDbCluster,
  awsDeleteDbCluster,
  awsStartDbCluster,
  awsStopDbCluster,
  awsCreateDbClusterSnapshot,
  awsRestoreDbClusterFromSnapshot,
  awsDescribeDbParameterGroups,
  awsCreateDbParameterGroup,
  awsModifyDbParameterGroup,
  awsDeleteDbParameterGroup,
  awsDescribeDbParameters,
  awsDescribeDbSubnetGroups,
  awsCreateDbSubnetGroup,
  awsModifyDbSubnetGroup,
  awsDeleteDbSubnetGroup,
  awsCreateGlobalCluster,
  awsDescribeGlobalClusters,
  awsModifyGlobalCluster,
  awsDeleteGlobalCluster,
  awsRemoveFromGlobalCluster,
  awsFailoverGlobalCluster,
  awsRestoreDbClusterToPointInTime,
  awsDescribeElasticacheCacheClusters,
  awsCreateCacheCluster,
  awsModifyCacheCluster,
  awsDeleteCacheCluster,
  awsRebootCacheCluster,
  awsDescribeReplicationGroups,
  awsCreateReplicationGroup,
  awsModifyReplicationGroup,
  awsDeleteReplicationGroup,
  awsIncreaseReplicaCount,
  awsDecreaseReplicaCount,
  awsDescribeCacheParameterGroups,
  awsCreateCacheParameterGroup,
  awsModifyCacheParameterGroup,
  awsDeleteCacheParameterGroup,
  awsDescribeCacheParameters,
  awsDescribeCacheSubnetGroups,
  awsCreateCacheSubnetGroup,
  awsModifyCacheSubnetGroup,
  awsDeleteCacheSubnetGroup,
  awsDescribeSnapshots,
  awsCreateSnapshot,
  awsDeleteSnapshot,
  awsCopySnapshot,
  awsListTagsForResource,
  awsAddTagsToResource,
  awsRemoveTagsFromResource,
  awsStartEbsSnapshot,
  awsPutEbsSnapshotBlock,
  awsGetEbsSnapshotBlock,
  awsListEbsSnapshotBlocks,
  awsListEbsChangedBlocks,
  awsCompleteEbsSnapshot,
  awsCreateRoute53HostedZone,
  awsGetRoute53HostedZone,
  awsListRoute53HostedZones,
  awsDeleteRoute53HostedZone,
  awsUpdateRoute53HostedZoneComment,
  awsListRoute53HostedZonesByName,
  awsListRoute53ResourceRecordSets,
  awsChangeRoute53ResourceRecordSets,
  awsGetRoute53Change,
  awsListRoute53TagsForResource,
  awsChangeRoute53TagsForResource,
  awsCreateRoute53HealthCheck,
  awsGetRoute53HealthCheck,
  awsListRoute53HealthChecks,
  awsDeleteRoute53HealthCheck,
  awsUpdateRoute53HealthCheck,
  awsGetRoute53HealthCheckStatus,
  awsGetRoute53HealthCheckLastFailureReason,
  awsGetRoute53HealthCheckCount,
  awsCreateRoute53ReusableDelegationSet,
  awsGetRoute53ReusableDelegationSet,
  awsListRoute53ReusableDelegationSets,
  awsDeleteRoute53ReusableDelegationSet,
  awsCreateRoute53TrafficPolicy,
  awsGetRoute53TrafficPolicy,
  awsListRoute53TrafficPolicies,
  awsDeleteRoute53TrafficPolicy,
  awsCreateRoute53TrafficPolicyInstance,
  awsGetRoute53TrafficPolicyInstance,
  awsListRoute53TrafficPolicyInstances,
  awsDeleteRoute53TrafficPolicyInstance,
  awsUpdateRoute53TrafficPolicyInstance,
  awsGetRoute53TrafficPolicyInstanceCount,
  awsCreateRoute53TrafficPolicyVersion,
  awsListRoute53TrafficPolicyVersions,
  awsGetRoute53AccountLimit,
  awsGetRoute53HostedZoneLimit,
  awsGetRoute53ReusableDelegationSetLimit,
  awsCreateRoute53QueryLoggingConfig,
  awsGetRoute53QueryLoggingConfig,
  awsListRoute53QueryLoggingConfigs,
  awsDeleteRoute53QueryLoggingConfig,
  awsGetRoute53CheckerIpRanges,
  awsGetRoute53GeoLocation,
  awsListRoute53GeoLocations,
  awsGetRoute53Dnssec,
  awsAssociateRoute53VpcWithHostedZone,
  awsDisassociateRoute53VpcFromHostedZone,
  awsListRoute53VpcAssociationAuthorizations,
  awsTestRoute53DnsAnswer,
  awsGetRoute53HostedZoneCount,
  awsListRoute53HostedZonesByVpc,
  awsActivateRoute53KeySigningKey,
  awsCreateRoute53KeySigningKey,
  awsDeactivateRoute53KeySigningKey,
  awsDeleteRoute53KeySigningKey,
  awsCreateCloudfrontDistribution,
  awsGetCloudfrontDistribution,
  awsGetCloudfrontDistributionConfig,
  awsUpdateCloudfrontDistribution,
  awsDeleteCloudfrontDistribution,
  awsListCloudfrontDistributions,
  awsCreateCloudfrontDistributionWithTags,
  awsCopyCloudfrontDistribution,
  awsCreateCloudfrontInvalidation,
  awsGetCloudfrontInvalidation,
  awsListCloudfrontInvalidations,
  awsCreateCloudfrontOriginAccessIdentity,
  awsGetCloudfrontOriginAccessIdentity,
  awsUpdateCloudfrontOriginAccessIdentity,
  awsDeleteCloudfrontOriginAccessIdentity,
  awsListCloudfrontOriginAccessIdentities,
  awsCreateCloudfrontCachePolicy,
  awsGetCloudfrontCachePolicy,
  awsUpdateCloudfrontCachePolicy,
  awsDeleteCloudfrontCachePolicy,
  awsListCloudfrontCachePolicies,
  awsCreateCloudfrontResponseHeadersPolicy,
  awsGetCloudfrontResponseHeadersPolicy,
  awsUpdateCloudfrontResponseHeadersPolicy,
  awsDeleteCloudfrontResponseHeadersPolicy,
  awsListCloudfrontResponseHeadersPolicies,
  awsCreateCloudfrontFunction,
  awsGetCloudfrontFunction,
  awsDescribeCloudfrontFunction,
  awsUpdateCloudfrontFunction,
  awsDeleteCloudfrontFunction,
  awsListCloudfrontFunctions,
  awsPublishCloudfrontFunction,
  awsTestCloudfrontFunction,
  awsCreateCloudfrontKeyGroup,
  awsGetCloudfrontKeyGroup,
  awsUpdateCloudfrontKeyGroup,
  awsDeleteCloudfrontKeyGroup,
  awsListCloudfrontKeyGroups,
  awsCreateCloudfrontPublicKey,
  awsGetCloudfrontPublicKey,
  awsUpdateCloudfrontPublicKey,
  awsDeleteCloudfrontPublicKey,
  awsListCloudfrontPublicKeys,
  awsCreateCloudfrontStreamingDistribution,
  awsGetCloudfrontStreamingDistribution,
  awsGetCloudfrontStreamingDistributionConfig,
  awsUpdateCloudfrontStreamingDistribution,
  awsDeleteCloudfrontStreamingDistribution,
  awsListCloudfrontStreamingDistributions,
  awsCreateCloudfrontStreamingDistributionWithTags,
  awsListCloudfrontTags,
  awsTagCloudfrontResource,
  awsUntagCloudfrontResource,
  awsGetCloudfrontContinuousDeploymentPolicy,
  awsCreateCloudfrontContinuousDeploymentPolicy,
  awsUpdateCloudfrontContinuousDeploymentPolicy,
  awsDeleteCloudfrontContinuousDeploymentPolicy,
  awsListCloudfrontContinuousDeploymentPolicies,
  awsGetCloudfrontRealtimeLogConfig,
  awsCreateCloudfrontRealtimeLogConfig,
  awsUpdateCloudfrontRealtimeLogConfig,
  awsDeleteCloudfrontRealtimeLogConfig,
  awsListCloudfrontRealtimeLogConfigs,
  awsGetCloudfrontMonitoringSubscription,
  awsCreateCloudfrontMonitoringSubscription,
  awsDeleteCloudfrontMonitoringSubscription,
  awsListRestApis,
  awsGetRestApi,
  awsCreateRestApi,
  awsUpdateRestApi,
  awsDeleteRestApi,
  awsImportRestApi,
  awsPutRestApi,
  awsListResources,
  awsGetResource,
  awsCreateResource,
  awsUpdateResource,
  awsDeleteResource,
  awsPutMethod,
  awsGetMethod,
  awsDeleteMethod,
  awsUpdateMethod,
  awsPutIntegration,
  awsGetIntegration,
  awsDeleteIntegration,
  awsUpdateIntegration,
  awsListDeployments,
  awsGetDeployment,
  awsCreateDeployment,
  awsUpdateDeployment,
  awsDeleteDeployment,
  awsListStages,
  awsGetStage,
  awsCreateStage,
  awsUpdateStage,
  awsDeleteStage,
  awsCreateAutoscalingGroup,
  awsDescribeAutoscalingGroups,
  awsUpdateAutoscalingGroup,
  awsDeleteAutoscalingGroup,
  awsAttachInstancesToAutoscalingGroup,
  awsDetachInstancesFromAutoscalingGroup,
  awsEnterStandbyAutoscalingGroup,
  awsExitStandbyAutoscalingGroup,
  awsSetAutoscalingGroupDesiredCapacity,
  awsSetAutoscalingInstanceHealth,
  awsTerminateAutoscalingInstance,
  awsCreateLaunchConfiguration,
  awsDescribeLaunchConfigurations,
  awsDeleteLaunchConfiguration,
  awsPutAutoscalingScalingPolicy,
  awsDescribeAutoscalingPolicies,
  awsDeleteAutoscalingPolicy,
  awsExecuteAutoscalingPolicy,
  awsPutAutoscalingScheduledAction,
  awsDescribeAutoscalingScheduledActions,
  awsDeleteAutoscalingScheduledAction,
  awsPutAutoscalingLifecycleHook,
  awsDescribeAutoscalingLifecycleHooks,
  awsDeleteAutoscalingLifecycleHook,
  awsCompleteAutoscalingLifecycleAction,
  awsRecordAutoscalingLifecycleActionHeartbeat,
  awsCreateOrUpdateAutoscalingTags,
  awsDescribeAutoscalingTags,
  awsDeleteAutoscalingTags,
  awsDescribeAutoscalingActivities,
  awsDescribeAutoscalingInstances,
  awsDescribeAutoscalingNotificationConfigurations,
  awsPutAutoscalingNotificationConfiguration,
  awsDeleteAutoscalingNotificationConfiguration,
  awsDescribeAutoscalingAccountLimits,
  awsDescribeAutoscalingAdjustmentTypes,
  awsDescribeAutoscalingMetricCollectionTypes,
  awsEnableAutoscalingMetricsCollection,
  awsDisableAutoscalingMetricsCollection,
  awsDescribeAutoscalingTerminationPolicyTypes,
  awsDescribeAutoscalingScalingProcessTypes,
  awsSuspendAutoscalingProcesses,
  awsResumeAutoscalingProcesses,
  awsBatchPutAutoscalingScheduledAction,
  awsBatchDeleteAutoscalingScheduledAction,
  awsStartAutoscalingInstanceRefresh,
  awsCancelAutoscalingInstanceRefresh,
  awsDescribeAutoscalingInstanceRefreshes,
  awsDescribeAutoscalingWarmPool,
  awsPutAutoscalingWarmPool,
  awsDeleteAutoscalingWarmPool,
  awsPutEventbridgeEvents,
  awsPutEventbridgeRule,
  awsListEventbridgeRules,
  awsDescribeEventbridgeRule,
  awsDeleteEventbridgeRule,
  awsEnableEventbridgeRule,
  awsDisableEventbridgeRule,
  awsPutEventbridgeTargets,
  awsListEventbridgeTargets,
  awsRemoveEventbridgeTargets,
  awsCreateEventbridgeEventBus,
  awsListEventbridgeEventBuses,
  awsDescribeEventbridgeEventBus,
  awsDeleteEventbridgeEventBus,
  awsCreateEventbridgeArchive,
  awsListEventbridgeArchives,
  awsDescribeEventbridgeArchive,
  awsUpdateEventbridgeArchive,
  awsDeleteEventbridgeArchive,
  awsStartEventbridgeReplay,
  awsListEventbridgeReplays,
  awsDescribeEventbridgeReplay,
  awsCancelEventbridgeReplay,
  awsCreateEventbridgeConnection,
  awsListEventbridgeConnections,
  awsDescribeEventbridgeConnection,
  awsUpdateEventbridgeConnection,
  awsDeleteEventbridgeConnection,
  awsCreateEventbridgeEndpoint,
  awsListEventbridgeEndpoints,
  awsDescribeEventbridgeEndpoint,
  awsUpdateEventbridgeEndpoint,
  awsDeleteEventbridgeEndpoint,
  awsListEventbridgeTags,
  awsTagEventbridgeResource,
  awsUntagEventbridgeResource,
  awsCreateVpcLatticeService,
  awsGetVpcLatticeService,
  awsUpdateVpcLatticeService,
  awsDeleteVpcLatticeService,
  awsListVpcLatticeServices,
  awsCreateVpcLatticeServiceNetwork,
  awsGetVpcLatticeServiceNetwork,
  awsUpdateVpcLatticeServiceNetwork,
  awsDeleteVpcLatticeServiceNetwork,
  awsListVpcLatticeServiceNetworks,
  awsCreateVpcLatticeListener,
  awsGetVpcLatticeListener,
  awsUpdateVpcLatticeListener,
  awsDeleteVpcLatticeListener,
  awsListVpcLatticeListeners,
  awsCreateVpcLatticeRule,
  awsGetVpcLatticeRule,
  awsUpdateVpcLatticeRule,
  awsDeleteVpcLatticeRule,
  awsListVpcLatticeRules,
  awsCreateVpcLatticeTargetGroup,
  awsGetVpcLatticeTargetGroup,
  awsUpdateVpcLatticeTargetGroup,
  awsDeleteVpcLatticeTargetGroup,
  awsListVpcLatticeTargetGroups,
  awsRegisterVpcLatticeTargets,
  awsDeregisterVpcLatticeTargets,
  awsGetVpcLatticeTargets,
  awsCreateVpcLatticeServiceNetworkServiceAssociation,
  awsGetVpcLatticeServiceNetworkServiceAssociation,
  awsDeleteVpcLatticeServiceNetworkServiceAssociation,
  awsListVpcLatticeServiceNetworkServiceAssociations,
  awsCreateVpcLatticeServiceNetworkVpcAssociation,
  awsGetVpcLatticeServiceNetworkVpcAssociation,
  awsUpdateVpcLatticeServiceNetworkVpcAssociation,
  awsDeleteVpcLatticeServiceNetworkVpcAssociation,
  awsListVpcLatticeServiceNetworkVpcAssociations,
  awsCreateVpcLatticeAccessLogSubscription,
  awsGetVpcLatticeAccessLogSubscription,
  awsUpdateVpcLatticeAccessLogSubscription,
  awsDeleteVpcLatticeAccessLogSubscription,
  awsListVpcLatticeAccessLogSubscriptions,
  awsPutVpcLatticeAuthPolicy,
  awsGetVpcLatticeAuthPolicy,
  awsDeleteVpcLatticeAuthPolicy,
  awsPutVpcLatticeResourcePolicy,
  awsGetVpcLatticeResourcePolicy,
  awsDeleteVpcLatticeResourcePolicy,
  awsListVpcLatticeTags,
  awsTagVpcLatticeResource,
  awsUntagVpcLatticeResource,
  awsCreateCloudformationStack,
  awsUpdateCloudformationStack,
  awsDeleteCloudformationStack,
  awsDescribeCloudformationStacks,
  awsListCloudformationStacks,
  awsDescribeCloudformationStackEvents,
  awsDescribeCloudformationStackResource,
  awsDescribeCloudformationStackResources,
  awsListCloudformationStackResources,
  awsCreateCloudformationChangeset,
  awsDescribeCloudformationChangeset,
  awsExecuteCloudformationChangeset,
  awsDeleteCloudformationChangeset,
  awsListCloudformationChangesets,
  awsGetCloudformationTemplate,
  awsGetCloudformationTemplateSummary,
  awsValidateCloudformationTemplate,
  awsCreateCloudformationStackSet,
  awsUpdateCloudformationStackSet,
  awsDeleteCloudformationStackSet,
  awsDescribeCloudformationStackSet,
  awsListCloudformationStackSets,
  awsCreateCloudformationStackInstances,
  awsDeleteCloudformationStackInstances,
  awsDescribeCloudformationStackInstance,
  awsListCloudformationStackInstances,
  awsDetectCloudformationStackDrift,
  awsDetectCloudformationStackResourceDrift,
  awsDescribeCloudformationStackResourceDrifts,
  awsListCloudformationExports,
  awsListCloudformationImports,
  awsDescribeCloudformationAccountLimits,
  awsCreateCodebuildProject,
  awsGetCodebuildProject,
  awsListCodebuildProjects,
  awsUpdateCodebuildProject,
  awsDeleteCodebuildProject,
  awsBatchGetCodebuildProjects,
  awsStartCodebuildBuild,
  awsStopCodebuildBuild,
  awsListCodebuildBuilds,
  awsListCodebuildBuildsForProject,
  awsBatchGetCodebuildBuilds,
  awsRetryCodebuildBuild,
  awsStartCodebuildBuildBatch,
  awsStopCodebuildBuildBatch,
  awsListCodebuildBuildBatches,
  awsListCodebuildBuildBatchesForProject,
  awsBatchGetCodebuildBuildBatches,
  awsRetryCodebuildBuildBatch,
  awsListCodebuildReports,
  awsListCodebuildReportsForReportGroup,
  awsGetCodebuildReport,
  awsBatchGetCodebuildReports,
  awsDeleteCodebuildReport,
  awsCreateCodebuildReportGroup,
  awsGetCodebuildReportGroup,
  awsUpdateCodebuildReportGroup,
  awsDeleteCodebuildReportGroup,
  awsListCodebuildReportGroups,
  awsBatchGetCodebuildReportGroups,
  awsCreateCodedeployApplication,
  awsGetCodedeployApplication,
  awsListCodedeployApplications,
  awsUpdateCodedeployApplication,
  awsDeleteCodedeployApplication,
  awsBatchGetCodedeployApplications,
  awsCreateCodedeployDeploymentGroup,
  awsGetCodedeployDeploymentGroup,
  awsListCodedeployDeploymentGroups,
  awsUpdateCodedeployDeploymentGroup,
  awsDeleteCodedeployDeploymentGroup,
  awsBatchGetCodedeployDeploymentGroups,
  awsCreateCodedeployDeployment,
  awsGetCodedeployDeployment,
  awsListCodedeployDeployments,
  awsStopCodedeployDeployment,
  awsContinueCodedeployDeployment,
  awsBatchGetCodedeployDeployments,
  awsListCodedeployApplicationRevisions,
  awsGetCodedeployApplicationRevision,
  awsRegisterCodedeployApplicationRevision,
  awsListCodedeployOnPremisesInstances,
  awsBatchGetCodedeployOnPremisesInstances,
  awsAddTagsToCodedeployOnPremisesInstances,
  awsRemoveTagsFromCodedeployOnPremisesInstances,
  awsListCodedeployTags,
  awsTagCodedeployResource,
  awsUntagCodedeployResource,
  awsCreateCodepipelinePipeline,
  awsGetCodepipelinePipeline,
  awsListCodepipelinePipelines,
  awsUpdateCodepipelinePipeline,
  awsDeleteCodepipelinePipeline,
  awsGetCodepipelinePipelineState,
  awsStartCodepipelineExecution,
  awsGetCodepipelineExecution,
  awsListCodepipelineExecutions,
  awsStopCodepipelineExecution,
  awsListCodepipelineActionExecutions,
  awsListCodepipelineActionTypes,
  awsGetCodepipelineActionType,
  awsCreateCodepipelineWebhook,
  awsListCodepipelineWebhooks,
  awsDeleteCodepipelineWebhook,
  awsDeregisterCodepipelineWebhookWithThirdParty,
  awsRegisterCodepipelineWebhookWithThirdParty,
  awsPutCodepipelineApprovalResult,
  awsPutCodepipelineJobSuccessResult,
  awsPutCodepipelineJobFailureResult,
  awsPutCodepipelineThirdPartyJobSuccessResult,
  awsPutCodepipelineThirdPartyJobFailureResult,
  awsListCodepipelineTags,
  awsTagCodepipelineResource,
  awsUntagCodepipelineResource,
  awsCreateCodeartifactDomain,
  awsDescribeCodeartifactDomain,
  awsListCodeartifactDomains,
  awsDeleteCodeartifactDomain,
  awsCreateCodeartifactRepository,
  awsDescribeCodeartifactRepository,
  awsListCodeartifactRepositories,
  awsUpdateCodeartifactRepository,
  awsDeleteCodeartifactRepository,
  awsListCodeartifactPackages,
  awsDescribeCodeartifactPackage,
  awsDeleteCodeartifactPackage,
  awsListCodeartifactPackageVersions,
  awsDescribeCodeartifactPackageVersion,
  awsDeleteCodeartifactPackageVersions,
  awsGetCodeartifactAuthorizationToken,
  awsGetCodeartifactRepositoryEndpoint,
  awsCreateCodeartifactPackageGroup,
  awsDescribeCodeartifactPackageGroup,
  awsListCodeartifactPackageGroups,
  awsUpdateCodeartifactPackageGroup,
  awsDeleteCodeartifactPackageGroup,
  awsAssociateCodeartifactExternalConnection,
  awsDisassociateCodeartifactExternalConnection,
  awsListCodeartifactTags,
  awsTagCodeartifactResource,
  awsUntagCodeartifactResource,
  awsListTrails,
  awsGetTrail,
  awsCreateTrail,
  awsUpdateTrail,
  awsDeleteTrail,
  awsDescribeTrails,
  awsGetTrailStatus,
  awsStartLogging,
  awsStopLogging,
  awsLookupEvents,
  awsCreateEventDataStore,
  awsDeleteEventDataStore,
  awsUpdateEventDataStore,
  awsGetEventDataStore,
  awsListEventDataStores,
  awsRestoreEventDataStore,
  awsCreateChannel,
  awsDeleteChannel,
  awsUpdateChannel,
  awsGetChannel,
  awsListChannels,
  awsPutResourcePolicy,
  awsGetResourcePolicy,
  awsDeleteResourcePolicy,
  awsAddTags,
  awsRemoveTags,
  awsListTags,
  awsBatchGetTraces,
  awsGetTraceSummaries,
  awsGetServiceGraph,
  awsPutTraceSegments,
  awsGetTraceGraph,
  awsGetGroups,
  awsCreateGroup,
  awsUpdateGroup,
  awsDeleteGroup,
  awsGetGroup,
  awsGetSamplingRules,
  awsGetSamplingTargets,
  awsPutTelemetryRecords,
  awsGetInsight,
  awsGetInsightSummaries,
  awsGetInsightEvents,
  awsGetInsightImpactGraph,
  awsGetCostAndUsage,
  awsGetCostAndUsageWithResources,
  awsGetReservationCoverage,
  awsGetReservationPurchaseRecommendation,
  awsGetReservationUtilization,
  awsGetRightsizingRecommendation,
  awsGetSavingsPlansCoverage,
  awsGetSavingsPlansPurchaseRecommendation,
  awsGetSavingsPlansUtilization,
  awsGetSavingsPlansUtilizationDetails,
  awsListCostCategoryDefinitions,
  awsGetCostCategories,
  awsCreateCostCategoryDefinition,
  awsUpdateCostCategoryDefinition,
  awsDeleteCostCategoryDefinition,
  awsDescribeCostCategoryDefinition,
  awsGetDimensionValues,
  awsGetTags,
  awsGetAnomalies,
  awsGetAnomalyMonitors,
  awsGetAnomalySubscriptions,
  awsCreateAnomalyMonitor,
  awsUpdateAnomalyMonitor,
  awsDeleteAnomalyMonitor,
  awsCreateAnomalySubscription,
  awsUpdateAnomalySubscription,
  awsDeleteAnomalySubscription,
  awsListBudgets,
  awsDescribeBudget,
  awsCreateBudget,
  awsUpdateBudget,
  awsDeleteBudget,
  awsDescribeBudgetPerformanceHistory,
  awsCreateBudgetAction,
  awsUpdateBudgetAction,
  awsDeleteBudgetAction,
  awsDescribeBudgetAction,
  awsListBudgetActionsForBudget,
  awsListBudgetActionsForAccount,
  awsExecuteBudgetAction,
  awsCreateBudgetNotification,
  awsUpdateBudgetNotification,
  awsDeleteBudgetNotification,
  awsListBudgetNotificationsForBudget,
  awsListBudgetNotificationsForAccount,
  awsCreateBudgetSubscriber,
  awsUpdateBudgetSubscriber,
  awsDeleteBudgetSubscriber,
  awsListSubscribersForNotification,
  awsListBillingViews,
  awsGetBillingView,
  awsCreateBillingView,
  awsUpdateBillingView,
  awsDeleteBillingView,
  awsGetBillingViewResourcePolicy,
  awsListSourceViewsForBillingView,
  awsListBillingViewTags,
  awsTagBillingView,
  awsUntagBillingView,
  awsDescribeReportDefinitions,
  awsPutReportDefinition,
  awsModifyReportDefinition,
  awsDeleteReportDefinition,
  awsListKmsKeys,
  awsDescribeKmsKey,
  awsCreateKmsKey,
  awsScheduleKeyDeletion,
  awsCancelKeyDeletion,
  awsEnableKmsKey,
  awsDisableKmsKey,
  awsUpdateKeyDescription,
  awsKmsEncrypt,
  awsKmsDecrypt,
  awsKmsReEncrypt,
  awsGenerateDataKey,
  awsGenerateDataKeyWithoutPlaintext,
  awsGetKeyPolicy,
  awsPutKeyPolicy,
  awsListKeyPolicies,
  awsCreateGrant,
  awsListGrants,
  awsRevokeGrant,
  awsRetireGrant,
  awsListKmsAliases,
  awsCreateKmsAlias,
  awsDeleteKmsAlias,
  awsUpdateKmsAlias,
  awsListKmsResourceTags,
  awsTagKmsResource,
  awsUntagKmsResource,
  awsCreateGuarddutyDetector,
  awsListGuarddutyDetectors,
  awsGetGuarddutyDetector,
  awsUpdateGuarddutyDetector,
  awsDeleteGuarddutyDetector,
  awsListGuarddutyFindings,
  awsGetGuarddutyFindings,
  awsUpdateGuarddutyFindingsFeedback,
  awsArchiveGuarddutyFindings,
  awsUnarchiveGuarddutyFindings,
  awsCreateGuarddutyIpSet,
  awsListGuarddutyIpSets,
  awsGetGuarddutyIpSet,
  awsUpdateGuarddutyIpSet,
  awsDeleteGuarddutyIpSet,
  awsCreateThreatIntelSet,
  awsListThreatIntelSets,
  awsGetThreatIntelSet,
  awsUpdateThreatIntelSet,
  awsDeleteThreatIntelSet,
  awsEnableSecurityHub,
  awsDisableSecurityHub,
  awsDescribeHub,
  awsUpdateSecurityHubConfiguration,
  awsGetSecurityHubFindings,
  awsUpdateSecurityHubFindings,
  awsBatchImportFindings,
  awsBatchUpdateFindings,
  awsGetSecurityHubInsights,
  awsCreateInsight,
  awsUpdateInsight,
  awsDeleteInsight,
  awsGetInsightResults,
  awsDescribeStandards,
  awsGetEnabledStandards,
  awsBatchEnableStandards,
  awsBatchDisableStandards,
  awsDescribeProducts,
  awsListEnabledProductsForImport,
  awsEnableImportFindingsForProduct,
  awsDisableImportFindingsForProduct,
  awsCreateMembers,
  awsListMembers,
  awsGetMembers,
  awsDeleteMembers,
  awsListWebAcls,
  awsGetWebAcl,
  awsCreateWebAcl,
  awsUpdateWebAcl,
  awsDeleteWebAcl,
  awsAssociateWebAcl,
  awsDisassociateWebAcl,
  awsListResourcesForWebAcl,
  awsListWafIpSets,
  awsGetWafIpSet,
  awsCreateWafIpSet,
  awsUpdateWafIpSet,
  awsDeleteWafIpSet,
  awsListRegexPatternSets,
  awsGetRegexPatternSet,
  awsCreateRegexPatternSet,
  awsUpdateRegexPatternSet,
  awsDeleteRegexPatternSet,
  awsListRuleGroups,
  awsGetRuleGroup,
  awsCreateRuleGroup,
  awsUpdateRuleGroup,
  awsDeleteRuleGroup,
  awsGetLoggingConfiguration,
  awsPutLoggingConfiguration,
  awsDeleteLoggingConfiguration,
  awsListLoggingConfigurations,
  awsDescribeManagedRuleGroup,
  awsListAvailableManagedRuleGroups,
  awsGetSampledRequests,
  awsDescribeSubscription,
  awsCreateSubscription,
  awsDeleteSubscription,
  awsListProtections,
  awsDescribeProtection,
  awsCreateProtection,
  awsDeleteProtection,
  awsListAttacks,
  awsDescribeAttack,
  awsDescribeAttackStatistics,
  awsDescribeEmergencyContactSettings,
  awsUpdateEmergencyContactSettings,
  awsDescribeDrtAccess,
  awsAssociateDrtRole,
  awsDisassociateDrtRole,
};

export const awsTools: ToolDefinition[] = [
  {
    name: 'awsListEc2Instances',
    description: 'List EC2 instances, optionally filtered by state.',
    tool: awsListEc2Instances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetEc2Instance',
    description: 'Get detailed information about a specific EC2 instance.',
    tool: awsGetEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsStartEc2Instance',
    description: 'Start a stopped EC2 instance.',
    tool: awsStartEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopEc2Instance',
    description: 'Stop a running EC2 instance.',
    tool: awsStopEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudwatchMetricData',
    description: 'Retrieve CloudWatch metric statistics for a namespace and metric name.',
    tool: awsGetCloudwatchMetricData as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudwatchAlarms',
    description: 'List CloudWatch alarms, optionally filtered by name prefix or state.',
    tool: awsListCloudwatchAlarms as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudwatchLogGroups',
    description: 'List CloudWatch log groups, optionally filtered by name prefix.',
    tool: awsListCloudwatchLogGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsFilterCloudwatchLogEvents',
    description: 'Search CloudWatch log events with an optional filter pattern and time range.',
    tool: awsFilterCloudwatchLogEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Instance',
    description: 'Launch a new EC2 instance Use it to provision a new resource.',
    tool: awsCreateEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsTerminateEc2Instance',
    description: 'Terminate an EC2 instance Use it to permanently remove the resource.',
    tool: awsTerminateEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRebootEc2Instance',
    description: 'Reboot an EC2 instance Use it to restart a running instance.',
    tool: awsRebootEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2InstanceStatus',
    description: 'Describe the status of EC2 instances Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InstanceStatus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2InstanceTypes',
    description: 'Describe EC2 instance types Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InstanceTypes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsModifyEc2InstanceAttribute',
    description: 'Modify an attribute of an EC2 instance Use it to change an existing resource.',
    tool: awsModifyEc2InstanceAttribute as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2InstanceAttribute',
    description: 'Describe an attribute of an EC2 instance Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InstanceAttribute as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsMonitorEc2Instance',
    description: 'Enable detailed monitoring for an EC2 instance Use it to toggle detailed monitoring.',
    tool: awsMonitorEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUnmonitorEc2Instance',
    description: 'Disable detailed monitoring for an EC2 instance Use it to toggle detailed monitoring.',
    tool: awsUnmonitorEc2Instance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Images',
    description: 'Describe EC2 images (AMIs) Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Images as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Image',
    description: 'Create an AMI from an EC2 instance Use it to provision a new resource.',
    tool: awsCreateEc2Image as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeregisterEc2Image',
    description: 'Deregister an EC2 AMI Use it to permanently remove the resource.',
    tool: awsDeregisterEc2Image as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopyEc2Image',
    description: 'Copy an AMI to another region Use it to duplicate a resource, optionally across regions.',
    tool: awsCopyEc2Image as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyEc2ImageAttribute',
    description: 'Modify an attribute of an EC2 AMI Use it to change an existing resource.',
    tool: awsModifyEc2ImageAttribute as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Snapshots',
    description: 'Describe EC2 snapshots Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Snapshots as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Snapshot',
    description: 'Create a snapshot of an EBS volume Use it to provision a new resource.',
    tool: awsCreateEc2Snapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Snapshot',
    description: 'Delete an EC2 snapshot Use it to permanently remove the resource.',
    tool: awsDeleteEc2Snapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopyEc2Snapshot',
    description: 'Copy an EBS snapshot to another region Use it to duplicate a resource, optionally across regions.',
    tool: awsCopyEc2Snapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Volumes',
    description: 'Describe EBS volumes Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Volumes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Volume',
    description: 'Create an EBS volume Use it to provision a new resource.',
    tool: awsCreateEc2Volume as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAttachEc2Volume',
    description: 'Attach an EBS volume to an instance Use it to connect resources.',
    tool: awsAttachEc2Volume as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachEc2Volume',
    description: 'Detach an EBS volume from an instance Use it to disconnect resources.',
    tool: awsDetachEc2Volume as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Volume',
    description: 'Delete an EBS volume Use it to permanently remove the resource.',
    tool: awsDeleteEc2Volume as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsModifyEc2Volume',
    description: 'Modify an EBS volume (size, type, IOPS) Use it to change an existing resource.',
    tool: awsModifyEc2Volume as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2SecurityGroups',
    description: 'Describe EC2 security groups Use it to inspect current state before making changes.',
    tool: awsDescribeEc2SecurityGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2SecurityGroup',
    description: 'Create a new security group Use it to provision a new resource.',
    tool: awsCreateEc2SecurityGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2SecurityGroup',
    description: 'Delete a security group Use it to permanently remove the resource.',
    tool: awsDeleteEc2SecurityGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAuthorizeEc2SecurityGroupIngress',
    description: 'Add inbound rules to a security group Use it to grant access.',
    tool: awsAuthorizeEc2SecurityGroupIngress as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRevokeEc2SecurityGroupIngress',
    description: 'Remove inbound rules from a security group Use it to remove access.',
    tool: awsRevokeEc2SecurityGroupIngress as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAuthorizeEc2SecurityGroupEgress',
    description: 'Add outbound rules to a security group Use it to grant access.',
    tool: awsAuthorizeEc2SecurityGroupEgress as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRevokeEc2SecurityGroupEgress',
    description: 'Remove outbound rules from a security group Use it to remove access.',
    tool: awsRevokeEc2SecurityGroupEgress as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2KeyPairs',
    description: 'Describe EC2 key pairs Use it to inspect current state before making changes.',
    tool: awsDescribeEc2KeyPairs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2KeyPair',
    description: 'Create a new key pair Use it to provision a new resource.',
    tool: awsCreateEc2KeyPair as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2KeyPair',
    description: 'Delete a key pair Use it to permanently remove the resource.',
    tool: awsDeleteEc2KeyPair as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsImportEc2KeyPair',
    description: 'Import a public key to create a key pair Use it to provision a new resource.',
    tool: awsImportEc2KeyPair as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Vpcs',
    description: 'Describe VPCs Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Vpcs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Vpc',
    description: 'Create a new VPC Use it to provision a new resource.',
    tool: awsCreateEc2Vpc as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Vpc',
    description: 'Delete a VPC Use it to permanently remove the resource.',
    tool: awsDeleteEc2Vpc as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsModifyEc2VpcAttribute',
    description: 'Modify a VPC attribute Use it to change an existing resource.',
    tool: awsModifyEc2VpcAttribute as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2Subnets',
    description: 'Describe subnets Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Subnets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Subnet',
    description: 'Create a new subnet Use it to provision a new resource.',
    tool: awsCreateEc2Subnet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Subnet',
    description: 'Delete a subnet Use it to permanently remove the resource.',
    tool: awsDeleteEc2Subnet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2NetworkInterfaces',
    description: 'Describe network interfaces Use it to inspect current state before making changes.',
    tool: awsDescribeEc2NetworkInterfaces as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2NetworkInterface',
    description: 'Create a network interface Use it to provision a new resource.',
    tool: awsCreateEc2NetworkInterface as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2NetworkInterface',
    description: 'Delete a network interface Use it to permanently remove the resource.',
    tool: awsDeleteEc2NetworkInterface as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAttachEc2NetworkInterface',
    description: 'Attach a network interface to an instance Use it to connect resources.',
    tool: awsAttachEc2NetworkInterface as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachEc2NetworkInterface',
    description: 'Detach a network interface from an instance Use it to disconnect resources.',
    tool: awsDetachEc2NetworkInterface as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2InternetGateways',
    description: 'Describe internet gateways Use it to inspect current state before making changes.',
    tool: awsDescribeEc2InternetGateways as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2InternetGateway',
    description: 'Create an internet gateway Use it to provision a new resource.',
    tool: awsCreateEc2InternetGateway as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2InternetGateway',
    description: 'Delete an internet gateway Use it to permanently remove the resource.',
    tool: awsDeleteEc2InternetGateway as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAttachEc2InternetGateway',
    description: 'Attach an internet gateway to a VPC Use it to connect resources.',
    tool: awsAttachEc2InternetGateway as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachEc2InternetGateway',
    description: 'Detach an internet gateway from a VPC Use it to disconnect resources.',
    tool: awsDetachEc2InternetGateway as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeEc2RouteTables',
    description: 'Describe route tables Use it to inspect current state before making changes.',
    tool: awsDescribeEc2RouteTables as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2RouteTable',
    description: 'Create a route table Use it to provision a new resource.',
    tool: awsCreateEc2RouteTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2RouteTable',
    description: 'Delete a route table Use it to permanently remove the resource.',
    tool: awsDeleteEc2RouteTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateEc2Route',
    description: 'Create a route in a route table Use it to provision a new resource.',
    tool: awsCreateEc2Route as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Route',
    description: 'Delete a route from a route table Use it to permanently remove the resource.',
    tool: awsDeleteEc2Route as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateEc2RouteTable',
    description: 'Associate a route table with a subnet Use it to connect resources.',
    tool: awsAssociateEc2RouteTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateEc2RouteTable',
    description: 'Disassociate a route table from a subnet Use it to disconnect resources.',
    tool: awsDisassociateEc2RouteTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2NatGateways',
    description: 'Describe NAT gateways Use it to inspect current state before making changes.',
    tool: awsDescribeEc2NatGateways as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2NatGateway',
    description: 'Create a NAT gateway Use it to provision a new resource.',
    tool: awsCreateEc2NatGateway as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2NatGateway',
    description: 'Delete a NAT gateway Use it to permanently remove the resource.',
    tool: awsDeleteEc2NatGateway as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2Addresses',
    description: 'Describe Elastic IP addresses Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Addresses as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAllocateEc2Address',
    description: 'Allocate an Elastic IP address Use it to provision a new resource.',
    tool: awsAllocateEc2Address as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsReleaseEc2Address',
    description: 'Release an Elastic IP address Use it to permanently remove the resource.',
    tool: awsReleaseEc2Address as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateEc2Address',
    description: 'Associate an Elastic IP with an instance Use it to connect resources.',
    tool: awsAssociateEc2Address as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateEc2Address',
    description: 'Disassociate an Elastic IP from an instance Use it to disconnect resources.',
    tool: awsDisassociateEc2Address as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2PlacementGroups',
    description: 'Describe placement groups Use it to inspect current state before making changes.',
    tool: awsDescribeEc2PlacementGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2PlacementGroup',
    description: 'Create a placement group Use it to provision a new resource.',
    tool: awsCreateEc2PlacementGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2PlacementGroup',
    description: 'Delete a placement group Use it to permanently remove the resource.',
    tool: awsDeleteEc2PlacementGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2Tags',
    description: 'Describe tags for EC2 resources Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Tags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2Tags',
    description: 'Create tags for EC2 resources Use it to provision a new resource.',
    tool: awsCreateEc2Tags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2Tags',
    description: 'Delete tags from EC2 resources Use it to permanently remove the resource.',
    tool: awsDeleteEc2Tags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2Regions',
    description: 'Describe available AWS regions Use it to inspect current state before making changes.',
    tool: awsDescribeEc2Regions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2AvailabilityZones',
    description: 'Describe availability zones Use it to inspect current state before making changes.',
    tool: awsDescribeEc2AvailabilityZones as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2AccountAttributes',
    description: 'Describe EC2 account attributes Use it to inspect current state before making changes.',
    tool: awsDescribeEc2AccountAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEc2LaunchTemplates',
    description: 'Describe launch templates Use it to inspect current state before making changes.',
    tool: awsDescribeEc2LaunchTemplates as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEc2LaunchTemplate',
    description: 'Create a launch template Use it to provision a new resource.',
    tool: awsCreateEc2LaunchTemplate as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEc2LaunchTemplate',
    description: 'Delete a launch template Use it to permanently remove the resource.',
    tool: awsDeleteEc2LaunchTemplate as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeEc2LaunchTemplateVersions',
    description: 'Describe launch template versions Use it to inspect current state before making changes.',
    tool: awsDescribeEc2LaunchTemplateVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudwatchMetrics',
    description: 'Retrieve CloudWatch metrics Use it to inspect current state before making changes.',
    tool: awsGetCloudwatchMetrics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetMetricMetadata',
    description: 'Retrieves comprehensive metadata about a specific CloudWatch metric Use it to inspect current state before making changes.',
    tool: awsGetMetricMetadata as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutMetricData',
    description: 'Publish custom metric data points to CloudWatch Use it to publish data or configure the resource.',
    tool: awsPutMetricData as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRecommendedMetricAlarms',
    description: 'Gets recommended alarms for a CloudWatch metric based on best practice, and trend, seasonality and statistical analysis Use it to inspect current state before making changes.',
    tool: awsGetRecommendedMetricAlarms as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAnalyzeMetric',
    description: 'Analyzes CloudWatch metric data to determine trend, seasonality, and statistical properties Use it to analyze trends, patterns, and anomalies.',
    tool: awsAnalyzeMetric as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetAlarmHistory',
    description: 'Retrieves historical state changes and patterns for a given CloudWatch alarm Use it to inspect current state before making changes.',
    tool: awsGetAlarmHistory as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutMetricAlarm',
    description: 'Create or update a CloudWatch metric alarm Use it to publish data or configure the resource.',
    tool: awsPutMetricAlarm as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudwatchAlarms',
    description: 'Delete one or more CloudWatch alarms Use it to permanently remove the resource.',
    tool: awsDeleteCloudwatchAlarms as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSetAlarmState',
    description: 'Temporarily set the state of a CloudWatch alarm Use it to change the state or configuration of the resource.',
    tool: awsSetAlarmState as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateLogGroup',
    description: 'Create a new CloudWatch log group Use it to provision a new resource.',
    tool: awsCreateLogGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLogGroup',
    description: 'Delete a CloudWatch log group Use it to permanently remove the resource.',
    tool: awsDeleteLogGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeLogStreams',
    description: 'List log streams in a log group Use it to inspect current state before making changes.',
    tool: awsDescribeLogStreams as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLogStream',
    description: 'Create a new log stream in a log group Use it to provision a new resource.',
    tool: awsCreateLogStream as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetLogEvents',
    description: 'Retrieve log events from a log stream Use it to inspect current state before making changes.',
    tool: awsGetLogEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLogEvents',
    description: 'Upload log events to a log stream Use it to publish data or configure the resource.',
    tool: awsPutLogEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutRetentionPolicy',
    description: 'Set retention policy for a log group Use it to publish data or configure the resource.',
    tool: awsPutRetentionPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAnalyzeLogGroup',
    description: 'Analyzes CloudWatch logs for anomalies, message patterns, and error patterns Use it to analyze trends, patterns, and anomalies.',
    tool: awsAnalyzeLogGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsExecuteLogInsightsQuery',
    description: 'Executes CloudWatch Logs insights query on CloudWatch log group(s) with specified time range and query syntax, returns a unique ID used to retrieve results Use it to start a query, then poll for results with the query ID.',
    tool: awsExecuteLogInsightsQuery as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetLogsInsightQueryResults',
    description: 'Retrieves the results of an executed CloudWatch insights query using the query ID. It is used after execute_log_insights_query has been called Use it to inspect current state before making changes.',
    tool: awsGetLogsInsightQueryResults as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCancelLogsInsightQuery',
    description: 'Cancels in progress CloudWatch logs insights query Use it to stop a running query.',
    tool: awsCancelLogsInsightQuery as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListS3Buckets',
    description: 'List all S3 buckets in your AWS account Use it to inspect current state before making changes.',
    tool: awsListS3Buckets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateS3Bucket',
    description: 'Create a new S3 bucket Use it to provision a new resource.',
    tool: awsCreateS3Bucket as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3Bucket',
    description: 'Delete an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3Bucket as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCheckS3BucketExists',
    description: 'Check if an S3 bucket exists Use it to inspect current state before making changes.',
    tool: awsCheckS3BucketExists as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListS3Objects',
    description: 'List objects in an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3Objects as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3Object',
    description: 'Retrieve an object from S3 Use it to inspect current state before making changes.',
    tool: awsGetS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUploadS3Object',
    description: 'Upload an object to S3 Use it to store data.',
    tool: awsUploadS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3Object',
    description: 'Delete an object from S3 Use it to permanently remove the resource.',
    tool: awsDeleteS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopyS3Object',
    description: 'Copy an object from one S3 location to another Use it to duplicate data.',
    tool: awsCopyS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsHeadS3Object',
    description: 'Retrieve metadata about an S3 object without returning the object itself',
    tool: awsHeadS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListLambdaFunctions',
    description: 'List all Lambda functions in your AWS account Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaFunction',
    description: 'Get details about a Lambda function including code location Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsInvokeLambdaFunction',
    description: 'Invoke a Lambda function synchronously or asynchronously Use it to execute the function.',
    tool: awsInvokeLambdaFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateLambdaFunction',
    description: 'Create a new Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionCode',
    description: 'Update the code of a Lambda function Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionCode as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionConfiguration',
    description: 'Update configuration settings of a Lambda function Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunction',
    description: 'Delete a Lambda function Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaFunctionVersions',
    description: 'List all versions of a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListDynamodbTables',
    description: 'List all DynamoDB tables in the region Use it to inspect current state before making changes.',
    tool: awsListDynamodbTables as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeDynamodbTable',
    description: 'Get detailed information about a DynamoDB table including schema, status, and metrics Use it to inspect current state before making changes.',
    tool: awsDescribeDynamodbTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDynamodbTable',
    description: 'Create a new DynamoDB table with attributes and keys Use it to provision a new resource.',
    tool: awsCreateDynamodbTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateDynamodbTable',
    description: 'Modify DynamoDB table settings (capacity, TTL, streams, PITR) Use it to change an existing resource.',
    tool: awsUpdateDynamodbTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDynamodbTable',
    description: 'Delete a DynamoDB table Use it to permanently remove the resource.',
    tool: awsDeleteDynamodbTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDynamodbGetItem',
    description: 'Retrieve a single item from DynamoDB table by primary key. Use it to inspect current state before making changes.',
    tool: awsDynamodbGetItem as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbPutItem',
    description: 'Create or replace an item in DynamoDB table. Use it to write data.',
    tool: awsDynamodbPutItem as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDynamodbUpdateItem',
    description: 'Update specific attributes of an item in DynamoDB. Use it to change an existing resource.',
    tool: awsDynamodbUpdateItem as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDynamodbDeleteItem',
    description: 'Delete an item from DynamoDB table. Use it to permanently remove the resource.',
    tool: awsDynamodbDeleteItem as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDynamodbQuery',
    description: 'Query DynamoDB table by partition key with optional sort key conditions. Use it to inspect current state before making changes.',
    tool: awsDynamodbQuery as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbScan',
    description: 'Scan entire DynamoDB table (use with caution on large tables). Use it to inspect current state before making changes.',
    tool: awsDynamodbScan as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbBatchGetItem',
    description: 'Retrieve up to 100 items from one or more DynamoDB tables. Use it to inspect current state before making changes.',
    tool: awsDynamodbBatchGetItem as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDynamodbBatchWriteItem',
    description: 'Write or delete up to 25 items across one or more DynamoDB tables. Use it to write data.',
    tool: awsDynamodbBatchWriteItem as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateSqsQueue',
    description: 'Create a new SQS queue Use it to provision a new resource.',
    tool: awsCreateSqsQueue as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSqsQueues',
    description: 'List all SQS queues Use it to inspect current state before making changes.',
    tool: awsListSqsQueues as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSqsQueueUrl',
    description: 'Get the URL of an SQS queue Use it to inspect current state before making changes.',
    tool: awsGetSqsQueueUrl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSqsQueueAttributes',
    description: 'Get attributes of an SQS queue Use it to inspect current state before making changes.',
    tool: awsGetSqsQueueAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSqsQueueAttributes',
    description: 'Set attributes of an SQS queue Use it to change the configuration of the resource.',
    tool: awsSetSqsQueueAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSqsQueue',
    description: 'Delete an SQS queue Use it to permanently remove the resource.',
    tool: awsDeleteSqsQueue as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPurgeSqsQueue',
    description: 'Delete all messages in an SQS queue Use it to permanently remove all messages (cannot be undone).',
    tool: awsPurgeSqsQueue as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSendSqsMessage',
    description: 'Send a message to an SQS queue Use it to send a message.',
    tool: awsSendSqsMessage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsSendSqsMessageBatch',
    description: 'Send multiple messages to an SQS queue in a batch Use it to send a message.',
    tool: awsSendSqsMessageBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsReceiveSqsMessages',
    description: 'Receive messages from an SQS queue Use it to poll for new messages.',
    tool: awsReceiveSqsMessages as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteSqsMessage',
    description: 'Delete a message from an SQS queue Use it to permanently remove the resource.',
    tool: awsDeleteSqsMessage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDeleteSqsMessageBatch',
    description: 'Delete multiple messages from an SQS queue in a batch Use it to permanently remove the resource.',
    tool: awsDeleteSqsMessageBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsChangeSqsMessageVisibility',
    description: 'Change the visibility timeout of a message Use it to change the configuration of the resource.',
    tool: awsChangeSqsMessageVisibility as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsChangeSqsMessageVisibilityBatch',
    description: 'Change the visibility timeout of multiple messages in a batch Use it to change the configuration of the resource.',
    tool: awsChangeSqsMessageVisibilityBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAddSqsPermission',
    description: 'Add a permission to an SQS queue Use it to grant access or attach configuration.',
    tool: awsAddSqsPermission as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveSqsPermission',
    description: 'Remove a permission from an SQS queue',
    tool: awsRemoveSqsPermission as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListSqsQueueTags',
    description: 'List tags for an SQS queue Use it to inspect current state before making changes.',
    tool: awsListSqsQueueTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagSqsQueue',
    description: 'Add tags to an SQS queue Use it to label the resource.',
    tool: awsTagSqsQueue as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagSqsQueue',
    description: 'Remove tags from an SQS queue',
    tool: awsUntagSqsQueue as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateSnsTopic',
    description: 'Create a new SNS topic Use it to provision a new resource.',
    tool: awsCreateSnsTopic as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsTopics',
    description: 'List all SNS topics Use it to inspect current state before making changes.',
    tool: awsListSnsTopics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSnsTopicAttributes',
    description: 'Get attributes of an SNS topic Use it to inspect current state before making changes.',
    tool: awsGetSnsTopicAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteSnsTopic',
    description: 'Delete an SNS topic Use it to permanently remove the resource.',
    tool: awsDeleteSnsTopic as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSubscribeSnsTopic',
    description: 'Subscribe to an SNS topic Use it to subscribe an endpoint.',
    tool: awsSubscribeSnsTopic as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUnsubscribeSnsTopic',
    description: 'Unsubscribe from an SNS topic Use it to remove a subscription.',
    tool: awsUnsubscribeSnsTopic as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPublishSnsMessage',
    description: 'Publish a message to an SNS topic Use it to publish a message.',
    tool: awsPublishSnsMessage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsSubscriptions',
    description: 'List all SNS subscriptions Use it to inspect current state before making changes.',
    tool: awsListSnsSubscriptions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListSnsSubscriptionsByTopic',
    description: 'List subscriptions for a specific topic Use it to inspect current state before making changes.',
    tool: awsListSnsSubscriptionsByTopic as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketVersioning',
    description: 'Get the versioning configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketVersioning as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketVersioning',
    description: 'Set the versioning configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketVersioning as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketPolicy',
    description: 'Get the bucket policy for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketPolicy',
    description: 'Set the bucket policy for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketPolicy',
    description: 'Delete the bucket policy for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketTagging',
    description: 'Get tags for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketTagging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketTagging',
    description: 'Set tags for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketTagging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketTagging',
    description: 'Delete tags from an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketTagging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketCors',
    description: 'Get the CORS configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketCors as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketCors',
    description: 'Set the CORS configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketCors as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketCors',
    description: 'Delete the CORS configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketCors as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketEncryption',
    description: 'Get the encryption configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketEncryption as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketEncryption',
    description: 'Set the encryption configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketEncryption as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketEncryption',
    description: 'Delete the encryption configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketEncryption as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketLifecycle',
    description: 'Get the lifecycle configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketLifecycle as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketLifecycle',
    description: 'Set the lifecycle configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketLifecycle as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketLifecycle',
    description: 'Delete the lifecycle configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketLifecycle as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketWebsite',
    description: 'Get the website configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketWebsite as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketWebsite',
    description: 'Set the website configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketWebsite as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketWebsite',
    description: 'Delete the website configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketWebsite as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketLogging',
    description: 'Get the logging configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketLogging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketLogging',
    description: 'Set the logging configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketLogging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketNotification',
    description: 'Get the notification configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketNotification as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketNotification',
    description: 'Set the notification configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketNotification as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketReplication',
    description: 'Get the replication configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketReplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketReplication',
    description: 'Set the replication configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketReplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketReplication',
    description: 'Delete the replication configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketReplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListS3ObjectVersions',
    description: 'List all versions of objects in an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3ObjectVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteS3Objects',
    description: 'Delete multiple objects from S3 in a single request Use it to permanently remove the resource.',
    tool: awsDeleteS3Objects as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateS3MultipartUpload',
    description: 'Initiate a multipart upload to S3 Use it to provision a new resource.',
    tool: awsCreateS3MultipartUpload as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUploadS3Part',
    description: 'Upload a part in a multipart upload Use it to store data.',
    tool: awsUploadS3Part as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCompleteS3MultipartUpload',
    description: 'Complete a multipart upload',
    tool: awsCompleteS3MultipartUpload as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAbortS3MultipartUpload',
    description: 'Abort a multipart upload',
    tool: awsAbortS3MultipartUpload as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListS3MultipartUploads',
    description: 'List in-progress multipart uploads Use it to inspect current state before making changes.',
    tool: awsListS3MultipartUploads as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListS3Parts',
    description: 'List parts that have been uploaded for a multipart upload Use it to inspect current state before making changes.',
    tool: awsListS3Parts as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3ObjectTagging',
    description: 'Get tags for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectTagging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectTagging',
    description: 'Set tags for an S3 object Use it to write data or configuration.',
    tool: awsPutS3ObjectTagging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3ObjectTagging',
    description: 'Delete tags from an S3 object Use it to permanently remove the resource.',
    tool: awsDeleteS3ObjectTagging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3ObjectAcl',
    description: 'Get the ACL (Access Control List) for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectAcl',
    description: 'Set the ACL (Access Control List) for an S3 object Use it to write data or configuration.',
    tool: awsPutS3ObjectAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketAcl',
    description: 'Get the ACL (Access Control List) for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketAcl',
    description: 'Set the ACL (Access Control List) for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3PublicAccessBlock',
    description: 'Get public access block configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3PublicAccessBlock as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3PublicAccessBlock',
    description: 'Set public access block configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3PublicAccessBlock as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3PublicAccessBlock',
    description: 'Delete public access block configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3PublicAccessBlock as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLambdaFunctionConfiguration',
    description: 'Get configuration details of a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPublishLambdaFunctionVersion',
    description: 'Publish a new version of a Lambda function Use it to publish or release.',
    tool: awsPublishLambdaFunctionVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListLambdaFunctionAliases',
    description: 'List all aliases for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionAliases as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaFunctionAlias',
    description: 'Get details about a Lambda function alias Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLambdaFunctionAlias',
    description: 'Create an alias for a Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaFunctionAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionAlias',
    description: 'Update a Lambda function alias Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunctionAlias',
    description: 'Delete a Lambda function alias Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunctionAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLambdaFunctionPolicy',
    description: 'Get the resource-based policy for a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAddLambdaFunctionPermission',
    description: 'Add a permission to a Lambda function resource-based policy Use it to grant access or attach configuration.',
    tool: awsAddLambdaFunctionPermission as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveLambdaFunctionPermission',
    description: 'Remove a permission from a Lambda function resource-based policy Use it to remove access or configuration.',
    tool: awsRemoveLambdaFunctionPermission as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaEventSourceMappings',
    description: 'List event source mappings for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaEventSourceMappings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLambdaEventSourceMapping',
    description: 'Create an event source mapping for a Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaEventSourceMapping as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaEventSourceMapping',
    description: 'Update an event source mapping configuration Use it to change an existing resource.',
    tool: awsUpdateLambdaEventSourceMapping as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaEventSourceMapping',
    description: 'Delete an event source mapping Use it to permanently remove the resource.',
    tool: awsDeleteLambdaEventSourceMapping as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaFunctionEventInvokeConfigs',
    description: 'List async invocation configurations for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionEventInvokeConfigs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaFunctionEventInvokeConfig',
    description: 'Get async invocation configuration for a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionEventInvokeConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLambdaFunctionEventInvokeConfig',
    description: 'Configure async invocation settings for a Lambda function Use it to write data or configuration.',
    tool: awsPutLambdaFunctionEventInvokeConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunctionEventInvokeConfig',
    description: 'Delete async invocation configuration for a Lambda function Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunctionEventInvokeConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaLayers',
    description: 'List Lambda layers Use it to inspect current state before making changes.',
    tool: awsListLambdaLayers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListLambdaLayerVersions',
    description: 'List versions of a Lambda layer Use it to inspect current state before making changes.',
    tool: awsListLambdaLayerVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaLayerVersion',
    description: 'Get details about a specific Lambda layer version Use it to inspect current state before making changes.',
    tool: awsGetLambdaLayerVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListLambdaProvisionedConcurrencyConfigs',
    description: 'List provisioned concurrency configurations for a function Use it to inspect current state before making changes.',
    tool: awsListLambdaProvisionedConcurrencyConfigs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetLambdaProvisionedConcurrencyConfig',
    description: 'Get provisioned concurrency configuration for a function version Use it to inspect current state before making changes.',
    tool: awsGetLambdaProvisionedConcurrencyConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLambdaProvisionedConcurrencyConfig',
    description: 'Configure provisioned concurrency for a function version Use it to write data or configuration.',
    tool: awsPutLambdaProvisionedConcurrencyConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaProvisionedConcurrencyConfig',
    description: 'Delete provisioned concurrency configuration Use it to permanently remove the resource.',
    tool: awsDeleteLambdaProvisionedConcurrencyConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLambdaFunctionTags',
    description: 'List tags for a Lambda function Use it to inspect current state before making changes.',
    tool: awsListLambdaFunctionTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagLambdaFunction',
    description: 'Add tags to a Lambda function Use it to label the resource.',
    tool: awsTagLambdaFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagLambdaFunction',
    description: 'Remove tags from a Lambda function Use it to remove tags from the resource.',
    tool: awsUntagLambdaFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLambdaFunctionUrlConfig',
    description: 'Get function URL configuration for a Lambda function Use it to inspect current state before making changes.',
    tool: awsGetLambdaFunctionUrlConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateLambdaFunctionUrlConfig',
    description: 'Create a function URL for a Lambda function Use it to provision a new resource.',
    tool: awsCreateLambdaFunctionUrlConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateLambdaFunctionUrlConfig',
    description: 'Update function URL configuration Use it to change an existing resource.',
    tool: awsUpdateLambdaFunctionUrlConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLambdaFunctionUrlConfig',
    description: 'Delete function URL configuration Use it to permanently remove the resource.',
    tool: awsDeleteLambdaFunctionUrlConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListDynamodbBackups',
    description: 'List on-demand backups for DynamoDB tables Use it to inspect current state before making changes.',
    tool: awsListDynamodbBackups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeDynamodbBackup',
    description: 'Get details about a specific DynamoDB backup Use it to inspect current state before making changes.',
    tool: awsDescribeDynamodbBackup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDynamodbBackup',
    description: 'Create an on-demand backup of a DynamoDB table Use it to provision a new resource.',
    tool: awsCreateDynamodbBackup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDynamodbBackup',
    description: 'Delete an on-demand DynamoDB backup Use it to permanently remove the resource.',
    tool: awsDeleteDynamodbBackup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRestoreDynamodbTableFromBackup',
    description: 'Restore a DynamoDB table from a backup Use it to restore from a backup.',
    tool: awsRestoreDynamodbTableFromBackup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeContinuousBackups',
    description: 'Check Point-in-Time Recovery (PITR) status for a DynamoDB table Use it to inspect current state before making changes.',
    tool: awsDescribeContinuousBackups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateContinuousBackups',
    description: 'Enable or disable Point-in-Time Recovery (PITR) for a DynamoDB table Use it to change an existing resource.',
    tool: awsUpdateContinuousBackups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeGlobalTable',
    description: 'Get details about a DynamoDB Global Table Use it to inspect current state before making changes.',
    tool: awsDescribeGlobalTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateGlobalTable',
    description: 'Create a multi-region DynamoDB Global Table Use it to provision a new resource.',
    tool: awsCreateGlobalTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateGlobalTable',
    description: 'Add or remove regions from a DynamoDB Global Table Use it to change an existing resource.',
    tool: awsUpdateGlobalTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeTimeToLive',
    description: 'Get Time To Live (TTL) configuration for a DynamoDB table Use it to inspect current state before making changes.',
    tool: awsDescribeTimeToLive as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateTimeToLive',
    description: 'Enable or disable Time To Live (TTL) for a DynamoDB table Use it to change an existing resource.',
    tool: awsUpdateTimeToLive as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListDynamodbTags',
    description: 'List tags for a DynamoDB table Use it to inspect current state before making changes.',
    tool: awsListDynamodbTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagDynamodbResource',
    description: 'Add tags to a DynamoDB table Use it to label the resource.',
    tool: awsTagDynamodbResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagDynamodbResource',
    description: 'Remove tags from a DynamoDB table Use it to remove tags from the resource.',
    tool: awsUntagDynamodbResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsSetSnsTopicAttributes',
    description: 'Set attributes of an SNS topic Use it to change the configuration of the resource.',
    tool: awsSetSnsTopicAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetSnsSubscriptionAttributes',
    description: 'Get attributes of an SNS subscription Use it to inspect current state before making changes.',
    tool: awsGetSnsSubscriptionAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsSubscriptionAttributes',
    description: 'Set attributes of an SNS subscription Use it to change the configuration of the resource.',
    tool: awsSetSnsSubscriptionAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsConfirmSnsSubscription',
    description: 'Confirm an SNS subscription (for HTTP/HTTPS) Use it to confirm a pending subscription.',
    tool: awsConfirmSnsSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPublishSnsBatch',
    description: 'Publish multiple messages to an SNS topic in a batch Use it to publish or release.',
    tool: awsPublishSnsBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateSnsPlatformApplication',
    description: 'Create a platform application for push notifications Use it to provision a new resource.',
    tool: awsCreateSnsPlatformApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsPlatformApplications',
    description: 'List all platform applications Use it to inspect current state before making changes.',
    tool: awsListSnsPlatformApplications as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSnsPlatformApplicationAttributes',
    description: 'Get attributes of a platform application Use it to inspect current state before making changes.',
    tool: awsGetSnsPlatformApplicationAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsPlatformApplicationAttributes',
    description: 'Set attributes of a platform application Use it to change the configuration of the resource.',
    tool: awsSetSnsPlatformApplicationAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSnsPlatformApplication',
    description: 'Delete a platform application Use it to permanently remove the resource.',
    tool: awsDeleteSnsPlatformApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateSnsPlatformEndpoint',
    description: 'Create a platform endpoint for push notifications Use it to provision a new resource.',
    tool: awsCreateSnsPlatformEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListSnsEndpointsByPlatformApplication',
    description: 'List endpoints for a platform application Use it to inspect current state before making changes.',
    tool: awsListSnsEndpointsByPlatformApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSnsEndpointAttributes',
    description: 'Get attributes of a platform endpoint Use it to inspect current state before making changes.',
    tool: awsGetSnsEndpointAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsEndpointAttributes',
    description: 'Set attributes of a platform endpoint Use it to change the configuration of the resource.',
    tool: awsSetSnsEndpointAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSnsEndpoint',
    description: 'Delete a platform endpoint Use it to permanently remove the resource.',
    tool: awsDeleteSnsEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCheckSnsPhoneOptedOut',
    description: 'Check if a phone number is opted out of SMS Use it to inspect current state before making changes.',
    tool: awsCheckSnsPhoneOptedOut as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListSnsOptedOutPhoneNumbers',
    description: 'List phone numbers opted out of SMS Use it to inspect current state before making changes.',
    tool: awsListSnsOptedOutPhoneNumbers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsOptInSnsPhoneNumber',
    description: 'Opt in a phone number to receive SMS Use it to manage SMS opt-in status.',
    tool: awsOptInSnsPhoneNumber as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetSnsSmsAttributes',
    description: 'Get SMS attributes for the account Use it to inspect current state before making changes.',
    tool: awsGetSnsSmsAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetSnsSmsAttributes',
    description: 'Set SMS attributes for the account Use it to change the configuration of the resource.',
    tool: awsSetSnsSmsAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAddSnsPermission',
    description: 'Add a permission to an SNS topic Use it to grant access or attach configuration.',
    tool: awsAddSnsPermission as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveSnsPermission',
    description: 'Remove a permission from an SNS topic Use it to remove access or configuration.',
    tool: awsRemoveSnsPermission as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListSnsTags',
    description: 'List tags for an SNS resource Use it to inspect current state before making changes.',
    tool: awsListSnsTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagSnsResource',
    description: 'Add tags to an SNS resource Use it to label the resource.',
    tool: awsTagSnsResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagSnsResource',
    description: 'Remove tags from an SNS resource Use it to remove tags from the resource.',
    tool: awsUntagSnsResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListIamUsers',
    description: 'List all IAM users in the AWS account Use it to inspect current state before making changes.',
    tool: awsListIamUsers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamUser',
    description: 'Get detailed information about a specific IAM user Use it to inspect current state before making changes.',
    tool: awsGetIamUser as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListIamRoles',
    description: 'List all IAM roles in the AWS account Use it to inspect current state before making changes.',
    tool: awsListIamRoles as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamRole',
    description: 'Get detailed information about a specific IAM role Use it to inspect current state before making changes.',
    tool: awsGetIamRole as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListIamPolicies',
    description: 'List all customer managed and AWS managed policies Use it to inspect current state before making changes.',
    tool: awsListIamPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamPolicy',
    description: 'Get metadata about a managed policy Use it to inspect current state before making changes.',
    tool: awsGetIamPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetPolicyVersion',
    description: 'Get the content of a specific policy version Use it to inspect current state before making changes.',
    tool: awsGetPolicyVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListPolicyVersions',
    description: 'List all versions of a policy Use it to inspect current state before making changes.',
    tool: awsListPolicyVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListIamGroups',
    description: 'List all IAM groups in the AWS account Use it to inspect current state before making changes.',
    tool: awsListIamGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetIamGroup',
    description: 'Get detailed information about a specific IAM group Use it to inspect current state before making changes.',
    tool: awsGetIamGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListAttachedRolePolicies',
    description: 'List all managed policies attached to an IAM role Use it to inspect current state before making changes.',
    tool: awsListAttachedRolePolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetAccountPasswordPolicy',
    description: 'Get the password policy for the AWS account Use it to inspect current state before making changes.',
    tool: awsGetAccountPasswordPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListS3DirectoryBuckets',
    description: 'List S3 directory buckets Use it to inspect current state before making changes.',
    tool: awsListS3DirectoryBuckets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketLocation',
    description: 'Get the AWS region where an S3 bucket is located Use it to inspect current state before making changes.',
    tool: awsGetS3BucketLocation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketPolicyStatus',
    description: 'Get the policy status for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketPolicyStatus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListS3ObjectsV1',
    description: 'List objects in an S3 bucket (v1 API) Use it to inspect current state before making changes.',
    tool: awsListS3ObjectsV1 as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3ObjectAttributes',
    description: 'Retrieve attributes of an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3ObjectTorrent',
    description: 'Get a torrent file for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectTorrent as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRenameS3Object',
    description: 'Rename an S3 object by copying and deleting Use it to rename an object (copy then delete).',
    tool: awsRenameS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUploadS3PartCopy',
    description: 'Upload a part by copying data from an existing object Use it to store data.',
    tool: awsUploadS3PartCopy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketRequestPayment',
    description: 'Get the request payer configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketRequestPayment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketRequestPayment',
    description: 'Set the request payer configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketRequestPayment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketOwnershipControls',
    description: 'Get the ownership controls for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketOwnershipControls as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketOwnershipControls',
    description: 'Set the ownership controls for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketOwnershipControls as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketOwnershipControls',
    description: 'Delete the ownership controls for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketOwnershipControls as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketAccelerate',
    description: 'Get the transfer acceleration configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketAccelerate as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketAccelerate',
    description: 'Set the transfer acceleration configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketAccelerate as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketIntelligentTiering',
    description: 'Get intelligent tiering configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketIntelligentTiering as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketIntelligentTiering',
    description: 'Set intelligent tiering configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketIntelligentTiering as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketIntelligentTiering',
    description: 'Delete intelligent tiering configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketIntelligentTiering as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListS3BucketIntelligentTiering',
    description: 'List intelligent tiering configurations for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3BucketIntelligentTiering as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketInventory',
    description: 'Get inventory configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketInventory as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketInventory',
    description: 'Set inventory configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketInventory as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketInventory',
    description: 'Delete inventory configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketInventory as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListS3BucketInventory',
    description: 'List inventory configurations for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3BucketInventory as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketMetrics',
    description: 'Get metrics configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketMetrics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketMetrics',
    description: 'Set metrics configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketMetrics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketMetrics',
    description: 'Delete metrics configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketMetrics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListS3BucketMetrics',
    description: 'List metrics configurations for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3BucketMetrics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketAnalytics',
    description: 'Get analytics configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketAnalytics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3BucketAnalytics',
    description: 'Set analytics configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3BucketAnalytics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketAnalytics',
    description: 'Delete analytics configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketAnalytics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListS3BucketAnalytics',
    description: 'List analytics configurations for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsListS3BucketAnalytics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3BucketMetadataConfig',
    description: 'Get metadata configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketMetadataConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateS3BucketMetadataConfig',
    description: 'Create metadata configuration for an S3 bucket Use it to provision a new resource.',
    tool: awsCreateS3BucketMetadataConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketMetadataConfig',
    description: 'Delete metadata configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketMetadataConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetS3BucketMetadataTable',
    description: 'Get metadata table configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketMetadataTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateS3BucketMetadataTable',
    description: 'Create metadata table configuration for an S3 bucket Use it to provision a new resource.',
    tool: awsCreateS3BucketMetadataTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteS3BucketMetadataTable',
    description: 'Delete metadata table configuration for an S3 bucket Use it to permanently remove the resource.',
    tool: awsDeleteS3BucketMetadataTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateS3BucketMetadataInventoryTable',
    description: 'Update metadata inventory table configuration for an S3 bucket Use it to change an existing resource.',
    tool: awsUpdateS3BucketMetadataInventoryTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateS3BucketMetadataJournalTable',
    description: 'Update metadata journal table configuration for an S3 bucket Use it to change an existing resource.',
    tool: awsUpdateS3BucketMetadataJournalTable as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3BucketAbac',
    description: 'Get ABAC (Attribute-Based Access Control) configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3BucketAbac as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetS3ObjectLegalHold',
    description: 'Get legal hold status for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectLegalHold as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectLegalHold',
    description: 'Set legal hold status for an S3 object Use it to write data or configuration.',
    tool: awsPutS3ObjectLegalHold as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3ObjectRetention',
    description: 'Get retention configuration for an S3 object Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectRetention as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectRetention',
    description: 'Set retention configuration for an S3 object Use it to write data or configuration.',
    tool: awsPutS3ObjectRetention as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetS3ObjectLockConfig',
    description: 'Get object lock configuration for an S3 bucket Use it to inspect current state before making changes.',
    tool: awsGetS3ObjectLockConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutS3ObjectLockConfig',
    description: 'Set object lock configuration for an S3 bucket Use it to write data or configuration.',
    tool: awsPutS3ObjectLockConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRestoreS3Object',
    description: 'Restore an archived S3 object from Glacier or Deep Archive Use it to restore data.',
    tool: awsRestoreS3Object as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsSelectS3ObjectContent',
    description: 'Select content from an S3 object using SQL expressions Use it to query object content.',
    tool: awsSelectS3ObjectContent as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsWriteS3GetObjectResponse',
    description: 'Write a response to a GetObject request (used with S3 Object Lambda)',
    tool: awsWriteS3GetObjectResponse as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateS3Session',
    description: 'Create a session for S3 operations Use it to provision a new resource.',
    tool: awsCreateS3Session as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateIamUser',
    description: 'Create a new IAM user Use it to provision a new resource.',
    tool: awsCreateIamUser as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteIamUser',
    description: 'Delete an IAM user (user must not have any access keys, signing certificates, or MFA devices) Use it to permanently remove the resource.',
    tool: awsDeleteIamUser as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateIamUser',
    description: 'Update the name or path of an IAM user Use it to change an existing resource.',
    tool: awsUpdateIamUser as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateIamRole',
    description: 'Create a new IAM role with a trust policy Use it to provision a new resource.',
    tool: awsCreateIamRole as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteIamRole',
    description: 'Delete an IAM role (role must not have any attached policies) Use it to permanently remove the resource.',
    tool: awsDeleteIamRole as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateAssumeRolePolicy',
    description: 'Update the trust policy of an IAM role Use it to change an existing resource.',
    tool: awsUpdateAssumeRolePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAttachRolePolicy',
    description: 'Attach a managed policy to an IAM role Use it to attach a policy or resource.',
    tool: awsAttachRolePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachRolePolicy',
    description: 'Detach a managed policy from an IAM role Use it to detach or remove access.',
    tool: awsDetachRolePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateIamPolicy',
    description: 'Create a new customer managed policy Use it to provision a new resource.',
    tool: awsCreateIamPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteIamPolicy',
    description: 'Delete a customer managed policy Use it to permanently remove the resource.',
    tool: awsDeleteIamPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreatePolicyVersion',
    description: 'Create a new version of a customer managed policy Use it to provision a new resource.',
    tool: awsCreatePolicyVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateIamGroup',
    description: 'Create a new IAM group Use it to provision a new resource.',
    tool: awsCreateIamGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteIamGroup',
    description: 'Delete an IAM group (group must not contain any users) Use it to permanently remove the resource.',
    tool: awsDeleteIamGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAddUserToGroup',
    description: 'Add an IAM user to a group Use it to grant access or attach configuration.',
    tool: awsAddUserToGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveUserFromGroup',
    description: 'Remove an IAM user from a group Use it to remove access or configuration.',
    tool: awsRemoveUserFromGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAttachGroupPolicy',
    description: 'Attach a managed policy to an IAM group Use it to attach a policy or resource.',
    tool: awsAttachGroupPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachGroupPolicy',
    description: 'Detach a managed policy from an IAM group Use it to detach or remove access.',
    tool: awsDetachGroupPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListAccessKeys',
    description: 'List access keys for an IAM user Use it to inspect current state before making changes.',
    tool: awsListAccessKeys as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateAccessKey',
    description: 'Create a new access key for an IAM user Use it to provision a new resource.',
    tool: awsCreateAccessKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteAccessKey',
    description: 'Delete an access key for an IAM user Use it to permanently remove the resource.',
    tool: awsDeleteAccessKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateAccessKey',
    description: 'Update the status of an access key (activate or deactivate) Use it to change an existing resource.',
    tool: awsUpdateAccessKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateAccountPasswordPolicy',
    description: 'Update the password policy for the AWS account Use it to change an existing resource.',
    tool: awsUpdateAccountPasswordPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListMfaDevices',
    description: 'List MFA devices for an IAM user Use it to inspect current state before making changes.',
    tool: awsListMfaDevices as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsEnableMfaDevice',
    description: 'Enable an MFA device for an IAM user Use it to enable a feature.',
    tool: awsEnableMfaDevice as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeactivateMfaDevice',
    description: 'Deactivate an MFA device for an IAM user',
    tool: awsDeactivateMfaDevice as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutS3BucketAbac',
    description: 'Set ABAC (Attribute-Based Access Control) status for an S3 general purpose bucket. When enabled, bucket tags can be used for access control. Use it to write data or configuration.',
    tool: awsPutS3BucketAbac as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEcsClusters',
    description: 'List all ECS clusters in your AWS account Use it to inspect current state before making changes.',
    tool: awsListEcsClusters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsClusters',
    description: 'Get details about one or more ECS clusters Use it to inspect current state before making changes.',
    tool: awsDescribeEcsClusters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEcsCluster',
    description: 'Create a new ECS cluster Use it to provision a new resource.',
    tool: awsCreateEcsCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEcsCluster',
    description: 'Update an existing ECS cluster Use it to change an existing resource.',
    tool: awsUpdateEcsCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEcsClusterSettings',
    description: 'Update cluster settings Use it to change an existing resource.',
    tool: awsUpdateEcsClusterSettings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEcsCluster',
    description: 'Delete an ECS cluster Use it to permanently remove the resource.',
    tool: awsDeleteEcsCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEcsServices',
    description: 'List all services in an ECS cluster Use it to inspect current state before making changes.',
    tool: awsListEcsServices as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsServices',
    description: 'Get details about one or more ECS services Use it to inspect current state before making changes.',
    tool: awsDescribeEcsServices as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEcsService',
    description: 'Create a new ECS service Use it to provision a new resource.',
    tool: awsCreateEcsService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEcsService',
    description: 'Update an existing ECS service Use it to change an existing resource.',
    tool: awsUpdateEcsService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEcsService',
    description: 'Delete an ECS service Use it to permanently remove the resource.',
    tool: awsDeleteEcsService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEcsTasks',
    description: 'List all tasks in an ECS cluster or service Use it to inspect current state before making changes.',
    tool: awsListEcsTasks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsTasks',
    description: 'Get details about one or more ECS tasks Use it to inspect current state before making changes.',
    tool: awsDescribeEcsTasks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRunEcsTask',
    description: 'Run a new task in an ECS cluster Use it to launch workloads.',
    tool: awsRunEcsTask as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopEcsTask',
    description: 'Stop a running ECS task Use it to stop a running resource (billable config may remain).',
    tool: awsStopEcsTask as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsStartEcsTask',
    description: 'Start a stopped ECS task Use it to start a stopped resource.',
    tool: awsStartEcsTask as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEcsTaskDefinitions',
    description: 'List all task definitions Use it to inspect current state before making changes.',
    tool: awsListEcsTaskDefinitions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsTaskDefinition',
    description: 'Get details about a task definition Use it to inspect current state before making changes.',
    tool: awsDescribeEcsTaskDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRegisterEcsTaskDefinition',
    description: 'Register a new task definition Use it to provision a new resource.',
    tool: awsRegisterEcsTaskDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeregisterEcsTaskDefinition',
    description: 'Deregister a task definition Use it to permanently remove the resource.',
    tool: awsDeregisterEcsTaskDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEcsContainerInstances',
    description: 'List all container instances in an ECS cluster Use it to inspect current state before making changes.',
    tool: awsListEcsContainerInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsContainerInstances',
    description: 'Get details about one or more container instances Use it to inspect current state before making changes.',
    tool: awsDescribeEcsContainerInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateEcsContainerInstancesState',
    description: 'Update the state of container instances Use it to change an existing resource.',
    tool: awsUpdateEcsContainerInstancesState as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEcsCapacityProviders',
    description: 'List all capacity providers (uses DescribeCapacityProvidersCommand) Use it to inspect current state before making changes.',
    tool: awsListEcsCapacityProviders as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsCapacityProviders',
    description: 'Get details about one or more capacity providers Use it to inspect current state before making changes.',
    tool: awsDescribeEcsCapacityProviders as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEcsCapacityProvider',
    description: 'Create a new capacity provider Use it to provision a new resource.',
    tool: awsCreateEcsCapacityProvider as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEcsCapacityProvider',
    description: 'Update a capacity provider Use it to change an existing resource.',
    tool: awsUpdateEcsCapacityProvider as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEcsCapacityProvider',
    description: 'Delete a capacity provider Use it to permanently remove the resource.',
    tool: awsDeleteEcsCapacityProvider as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutEcsClusterCapacityProviders',
    description: 'Update capacity providers for a cluster Use it to write data or configuration.',
    tool: awsPutEcsClusterCapacityProviders as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEcsTags',
    description: 'List tags for an ECS resource Use it to inspect current state before making changes.',
    tool: awsListEcsTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagEcsResource',
    description: 'Add tags to an ECS resource Use it to label the resource.',
    tool: awsTagEcsResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagEcsResource',
    description: 'Remove tags from an ECS resource Use it to remove tags from the resource.',
    tool: awsUntagEcsResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEcsAccountSettings',
    description: 'List account settings Use it to inspect current state before making changes.',
    tool: awsListEcsAccountSettings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutEcsAccountSetting',
    description: 'Update an account setting Use it to write data or configuration.',
    tool: awsPutEcsAccountSetting as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutEcsAccountSettingDefault',
    description: 'Update the default account setting Use it to write data or configuration.',
    tool: awsPutEcsAccountSettingDefault as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEcsAccountSetting',
    description: 'Delete an account setting Use it to permanently remove the resource.',
    tool: awsDeleteEcsAccountSetting as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEcsTaskSets',
    description: 'List all task sets in a service (uses DescribeTaskSetsCommand) Use it to inspect current state before making changes.',
    tool: awsListEcsTaskSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEcsTaskSets',
    description: 'Get details about one or more task sets Use it to inspect current state before making changes.',
    tool: awsDescribeEcsTaskSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEcsTaskSet',
    description: 'Create a new task set Use it to provision a new resource.',
    tool: awsCreateEcsTaskSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEcsTaskSet',
    description: 'Update a task set Use it to change an existing resource.',
    tool: awsUpdateEcsTaskSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEcsTaskSet',
    description: 'Delete a task set Use it to permanently remove the resource.',
    tool: awsDeleteEcsTaskSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEcsAttributes',
    description: 'List attributes for a resource Use it to inspect current state before making changes.',
    tool: awsListEcsAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutEcsAttributes',
    description: 'Create or update attributes Use it to write data or configuration.',
    tool: awsPutEcsAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEcsAttributes',
    description: 'Delete attributes Use it to permanently remove the resource.',
    tool: awsDeleteEcsAttributes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksClusters',
    description: 'List all EKS clusters in your AWS account Use it to inspect current state before making changes.',
    tool: awsListEksClusters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksCluster',
    description: 'Get details about an EKS cluster Use it to inspect current state before making changes.',
    tool: awsDescribeEksCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEksCluster',
    description: 'Create a new EKS cluster Use it to provision a new resource.',
    tool: awsCreateEksCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksClusterVersion',
    description: 'Update the Kubernetes version of an EKS cluster Use it to change an existing resource.',
    tool: awsUpdateEksClusterVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksClusterConfig',
    description: 'Update the configuration of an EKS cluster Use it to change an existing resource.',
    tool: awsUpdateEksClusterConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEksCluster',
    description: 'Delete an EKS cluster Use it to permanently remove the resource.',
    tool: awsDeleteEksCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksNodegroups',
    description: 'List all nodegroups in an EKS cluster Use it to inspect current state before making changes.',
    tool: awsListEksNodegroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksNodegroup',
    description: 'Get details about a nodegroup Use it to inspect current state before making changes.',
    tool: awsDescribeEksNodegroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEksNodegroup',
    description: 'Create a new nodegroup Use it to provision a new resource.',
    tool: awsCreateEksNodegroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksNodegroupVersion',
    description: 'Update the Kubernetes version of a nodegroup Use it to change an existing resource.',
    tool: awsUpdateEksNodegroupVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksNodegroupConfig',
    description: 'Update the configuration of a nodegroup Use it to change an existing resource.',
    tool: awsUpdateEksNodegroupConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEksNodegroup',
    description: 'Delete a nodegroup Use it to permanently remove the resource.',
    tool: awsDeleteEksNodegroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksFargateProfiles',
    description: 'List all Fargate profiles in an EKS cluster Use it to inspect current state before making changes.',
    tool: awsListEksFargateProfiles as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksFargateProfile',
    description: 'Get details about a Fargate profile Use it to inspect current state before making changes.',
    tool: awsDescribeEksFargateProfile as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEksFargateProfile',
    description: 'Create a new Fargate profile Use it to provision a new resource.',
    tool: awsCreateEksFargateProfile as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEksFargateProfile',
    description: 'Delete a Fargate profile Use it to permanently remove the resource.',
    tool: awsDeleteEksFargateProfile as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksAddons',
    description: 'List all addons in an EKS cluster Use it to inspect current state before making changes.',
    tool: awsListEksAddons as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksAddon',
    description: 'Get details about an addon Use it to inspect current state before making changes.',
    tool: awsDescribeEksAddon as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksAddonVersions',
    description: 'Get available versions for an addon Use it to inspect current state before making changes.',
    tool: awsDescribeEksAddonVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEksAddon',
    description: 'Create a new addon Use it to provision a new resource.',
    tool: awsCreateEksAddon as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksAddon',
    description: 'Update an addon Use it to change an existing resource.',
    tool: awsUpdateEksAddon as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEksAddon',
    description: 'Delete an addon Use it to permanently remove the resource.',
    tool: awsDeleteEksAddon as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksIdentityProviderConfigs',
    description: 'List all identity provider configurations for a cluster Use it to inspect current state before making changes.',
    tool: awsListEksIdentityProviderConfigs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksIdentityProviderConfig',
    description: 'Get details about an identity provider configuration Use it to inspect current state before making changes.',
    tool: awsDescribeEksIdentityProviderConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAssociateEksIdentityProviderConfig',
    description: 'Associate an identity provider configuration with a cluster Use it to connect resources.',
    tool: awsAssociateEksIdentityProviderConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateEksIdentityProviderConfig',
    description: 'Disassociate an identity provider configuration from a cluster Use it to disconnect resources.',
    tool: awsDisassociateEksIdentityProviderConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksTags',
    description: 'List tags for an EKS resource Use it to inspect current state before making changes.',
    tool: awsListEksTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagEksResource',
    description: 'Add tags to an EKS resource Use it to label the resource.',
    tool: awsTagEksResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagEksResource',
    description: 'Remove tags from an EKS resource Use it to remove tags from the resource.',
    tool: awsUntagEksResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksAccessEntries',
    description: 'List all access entries for a cluster Use it to inspect current state before making changes.',
    tool: awsListEksAccessEntries as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksAccessEntry',
    description: 'Get details about an access entry Use it to inspect current state before making changes.',
    tool: awsDescribeEksAccessEntry as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEksAccessEntry',
    description: 'Create a new access entry Use it to provision a new resource.',
    tool: awsCreateEksAccessEntry as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksAccessEntry',
    description: 'Update an access entry Use it to change an existing resource.',
    tool: awsUpdateEksAccessEntry as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEksAccessEntry',
    description: 'Delete an access entry Use it to permanently remove the resource.',
    tool: awsDeleteEksAccessEntry as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateEksAccessPolicy',
    description: 'Associate an access policy with an access entry Use it to connect resources.',
    tool: awsAssociateEksAccessPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateEksAccessPolicy',
    description: 'Disassociate an access policy from an access entry Use it to disconnect resources.',
    tool: awsDisassociateEksAccessPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEksAssociatedAccessPolicies',
    description: 'List access policies associated with an access entry Use it to inspect current state before making changes.',
    tool: awsListEksAssociatedAccessPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListEksPodIdentityAssociations',
    description: 'List all pod identity associations for a cluster Use it to inspect current state before making changes.',
    tool: awsListEksPodIdentityAssociations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEksPodIdentityAssociation',
    description: 'Get details about a pod identity association Use it to inspect current state before making changes.',
    tool: awsDescribeEksPodIdentityAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEksPodIdentityAssociation',
    description: 'Create a new pod identity association Use it to provision a new resource.',
    tool: awsCreateEksPodIdentityAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEksPodIdentityAssociation',
    description: 'Update a pod identity association Use it to change an existing resource.',
    tool: awsUpdateEksPodIdentityAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEksPodIdentityAssociation',
    description: 'Delete a pod identity association Use it to permanently remove the resource.',
    tool: awsDeleteEksPodIdentityAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListRepositories',
    description: 'List all ECR repositories in your AWS account Use it to inspect current state before making changes.',
    tool: awsListRepositories as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeRepositories',
    description: 'Get details about one or more ECR repositories Use it to inspect current state before making changes.',
    tool: awsDescribeRepositories as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRepository',
    description: 'Create a new ECR repository Use it to provision a new resource.',
    tool: awsCreateRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateEcrRepository',
    description: 'Update an existing ECR repository Use it to change an existing resource.',
    tool: awsUpdateEcrRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteRepository',
    description: 'Delete an ECR repository Use it to permanently remove the resource.',
    tool: awsDeleteRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListImages',
    description: 'List all images in an ECR repository Use it to inspect current state before making changes.',
    tool: awsListImages as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeImages',
    description: 'Get details about images in an ECR repository Use it to inspect current state before making changes.',
    tool: awsDescribeImages as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetImage',
    description: 'Get detailed information about images in an ECR repository Use it to operate on multiple resources.',
    tool: awsBatchGetImage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutImage',
    description: 'Create or update an image in an ECR repository Use it to write data or configuration.',
    tool: awsPutImage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteImages',
    description: 'Delete one or more images from an ECR repository Use it to permanently remove the resource.',
    tool: awsDeleteImages as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsBatchDeleteImage',
    description: 'Delete multiple images from an ECR repository Use it to operate on multiple resources.',
    tool: awsBatchDeleteImage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutLifecyclePolicy',
    description: 'Create or update the lifecycle policy for an ECR repository Use it to write data or configuration.',
    tool: awsPutLifecyclePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetLifecyclePolicy',
    description: 'Get the lifecycle policy for an ECR repository Use it to inspect current state before making changes.',
    tool: awsGetLifecyclePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteLifecyclePolicy',
    description: 'Delete the lifecycle policy from an ECR repository Use it to permanently remove the resource.',
    tool: awsDeleteLifecyclePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsStartLifecyclePolicyPreview',
    description: 'Start a preview of the lifecycle policy for an ECR repository Use it to start a stopped resource.',
    tool: awsStartLifecyclePolicyPreview as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetLifecyclePolicyPreview',
    description: 'Get the results of a lifecycle policy preview Use it to inspect current state before making changes.',
    tool: awsGetLifecyclePolicyPreview as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutImageTagMutability',
    description: 'Update the image tag mutability settings for an ECR repository Use it to write data or configuration.',
    tool: awsPutImageTagMutability as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetImageTagMutability',
    description: 'Get the image tag mutability settings for an ECR repository Use it to inspect current state before making changes.',
    tool: awsGetImageTagMutability as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutImageScanningConfiguration',
    description: 'Update the image scanning configuration for an ECR repository Use it to write data or configuration.',
    tool: awsPutImageScanningConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetImageScanningConfiguration',
    description: 'Get the image scanning configuration for an ECR repository Use it to inspect current state before making changes.',
    tool: awsGetImageScanningConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeImageScanFindings',
    description: 'Get the image scan findings for an ECR repository Use it to inspect current state before making changes.',
    tool: awsDescribeImageScanFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSetRepositoryPolicy',
    description: 'Set the repository policy for an ECR repository Use it to change the configuration of the resource.',
    tool: awsSetRepositoryPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRepositoryPolicy',
    description: 'Get the repository policy for an ECR repository Use it to inspect current state before making changes.',
    tool: awsGetRepositoryPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRepositoryPolicy',
    description: 'Delete the repository policy from an ECR repository Use it to permanently remove the resource.',
    tool: awsDeleteRepositoryPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutReplicationConfiguration',
    description: 'Create or update the replication configuration for the registry Use it to write data or configuration.',
    tool: awsPutReplicationConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetReplicationConfiguration',
    description: 'Get the replication configuration for the registry Use it to inspect current state before making changes.',
    tool: awsGetReplicationConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutRegistryPolicy',
    description: 'Create or update the registry policy Use it to write data or configuration.',
    tool: awsPutRegistryPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRegistryPolicy',
    description: 'Get the registry policy Use it to inspect current state before making changes.',
    tool: awsGetRegistryPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRegistryPolicy',
    description: 'Delete the registry policy Use it to permanently remove the resource.',
    tool: awsDeleteRegistryPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutRegistryScanningConfiguration',
    description: 'Create or update the registry scanning configuration Use it to write data or configuration.',
    tool: awsPutRegistryScanningConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRegistryScanningConfiguration',
    description: 'Get the registry scanning configuration Use it to inspect current state before making changes.',
    tool: awsGetRegistryScanningConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeRegistry',
    description: 'Get details about the registry Use it to inspect current state before making changes.',
    tool: awsDescribeRegistry as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeImageReplicationStatus',
    description: 'Get the replication status of an image Use it to inspect current state before making changes.',
    tool: awsDescribeImageReplicationStatus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListEcrTags',
    description: 'List tags for an ECR resource Use it to inspect current state before making changes.',
    tool: awsListEcrTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagEcrResource',
    description: 'Add tags to an ECR resource Use it to label the resource.',
    tool: awsTagEcrResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagEcrResource',
    description: 'Remove tags from an ECR resource Use it to remove tags from the resource.',
    tool: awsUntagEcrResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeRdsInstances',
    description: 'List all RDS database instances with details about configuration, status, and endpoints Use it to inspect current state before making changes.',
    tool: awsDescribeRdsInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDbInstance',
    description: 'Create a new RDS database instance (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server) Use it to provision a new resource.',
    tool: awsCreateDbInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyDbInstance',
    description: 'Modify an existing RDS database instance (change storage, compute, engine version) Use it to change an existing resource.',
    tool: awsModifyDbInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDbInstance',
    description: 'Delete an RDS database instance Use it to permanently remove the resource.',
    tool: awsDeleteDbInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsStartDbInstance',
    description: 'Start a stopped RDS database instance Use it to start a stopped resource.',
    tool: awsStartDbInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopDbInstance',
    description: 'Stop a running RDS database instance (max 7 days) Use it to stop a running resource (billable config may remain).',
    tool: awsStopDbInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRebootDbInstance',
    description: 'Reboot an RDS database instance Use it to restart the resource.',
    tool: awsRebootDbInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeDbSnapshots',
    description: 'List all RDS database snapshots Use it to inspect current state before making changes.',
    tool: awsDescribeDbSnapshots as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDbSnapshot',
    description: 'Create a manual backup snapshot of an RDS instance Use it to provision a new resource.',
    tool: awsCreateDbSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDbSnapshot',
    description: 'Delete an RDS database snapshot Use it to permanently remove the resource.',
    tool: awsDeleteDbSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRestoreDbInstanceFromDbSnapshot',
    description: 'Restore an RDS instance from a snapshot Use it to restore from a backup or snapshot.',
    tool: awsRestoreDbInstanceFromDbSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCopyDbSnapshot',
    description: 'Copy an RDS snapshot across regions or accounts Use it to duplicate data.',
    tool: awsCopyDbSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeDbAutomatedBackups',
    description: 'List automated backups for RDS instances Use it to inspect current state before making changes.',
    tool: awsDescribeDbAutomatedBackups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeDbClusters',
    description: 'List all Aurora database clusters Use it to inspect current state before making changes.',
    tool: awsDescribeDbClusters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDbCluster',
    description: 'Create a new Aurora database cluster Use it to provision a new resource.',
    tool: awsCreateDbCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyDbCluster',
    description: 'Modify an Aurora database cluster Use it to change an existing resource.',
    tool: awsModifyDbCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDbCluster',
    description: 'Delete an Aurora database cluster Use it to permanently remove the resource.',
    tool: awsDeleteDbCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsStartDbCluster',
    description: 'Start a stopped Aurora cluster Use it to start a stopped resource.',
    tool: awsStartDbCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopDbCluster',
    description: 'Stop a running Aurora cluster Use it to stop a running resource (billable config may remain).',
    tool: awsStopDbCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateDbClusterSnapshot',
    description: 'Create a manual snapshot of an Aurora cluster Use it to provision a new resource.',
    tool: awsCreateDbClusterSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRestoreDbClusterFromSnapshot',
    description: 'Restore an Aurora cluster from a snapshot Use it to restore from a backup or snapshot.',
    tool: awsRestoreDbClusterFromSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeDbParameterGroups',
    description: 'List all RDS parameter groups Use it to inspect current state before making changes.',
    tool: awsDescribeDbParameterGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDbParameterGroup',
    description: 'Create a new RDS parameter group Use it to provision a new resource.',
    tool: awsCreateDbParameterGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyDbParameterGroup',
    description: 'Modify parameters in an RDS parameter group Use it to change an existing resource.',
    tool: awsModifyDbParameterGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDbParameterGroup',
    description: 'Delete an RDS parameter group Use it to permanently remove the resource.',
    tool: awsDeleteDbParameterGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeDbParameters',
    description: 'List all parameters in an RDS parameter group Use it to inspect current state before making changes.',
    tool: awsDescribeDbParameters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeDbSubnetGroups',
    description: 'List all RDS subnet groups Use it to inspect current state before making changes.',
    tool: awsDescribeDbSubnetGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDbSubnetGroup',
    description: 'Create a new RDS subnet group for VPC Use it to provision a new resource.',
    tool: awsCreateDbSubnetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyDbSubnetGroup',
    description: 'Modify an RDS subnet group Use it to change an existing resource.',
    tool: awsModifyDbSubnetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDbSubnetGroup',
    description: 'Delete an RDS subnet group Use it to permanently remove the resource.',
    tool: awsDeleteDbSubnetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateGlobalCluster',
    description: 'Create a multi-region Aurora Global Database Use it to provision a new resource.',
    tool: awsCreateGlobalCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeGlobalClusters',
    description: 'List all Aurora Global Database clusters Use it to inspect current state before making changes.',
    tool: awsDescribeGlobalClusters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsModifyGlobalCluster',
    description: 'Modify an Aurora Global Database cluster Use it to change an existing resource.',
    tool: awsModifyGlobalCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteGlobalCluster',
    description: 'Delete an Aurora Global Database cluster Use it to permanently remove the resource.',
    tool: awsDeleteGlobalCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRemoveFromGlobalCluster',
    description: 'Remove a secondary cluster from an Aurora Global Database Use it to remove access or configuration.',
    tool: awsRemoveFromGlobalCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsFailoverGlobalCluster',
    description: 'Promote a secondary Aurora cluster to primary in a Global Database Use it to trigger a failover (causes downtime).',
    tool: awsFailoverGlobalCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRestoreDbClusterToPointInTime',
    description: 'Clone an Aurora cluster from a point-in-time backup Use it to restore from a backup or snapshot.',
    tool: awsRestoreDbClusterToPointInTime as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeElasticacheCacheClusters',
    description: 'List all ElastiCache cache clusters (Memcached and Redis) Use it to inspect current state before making changes.',
    tool: awsDescribeElasticacheCacheClusters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCacheCluster',
    description: 'Create a new Memcached cache cluster Use it to provision a new resource.',
    tool: awsCreateCacheCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyCacheCluster',
    description: 'Modify a Memcached cache cluster Use it to change an existing resource.',
    tool: awsModifyCacheCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCacheCluster',
    description: 'Delete a Memcached cache cluster Use it to permanently remove the resource.',
    tool: awsDeleteCacheCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRebootCacheCluster',
    description: 'Reboot cache cluster nodes Use it to restart the resource.',
    tool: awsRebootCacheCluster as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeReplicationGroups',
    description: 'List all Redis replication groups Use it to inspect current state before making changes.',
    tool: awsDescribeReplicationGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateReplicationGroup',
    description: 'Create a Redis replication group with read replicas Use it to provision a new resource.',
    tool: awsCreateReplicationGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyReplicationGroup',
    description: 'Modify a Redis replication group Use it to change an existing resource.',
    tool: awsModifyReplicationGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteReplicationGroup',
    description: 'Delete a Redis replication group Use it to permanently remove the resource.',
    tool: awsDeleteReplicationGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsIncreaseReplicaCount',
    description: 'Add read replicas to a Redis replication group Use it to scale capacity.',
    tool: awsIncreaseReplicaCount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDecreaseReplicaCount',
    description: 'Remove read replicas from a Redis replication group Use it to scale capacity.',
    tool: awsDecreaseReplicaCount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeCacheParameterGroups',
    description: 'List all cache parameter groups Use it to inspect current state before making changes.',
    tool: awsDescribeCacheParameterGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCacheParameterGroup',
    description: 'Create a new cache parameter group Use it to provision a new resource.',
    tool: awsCreateCacheParameterGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyCacheParameterGroup',
    description: 'Modify parameters in a cache parameter group Use it to change an existing resource.',
    tool: awsModifyCacheParameterGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCacheParameterGroup',
    description: 'Delete a cache parameter group Use it to permanently remove the resource.',
    tool: awsDeleteCacheParameterGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeCacheParameters',
    description: 'List all parameters in a cache parameter group Use it to inspect current state before making changes.',
    tool: awsDescribeCacheParameters as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCacheSubnetGroups',
    description: 'List all cache subnet groups Use it to inspect current state before making changes.',
    tool: awsDescribeCacheSubnetGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCacheSubnetGroup',
    description: 'Create a cache subnet group for VPC Use it to provision a new resource.',
    tool: awsCreateCacheSubnetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyCacheSubnetGroup',
    description: 'Modify a cache subnet group Use it to change an existing resource.',
    tool: awsModifyCacheSubnetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCacheSubnetGroup',
    description: 'Delete a cache subnet group Use it to permanently remove the resource.',
    tool: awsDeleteCacheSubnetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeSnapshots',
    description: 'List Redis snapshots Use it to inspect current state before making changes.',
    tool: awsDescribeSnapshots as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateSnapshot',
    description: 'Create a backup snapshot of a Redis cluster Use it to provision a new resource.',
    tool: awsCreateSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSnapshot',
    description: 'Delete a Redis snapshot Use it to permanently remove the resource.',
    tool: awsDeleteSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCopySnapshot',
    description: 'Copy a Redis snapshot across regions Use it to duplicate data.',
    tool: awsCopySnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListTagsForResource',
    description: 'List tags for an ElastiCache resource Use it to inspect current state before making changes.',
    tool: awsListTagsForResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAddTagsToResource',
    description: 'Add tags to an ElastiCache resource Use it to grant access or attach configuration.',
    tool: awsAddTagsToResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveTagsFromResource',
    description: 'Remove tags from an ElastiCache resource Use it to remove access or configuration.',
    tool: awsRemoveTagsFromResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsStartEbsSnapshot',
    description: 'Start creating a new EBS snapshot Use it to start a stopped resource.',
    tool: awsStartEbsSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutEbsSnapshotBlock',
    description: 'Write a block of data to a snapshot Use it to write data or configuration.',
    tool: awsPutEbsSnapshotBlock as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetEbsSnapshotBlock',
    description: 'Get a block of data from a snapshot Use it to inspect current state before making changes.',
    tool: awsGetEbsSnapshotBlock as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListEbsSnapshotBlocks',
    description: 'List all blocks in a snapshot Use it to inspect current state before making changes.',
    tool: awsListEbsSnapshotBlocks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListEbsChangedBlocks',
    description: 'List blocks that have changed between two snapshots Use it to inspect current state before making changes.',
    tool: awsListEbsChangedBlocks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCompleteEbsSnapshot',
    description: 'Complete the creation of an EBS snapshot',
    tool: awsCompleteEbsSnapshot as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateRoute53HostedZone',
    description: 'Create a new Route 53 hosted zone Use it to provision a new resource.',
    tool: awsCreateRoute53HostedZone as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53HostedZone',
    description: 'Get information about a Route 53 hosted zone Use it to inspect current state before making changes.',
    tool: awsGetRoute53HostedZone as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53HostedZones',
    description: 'List all Route 53 hosted zones Use it to inspect current state before making changes.',
    tool: awsListRoute53HostedZones as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRoute53HostedZone',
    description: 'Delete a Route 53 hosted zone Use it to permanently remove the resource.',
    tool: awsDeleteRoute53HostedZone as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateRoute53HostedZoneComment',
    description: 'Update the comment for a Route 53 hosted zone Use it to change an existing resource.',
    tool: awsUpdateRoute53HostedZoneComment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListRoute53HostedZonesByName',
    description: 'List Route 53 hosted zones by name Use it to inspect current state before making changes.',
    tool: awsListRoute53HostedZonesByName as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53ResourceRecordSets',
    description: 'List resource record sets in a hosted zone Use it to inspect current state before making changes.',
    tool: awsListRoute53ResourceRecordSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsChangeRoute53ResourceRecordSets',
    description: 'Create, update, or delete resource record sets',
    tool: awsChangeRoute53ResourceRecordSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53Change',
    description: 'Get the status of a change batch request Use it to inspect current state before making changes.',
    tool: awsGetRoute53Change as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53TagsForResource',
    description: 'List tags for a Route 53 resource Use it to inspect current state before making changes.',
    tool: awsListRoute53TagsForResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsChangeRoute53TagsForResource',
    description: 'Add or remove tags from a Route 53 resource',
    tool: awsChangeRoute53TagsForResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateRoute53HealthCheck',
    description: 'Create a Route 53 health check Use it to provision a new resource.',
    tool: awsCreateRoute53HealthCheck as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53HealthCheck',
    description: 'Get information about a Route 53 health check Use it to inspect current state before making changes.',
    tool: awsGetRoute53HealthCheck as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53HealthChecks',
    description: 'List all Route 53 health checks Use it to inspect current state before making changes.',
    tool: awsListRoute53HealthChecks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRoute53HealthCheck',
    description: 'Delete a Route 53 health check Use it to permanently remove the resource.',
    tool: awsDeleteRoute53HealthCheck as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateRoute53HealthCheck',
    description: 'Update a Route 53 health check Use it to change an existing resource.',
    tool: awsUpdateRoute53HealthCheck as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53HealthCheckStatus',
    description: 'Get the current status of a Route 53 health check Use it to inspect current state before making changes.',
    tool: awsGetRoute53HealthCheckStatus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53HealthCheckLastFailureReason',
    description: 'Get the last failure reason for a Route 53 health check Use it to inspect current state before making changes.',
    tool: awsGetRoute53HealthCheckLastFailureReason as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53HealthCheckCount',
    description: 'Get the number of health checks associated with the current AWS account Use it to inspect current state before making changes.',
    tool: awsGetRoute53HealthCheckCount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRoute53ReusableDelegationSet',
    description: 'Create a reusable delegation set Use it to provision a new resource.',
    tool: awsCreateRoute53ReusableDelegationSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53ReusableDelegationSet',
    description: 'Get information about a reusable delegation set Use it to inspect current state before making changes.',
    tool: awsGetRoute53ReusableDelegationSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53ReusableDelegationSets',
    description: 'List all reusable delegation sets Use it to inspect current state before making changes.',
    tool: awsListRoute53ReusableDelegationSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRoute53ReusableDelegationSet',
    description: 'Delete a reusable delegation set Use it to permanently remove the resource.',
    tool: awsDeleteRoute53ReusableDelegationSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateRoute53TrafficPolicy',
    description: 'Create a Route 53 traffic policy Use it to provision a new resource.',
    tool: awsCreateRoute53TrafficPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53TrafficPolicy',
    description: 'Get information about a Route 53 traffic policy Use it to inspect current state before making changes.',
    tool: awsGetRoute53TrafficPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53TrafficPolicies',
    description: 'List all Route 53 traffic policies Use it to inspect current state before making changes.',
    tool: awsListRoute53TrafficPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRoute53TrafficPolicy',
    description: 'Delete a Route 53 traffic policy Use it to permanently remove the resource.',
    tool: awsDeleteRoute53TrafficPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateRoute53TrafficPolicyInstance',
    description: 'Create a Route 53 traffic policy instance Use it to provision a new resource.',
    tool: awsCreateRoute53TrafficPolicyInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53TrafficPolicyInstance',
    description: 'Get information about a Route 53 traffic policy instance Use it to inspect current state before making changes.',
    tool: awsGetRoute53TrafficPolicyInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53TrafficPolicyInstances',
    description: 'List all Route 53 traffic policy instances Use it to inspect current state before making changes.',
    tool: awsListRoute53TrafficPolicyInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRoute53TrafficPolicyInstance',
    description: 'Delete a Route 53 traffic policy instance Use it to permanently remove the resource.',
    tool: awsDeleteRoute53TrafficPolicyInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateRoute53TrafficPolicyInstance',
    description: 'Update a Route 53 traffic policy instance Use it to change an existing resource.',
    tool: awsUpdateRoute53TrafficPolicyInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53TrafficPolicyInstanceCount',
    description: 'Get the number of traffic policy instances for the current AWS account Use it to inspect current state before making changes.',
    tool: awsGetRoute53TrafficPolicyInstanceCount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRoute53TrafficPolicyVersion',
    description: 'Create a new version of a Route 53 traffic policy Use it to provision a new resource.',
    tool: awsCreateRoute53TrafficPolicyVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListRoute53TrafficPolicyVersions',
    description: 'List all versions of a Route 53 traffic policy Use it to inspect current state before making changes.',
    tool: awsListRoute53TrafficPolicyVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53AccountLimit',
    description: 'Get the limit for a specific account setting Use it to inspect current state before making changes.',
    tool: awsGetRoute53AccountLimit as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53HostedZoneLimit',
    description: 'Get the limit for a specific hosted zone setting Use it to inspect current state before making changes.',
    tool: awsGetRoute53HostedZoneLimit as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53ReusableDelegationSetLimit',
    description: 'Get the limit for a specific reusable delegation set setting Use it to inspect current state before making changes.',
    tool: awsGetRoute53ReusableDelegationSetLimit as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRoute53QueryLoggingConfig',
    description: 'Create a query logging configuration Use it to provision a new resource.',
    tool: awsCreateRoute53QueryLoggingConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetRoute53QueryLoggingConfig',
    description: 'Get information about a query logging configuration Use it to inspect current state before making changes.',
    tool: awsGetRoute53QueryLoggingConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53QueryLoggingConfigs',
    description: 'List all query logging configurations Use it to inspect current state before making changes.',
    tool: awsListRoute53QueryLoggingConfigs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteRoute53QueryLoggingConfig',
    description: 'Delete a query logging configuration Use it to permanently remove the resource.',
    tool: awsDeleteRoute53QueryLoggingConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetRoute53CheckerIpRanges',
    description: 'Get the IP ranges used by Route 53 health checkers Use it to inspect current state before making changes.',
    tool: awsGetRoute53CheckerIpRanges as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53GeoLocation',
    description: 'Get information about a specific geo location Use it to inspect current state before making changes.',
    tool: awsGetRoute53GeoLocation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53GeoLocations',
    description: 'List all supported geo locations Use it to inspect current state before making changes.',
    tool: awsListRoute53GeoLocations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53Dnssec',
    description: 'Get DNSSEC information for a hosted zone Use it to inspect current state before making changes.',
    tool: awsGetRoute53Dnssec as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAssociateRoute53VpcWithHostedZone',
    description: 'Associate a VPC with a hosted zone Use it to connect resources.',
    tool: awsAssociateRoute53VpcWithHostedZone as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateRoute53VpcFromHostedZone',
    description: 'Disassociate a VPC from a hosted zone Use it to disconnect resources.',
    tool: awsDisassociateRoute53VpcFromHostedZone as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListRoute53VpcAssociationAuthorizations',
    description: 'List VPCs that can be associated with a hosted zone Use it to inspect current state before making changes.',
    tool: awsListRoute53VpcAssociationAuthorizations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTestRoute53DnsAnswer',
    description: 'Test DNS answer for a specific record Use it to inspect current state before making changes.',
    tool: awsTestRoute53DnsAnswer as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRoute53HostedZoneCount',
    description: 'Get the number of hosted zones associated with the current AWS account Use it to inspect current state before making changes.',
    tool: awsGetRoute53HostedZoneCount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListRoute53HostedZonesByVpc',
    description: 'List hosted zones associated with a VPC Use it to inspect current state before making changes.',
    tool: awsListRoute53HostedZonesByVpc as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsActivateRoute53KeySigningKey',
    description: 'Activate a key signing key for a hosted zone Use it to enable a feature.',
    tool: awsActivateRoute53KeySigningKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateRoute53KeySigningKey',
    description: 'Create a key signing key for a hosted zone Use it to provision a new resource.',
    tool: awsCreateRoute53KeySigningKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeactivateRoute53KeySigningKey',
    description: 'Deactivate a key signing key for a hosted zone Use it to disable a feature.',
    tool: awsDeactivateRoute53KeySigningKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteRoute53KeySigningKey',
    description: 'Delete a key signing key for a hosted zone Use it to permanently remove the resource.',
    tool: awsDeleteRoute53KeySigningKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateCloudfrontDistribution',
    description: 'Create a new CloudFront distribution Use it to provision a new resource.',
    tool: awsCreateCloudfrontDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontDistribution',
    description: 'Get information about a CloudFront distribution Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudfrontDistributionConfig',
    description: 'Get the configuration of a CloudFront distribution Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontDistributionConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontDistribution',
    description: 'Update a CloudFront distribution Use it to change an existing resource.',
    tool: awsUpdateCloudfrontDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontDistribution',
    description: 'Delete a CloudFront distribution Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontDistributions',
    description: 'List all CloudFront distributions Use it to inspect current state before making changes.',
    tool: awsListCloudfrontDistributions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontDistributionWithTags',
    description: 'Create a CloudFront distribution with tags Use it to provision a new resource.',
    tool: awsCreateCloudfrontDistributionWithTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCopyCloudfrontDistribution',
    description: 'Copy a CloudFront distribution Use it to duplicate data.',
    tool: awsCopyCloudfrontDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateCloudfrontInvalidation',
    description: 'Create a CloudFront invalidation Use it to provision a new resource.',
    tool: awsCreateCloudfrontInvalidation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontInvalidation',
    description: 'Get information about a CloudFront invalidation Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontInvalidation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudfrontInvalidations',
    description: 'List all invalidations for a CloudFront distribution Use it to inspect current state before making changes.',
    tool: awsListCloudfrontInvalidations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontOriginAccessIdentity',
    description: 'Create a CloudFront origin access identity Use it to provision a new resource.',
    tool: awsCreateCloudfrontOriginAccessIdentity as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontOriginAccessIdentity',
    description: 'Get information about a CloudFront origin access identity Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontOriginAccessIdentity as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontOriginAccessIdentity',
    description: 'Update a CloudFront origin access identity Use it to change an existing resource.',
    tool: awsUpdateCloudfrontOriginAccessIdentity as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontOriginAccessIdentity',
    description: 'Delete a CloudFront origin access identity Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontOriginAccessIdentity as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontOriginAccessIdentities',
    description: 'List all CloudFront origin access identities Use it to inspect current state before making changes.',
    tool: awsListCloudfrontOriginAccessIdentities as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontCachePolicy',
    description: 'Create a CloudFront cache policy Use it to provision a new resource.',
    tool: awsCreateCloudfrontCachePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontCachePolicy',
    description: 'Get information about a CloudFront cache policy Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontCachePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontCachePolicy',
    description: 'Update a CloudFront cache policy Use it to change an existing resource.',
    tool: awsUpdateCloudfrontCachePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontCachePolicy',
    description: 'Delete a CloudFront cache policy Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontCachePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontCachePolicies',
    description: 'List all CloudFront cache policies Use it to inspect current state before making changes.',
    tool: awsListCloudfrontCachePolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontResponseHeadersPolicy',
    description: 'Create a CloudFront response headers policy Use it to provision a new resource.',
    tool: awsCreateCloudfrontResponseHeadersPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontResponseHeadersPolicy',
    description: 'Get information about a CloudFront response headers policy Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontResponseHeadersPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontResponseHeadersPolicy',
    description: 'Update a CloudFront response headers policy Use it to change an existing resource.',
    tool: awsUpdateCloudfrontResponseHeadersPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontResponseHeadersPolicy',
    description: 'Delete a CloudFront response headers policy Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontResponseHeadersPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontResponseHeadersPolicies',
    description: 'List all CloudFront response headers policies Use it to inspect current state before making changes.',
    tool: awsListCloudfrontResponseHeadersPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontFunction',
    description: 'Create a CloudFront function Use it to provision a new resource.',
    tool: awsCreateCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontFunction',
    description: 'Get information about a CloudFront function Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCloudfrontFunction',
    description: 'Describe a CloudFront function Use it to inspect current state before making changes.',
    tool: awsDescribeCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontFunction',
    description: 'Update a CloudFront function Use it to change an existing resource.',
    tool: awsUpdateCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontFunction',
    description: 'Delete a CloudFront function Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontFunctions',
    description: 'List all CloudFront functions Use it to inspect current state before making changes.',
    tool: awsListCloudfrontFunctions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPublishCloudfrontFunction',
    description: 'Publish a CloudFront function Use it to publish or release.',
    tool: awsPublishCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsTestCloudfrontFunction',
    description: 'Test a CloudFront function Use it to inspect current state before making changes.',
    tool: awsTestCloudfrontFunction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontKeyGroup',
    description: 'Create a CloudFront key group Use it to provision a new resource.',
    tool: awsCreateCloudfrontKeyGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontKeyGroup',
    description: 'Get information about a CloudFront key group Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontKeyGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontKeyGroup',
    description: 'Update a CloudFront key group Use it to change an existing resource.',
    tool: awsUpdateCloudfrontKeyGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontKeyGroup',
    description: 'Delete a CloudFront key group Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontKeyGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontKeyGroups',
    description: 'List all CloudFront key groups Use it to inspect current state before making changes.',
    tool: awsListCloudfrontKeyGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontPublicKey',
    description: 'Create a CloudFront public key Use it to provision a new resource.',
    tool: awsCreateCloudfrontPublicKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontPublicKey',
    description: 'Get information about a CloudFront public key Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontPublicKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontPublicKey',
    description: 'Update a CloudFront public key Use it to change an existing resource.',
    tool: awsUpdateCloudfrontPublicKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontPublicKey',
    description: 'Delete a CloudFront public key Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontPublicKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontPublicKeys',
    description: 'List all CloudFront public keys Use it to inspect current state before making changes.',
    tool: awsListCloudfrontPublicKeys as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontStreamingDistribution',
    description: 'Create a CloudFront streaming distribution Use it to provision a new resource.',
    tool: awsCreateCloudfrontStreamingDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCloudfrontStreamingDistribution',
    description: 'Get information about a CloudFront streaming distribution Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontStreamingDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudfrontStreamingDistributionConfig',
    description: 'Get the configuration of a CloudFront streaming distribution Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontStreamingDistributionConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCloudfrontStreamingDistribution',
    description: 'Update a CloudFront streaming distribution Use it to change an existing resource.',
    tool: awsUpdateCloudfrontStreamingDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontStreamingDistribution',
    description: 'Delete a CloudFront streaming distribution Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontStreamingDistribution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontStreamingDistributions',
    description: 'List all CloudFront streaming distributions Use it to inspect current state before making changes.',
    tool: awsListCloudfrontStreamingDistributions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontStreamingDistributionWithTags',
    description: 'Create a CloudFront streaming distribution with tags Use it to provision a new resource.',
    tool: awsCreateCloudfrontStreamingDistributionWithTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListCloudfrontTags',
    description: 'List tags for a CloudFront resource Use it to inspect current state before making changes.',
    tool: awsListCloudfrontTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagCloudfrontResource',
    description: 'Add tags to a CloudFront resource Use it to label the resource.',
    tool: awsTagCloudfrontResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagCloudfrontResource',
    description: 'Remove tags from a CloudFront resource Use it to remove tags from the resource.',
    tool: awsUntagCloudfrontResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetCloudfrontContinuousDeploymentPolicy',
    description: 'Get information about a CloudFront continuous deployment policy Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontContinuousDeploymentPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontContinuousDeploymentPolicy',
    description: 'Create a CloudFront continuous deployment policy Use it to provision a new resource.',
    tool: awsCreateCloudfrontContinuousDeploymentPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateCloudfrontContinuousDeploymentPolicy',
    description: 'Update a CloudFront continuous deployment policy Use it to change an existing resource.',
    tool: awsUpdateCloudfrontContinuousDeploymentPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontContinuousDeploymentPolicy',
    description: 'Delete a CloudFront continuous deployment policy Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontContinuousDeploymentPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontContinuousDeploymentPolicies',
    description: 'List all CloudFront continuous deployment policies Use it to inspect current state before making changes.',
    tool: awsListCloudfrontContinuousDeploymentPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudfrontRealtimeLogConfig',
    description: 'Get information about a CloudFront real-time log config Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontRealtimeLogConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontRealtimeLogConfig',
    description: 'Create a CloudFront real-time log config Use it to provision a new resource.',
    tool: awsCreateCloudfrontRealtimeLogConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateCloudfrontRealtimeLogConfig',
    description: 'Update a CloudFront real-time log config Use it to change an existing resource.',
    tool: awsUpdateCloudfrontRealtimeLogConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontRealtimeLogConfig',
    description: 'Delete a CloudFront real-time log config Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontRealtimeLogConfig as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudfrontRealtimeLogConfigs',
    description: 'List all CloudFront real-time log configs Use it to inspect current state before making changes.',
    tool: awsListCloudfrontRealtimeLogConfigs as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudfrontMonitoringSubscription',
    description: 'Get monitoring subscription for a CloudFront distribution Use it to inspect current state before making changes.',
    tool: awsGetCloudfrontMonitoringSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudfrontMonitoringSubscription',
    description: 'Create monitoring subscription for a CloudFront distribution Use it to provision a new resource.',
    tool: awsCreateCloudfrontMonitoringSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudfrontMonitoringSubscription',
    description: 'Delete monitoring subscription for a CloudFront distribution Use it to permanently remove the resource.',
    tool: awsDeleteCloudfrontMonitoringSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListRestApis',
    description: 'Lists the RestApis resources for your collection Use it to inspect current state before making changes.',
    tool: awsListRestApis as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRestApi',
    description: 'Lists the RestApi resource in the collection Use it to inspect current state before making changes.',
    tool: awsGetRestApi as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRestApi',
    description: 'Creates a new RestApi resource Use it to provision a new resource.',
    tool: awsCreateRestApi as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateRestApi',
    description: 'Changes information about the specified API Use it to change an existing resource.',
    tool: awsUpdateRestApi as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteRestApi',
    description: 'Deletes the specified API Use it to permanently remove the resource.',
    tool: awsDeleteRestApi as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsImportRestApi',
    description: 'A feature of the API Gateway control service for creating a new API from an external API definition file Use it to import a definition.',
    tool: awsImportRestApi as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutRestApi',
    description: 'A feature of the API Gateway control service for updating an existing API with an external API definition file Use it to write data or configuration.',
    tool: awsPutRestApi as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListResources',
    description: 'Lists information about a collection of Resource resources Use it to inspect current state before making changes.',
    tool: awsListResources as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetResource',
    description: 'Lists information about a Resource resource Use it to inspect current state before making changes.',
    tool: awsGetResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateResource',
    description: 'Creates a Resource resource Use it to provision a new resource.',
    tool: awsCreateResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateResource',
    description: 'Changes information about a Resource resource Use it to change an existing resource.',
    tool: awsUpdateResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteResource',
    description: 'Deletes a Resource resource Use it to permanently remove the resource.',
    tool: awsDeleteResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutMethod',
    description: 'Add a method to an existing Resource resource Use it to write data or configuration.',
    tool: awsPutMethod as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetMethod',
    description: 'Describe an existing Method resource Use it to inspect current state before making changes.',
    tool: awsGetMethod as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteMethod',
    description: 'Deletes an existing Method resource Use it to permanently remove the resource.',
    tool: awsDeleteMethod as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateMethod',
    description: 'Updates an existing Method resource Use it to change an existing resource.',
    tool: awsUpdateMethod as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutIntegration',
    description: 'Sets up a method\'s integration Use it to write data or configuration.',
    tool: awsPutIntegration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetIntegration',
    description: 'Get the Integration Use it to inspect current state before making changes.',
    tool: awsGetIntegration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteIntegration',
    description: 'Represents a delete integration Use it to permanently remove the resource.',
    tool: awsDeleteIntegration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateIntegration',
    description: 'Represents an update integration Use it to change an existing resource.',
    tool: awsUpdateIntegration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListDeployments',
    description: 'Lists information about a collection of Deployment resources Use it to inspect current state before making changes.',
    tool: awsListDeployments as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetDeployment',
    description: 'Gets information about a Deployment resource Use it to inspect current state before making changes.',
    tool: awsGetDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateDeployment',
    description: 'Creates a Deployment resource Use it to provision a new resource.',
    tool: awsCreateDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateDeployment',
    description: 'Changes information about a Deployment resource Use it to change an existing resource.',
    tool: awsUpdateDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteDeployment',
    description: 'Deletes a Deployment resource Use it to permanently remove the resource.',
    tool: awsDeleteDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListStages',
    description: 'Lists information about a collection of Stage resources Use it to inspect current state before making changes.',
    tool: awsListStages as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetStage',
    description: 'Gets information about a Stage resource Use it to inspect current state before making changes.',
    tool: awsGetStage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateStage',
    description: 'Creates a new Stage resource Use it to provision a new resource.',
    tool: awsCreateStage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateStage',
    description: 'Changes information about a Stage resource Use it to change an existing resource.',
    tool: awsUpdateStage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteStage',
    description: 'Deletes a Stage resource Use it to permanently remove the resource.',
    tool: awsDeleteStage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateAutoscalingGroup',
    description: 'Create a new Auto Scaling group Use it to provision a new resource.',
    tool: awsCreateAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeAutoscalingGroups',
    description: 'Describe one or more Auto Scaling groups Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateAutoscalingGroup',
    description: 'Update an Auto Scaling group Use it to change an existing resource.',
    tool: awsUpdateAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteAutoscalingGroup',
    description: 'Delete an Auto Scaling group Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAttachInstancesToAutoscalingGroup',
    description: 'Attach instances to an Auto Scaling group Use it to attach a policy or resource.',
    tool: awsAttachInstancesToAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDetachInstancesFromAutoscalingGroup',
    description: 'Detach instances from an Auto Scaling group Use it to detach or remove access.',
    tool: awsDetachInstancesFromAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsEnterStandbyAutoscalingGroup',
    description: 'Move instances into standby mode Use it to move instances.',
    tool: awsEnterStandbyAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsExitStandbyAutoscalingGroup',
    description: 'Move instances out of standby mode Use it to move instances.',
    tool: awsExitStandbyAutoscalingGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsSetAutoscalingGroupDesiredCapacity',
    description: 'Set the desired capacity for an Auto Scaling group Use it to change the configuration of the resource.',
    tool: awsSetAutoscalingGroupDesiredCapacity as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsSetAutoscalingInstanceHealth',
    description: 'Set the health status of an instance Use it to change the configuration of the resource.',
    tool: awsSetAutoscalingInstanceHealth as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsTerminateAutoscalingInstance',
    description: 'Terminate an instance in an Auto Scaling group Use it to permanently terminate the resource.',
    tool: awsTerminateAutoscalingInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateLaunchConfiguration',
    description: 'Create a launch configuration Use it to provision a new resource.',
    tool: awsCreateLaunchConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeLaunchConfigurations',
    description: 'Describe launch configurations Use it to inspect current state before making changes.',
    tool: awsDescribeLaunchConfigurations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteLaunchConfiguration',
    description: 'Delete a launch configuration Use it to permanently remove the resource.',
    tool: awsDeleteLaunchConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutAutoscalingScalingPolicy',
    description: 'Create or update a scaling policy Use it to write data or configuration.',
    tool: awsPutAutoscalingScalingPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeAutoscalingPolicies',
    description: 'Describe scaling policies Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteAutoscalingPolicy',
    description: 'Delete a scaling policy Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsExecuteAutoscalingPolicy',
    description: 'Execute a scaling policy Use it to start a query, then poll for results with the query ID.',
    tool: awsExecuteAutoscalingPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutAutoscalingScheduledAction',
    description: 'Create or update a scheduled action Use it to write data or configuration.',
    tool: awsPutAutoscalingScheduledAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeAutoscalingScheduledActions',
    description: 'Describe scheduled actions Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingScheduledActions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteAutoscalingScheduledAction',
    description: 'Delete a scheduled action Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingScheduledAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutAutoscalingLifecycleHook',
    description: 'Create or update a lifecycle hook Use it to write data or configuration.',
    tool: awsPutAutoscalingLifecycleHook as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeAutoscalingLifecycleHooks',
    description: 'Describe lifecycle hooks Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingLifecycleHooks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteAutoscalingLifecycleHook',
    description: 'Delete a lifecycle hook Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingLifecycleHook as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCompleteAutoscalingLifecycleAction',
    description: 'Complete a lifecycle action',
    tool: awsCompleteAutoscalingLifecycleAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRecordAutoscalingLifecycleActionHeartbeat',
    description: 'Record a lifecycle action heartbeat',
    tool: awsRecordAutoscalingLifecycleActionHeartbeat as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateOrUpdateAutoscalingTags',
    description: 'Create or update tags for Auto Scaling resources Use it to provision a new resource.',
    tool: awsCreateOrUpdateAutoscalingTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeAutoscalingTags',
    description: 'Describe tags for Auto Scaling resources Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteAutoscalingTags',
    description: 'Delete tags from Auto Scaling resources Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeAutoscalingActivities',
    description: 'Describe scaling activities Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingActivities as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAutoscalingInstances',
    description: 'Describe Auto Scaling instances Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAutoscalingNotificationConfigurations',
    description: 'Describe notification configurations Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingNotificationConfigurations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutAutoscalingNotificationConfiguration',
    description: 'Create or update a notification configuration Use it to write data or configuration.',
    tool: awsPutAutoscalingNotificationConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteAutoscalingNotificationConfiguration',
    description: 'Delete a notification configuration Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingNotificationConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeAutoscalingAccountLimits',
    description: 'Describe account limits for Auto Scaling Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingAccountLimits as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAutoscalingAdjustmentTypes',
    description: 'Describe adjustment types Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingAdjustmentTypes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAutoscalingMetricCollectionTypes',
    description: 'Describe metric collection types Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingMetricCollectionTypes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsEnableAutoscalingMetricsCollection',
    description: 'Enable metrics collection for an Auto Scaling group Use it to enable a feature.',
    tool: awsEnableAutoscalingMetricsCollection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisableAutoscalingMetricsCollection',
    description: 'Disable metrics collection for an Auto Scaling group Use it to disable a feature.',
    tool: awsDisableAutoscalingMetricsCollection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeAutoscalingTerminationPolicyTypes',
    description: 'Describe termination policy types Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingTerminationPolicyTypes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAutoscalingScalingProcessTypes',
    description: 'Describe scaling process types Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingScalingProcessTypes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsSuspendAutoscalingProcesses',
    description: 'Suspend processes for an Auto Scaling group Use it to pause a process.',
    tool: awsSuspendAutoscalingProcesses as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsResumeAutoscalingProcesses',
    description: 'Resume processes for an Auto Scaling group Use it to resume a paused process.',
    tool: awsResumeAutoscalingProcesses as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsBatchPutAutoscalingScheduledAction',
    description: 'Batch create or update scheduled actions Use it to operate on multiple resources.',
    tool: awsBatchPutAutoscalingScheduledAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsBatchDeleteAutoscalingScheduledAction',
    description: 'Batch delete scheduled actions Use it to operate on multiple resources.',
    tool: awsBatchDeleteAutoscalingScheduledAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStartAutoscalingInstanceRefresh',
    description: 'Start an instance refresh Use it to start a stopped resource.',
    tool: awsStartAutoscalingInstanceRefresh as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCancelAutoscalingInstanceRefresh',
    description: 'Cancel an instance refresh Use it to cancel a running operation.',
    tool: awsCancelAutoscalingInstanceRefresh as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeAutoscalingInstanceRefreshes',
    description: 'Describe instance refreshes Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingInstanceRefreshes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAutoscalingWarmPool',
    description: 'Describe warm pool configuration Use it to inspect current state before making changes.',
    tool: awsDescribeAutoscalingWarmPool as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutAutoscalingWarmPool',
    description: 'Create or update warm pool configuration Use it to write data or configuration.',
    tool: awsPutAutoscalingWarmPool as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteAutoscalingWarmPool',
    description: 'Delete warm pool configuration Use it to permanently remove the resource.',
    tool: awsDeleteAutoscalingWarmPool as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutEventbridgeEvents',
    description: 'Send custom events to EventBridge Use it to write data or configuration.',
    tool: awsPutEventbridgeEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutEventbridgeRule',
    description: 'Create or update an EventBridge rule Use it to write data or configuration.',
    tool: awsPutEventbridgeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeRules',
    description: 'List EventBridge rules Use it to inspect current state before making changes.',
    tool: awsListEventbridgeRules as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEventbridgeRule',
    description: 'Get details about an EventBridge rule Use it to inspect current state before making changes.',
    tool: awsDescribeEventbridgeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteEventbridgeRule',
    description: 'Delete an EventBridge rule Use it to permanently remove the resource.',
    tool: awsDeleteEventbridgeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsEnableEventbridgeRule',
    description: 'Enable an EventBridge rule Use it to enable a feature.',
    tool: awsEnableEventbridgeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisableEventbridgeRule',
    description: 'Disable an EventBridge rule Use it to disable a feature.',
    tool: awsDisableEventbridgeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutEventbridgeTargets',
    description: 'Add or update targets for an EventBridge rule Use it to write data or configuration.',
    tool: awsPutEventbridgeTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeTargets',
    description: 'List targets for an EventBridge rule Use it to inspect current state before making changes.',
    tool: awsListEventbridgeTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRemoveEventbridgeTargets',
    description: 'Remove targets from an EventBridge rule Use it to remove access or configuration.',
    tool: awsRemoveEventbridgeTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateEventbridgeEventBus',
    description: 'Create a new EventBridge event bus Use it to provision a new resource.',
    tool: awsCreateEventbridgeEventBus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeEventBuses',
    description: 'List EventBridge event buses Use it to inspect current state before making changes.',
    tool: awsListEventbridgeEventBuses as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEventbridgeEventBus',
    description: 'Get details about an EventBridge event bus Use it to inspect current state before making changes.',
    tool: awsDescribeEventbridgeEventBus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteEventbridgeEventBus',
    description: 'Delete an EventBridge event bus Use it to permanently remove the resource.',
    tool: awsDeleteEventbridgeEventBus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateEventbridgeArchive',
    description: 'Create an EventBridge archive Use it to provision a new resource.',
    tool: awsCreateEventbridgeArchive as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeArchives',
    description: 'List EventBridge archives Use it to inspect current state before making changes.',
    tool: awsListEventbridgeArchives as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEventbridgeArchive',
    description: 'Get details about an EventBridge archive Use it to inspect current state before making changes.',
    tool: awsDescribeEventbridgeArchive as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateEventbridgeArchive',
    description: 'Update an EventBridge archive Use it to change an existing resource.',
    tool: awsUpdateEventbridgeArchive as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEventbridgeArchive',
    description: 'Delete an EventBridge archive Use it to permanently remove the resource.',
    tool: awsDeleteEventbridgeArchive as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsStartEventbridgeReplay',
    description: 'Start an EventBridge replay Use it to start a stopped resource.',
    tool: awsStartEventbridgeReplay as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeReplays',
    description: 'List EventBridge replays Use it to inspect current state before making changes.',
    tool: awsListEventbridgeReplays as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEventbridgeReplay',
    description: 'Get details about an EventBridge replay Use it to inspect current state before making changes.',
    tool: awsDescribeEventbridgeReplay as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCancelEventbridgeReplay',
    description: 'Cancel an EventBridge replay Use it to cancel a running operation.',
    tool: awsCancelEventbridgeReplay as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateEventbridgeConnection',
    description: 'Create an EventBridge connection Use it to provision a new resource.',
    tool: awsCreateEventbridgeConnection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeConnections',
    description: 'List EventBridge connections Use it to inspect current state before making changes.',
    tool: awsListEventbridgeConnections as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEventbridgeConnection',
    description: 'Get details about an EventBridge connection Use it to inspect current state before making changes.',
    tool: awsDescribeEventbridgeConnection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateEventbridgeConnection',
    description: 'Update an EventBridge connection Use it to change an existing resource.',
    tool: awsUpdateEventbridgeConnection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEventbridgeConnection',
    description: 'Delete an EventBridge connection Use it to permanently remove the resource.',
    tool: awsDeleteEventbridgeConnection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateEventbridgeEndpoint',
    description: 'Create an EventBridge endpoint Use it to provision a new resource.',
    tool: awsCreateEventbridgeEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListEventbridgeEndpoints',
    description: 'List EventBridge endpoints Use it to inspect current state before making changes.',
    tool: awsListEventbridgeEndpoints as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEventbridgeEndpoint',
    description: 'Get details about an EventBridge endpoint Use it to inspect current state before making changes.',
    tool: awsDescribeEventbridgeEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateEventbridgeEndpoint',
    description: 'Update an EventBridge endpoint Use it to change an existing resource.',
    tool: awsUpdateEventbridgeEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEventbridgeEndpoint',
    description: 'Delete an EventBridge endpoint Use it to permanently remove the resource.',
    tool: awsDeleteEventbridgeEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListEventbridgeTags',
    description: 'List tags for an EventBridge resource Use it to inspect current state before making changes.',
    tool: awsListEventbridgeTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagEventbridgeResource',
    description: 'Add tags to an EventBridge resource Use it to label the resource.',
    tool: awsTagEventbridgeResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagEventbridgeResource',
    description: 'Remove tags from an EventBridge resource Use it to remove tags from the resource.',
    tool: awsUntagEventbridgeResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateVpcLatticeService',
    description: 'Create a new VPC Lattice service Use it to provision a new resource.',
    tool: awsCreateVpcLatticeService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeService',
    description: 'Get information about a VPC Lattice service Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeService',
    description: 'Update a VPC Lattice service Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeService',
    description: 'Delete a VPC Lattice service Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeService as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeServices',
    description: 'List VPC Lattice services Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeServices as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeServiceNetwork',
    description: 'Create a new VPC Lattice service network Use it to provision a new resource.',
    tool: awsCreateVpcLatticeServiceNetwork as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeServiceNetwork',
    description: 'Get information about a VPC Lattice service network Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeServiceNetwork as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeServiceNetwork',
    description: 'Update a VPC Lattice service network Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeServiceNetwork as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeServiceNetwork',
    description: 'Delete a VPC Lattice service network Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeServiceNetwork as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeServiceNetworks',
    description: 'List VPC Lattice service networks Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeServiceNetworks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeListener',
    description: 'Create a new VPC Lattice listener Use it to provision a new resource.',
    tool: awsCreateVpcLatticeListener as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeListener',
    description: 'Get information about a VPC Lattice listener Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeListener as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeListener',
    description: 'Update a VPC Lattice listener Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeListener as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeListener',
    description: 'Delete a VPC Lattice listener Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeListener as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeListeners',
    description: 'List VPC Lattice listeners Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeListeners as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeRule',
    description: 'Create a new VPC Lattice rule Use it to provision a new resource.',
    tool: awsCreateVpcLatticeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeRule',
    description: 'Get information about a VPC Lattice rule Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeRule',
    description: 'Update a VPC Lattice rule Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeRule',
    description: 'Delete a VPC Lattice rule Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeRule as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeRules',
    description: 'List VPC Lattice rules Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeRules as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeTargetGroup',
    description: 'Create a new VPC Lattice target group Use it to provision a new resource.',
    tool: awsCreateVpcLatticeTargetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeTargetGroup',
    description: 'Get information about a VPC Lattice target group Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeTargetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeTargetGroup',
    description: 'Update a VPC Lattice target group Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeTargetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeTargetGroup',
    description: 'Delete a VPC Lattice target group Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeTargetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeTargetGroups',
    description: 'List VPC Lattice target groups Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeTargetGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRegisterVpcLatticeTargets',
    description: 'Register targets with a VPC Lattice target group Use it to provision a new resource.',
    tool: awsRegisterVpcLatticeTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeregisterVpcLatticeTargets',
    description: 'Deregister targets from a VPC Lattice target group Use it to permanently remove the resource.',
    tool: awsDeregisterVpcLatticeTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetVpcLatticeTargets',
    description: 'Get targets for a VPC Lattice target group Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeServiceNetworkServiceAssociation',
    description: 'Create a service network service association Use it to provision a new resource.',
    tool: awsCreateVpcLatticeServiceNetworkServiceAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeServiceNetworkServiceAssociation',
    description: 'Get information about a service network service association Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeServiceNetworkServiceAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteVpcLatticeServiceNetworkServiceAssociation',
    description: 'Delete a service network service association Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeServiceNetworkServiceAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeServiceNetworkServiceAssociations',
    description: 'List service network service associations Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeServiceNetworkServiceAssociations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeServiceNetworkVpcAssociation',
    description: 'Create a service network VPC association Use it to provision a new resource.',
    tool: awsCreateVpcLatticeServiceNetworkVpcAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeServiceNetworkVpcAssociation',
    description: 'Get information about a service network VPC association Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeServiceNetworkVpcAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeServiceNetworkVpcAssociation',
    description: 'Update a service network VPC association Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeServiceNetworkVpcAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeServiceNetworkVpcAssociation',
    description: 'Delete a service network VPC association Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeServiceNetworkVpcAssociation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeServiceNetworkVpcAssociations',
    description: 'List service network VPC associations Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeServiceNetworkVpcAssociations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateVpcLatticeAccessLogSubscription',
    description: 'Create an access log subscription Use it to provision a new resource.',
    tool: awsCreateVpcLatticeAccessLogSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeAccessLogSubscription',
    description: 'Get information about an access log subscription Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeAccessLogSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateVpcLatticeAccessLogSubscription',
    description: 'Update an access log subscription Use it to change an existing resource.',
    tool: awsUpdateVpcLatticeAccessLogSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteVpcLatticeAccessLogSubscription',
    description: 'Delete an access log subscription Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeAccessLogSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeAccessLogSubscriptions',
    description: 'List access log subscriptions Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeAccessLogSubscriptions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutVpcLatticeAuthPolicy',
    description: 'Put an auth policy Use it to write data or configuration.',
    tool: awsPutVpcLatticeAuthPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeAuthPolicy',
    description: 'Get an auth policy Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeAuthPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteVpcLatticeAuthPolicy',
    description: 'Delete an auth policy Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeAuthPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsPutVpcLatticeResourcePolicy',
    description: 'Put a resource policy Use it to write data or configuration.',
    tool: awsPutVpcLatticeResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetVpcLatticeResourcePolicy',
    description: 'Get a resource policy Use it to inspect current state before making changes.',
    tool: awsGetVpcLatticeResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteVpcLatticeResourcePolicy',
    description: 'Delete a resource policy Use it to permanently remove the resource.',
    tool: awsDeleteVpcLatticeResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListVpcLatticeTags',
    description: 'List tags for a VPC Lattice resource Use it to inspect current state before making changes.',
    tool: awsListVpcLatticeTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagVpcLatticeResource',
    description: 'Add tags to a VPC Lattice resource Use it to label the resource.',
    tool: awsTagVpcLatticeResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagVpcLatticeResource',
    description: 'Remove tags from a VPC Lattice resource Use it to remove tags from the resource.',
    tool: awsUntagVpcLatticeResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateCloudformationStack',
    description: 'Create a new CloudFormation stack Use it to provision a new resource.',
    tool: awsCreateCloudformationStack as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateCloudformationStack',
    description: 'Update an existing CloudFormation stack Use it to change an existing resource.',
    tool: awsUpdateCloudformationStack as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudformationStack',
    description: 'Delete a CloudFormation stack Use it to permanently remove the resource.',
    tool: awsDeleteCloudformationStack as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeCloudformationStacks',
    description: 'Describe CloudFormation stacks Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStacks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudformationStacks',
    description: 'List all CloudFormation stacks Use it to inspect current state before making changes.',
    tool: awsListCloudformationStacks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCloudformationStackEvents',
    description: 'Describe events for a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStackEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCloudformationStackResource',
    description: 'Describe a specific resource in a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStackResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCloudformationStackResources',
    description: 'Describe all resources in a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStackResources as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudformationStackResources',
    description: 'List all resources in a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsListCloudformationStackResources as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudformationChangeset',
    description: 'Create a CloudFormation change set Use it to provision a new resource.',
    tool: awsCreateCloudformationChangeset as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeCloudformationChangeset',
    description: 'Describe a CloudFormation change set Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationChangeset as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsExecuteCloudformationChangeset',
    description: 'Execute a CloudFormation change set Use it to run an operation.',
    tool: awsExecuteCloudformationChangeset as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudformationChangeset',
    description: 'Delete a CloudFormation change set Use it to permanently remove the resource.',
    tool: awsDeleteCloudformationChangeset as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCloudformationChangesets',
    description: 'List change sets for a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsListCloudformationChangesets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudformationTemplate',
    description: 'Get the template for a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsGetCloudformationTemplate as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCloudformationTemplateSummary',
    description: 'Get a summary of a CloudFormation template Use it to inspect current state before making changes.',
    tool: awsGetCloudformationTemplateSummary as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsValidateCloudformationTemplate',
    description: 'Validate a CloudFormation template Use it to validate a template or configuration.',
    tool: awsValidateCloudformationTemplate as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateCloudformationStackSet',
    description: 'Create a CloudFormation stack set Use it to provision a new resource.',
    tool: awsCreateCloudformationStackSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateCloudformationStackSet',
    description: 'Update a CloudFormation stack set Use it to change an existing resource.',
    tool: awsUpdateCloudformationStackSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudformationStackSet',
    description: 'Delete a CloudFormation stack set Use it to permanently remove the resource.',
    tool: awsDeleteCloudformationStackSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeCloudformationStackSet',
    description: 'Describe a CloudFormation stack set Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStackSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudformationStackSets',
    description: 'List all CloudFormation stack sets Use it to inspect current state before making changes.',
    tool: awsListCloudformationStackSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCloudformationStackInstances',
    description: 'Create stack instances in a stack set Use it to provision a new resource.',
    tool: awsCreateCloudformationStackInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCloudformationStackInstances',
    description: 'Delete stack instances from a stack set Use it to permanently remove the resource.',
    tool: awsDeleteCloudformationStackInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeCloudformationStackInstance',
    description: 'Describe a stack instance in a stack set Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStackInstance as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudformationStackInstances',
    description: 'List stack instances in a stack set Use it to inspect current state before making changes.',
    tool: awsListCloudformationStackInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDetectCloudformationStackDrift',
    description: 'Detect drift on a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsDetectCloudformationStackDrift as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDetectCloudformationStackResourceDrift',
    description: 'Detect drift on a specific resource in a stack Use it to inspect current state before making changes.',
    tool: awsDetectCloudformationStackResourceDrift as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCloudformationStackResourceDrifts',
    description: 'Describe resource drifts in a CloudFormation stack Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationStackResourceDrifts as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudformationExports',
    description: 'List CloudFormation exports Use it to inspect current state before making changes.',
    tool: awsListCloudformationExports as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCloudformationImports',
    description: 'List CloudFormation imports for an export Use it to inspect current state before making changes.',
    tool: awsListCloudformationImports as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCloudformationAccountLimits',
    description: 'Describe CloudFormation account limits Use it to inspect current state before making changes.',
    tool: awsDescribeCloudformationAccountLimits as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCodebuildProject',
    description: 'Create a new CodeBuild project Use it to provision a new resource.',
    tool: awsCreateCodebuildProject as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodebuildProject',
    description: 'Get information about a CodeBuild build project Use it to inspect current state before making changes.',
    tool: awsGetCodebuildProject as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodebuildProjects',
    description: 'List all CodeBuild build projects Use it to inspect current state before making changes.',
    tool: awsListCodebuildProjects as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodebuildProject',
    description: 'Update a CodeBuild build project Use it to change an existing resource.',
    tool: awsUpdateCodebuildProject as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodebuildProject',
    description: 'Delete a CodeBuild build project Use it to permanently remove the resource.',
    tool: awsDeleteCodebuildProject as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsBatchGetCodebuildProjects',
    description: 'Get information about one or more build projects Use it to operate on multiple resources.',
    tool: awsBatchGetCodebuildProjects as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStartCodebuildBuild',
    description: 'Start running a build Use it to start a stopped resource.',
    tool: awsStartCodebuildBuild as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopCodebuildBuild',
    description: 'Stop a running build Use it to stop a running resource (billable config may remain).',
    tool: awsStopCodebuildBuild as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodebuildBuilds',
    description: 'List build IDs Use it to inspect current state before making changes.',
    tool: awsListCodebuildBuilds as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodebuildBuildsForProject',
    description: 'List build IDs for a project Use it to inspect current state before making changes.',
    tool: awsListCodebuildBuildsForProject as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetCodebuildBuilds',
    description: 'Get information about one or more builds Use it to operate on multiple resources.',
    tool: awsBatchGetCodebuildBuilds as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRetryCodebuildBuild',
    description: 'Restart a build Use it to retry a failed operation.',
    tool: awsRetryCodebuildBuild as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStartCodebuildBuildBatch',
    description: 'Starts a batch build for a project Use it to start a stopped resource.',
    tool: awsStartCodebuildBuildBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopCodebuildBuildBatch',
    description: 'Stops a running batch build Use it to stop a running resource (billable config may remain).',
    tool: awsStopCodebuildBuildBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodebuildBuildBatches',
    description: 'Retrieves the identifiers of your build batches Use it to inspect current state before making changes.',
    tool: awsListCodebuildBuildBatches as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodebuildBuildBatchesForProject',
    description: 'Retrieves the identifiers of the build batches for a specific project Use it to inspect current state before making changes.',
    tool: awsListCodebuildBuildBatchesForProject as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetCodebuildBuildBatches',
    description: 'Retrieves information about one or more batch builds Use it to operate on multiple resources.',
    tool: awsBatchGetCodebuildBuildBatches as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRetryCodebuildBuildBatch',
    description: 'Restarts a failed batch build Use it to retry a failed operation.',
    tool: awsRetryCodebuildBuildBatch as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListCodebuildReports',
    description: 'Returns a list of ARNs for the reports Use it to inspect current state before making changes.',
    tool: awsListCodebuildReports as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodebuildReportsForReportGroup',
    description: 'Returns a list of ARNs for the reports that belong to a ReportGroup Use it to inspect current state before making changes.',
    tool: awsListCodebuildReportsForReportGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCodebuildReport',
    description: 'Returns a list of ARNs for the reports in the current account Use it to inspect current state before making changes.',
    tool: awsGetCodebuildReport as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetCodebuildReports',
    description: 'Returns an array of reports Use it to operate on multiple resources.',
    tool: awsBatchGetCodebuildReports as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodebuildReport',
    description: 'Deletes a report Use it to permanently remove the resource.',
    tool: awsDeleteCodebuildReport as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateCodebuildReportGroup',
    description: 'Creates a report group Use it to provision a new resource.',
    tool: awsCreateCodebuildReportGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodebuildReportGroup',
    description: 'Returns a report group Use it to inspect current state before making changes.',
    tool: awsGetCodebuildReportGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodebuildReportGroup',
    description: 'Updates a report group Use it to change an existing resource.',
    tool: awsUpdateCodebuildReportGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodebuildReportGroup',
    description: 'Deletes a report group Use it to permanently remove the resource.',
    tool: awsDeleteCodebuildReportGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodebuildReportGroups',
    description: 'Returns a list of report groups Use it to inspect current state before making changes.',
    tool: awsListCodebuildReportGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetCodebuildReportGroups',
    description: 'Returns an array of report groups Use it to operate on multiple resources.',
    tool: awsBatchGetCodebuildReportGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateCodedeployApplication',
    description: 'Create a new CodeDeploy application Use it to provision a new resource.',
    tool: awsCreateCodedeployApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodedeployApplication',
    description: 'Get details about a CodeDeploy application Use it to inspect current state before making changes.',
    tool: awsGetCodedeployApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodedeployApplications',
    description: 'List all CodeDeploy applications Use it to inspect current state before making changes.',
    tool: awsListCodedeployApplications as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodedeployApplication',
    description: 'Update a CodeDeploy application Use it to change an existing resource.',
    tool: awsUpdateCodedeployApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodedeployApplication',
    description: 'Delete a CodeDeploy application Use it to permanently remove the resource.',
    tool: awsDeleteCodedeployApplication as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsBatchGetCodedeployApplications',
    description: 'Get information about one or more applications Use it to operate on multiple resources.',
    tool: awsBatchGetCodedeployApplications as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateCodedeployDeploymentGroup',
    description: 'Create a new deployment group Use it to provision a new resource.',
    tool: awsCreateCodedeployDeploymentGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodedeployDeploymentGroup',
    description: 'Get details about a deployment group Use it to inspect current state before making changes.',
    tool: awsGetCodedeployDeploymentGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodedeployDeploymentGroups',
    description: 'List deployment groups for an application Use it to inspect current state before making changes.',
    tool: awsListCodedeployDeploymentGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodedeployDeploymentGroup',
    description: 'Update a deployment group Use it to change an existing resource.',
    tool: awsUpdateCodedeployDeploymentGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodedeployDeploymentGroup',
    description: 'Delete a deployment group Use it to permanently remove the resource.',
    tool: awsDeleteCodedeployDeploymentGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsBatchGetCodedeployDeploymentGroups',
    description: 'Get information about one or more deployment groups Use it to operate on multiple resources.',
    tool: awsBatchGetCodedeployDeploymentGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateCodedeployDeployment',
    description: 'Create a new deployment Use it to provision a new resource.',
    tool: awsCreateCodedeployDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodedeployDeployment',
    description: 'Get details about a deployment Use it to inspect current state before making changes.',
    tool: awsGetCodedeployDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodedeployDeployments',
    description: 'List deployments Use it to inspect current state before making changes.',
    tool: awsListCodedeployDeployments as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsStopCodedeployDeployment',
    description: 'Stop a deployment Use it to stop a running resource (billable config may remain).',
    tool: awsStopCodedeployDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsContinueCodedeployDeployment',
    description: 'Continue a stopped deployment Use it to resume a deployment.',
    tool: awsContinueCodedeployDeployment as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsBatchGetCodedeployDeployments',
    description: 'Get information about one or more deployments Use it to operate on multiple resources.',
    tool: awsBatchGetCodedeployDeployments as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListCodedeployApplicationRevisions',
    description: 'List application revisions Use it to inspect current state before making changes.',
    tool: awsListCodedeployApplicationRevisions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCodedeployApplicationRevision',
    description: 'Get details about an application revision Use it to inspect current state before making changes.',
    tool: awsGetCodedeployApplicationRevision as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRegisterCodedeployApplicationRevision',
    description: 'Register a new application revision Use it to provision a new resource.',
    tool: awsRegisterCodedeployApplicationRevision as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListCodedeployOnPremisesInstances',
    description: 'List on-premises instances Use it to inspect current state before making changes.',
    tool: awsListCodedeployOnPremisesInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetCodedeployOnPremisesInstances',
    description: 'Get information about one or more on-premises instances Use it to operate on multiple resources.',
    tool: awsBatchGetCodedeployOnPremisesInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsAddTagsToCodedeployOnPremisesInstances',
    description: 'Add tags to on-premises instances Use it to grant access or attach configuration.',
    tool: awsAddTagsToCodedeployOnPremisesInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveTagsFromCodedeployOnPremisesInstances',
    description: 'Remove tags from on-premises instances Use it to remove access or configuration.',
    tool: awsRemoveTagsFromCodedeployOnPremisesInstances as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodedeployTags',
    description: 'List tags for a CodeDeploy resource Use it to inspect current state before making changes.',
    tool: awsListCodedeployTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagCodedeployResource',
    description: 'Add tags to a CodeDeploy resource Use it to label the resource.',
    tool: awsTagCodedeployResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagCodedeployResource',
    description: 'Remove tags from a CodeDeploy resource Use it to remove tags from the resource.',
    tool: awsUntagCodedeployResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateCodepipelinePipeline',
    description: 'Create a new CodePipeline pipeline Use it to provision a new resource.',
    tool: awsCreateCodepipelinePipeline as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodepipelinePipeline',
    description: 'Get details about a CodePipeline pipeline Use it to inspect current state before making changes.',
    tool: awsGetCodepipelinePipeline as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodepipelinePipelines',
    description: 'List all CodePipeline pipelines Use it to inspect current state before making changes.',
    tool: awsListCodepipelinePipelines as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodepipelinePipeline',
    description: 'Update a CodePipeline pipeline Use it to change an existing resource.',
    tool: awsUpdateCodepipelinePipeline as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodepipelinePipeline',
    description: 'Delete a CodePipeline pipeline Use it to permanently remove the resource.',
    tool: awsDeleteCodepipelinePipeline as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetCodepipelinePipelineState',
    description: 'Get the current state of a CodePipeline pipeline Use it to inspect current state before making changes.',
    tool: awsGetCodepipelinePipelineState as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsStartCodepipelineExecution',
    description: 'Start a new pipeline execution Use it to start a stopped resource.',
    tool: awsStartCodepipelineExecution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetCodepipelineExecution',
    description: 'Get details about a pipeline execution Use it to inspect current state before making changes.',
    tool: awsGetCodepipelineExecution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodepipelineExecutions',
    description: 'List pipeline executions Use it to inspect current state before making changes.',
    tool: awsListCodepipelineExecutions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsStopCodepipelineExecution',
    description: 'Stop a pipeline execution Use it to stop a running resource (billable config may remain).',
    tool: awsStopCodepipelineExecution as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodepipelineActionExecutions',
    description: 'List action executions for a pipeline execution Use it to inspect current state before making changes.',
    tool: awsListCodepipelineActionExecutions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodepipelineActionTypes',
    description: 'List available action types Use it to inspect current state before making changes.',
    tool: awsListCodepipelineActionTypes as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCodepipelineActionType',
    description: 'Get details about an action type Use it to inspect current state before making changes.',
    tool: awsGetCodepipelineActionType as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCodepipelineWebhook',
    description: 'Create a webhook for a CodePipeline pipeline Use it to provision a new resource.',
    tool: awsCreateCodepipelineWebhook as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListCodepipelineWebhooks',
    description: 'List webhooks for pipelines Use it to inspect current state before making changes.',
    tool: awsListCodepipelineWebhooks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteCodepipelineWebhook',
    description: 'Delete a webhook Use it to permanently remove the resource.',
    tool: awsDeleteCodepipelineWebhook as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDeregisterCodepipelineWebhookWithThirdParty',
    description: 'Deregister a webhook with a third party Use it to permanently remove the resource.',
    tool: awsDeregisterCodepipelineWebhookWithThirdParty as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRegisterCodepipelineWebhookWithThirdParty',
    description: 'Register a webhook with a third party Use it to provision a new resource.',
    tool: awsRegisterCodepipelineWebhookWithThirdParty as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutCodepipelineApprovalResult',
    description: 'Put approval result for an approval action Use it to write data or configuration.',
    tool: awsPutCodepipelineApprovalResult as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutCodepipelineJobSuccessResult',
    description: 'Put success result for a job Use it to write data or configuration.',
    tool: awsPutCodepipelineJobSuccessResult as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutCodepipelineJobFailureResult',
    description: 'Put failure result for a job Use it to write data or configuration.',
    tool: awsPutCodepipelineJobFailureResult as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutCodepipelineThirdPartyJobSuccessResult',
    description: 'Put success result for a third-party job Use it to write data or configuration.',
    tool: awsPutCodepipelineThirdPartyJobSuccessResult as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsPutCodepipelineThirdPartyJobFailureResult',
    description: 'Put failure result for a third-party job Use it to write data or configuration.',
    tool: awsPutCodepipelineThirdPartyJobFailureResult as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListCodepipelineTags',
    description: 'List tags for a CodePipeline resource Use it to inspect current state before making changes.',
    tool: awsListCodepipelineTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagCodepipelineResource',
    description: 'Add tags to a CodePipeline resource Use it to label the resource.',
    tool: awsTagCodepipelineResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagCodepipelineResource',
    description: 'Remove tags from a CodePipeline resource Use it to remove tags from the resource.',
    tool: awsUntagCodepipelineResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateCodeartifactDomain',
    description: 'Create a new CodeArtifact domain Use it to provision a new resource.',
    tool: awsCreateCodeartifactDomain as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeCodeartifactDomain',
    description: 'Get details about a CodeArtifact domain Use it to inspect current state before making changes.',
    tool: awsDescribeCodeartifactDomain as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodeartifactDomains',
    description: 'List all CodeArtifact domains Use it to inspect current state before making changes.',
    tool: awsListCodeartifactDomains as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteCodeartifactDomain',
    description: 'Delete a CodeArtifact domain Use it to permanently remove the resource.',
    tool: awsDeleteCodeartifactDomain as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateCodeartifactRepository',
    description: 'Create a new CodeArtifact repository Use it to provision a new resource.',
    tool: awsCreateCodeartifactRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeCodeartifactRepository',
    description: 'Get details about a CodeArtifact repository Use it to inspect current state before making changes.',
    tool: awsDescribeCodeartifactRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodeartifactRepositories',
    description: 'List CodeArtifact repositories Use it to inspect current state before making changes.',
    tool: awsListCodeartifactRepositories as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodeartifactRepository',
    description: 'Update a CodeArtifact repository Use it to change an existing resource.',
    tool: awsUpdateCodeartifactRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodeartifactRepository',
    description: 'Delete a CodeArtifact repository Use it to permanently remove the resource.',
    tool: awsDeleteCodeartifactRepository as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodeartifactPackages',
    description: 'List packages in a CodeArtifact repository Use it to inspect current state before making changes.',
    tool: awsListCodeartifactPackages as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCodeartifactPackage',
    description: 'Get details about a CodeArtifact package Use it to inspect current state before making changes.',
    tool: awsDescribeCodeartifactPackage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteCodeartifactPackage',
    description: 'Delete a CodeArtifact package Use it to permanently remove the resource.',
    tool: awsDeleteCodeartifactPackage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodeartifactPackageVersions',
    description: 'List versions of a CodeArtifact package Use it to inspect current state before making changes.',
    tool: awsListCodeartifactPackageVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeCodeartifactPackageVersion',
    description: 'Get details about a CodeArtifact package version Use it to inspect current state before making changes.',
    tool: awsDescribeCodeartifactPackageVersion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteCodeartifactPackageVersions',
    description: 'Delete one or more CodeArtifact package versions Use it to permanently remove the resource.',
    tool: awsDeleteCodeartifactPackageVersions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetCodeartifactAuthorizationToken',
    description: 'Get an authorization token for CodeArtifact Use it to inspect current state before making changes.',
    tool: awsGetCodeartifactAuthorizationToken as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCodeartifactRepositoryEndpoint',
    description: 'Get the repository endpoint for CodeArtifact Use it to inspect current state before making changes.',
    tool: awsGetCodeartifactRepositoryEndpoint as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCodeartifactPackageGroup',
    description: 'Create a new CodeArtifact package group Use it to provision a new resource.',
    tool: awsCreateCodeartifactPackageGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeCodeartifactPackageGroup',
    description: 'Get details about a CodeArtifact package group Use it to inspect current state before making changes.',
    tool: awsDescribeCodeartifactPackageGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCodeartifactPackageGroups',
    description: 'List CodeArtifact package groups Use it to inspect current state before making changes.',
    tool: awsListCodeartifactPackageGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateCodeartifactPackageGroup',
    description: 'Update a CodeArtifact package group Use it to change an existing resource.',
    tool: awsUpdateCodeartifactPackageGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCodeartifactPackageGroup',
    description: 'Delete a CodeArtifact package group Use it to permanently remove the resource.',
    tool: awsDeleteCodeartifactPackageGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateCodeartifactExternalConnection',
    description: 'Associate an external connection with a repository Use it to connect resources.',
    tool: awsAssociateCodeartifactExternalConnection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateCodeartifactExternalConnection',
    description: 'Disassociate an external connection from a repository Use it to disconnect resources.',
    tool: awsDisassociateCodeartifactExternalConnection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListCodeartifactTags',
    description: 'List tags for a CodeArtifact resource Use it to inspect current state before making changes.',
    tool: awsListCodeartifactTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagCodeartifactResource',
    description: 'Add tags to a CodeArtifact resource Use it to label the resource.',
    tool: awsTagCodeartifactResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagCodeartifactResource',
    description: 'Remove tags from a CodeArtifact resource Use it to remove tags from the resource.',
    tool: awsUntagCodeartifactResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListTrails',
    description: 'Lists trails that are in the current account, or all trails in the current region Use it to inspect current state before making changes.',
    tool: awsListTrails as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetTrail',
    description: 'Returns settings information for a specified trail Use it to inspect current state before making changes.',
    tool: awsGetTrail as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateTrail',
    description: 'Creates a trail that specifies the settings for delivery of log data to an Amazon S3 bucket Use it to provision a new resource.',
    tool: awsCreateTrail as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateTrail',
    description: 'Updates trail settings that control what events you are logging, and how to handle log files Use it to change an existing resource.',
    tool: awsUpdateTrail as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteTrail',
    description: 'Deletes a trail Use it to permanently remove the resource.',
    tool: awsDeleteTrail as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeTrails',
    description: 'Retrieves settings for one or more trails Use it to inspect current state before making changes.',
    tool: awsDescribeTrails as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetTrailStatus',
    description: 'Returns a JSON-formatted list of information about the specified trail Use it to inspect current state before making changes.',
    tool: awsGetTrailStatus as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsStartLogging',
    description: 'Starts the recording of AWS API calls and log file delivery for a trail Use it to start a stopped resource.',
    tool: awsStartLogging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsStopLogging',
    description: 'Suspends the recording of AWS API calls and log file delivery for the specified trail Use it to stop a running resource (billable config may remain).',
    tool: awsStopLogging as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsLookupEvents',
    description: 'Looks up management events or CloudTrail Insights events that are captured by CloudTrail Use it to inspect current state before making changes.',
    tool: awsLookupEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateEventDataStore',
    description: 'Creates a new event data store Use it to provision a new resource.',
    tool: awsCreateEventDataStore as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteEventDataStore',
    description: 'Disables the event data store specified by EventDataStore Use it to permanently remove the resource.',
    tool: awsDeleteEventDataStore as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateEventDataStore',
    description: 'Updates an event data store Use it to change an existing resource.',
    tool: awsUpdateEventDataStore as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetEventDataStore',
    description: 'Returns information about an event data store Use it to inspect current state before making changes.',
    tool: awsGetEventDataStore as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListEventDataStores',
    description: 'Returns information about all event data stores in the account, in the current region Use it to inspect current state before making changes.',
    tool: awsListEventDataStores as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRestoreEventDataStore',
    description: 'Restores a deleted event data store Use it to restore from a backup.',
    tool: awsRestoreEventDataStore as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateChannel',
    description: 'Creates a channel for CloudTrail to deliver events to a partner or external destination Use it to provision a new resource.',
    tool: awsCreateChannel as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteChannel',
    description: 'Deletes a channel Use it to permanently remove the resource.',
    tool: awsDeleteChannel as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateChannel',
    description: 'Updates a channel Use it to change an existing resource.',
    tool: awsUpdateChannel as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetChannel',
    description: 'Returns information about a channel Use it to inspect current state before making changes.',
    tool: awsGetChannel as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListChannels',
    description: 'Returns information about all channels Use it to inspect current state before making changes.',
    tool: awsListChannels as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutResourcePolicy',
    description: 'Attaches a resource-based permission policy to a CloudTrail channel, event data store, or lake Use it to write data or configuration.',
    tool: awsPutResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetResourcePolicy',
    description: 'Retrieves the JSON-formatted resource-based policy document attached to the CloudTrail channel Use it to inspect current state before making changes.',
    tool: awsGetResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteResourcePolicy',
    description: 'Deletes the resource-based policy attached to the CloudTrail channel, event data store, or lake Use it to permanently remove the resource.',
    tool: awsDeleteResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAddTags',
    description: 'Adds one or more tags to a trail, event data store, or channel Use it to grant access or attach configuration.',
    tool: awsAddTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsRemoveTags',
    description: 'Removes one or more tags from a trail, event data store, or channel Use it to remove access or configuration.',
    tool: awsRemoveTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListTags',
    description: 'Lists the tags for the trail, event data store, or channel in the current region Use it to inspect current state before making changes.',
    tool: awsListTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchGetTraces',
    description: 'Retrieves a list of traces specified by ID. Each trace is a collection of segment documents that originates from a single request Use it to operate on multiple resources.',
    tool: awsBatchGetTraces as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetTraceSummaries',
    description: 'Retrieves IDs and annotations for traces available for a specified time frame using an optional filter Use it to inspect current state before making changes.',
    tool: awsGetTraceSummaries as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetServiceGraph',
    description: 'Retrieves a document that describes services that process incoming requests, and downstream services that they call as a result Use it to inspect current state before making changes.',
    tool: awsGetServiceGraph as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutTraceSegments',
    description: 'Uploads segment documents to AWS X-Ray Use it to write data or configuration.',
    tool: awsPutTraceSegments as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetTraceGraph',
    description: 'Retrieves a service graph for one or more specific trace IDs Use it to inspect current state before making changes.',
    tool: awsGetTraceGraph as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetGroups',
    description: 'Retrieves all active group details Use it to inspect current state before making changes.',
    tool: awsGetGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateGroup',
    description: 'Creates a group resource with a name and a filter expression Use it to provision a new resource.',
    tool: awsCreateGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateGroup',
    description: 'Updates a group resource Use it to change an existing resource.',
    tool: awsUpdateGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteGroup',
    description: 'Deletes a group resource Use it to permanently remove the resource.',
    tool: awsDeleteGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetGroup',
    description: 'Retrieves the group details with the provided ARN Use it to inspect current state before making changes.',
    tool: awsGetGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSamplingRules',
    description: 'Retrieves all sampling rules Use it to inspect current state before making changes.',
    tool: awsGetSamplingRules as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSamplingTargets',
    description: 'Retrieves a document that describes the current sampling targets for the sampling rules Use it to inspect current state before making changes.',
    tool: awsGetSamplingTargets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutTelemetryRecords',
    description: 'Used by the AWS X-Ray daemon to upload telemetry Use it to write data or configuration.',
    tool: awsPutTelemetryRecords as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetInsight',
    description: 'Retrieves the summary information of an insight Use it to inspect current state before making changes.',
    tool: awsGetInsight as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetInsightSummaries',
    description: 'Retrieves the summaries of all insights in the specified group matching the provided filter values Use it to inspect current state before making changes.',
    tool: awsGetInsightSummaries as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetInsightEvents',
    description: 'X-Ray reevaluates insights periodically until they are resolved, and records each intermediate state in an event Use it to inspect current state before making changes.',
    tool: awsGetInsightEvents as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetInsightImpactGraph',
    description: 'Retrieves a service graph structure filtered by the insight Use it to inspect current state before making changes.',
    tool: awsGetInsightImpactGraph as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCostAndUsage',
    description: 'Retrieves cost and usage metrics for your account Use it to inspect current state before making changes.',
    tool: awsGetCostAndUsage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCostAndUsageWithResources',
    description: 'Retrieves cost and usage metrics with resources Use it to inspect current state before making changes.',
    tool: awsGetCostAndUsageWithResources as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetReservationCoverage',
    description: 'Retrieves the reservation coverage for your account Use it to inspect current state before making changes.',
    tool: awsGetReservationCoverage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetReservationPurchaseRecommendation',
    description: 'Gets recommendations for which reservations to purchase Use it to inspect current state before making changes.',
    tool: awsGetReservationPurchaseRecommendation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetReservationUtilization',
    description: 'Retrieves the reservation utilization for your account Use it to inspect current state before making changes.',
    tool: awsGetReservationUtilization as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRightsizingRecommendation',
    description: 'Creates recommendations that help you reduce cost and improve efficiency Use it to inspect current state before making changes.',
    tool: awsGetRightsizingRecommendation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSavingsPlansCoverage',
    description: 'Retrieves the Savings Plans coverage for your account Use it to inspect current state before making changes.',
    tool: awsGetSavingsPlansCoverage as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSavingsPlansPurchaseRecommendation',
    description: 'Gets recommendations for which Savings Plans to purchase Use it to inspect current state before making changes.',
    tool: awsGetSavingsPlansPurchaseRecommendation as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSavingsPlansUtilization',
    description: 'Retrieves the Savings Plans utilization for your account Use it to inspect current state before making changes.',
    tool: awsGetSavingsPlansUtilization as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSavingsPlansUtilizationDetails',
    description: 'Retrieves attribute data about Savings Plans utilization Use it to inspect current state before making changes.',
    tool: awsGetSavingsPlansUtilizationDetails as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListCostCategoryDefinitions',
    description: 'Returns the name, ARN, effective date, and number of rules for all Cost Categories defined in the account Use it to inspect current state before making changes.',
    tool: awsListCostCategoryDefinitions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetCostCategories',
    description: 'Retrieves cost category values for a specific time period Use it to inspect current state before making changes.',
    tool: awsGetCostCategories as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateCostCategoryDefinition',
    description: 'Creates a new Cost Category with the requested name and rules Use it to provision a new resource.',
    tool: awsCreateCostCategoryDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateCostCategoryDefinition',
    description: 'Updates an existing Cost Category Use it to change an existing resource.',
    tool: awsUpdateCostCategoryDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteCostCategoryDefinition',
    description: 'Deletes a Cost Category Use it to permanently remove the resource.',
    tool: awsDeleteCostCategoryDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeCostCategoryDefinition',
    description: 'Returns the name, ARN, rules, definition, and effective dates of a Cost Category Use it to inspect current state before making changes.',
    tool: awsDescribeCostCategoryDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetDimensionValues',
    description: 'Retrieves all available filter values for a specific filter over a period of time Use it to inspect current state before making changes.',
    tool: awsGetDimensionValues as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetTags',
    description: 'Queries for available tag keys and tag values for a specified period Use it to inspect current state before making changes.',
    tool: awsGetTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetAnomalies',
    description: 'Retrieves all of the cost anomalies detected on your account Use it to inspect current state before making changes.',
    tool: awsGetAnomalies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetAnomalyMonitors',
    description: 'Retrieves the cost anomaly monitor objects for your account Use it to inspect current state before making changes.',
    tool: awsGetAnomalyMonitors as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetAnomalySubscriptions',
    description: 'Retrieves the cost anomaly subscription objects for your account Use it to inspect current state before making changes.',
    tool: awsGetAnomalySubscriptions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateAnomalyMonitor',
    description: 'Creates a new cost anomaly detection monitor Use it to provision a new resource.',
    tool: awsCreateAnomalyMonitor as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateAnomalyMonitor',
    description: 'Updates an existing cost anomaly monitor Use it to change an existing resource.',
    tool: awsUpdateAnomalyMonitor as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteAnomalyMonitor',
    description: 'Deletes a cost anomaly monitor Use it to permanently remove the resource.',
    tool: awsDeleteAnomalyMonitor as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateAnomalySubscription',
    description: 'Creates a new cost anomaly subscription Use it to provision a new resource.',
    tool: awsCreateAnomalySubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateAnomalySubscription',
    description: 'Updates an existing cost anomaly subscription Use it to change an existing resource.',
    tool: awsUpdateAnomalySubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteAnomalySubscription',
    description: 'Deletes a cost anomaly subscription Use it to permanently remove the resource.',
    tool: awsDeleteAnomalySubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListBudgets',
    description: 'List all budgets in your AWS account Use it to inspect current state before making changes.',
    tool: awsListBudgets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeBudget',
    description: 'Get details about a specific budget Use it to inspect current state before making changes.',
    tool: awsDescribeBudget as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateBudget',
    description: 'Create a new budget Use it to provision a new resource.',
    tool: awsCreateBudget as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateBudget',
    description: 'Update an existing budget Use it to change an existing resource.',
    tool: awsUpdateBudget as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteBudget',
    description: 'Delete a budget Use it to permanently remove the resource.',
    tool: awsDeleteBudget as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeBudgetPerformanceHistory',
    description: 'Get the performance history of a budget Use it to inspect current state before making changes.',
    tool: awsDescribeBudgetPerformanceHistory as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateBudgetAction',
    description: 'Create a budget action Use it to provision a new resource.',
    tool: awsCreateBudgetAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateBudgetAction',
    description: 'Update a budget action Use it to change an existing resource.',
    tool: awsUpdateBudgetAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteBudgetAction',
    description: 'Delete a budget action Use it to permanently remove the resource.',
    tool: awsDeleteBudgetAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeBudgetAction',
    description: 'Get details about a specific budget action Use it to inspect current state before making changes.',
    tool: awsDescribeBudgetAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListBudgetActionsForBudget',
    description: 'List all budget actions for a specific budget Use it to inspect current state before making changes.',
    tool: awsListBudgetActionsForBudget as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListBudgetActionsForAccount',
    description: 'List all budget actions for an account Use it to inspect current state before making changes.',
    tool: awsListBudgetActionsForAccount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsExecuteBudgetAction',
    description: 'Execute a budget action Use it to run an operation.',
    tool: awsExecuteBudgetAction as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateBudgetNotification',
    description: 'Create a budget notification Use it to provision a new resource.',
    tool: awsCreateBudgetNotification as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateBudgetNotification',
    description: 'Update a budget notification Use it to change an existing resource.',
    tool: awsUpdateBudgetNotification as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteBudgetNotification',
    description: 'Delete a budget notification Use it to permanently remove the resource.',
    tool: awsDeleteBudgetNotification as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListBudgetNotificationsForBudget',
    description: 'List all notifications for a specific budget Use it to inspect current state before making changes.',
    tool: awsListBudgetNotificationsForBudget as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListBudgetNotificationsForAccount',
    description: 'List all notifications for an account Use it to inspect current state before making changes.',
    tool: awsListBudgetNotificationsForAccount as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateBudgetSubscriber',
    description: 'Create a budget subscriber Use it to provision a new resource.',
    tool: awsCreateBudgetSubscriber as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateBudgetSubscriber',
    description: 'Update a budget subscriber Use it to change an existing resource.',
    tool: awsUpdateBudgetSubscriber as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteBudgetSubscriber',
    description: 'Delete a budget subscriber Use it to permanently remove the resource.',
    tool: awsDeleteBudgetSubscriber as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListSubscribersForNotification',
    description: 'List all subscribers for a specific notification Use it to inspect current state before making changes.',
    tool: awsListSubscribersForNotification as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListBillingViews',
    description: 'List all billing views in your AWS account Use it to inspect current state before making changes.',
    tool: awsListBillingViews as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetBillingView',
    description: 'Get details about a specific billing view Use it to inspect current state before making changes.',
    tool: awsGetBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateBillingView',
    description: 'Create a new billing view Use it to provision a new resource.',
    tool: awsCreateBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateBillingView',
    description: 'Update an existing billing view Use it to change an existing resource.',
    tool: awsUpdateBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteBillingView',
    description: 'Delete a billing view Use it to permanently remove the resource.',
    tool: awsDeleteBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetBillingViewResourcePolicy',
    description: 'Get the resource-based policy attached to a billing view Use it to inspect current state before making changes.',
    tool: awsGetBillingViewResourcePolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListSourceViewsForBillingView',
    description: 'List source views associated with a billing view Use it to inspect current state before making changes.',
    tool: awsListSourceViewsForBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListBillingViewTags',
    description: 'List tags associated with a billing view Use it to inspect current state before making changes.',
    tool: awsListBillingViewTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagBillingView',
    description: 'Add tags to a billing view Use it to label the resource.',
    tool: awsTagBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagBillingView',
    description: 'Remove tags from a billing view Use it to remove tags from the resource.',
    tool: awsUntagBillingView as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsDescribeReportDefinitions',
    description: 'Lists the AWS Cost and Usage reports available to the account Use it to inspect current state before making changes.',
    tool: awsDescribeReportDefinitions as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutReportDefinition',
    description: 'Creates a new report using the description that you provide Use it to write data or configuration.',
    tool: awsPutReportDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsModifyReportDefinition',
    description: 'Allows you to programmatically update your report preferences Use it to change an existing resource.',
    tool: awsModifyReportDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteReportDefinition',
    description: 'Deletes the specified report Use it to permanently remove the resource.',
    tool: awsDeleteReportDefinition as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListKmsKeys',
    description: 'List all KMS keys in the AWS account Use it to inspect current state before making changes.',
    tool: awsListKmsKeys as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeKmsKey',
    description: 'Get detailed information about a KMS key Use it to inspect current state before making changes.',
    tool: awsDescribeKmsKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateKmsKey',
    description: 'Create a new KMS key Use it to provision a new resource.',
    tool: awsCreateKmsKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsScheduleKeyDeletion',
    description: 'Schedule a KMS key for deletion (7-30 days waiting period)',
    tool: awsScheduleKeyDeletion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCancelKeyDeletion',
    description: 'Cancel a scheduled key deletion Use it to cancel a running operation.',
    tool: awsCancelKeyDeletion as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsEnableKmsKey',
    description: 'Enable a disabled KMS key Use it to enable a feature.',
    tool: awsEnableKmsKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisableKmsKey',
    description: 'Disable a KMS key',
    tool: awsDisableKmsKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateKeyDescription',
    description: 'Update the description of a KMS key Use it to change an existing resource.',
    tool: awsUpdateKeyDescription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsKmsEncrypt',
    description: 'Encrypt plaintext data using a KMS key',
    tool: awsKmsEncrypt as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsKmsDecrypt',
    description: 'Decrypt ciphertext that was encrypted with a KMS key',
    tool: awsKmsDecrypt as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsKmsReEncrypt',
    description: 'Re-encrypt data with a different KMS key without exposing plaintext',
    tool: awsKmsReEncrypt as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGenerateDataKey',
    description: 'Generate a data encryption key (DEK) for client-side encryption',
    tool: awsGenerateDataKey as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGenerateDataKeyWithoutPlaintext',
    description: 'Generate an encrypted data encryption key without returning plaintext',
    tool: awsGenerateDataKeyWithoutPlaintext as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetKeyPolicy',
    description: 'Get the key policy for a KMS key Use it to inspect current state before making changes.',
    tool: awsGetKeyPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutKeyPolicy',
    description: 'Update the key policy for a KMS key Use it to write data or configuration.',
    tool: awsPutKeyPolicy as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListKeyPolicies',
    description: 'List the names of key policies for a KMS key Use it to inspect current state before making changes.',
    tool: awsListKeyPolicies as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateGrant',
    description: 'Create a grant that allows a principal to use a KMS key Use it to provision a new resource.',
    tool: awsCreateGrant as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListGrants',
    description: 'List grants for a KMS key Use it to inspect current state before making changes.',
    tool: awsListGrants as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsRevokeGrant',
    description: 'Revoke a grant on a KMS key',
    tool: awsRevokeGrant as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsRetireGrant',
    description: 'Retire a grant (can only be called by retiring principal)',
    tool: awsRetireGrant as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListKmsAliases',
    description: 'List aliases for KMS keys Use it to inspect current state before making changes.',
    tool: awsListKmsAliases as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateKmsAlias',
    description: 'Create an alias for a KMS key Use it to provision a new resource.',
    tool: awsCreateKmsAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteKmsAlias',
    description: 'Delete an alias for a KMS key Use it to permanently remove the resource.',
    tool: awsDeleteKmsAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsUpdateKmsAlias',
    description: 'Associate an existing alias with a different KMS key Use it to change an existing resource.',
    tool: awsUpdateKmsAlias as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListKmsResourceTags',
    description: 'List tags for a KMS key Use it to inspect current state before making changes.',
    tool: awsListKmsResourceTags as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsTagKmsResource',
    description: 'Add or update tags for a KMS key Use it to label the resource.',
    tool: awsTagKmsResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUntagKmsResource',
    description: 'Remove tags from a KMS key Use it to remove tags from the resource.',
    tool: awsUntagKmsResource as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateGuarddutyDetector',
    description: 'Create a GuardDuty detector to enable threat detection Use it to provision a new resource.',
    tool: awsCreateGuarddutyDetector as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListGuarddutyDetectors',
    description: 'List all GuardDuty detectors in the current region Use it to inspect current state before making changes.',
    tool: awsListGuarddutyDetectors as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetGuarddutyDetector',
    description: 'Get detailed information about a GuardDuty detector Use it to inspect current state before making changes.',
    tool: awsGetGuarddutyDetector as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateGuarddutyDetector',
    description: 'Update GuardDuty detector settings Use it to change an existing resource.',
    tool: awsUpdateGuarddutyDetector as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteGuarddutyDetector',
    description: 'Delete a GuardDuty detector and disable threat detection Use it to permanently remove the resource.',
    tool: awsDeleteGuarddutyDetector as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListGuarddutyFindings',
    description: 'List GuardDuty findings with optional filtering Use it to inspect current state before making changes.',
    tool: awsListGuarddutyFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetGuarddutyFindings',
    description: 'Get detailed information about specific findings Use it to inspect current state before making changes.',
    tool: awsGetGuarddutyFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateGuarddutyFindingsFeedback',
    description: 'Mark findings as useful or not useful for machine learning Use it to change an existing resource.',
    tool: awsUpdateGuarddutyFindingsFeedback as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsArchiveGuarddutyFindings',
    description: 'Archive findings to suppress future notifications',
    tool: awsArchiveGuarddutyFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUnarchiveGuarddutyFindings',
    description: 'Unarchive findings to resume notifications',
    tool: awsUnarchiveGuarddutyFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateGuarddutyIpSet',
    description: 'Create an IP set of trusted or threat IP addresses Use it to provision a new resource.',
    tool: awsCreateGuarddutyIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListGuarddutyIpSets',
    description: 'List all IP sets for a detector Use it to inspect current state before making changes.',
    tool: awsListGuarddutyIpSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetGuarddutyIpSet',
    description: 'Get details about a specific IP set Use it to inspect current state before making changes.',
    tool: awsGetGuarddutyIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateGuarddutyIpSet',
    description: 'Update an IP set Use it to change an existing resource.',
    tool: awsUpdateGuarddutyIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteGuarddutyIpSet',
    description: 'Delete an IP set Use it to permanently remove the resource.',
    tool: awsDeleteGuarddutyIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsCreateThreatIntelSet',
    description: 'Create a threat intelligence set from external sources Use it to provision a new resource.',
    tool: awsCreateThreatIntelSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListThreatIntelSets',
    description: 'List all threat intelligence sets for a detector Use it to inspect current state before making changes.',
    tool: awsListThreatIntelSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetThreatIntelSet',
    description: 'Get details about a specific threat intelligence set Use it to inspect current state before making changes.',
    tool: awsGetThreatIntelSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateThreatIntelSet',
    description: 'Update a threat intelligence set Use it to change an existing resource.',
    tool: awsUpdateThreatIntelSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteThreatIntelSet',
    description: 'Delete a threat intelligence set Use it to permanently remove the resource.',
    tool: awsDeleteThreatIntelSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsEnableSecurityHub',
    description: 'Enable AWS Security Hub in the current region Use it to enable a feature.',
    tool: awsEnableSecurityHub as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisableSecurityHub',
    description: 'Disable AWS Security Hub in the current region',
    tool: awsDisableSecurityHub as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeHub',
    description: 'Get information about the Security Hub hub resource Use it to inspect current state before making changes.',
    tool: awsDescribeHub as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateSecurityHubConfiguration',
    description: 'Update Security Hub configuration settings Use it to change an existing resource.',
    tool: awsUpdateSecurityHubConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetSecurityHubFindings',
    description: 'Retrieve security findings with optional filters Use it to inspect current state before making changes.',
    tool: awsGetSecurityHubFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateSecurityHubFindings',
    description: 'Update the status, severity, or other attributes of findings Use it to change an existing resource.',
    tool: awsUpdateSecurityHubFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsBatchImportFindings',
    description: 'Import custom findings into Security Hub Use it to operate on multiple resources.',
    tool: awsBatchImportFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsBatchUpdateFindings',
    description: 'Update multiple findings in a single request Use it to operate on multiple resources.',
    tool: awsBatchUpdateFindings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsGetSecurityHubInsights',
    description: 'Get a list of custom insights Use it to inspect current state before making changes.',
    tool: awsGetSecurityHubInsights as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateInsight',
    description: 'Create a custom insight to group findings Use it to provision a new resource.',
    tool: awsCreateInsight as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateInsight',
    description: 'Update an existing custom insight Use it to change an existing resource.',
    tool: awsUpdateInsight as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteInsight',
    description: 'Delete a custom insight Use it to permanently remove the resource.',
    tool: awsDeleteInsight as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetInsightResults',
    description: 'Get the results for a specific insight Use it to inspect current state before making changes.',
    tool: awsGetInsightResults as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeStandards',
    description: 'List available security standards (CIS, PCI-DSS, AWS Foundational) Use it to inspect current state before making changes.',
    tool: awsDescribeStandards as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetEnabledStandards',
    description: 'Get a list of enabled security standards Use it to inspect current state before making changes.',
    tool: awsGetEnabledStandards as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsBatchEnableStandards',
    description: 'Enable one or more security standards Use it to operate on multiple resources.',
    tool: awsBatchEnableStandards as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsBatchDisableStandards',
    description: 'Disable one or more security standards Use it to operate on multiple resources.',
    tool: awsBatchDisableStandards as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeProducts',
    description: 'List available Security Hub product integrations Use it to inspect current state before making changes.',
    tool: awsDescribeProducts as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListEnabledProductsForImport',
    description: 'List enabled product integrations that can send findings Use it to inspect current state before making changes.',
    tool: awsListEnabledProductsForImport as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsEnableImportFindingsForProduct',
    description: 'Enable a product integration to send findings to Security Hub Use it to enable a feature.',
    tool: awsEnableImportFindingsForProduct as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisableImportFindingsForProduct',
    description: 'Disable a product integration',
    tool: awsDisableImportFindingsForProduct as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsCreateMembers',
    description: 'Invite AWS accounts to be member accounts in Security Hub Use it to provision a new resource.',
    tool: awsCreateMembers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsListMembers',
    description: 'List Security Hub member accounts Use it to inspect current state before making changes.',
    tool: awsListMembers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetMembers',
    description: 'Get detailed information about specific member accounts Use it to inspect current state before making changes.',
    tool: awsGetMembers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDeleteMembers',
    description: 'Remove member accounts from Security Hub Use it to permanently remove the resource.',
    tool: awsDeleteMembers as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListWebAcls',
    description: 'List all Web ACLs in the region or CloudFront Use it to inspect current state before making changes.',
    tool: awsListWebAcls as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetWebAcl',
    description: 'Get detailed information about a Web ACL Use it to inspect current state before making changes.',
    tool: awsGetWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateWebAcl',
    description: 'Create a new Web ACL Use it to provision a new resource.',
    tool: awsCreateWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateWebAcl',
    description: 'Update an existing Web ACL Use it to change an existing resource.',
    tool: awsUpdateWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteWebAcl',
    description: 'Delete a Web ACL Use it to permanently remove the resource.',
    tool: awsDeleteWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsAssociateWebAcl',
    description: 'Associate a Web ACL with a resource (ALB, API Gateway, CloudFront) Use it to connect resources.',
    tool: awsAssociateWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateWebAcl',
    description: 'Disassociate a Web ACL from a resource Use it to disconnect resources.',
    tool: awsDisassociateWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListResourcesForWebAcl',
    description: 'List all resources associated with a Web ACL Use it to inspect current state before making changes.',
    tool: awsListResourcesForWebAcl as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListWafIpSets',
    description: 'List all IP sets Use it to inspect current state before making changes.',
    tool: awsListWafIpSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetWafIpSet',
    description: 'Get details about an IP set Use it to inspect current state before making changes.',
    tool: awsGetWafIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateWafIpSet',
    description: 'Create an IP set with IPv4 or IPv6 addresses Use it to provision a new resource.',
    tool: awsCreateWafIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateWafIpSet',
    description: 'Update an IP set Use it to change an existing resource.',
    tool: awsUpdateWafIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteWafIpSet',
    description: 'Delete an IP set Use it to permanently remove the resource.',
    tool: awsDeleteWafIpSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListRegexPatternSets',
    description: 'List all regex pattern sets Use it to inspect current state before making changes.',
    tool: awsListRegexPatternSets as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRegexPatternSet',
    description: 'Get details about a regex pattern set Use it to inspect current state before making changes.',
    tool: awsGetRegexPatternSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRegexPatternSet',
    description: 'Create a regex pattern set for matching strings Use it to provision a new resource.',
    tool: awsCreateRegexPatternSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateRegexPatternSet',
    description: 'Update a regex pattern set Use it to change an existing resource.',
    tool: awsUpdateRegexPatternSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteRegexPatternSet',
    description: 'Delete a regex pattern set Use it to permanently remove the resource.',
    tool: awsDeleteRegexPatternSet as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListRuleGroups',
    description: 'List all rule groups Use it to inspect current state before making changes.',
    tool: awsListRuleGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetRuleGroup',
    description: 'Get details about a rule group Use it to inspect current state before making changes.',
    tool: awsGetRuleGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateRuleGroup',
    description: 'Create a custom rule group Use it to provision a new resource.',
    tool: awsCreateRuleGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsUpdateRuleGroup',
    description: 'Update a custom rule group Use it to change an existing resource.',
    tool: awsUpdateRuleGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteRuleGroup',
    description: 'Delete a custom rule group Use it to permanently remove the resource.',
    tool: awsDeleteRuleGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsGetLoggingConfiguration',
    description: 'Get logging configuration for a Web ACL Use it to inspect current state before making changes.',
    tool: awsGetLoggingConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsPutLoggingConfiguration',
    description: 'Configure logging for a Web ACL Use it to write data or configuration.',
    tool: awsPutLoggingConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteLoggingConfiguration',
    description: 'Delete logging configuration for a Web ACL Use it to permanently remove the resource.',
    tool: awsDeleteLoggingConfiguration as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListLoggingConfigurations',
    description: 'List all logging configurations Use it to inspect current state before making changes.',
    tool: awsListLoggingConfigurations as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeManagedRuleGroup',
    description: 'Get information about an AWS managed rule group Use it to inspect current state before making changes.',
    tool: awsDescribeManagedRuleGroup as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsListAvailableManagedRuleGroups',
    description: 'List AWS and Marketplace managed rule groups Use it to inspect current state before making changes.',
    tool: awsListAvailableManagedRuleGroups as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsGetSampledRequests',
    description: 'Get sample requests that matched a rule Use it to inspect current state before making changes.',
    tool: awsGetSampledRequests as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeSubscription',
    description: 'Get details about Shield Advanced subscription status Use it to inspect current state before making changes.',
    tool: awsDescribeSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateSubscription',
    description: 'Subscribe to AWS Shield Advanced (costs $3000/month) Use it to provision a new resource.',
    tool: awsCreateSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteSubscription',
    description: 'Cancel AWS Shield Advanced subscription Use it to permanently remove the resource.',
    tool: awsDeleteSubscription as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListProtections',
    description: 'List all protected resources Use it to inspect current state before making changes.',
    tool: awsListProtections as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeProtection',
    description: 'Get details about a specific protection Use it to inspect current state before making changes.',
    tool: awsDescribeProtection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsCreateProtection',
    description: 'Create protection for a resource (requires Shield Advanced) Use it to provision a new resource.',
    tool: awsCreateProtection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDeleteProtection',
    description: 'Remove protection from a resource Use it to permanently remove the resource.',
    tool: awsDeleteProtection as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
  {
    name: 'awsListAttacks',
    description: 'List DDoS attacks detected on protected resources Use it to inspect current state before making changes.',
    tool: awsListAttacks as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAttack',
    description: 'Get detailed information about a specific DDoS attack Use it to inspect current state before making changes.',
    tool: awsDescribeAttack as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeAttackStatistics',
    description: 'Get summary statistics about DDoS attacks Use it to inspect current state before making changes.',
    tool: awsDescribeAttackStatistics as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsDescribeEmergencyContactSettings',
    description: 'Get emergency contact information for DDoS Response Team (DRT) Use it to inspect current state before making changes.',
    tool: awsDescribeEmergencyContactSettings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsUpdateEmergencyContactSettings',
    description: 'Update emergency contact information for DRT notifications Use it to change an existing resource.',
    tool: awsUpdateEmergencyContactSettings as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDescribeDrtAccess',
    description: 'Get DDoS Response Team (DRT) access status and role Use it to inspect current state before making changes.',
    tool: awsDescribeDrtAccess as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'awsAssociateDrtRole',
    description: 'Grant DRT access to your account during attacks Use it to connect resources.',
    tool: awsAssociateDrtRole as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'awsDisassociateDrtRole',
    description: 'Revoke DRT access to your account Use it to disconnect resources.',
    tool: awsDisassociateDrtRole as Tool,
    requiredAuth: 'awsCredentials' as const,
    scope: 'delete' as const,
  },
];
