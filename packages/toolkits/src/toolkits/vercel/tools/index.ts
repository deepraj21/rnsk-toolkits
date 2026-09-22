// @ts-nocheck
import { vercelAddEnvironmentVariable, vercelBatchRemoveProjectEnv, vercelCreateProjectEnv, vercelCreateSharedEnvVariable, vercelDeleteProjectEnv, vercelDeleteSharedEnvVariable, vercelEditProjectEnv, vercelFilterProjectEnvs, vercelGetProjectEnv, vercelGetSharedEnvVar, vercelGetSharedEnvVariables, vercelListEnvVariables, vercelListProjectCustomEnvironments, vercelUnlinkSharedEnvVariable, vercelUpdateSharedEnvVariable } from './environment-variables.js';
import { vercelAddProjectDomain, vercelBuyDomains, vercelBuySingleDomain, vercelCheckDomainAvailability, vercelCheckDomainPrice, vercelCheckDomainPrice2, vercelCreateDnsRecord, vercelCreateOrTransferDomain, vercelDeleteDnsRecord, vercelDeleteDomain, vercelGetDomain, vercelGetDomainConfig, vercelGetDomainTransferInfo, vercelGetProjectDomain, vercelGetProjectDomains, vercelGetTldInfo, vercelGetTldPrice, vercelListDnsRecords, vercelListDomains, vercelListSupportedTlds, vercelMoveProjectDomain, vercelRemoveProjectDomain, vercelTransferInDomain, vercelUpdateDnsRecord, vercelUpdateDomain, vercelUpdateProjectDomain, vercelVerifyProjectDomain } from './domains.js';
import { vercelAssignAlias, vercelDeleteAlias, vercelGetAlias, vercelGetPromoteAliases, vercelListAliases } from './aliases.js';
import { vercelCheckCacheArtifactExists, vercelDeleteDataCachePurgeAll, vercelDownloadArtifact, vercelGetArtifactInfo, vercelGetCacheStatus, vercelInvalidateCacheBySrcImages, vercelInvalidateCacheByTags, vercelUploadArtifact } from './cache-artifacts.js';
import { vercelCreateAuthToken, vercelDeleteAuthToken, vercelGetAuthToken, vercelGetAuthUser, vercelListAuthTokens } from './auth.js';
import { vercelCreateDeployment, vercelCreateNewDeployment, vercelDeleteDeployment, vercelGetDeployment, vercelGetDeploymentDetails, vercelGetDeploymentEvents, vercelGetDeploymentEvents2, vercelGetDeploymentFileContents, vercelGetDeploymentLogs, vercelGetDeploymentLogs2, vercelGetDeployments, vercelListAllDeployments, vercelListDeploymentAliases, vercelListDeploymentChecks, vercelListDeploymentFiles } from './deployments.js';
import { vercelCreateEdgeConfig, vercelCreateEdgeConfigToken, vercelDeleteEdgeConfig, vercelDeleteEdgeConfigTokens, vercelGetEdgeConfig, vercelGetEdgeConfigBackup, vercelGetEdgeConfigItem, vercelGetEdgeConfigSchema, vercelGetEdgeConfigToken, vercelListEdgeConfigBackups, vercelListEdgeConfigItems, vercelListEdgeConfigs, vercelListEdgeConfigTokens, vercelUpdateEdgeConfig, vercelUpdateEdgeConfigItems, vercelUpdateEdgeConfigSchema } from './edge-config.js';
import { vercelCreateProject, vercelCreateProject2, vercelCreateProjectTransferRequest, vercelDeleteProject, vercelGetProject, vercelGetProject2, vercelGetProjects, vercelListProjectMembers, vercelListProjects, vercelPauseProject, vercelUnpauseProject, vercelUpdateProject, vercelUpdateProject2, vercelUpdateProjectDataCache, vercelUpdateProjectProtectionBypass } from './projects.js';
import { vercelCreateWebhook, vercelDeleteWebhook, vercelGetWebhook, vercelListWebhooks } from './webhooks.js';
import { vercelDangerouslyDeleteBySrcImages, vercelDangerouslyDeleteByTags, vercelDeleteRollingReleaseConfig, vercelGetBulkAvailability, vercelGetConfigurations, vercelGetContactInfoSchema, vercelGetGitNamespaces, vercelGetRollingRelease, vercelGetRollingReleaseBillingStatus, vercelGetRollingReleaseConfig, vercelGetUserEvents, vercelRecordEvents, vercelRequestDeleteUser, vercelRequestPromote, vercelSearchRepo, vercelUpdateStaticIps, vercelUpdateUrlProtectionBypass, vercelUploadFile, vercelWhoAmI } from './misc.js';
import { vercelGetActiveAttackStatus, vercelGetFirewallConfig, vercelListFirewallEvents, vercelReadFirewallConfig, vercelReplaceFirewallConfig, vercelUpdateAttackChallengeMode, vercelUpdateFirewallConfig } from './firewall.js';
import { vercelGetAllLogDrains, vercelGetDrains, vercelGetRuntimeLogs, vercelListIntegrationLogDrains, vercelTestDrain } from './logs.js';
import { vercelGetCerts } from './certs.js';
import { vercelGetTeam, vercelGetTeams, vercelListTeamMembers, vercelListTeams, vercelUpdateTeam } from './teams.js';

export { vercelAddEnvironmentVariable };
export { vercelBatchRemoveProjectEnv };
export { vercelCreateProjectEnv };
export { vercelCreateSharedEnvVariable };
export { vercelDeleteProjectEnv };
export { vercelDeleteSharedEnvVariable };
export { vercelEditProjectEnv };
export { vercelFilterProjectEnvs };
export { vercelGetProjectEnv };
export { vercelGetSharedEnvVar };
export { vercelGetSharedEnvVariables };
export { vercelListEnvVariables };
export { vercelListProjectCustomEnvironments };
export { vercelUnlinkSharedEnvVariable };
export { vercelUpdateSharedEnvVariable };
export { vercelAddProjectDomain };
export { vercelBuyDomains };
export { vercelBuySingleDomain };
export { vercelCheckDomainAvailability };
export { vercelCheckDomainPrice };
export { vercelCheckDomainPrice2 };
export { vercelCreateDnsRecord };
export { vercelCreateOrTransferDomain };
export { vercelDeleteDnsRecord };
export { vercelDeleteDomain };
export { vercelGetDomain };
export { vercelGetDomainConfig };
export { vercelGetDomainTransferInfo };
export { vercelGetProjectDomain };
export { vercelGetProjectDomains };
export { vercelGetTldInfo };
export { vercelGetTldPrice };
export { vercelListDnsRecords };
export { vercelListDomains };
export { vercelListSupportedTlds };
export { vercelMoveProjectDomain };
export { vercelRemoveProjectDomain };
export { vercelTransferInDomain };
export { vercelUpdateDnsRecord };
export { vercelUpdateDomain };
export { vercelUpdateProjectDomain };
export { vercelVerifyProjectDomain };
export { vercelAssignAlias };
export { vercelDeleteAlias };
export { vercelGetAlias };
export { vercelGetPromoteAliases };
export { vercelListAliases };
export { vercelCheckCacheArtifactExists };
export { vercelDeleteDataCachePurgeAll };
export { vercelDownloadArtifact };
export { vercelGetArtifactInfo };
export { vercelGetCacheStatus };
export { vercelInvalidateCacheBySrcImages };
export { vercelInvalidateCacheByTags };
export { vercelUploadArtifact };
export { vercelCreateAuthToken };
export { vercelDeleteAuthToken };
export { vercelGetAuthToken };
export { vercelGetAuthUser };
export { vercelListAuthTokens };
export { vercelCreateDeployment };
export { vercelCreateNewDeployment };
export { vercelDeleteDeployment };
export { vercelGetDeployment };
export { vercelGetDeploymentDetails };
export { vercelGetDeploymentEvents };
export { vercelGetDeploymentEvents2 };
export { vercelGetDeploymentFileContents };
export { vercelGetDeploymentLogs };
export { vercelGetDeploymentLogs2 };
export { vercelGetDeployments };
export { vercelListAllDeployments };
export { vercelListDeploymentAliases };
export { vercelListDeploymentChecks };
export { vercelListDeploymentFiles };
export { vercelCreateEdgeConfig };
export { vercelCreateEdgeConfigToken };
export { vercelDeleteEdgeConfig };
export { vercelDeleteEdgeConfigTokens };
export { vercelGetEdgeConfig };
export { vercelGetEdgeConfigBackup };
export { vercelGetEdgeConfigItem };
export { vercelGetEdgeConfigSchema };
export { vercelGetEdgeConfigToken };
export { vercelListEdgeConfigBackups };
export { vercelListEdgeConfigItems };
export { vercelListEdgeConfigs };
export { vercelListEdgeConfigTokens };
export { vercelUpdateEdgeConfig };
export { vercelUpdateEdgeConfigItems };
export { vercelUpdateEdgeConfigSchema };
export { vercelCreateProject };
export { vercelCreateProject2 };
export { vercelCreateProjectTransferRequest };
export { vercelDeleteProject };
export { vercelGetProject };
export { vercelGetProject2 };
export { vercelGetProjects };
export { vercelListProjectMembers };
export { vercelListProjects };
export { vercelPauseProject };
export { vercelUnpauseProject };
export { vercelUpdateProject };
export { vercelUpdateProject2 };
export { vercelUpdateProjectDataCache };
export { vercelUpdateProjectProtectionBypass };
export { vercelCreateWebhook };
export { vercelDeleteWebhook };
export { vercelGetWebhook };
export { vercelListWebhooks };
export { vercelDangerouslyDeleteBySrcImages };
export { vercelDangerouslyDeleteByTags };
export { vercelDeleteRollingReleaseConfig };
export { vercelGetBulkAvailability };
export { vercelGetConfigurations };
export { vercelGetContactInfoSchema };
export { vercelGetGitNamespaces };
export { vercelGetRollingRelease };
export { vercelGetRollingReleaseBillingStatus };
export { vercelGetRollingReleaseConfig };
export { vercelGetUserEvents };
export { vercelRecordEvents };
export { vercelRequestDeleteUser };
export { vercelRequestPromote };
export { vercelSearchRepo };
export { vercelUpdateStaticIps };
export { vercelUpdateUrlProtectionBypass };
export { vercelUploadFile };
export { vercelWhoAmI };
export { vercelGetActiveAttackStatus };
export { vercelGetFirewallConfig };
export { vercelListFirewallEvents };
export { vercelReadFirewallConfig };
export { vercelReplaceFirewallConfig };
export { vercelUpdateAttackChallengeMode };
export { vercelUpdateFirewallConfig };
export { vercelGetAllLogDrains };
export { vercelGetDrains };
export { vercelGetRuntimeLogs };
export { vercelListIntegrationLogDrains };
export { vercelTestDrain };
export { vercelGetCerts };
export { vercelGetTeam };
export { vercelGetTeams };
export { vercelListTeamMembers };
export { vercelListTeams };
export { vercelUpdateTeam };

export const vercelTools = [
    { name: 'vercelAddEnvironmentVariable', description: 'Tool to add an environment variable to a Vercel project. Variables only take effect in subsequent deployments — already-', tool: vercelAddEnvironmentVariable, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelAddProjectDomain', description: 'Tool to attach a custom domain to a Vercel project. Use when you need to add a domain to a project for production or bra', tool: vercelAddProjectDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelAssignAlias', description: 'Tool to assign an alias to a specific Vercel deployment. Use when you need to associate a custom domain or subdomain wit', tool: vercelAssignAlias, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelBatchRemoveProjectEnv', description: 'Tool to batch remove environment variables from a Vercel project. Use when you need to delete multiple environment varia', tool: vercelBatchRemoveProjectEnv, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelBuyDomains', description: 'Tool to purchase multiple domains through Vercel\'s domain registrar. Use when registering new domains after checking av', tool: vercelBuyDomains, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelBuySingleDomain', description: 'Tool to purchase a domain through Vercel\'s domain registrar. Use when you need to register and buy a domain after confi', tool: vercelBuySingleDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCheckCacheArtifactExists', description: 'Tool to check if a cache artifact exists by its hash. Use when verifying whether a cache artifact is already stored befo', tool: vercelCheckCacheArtifactExists, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelCheckDomainAvailability', description: 'Tool to check if a domain is available for registration. Read-only: does not reserve or purchase the domain. Use when yo', tool: vercelCheckDomainAvailability, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelCheckDomainPrice', description: 'DEPRECATED: Use VERCEL_CHECK_DOMAIN_PRICE2 instead. Tool to check the price for a domain before purchase. Use when evalu', tool: vercelCheckDomainPrice, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelCheckDomainPrice2', description: 'Check pricing for a domain including purchase, renewal, and transfer costs. Use this to evaluate the cost of registering', tool: vercelCheckDomainPrice2, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelCreateAuthToken', description: 'Tool to create a new authentication token. Use when you need to programmatically generate a new auth token with optional', tool: vercelCreateAuthToken, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateDeployment', description: 'DEPRECATED: Use VERCEL_CREATE_NEW_DEPLOYMENT instead. Create a new deployment on Vercel. Deploys static files or connect', tool: vercelCreateDeployment, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateDnsRecord', description: 'Tool to create a new DNS record for a domain. Use when you need to add DNS records such as A, AAAA, CNAME, MX, TXT, SRV,', tool: vercelCreateDnsRecord, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateEdgeConfig', description: 'Creates a new Edge Config for storing key-value data at the edge. Edge Configs enable ultra-low latency data reads from ', tool: vercelCreateEdgeConfig, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateEdgeConfigToken', description: 'Create a read access token for a specific Edge Config. The generated token is used to authenticate against the Edge Conf', tool: vercelCreateEdgeConfigToken, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateNewDeployment', description: 'Tool to create a new deployment. Use when you need to deploy files or a Git commit to a Vercel project. Example for file', tool: vercelCreateNewDeployment, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateOrTransferDomain', description: 'Tool to add an existing domain to the Vercel platform. Use when you need to add a domain to Vercel for DNS management or', tool: vercelCreateOrTransferDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateProject', description: 'DEPRECATED: Use VERCEL_VERCEL_CREATE_PROJECT2 instead. Tool to create a new Vercel project. Use when automating project ', tool: vercelCreateProject, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateProject2', description: 'Tool to create a new Vercel project with comprehensive configuration options. Use when you need to create a project with', tool: vercelCreateProject2, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateProjectEnv', description: 'DEPRECATED: Use VERCEL_ADD_ENVIRONMENT_VARIABLE instead. Tool to create environment variables in a Vercel project. Use w', tool: vercelCreateProjectEnv, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateProjectTransferRequest', description: 'Tool to create a project transfer request. Use when you need to initiate a transfer of a Vercel project to another accou', tool: vercelCreateProjectTransferRequest, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateSharedEnvVariable', description: 'Tool to create one or more shared environment variables in Vercel. Use when you need to create environment variables tha', tool: vercelCreateSharedEnvVariable, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelCreateWebhook', description: 'Tool to create a webhook for receiving notifications about Vercel events. Use when you need to set up automated response', tool: vercelCreateWebhook, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelDangerouslyDeleteBySrcImages', description: 'Tool to dangerously delete edge cache by source image URLs. Use when you need to invalidate cached images from the edge ', tool: vercelDangerouslyDeleteBySrcImages, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDangerouslyDeleteByTags', description: 'Tool to dangerously delete edge cache by tags. Use when you need to purge cached content for specific cache tags in a Ve', tool: vercelDangerouslyDeleteByTags, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteAlias', description: 'Tool to delete an alias from Vercel. Use when you need to remove a deployment alias or custom domain alias after confirm', tool: vercelDeleteAlias, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteAuthToken', description: 'Tool to delete an authentication token. Use when you need to revoke a token programmatically after confirming its validi', tool: vercelDeleteAuthToken, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteDataCachePurgeAll', description: 'Tool to purge all data cache entries for a specific project. Use when you need to clear the entire data cache for a proj', tool: vercelDeleteDataCachePurgeAll, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteDeployment', description: 'Permanently delete a Vercel deployment by its ID or URL. Use this action to remove a deployment from Vercel. The deploym', tool: vercelDeleteDeployment, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteDnsRecord', description: 'Tool to delete a DNS record from a domain. Use when you need to remove an existing DNS record by its record ID and domai', tool: vercelDeleteDnsRecord, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteDomain', description: 'Tool to remove a domain by name from Vercel. Use when you need to delete a domain that is no longer needed.', tool: vercelDeleteDomain, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteEdgeConfig', description: 'Tool to delete an Edge Config by its unique identifier. Use when you need to permanently remove an Edge Config and all i', tool: vercelDeleteEdgeConfig, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteEdgeConfigTokens', description: 'Tool to delete one or more Edge Config tokens. Use when you need to revoke access tokens from an Edge Config. Note: The ', tool: vercelDeleteEdgeConfigTokens, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteProject', description: 'Tool to delete a Vercel project by ID or name. Use after confirming the correct project identifier to permanently remove', tool: vercelDeleteProject, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteProjectEnv', description: 'Tool to remove an environment variable from a Vercel project. Use when you need to delete a specific environment variabl', tool: vercelDeleteProjectEnv, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteRollingReleaseConfig', description: 'Tool to delete rolling release configuration for a project. Use when you need to remove or disable rolling release confi', tool: vercelDeleteRollingReleaseConfig, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteSharedEnvVariable', description: 'Tool to delete one or more shared environment variables. Use when you need to remove shared env vars by their IDs (up to', tool: vercelDeleteSharedEnvVariable, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDeleteWebhook', description: 'Delete a webhook by its unique ID to stop receiving event notifications. This action permanently removes the webhook con', tool: vercelDeleteWebhook, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelDownloadArtifact', description: 'Download a cache artifact from Vercel\'s Remote Cache by its hash. Use this to retrieve previously cached build artifact', tool: vercelDownloadArtifact, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelEditProjectEnv', description: 'Tool to edit an environment variable in a Vercel project. Use when you need to update an existing environment variable\'', tool: vercelEditProjectEnv, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelFilterProjectEnvs', description: 'Tool to retrieve environment variables of a Vercel project by id or name. Use when you need to list and filter environme', tool: vercelFilterProjectEnvs, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetActiveAttackStatus', description: 'Tool to read active attack data from Vercel Firewall for a specific project. Use when you need to check if a project is ', tool: vercelGetActiveAttackStatus, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetAlias', description: 'Tool to retrieve information about a Vercel alias by ID or alias name. Use when you need to get details of a specific al', tool: vercelGetAlias, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetAllLogDrains', description: 'Tool to retrieve a list of all log drains (deprecated). Use when you need to list all log drains configured for your acc', tool: vercelGetAllLogDrains, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetArtifactInfo', description: 'Tool to query information about artifacts by their hashes. Use when you need to retrieve metadata about one or more arti', tool: vercelGetArtifactInfo, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetAuthToken', description: 'Tool to retrieve metadata for an authentication token. Use when you need to inspect details of a specific token or get i', tool: vercelGetAuthToken, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetAuthUser', description: 'Tool to get the authenticated user\'s profile. Use when you need to retrieve details about the currently authenticated u', tool: vercelGetAuthUser, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetBulkAvailability', description: 'Tool to check availability for multiple domains at once. Use when you need to verify availability of multiple domain nam', tool: vercelGetBulkAvailability, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetCacheStatus', description: 'Tool to get the status of Remote Caching for the principal. Use when you need to check if Remote Caching is enabled, dis', tool: vercelGetCacheStatus, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetCerts', description: 'Tool to retrieve SSL/TLS certificates for the authenticated user or team. Use after authentication to list active certif', tool: vercelGetCerts, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetConfigurations', description: 'Tool to get configurations for the authenticated user or team. Use when you need to list integration configurations inst', tool: vercelGetConfigurations, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetContactInfoSchema', description: 'Tool to retrieve the contact information schema for a domain\'s top-level domain (TLD). Use when you need to understand ', tool: vercelGetContactInfoSchema, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeployment', description: 'Tool to get a deployment by ID or URL. Use when you need to retrieve detailed information about a specific deployment.', tool: vercelGetDeployment, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeploymentDetails', description: 'DEPRECATED: Use VERCEL_VERCEL_GET_DEPLOYMENT instead. Retrieves detailed information about a specific deployment. Use af', tool: vercelGetDeploymentDetails, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeploymentEvents', description: 'DEPRECATED: Use VERCEL_VERCEL_GET_DEPLOYMENT_EVENTS2 instead. Tool to retrieve events related to a specific deployment. ', tool: vercelGetDeploymentEvents, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeploymentEvents2', description: 'Tool to get deployment events for a specific Vercel deployment by ID or URL. Use when you need to retrieve build logs, e', tool: vercelGetDeploymentEvents2, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeploymentFileContents', description: 'Retrieve the contents of a specific file from a Vercel deployment. Returns the file content as a base64-encoded string. ', tool: vercelGetDeploymentFileContents, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeploymentLogs', description: 'DEPRECATED: Use VERCEL_VERCEL_GET_DEPLOYMENT_EVENTS2 instead. Tool to retrieve logs for a specific Vercel deployment. Us', tool: vercelGetDeploymentLogs, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeploymentLogs2', description: 'Tool to retrieve runtime logs for a specific Vercel deployment by project and deployment ID. Use when you need to debug ', tool: vercelGetDeploymentLogs2, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDeployments', description: 'Tool to list deployments from Vercel. Use when you need to retrieve deployment information for a project or team.', tool: vercelGetDeployments, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDomain', description: 'Tool to retrieve complete information for a single domain. Use when you need to check domain details, ownership verifica', tool: vercelGetDomain, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDomainConfig', description: 'Tool to get a domain\'s configuration details from Vercel. Use when you need to check how a domain is configured, what D', tool: vercelGetDomainConfig, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDomainTransferInfo', description: 'Tool to get information required to transfer a domain to Vercel. Use when you need to check transfer availability or cur', tool: vercelGetDomainTransferInfo, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetDrains', description: 'Tool to retrieve a list of all drains. Use this to get all configured drains for an account or team, including their del', tool: vercelGetDrains, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetEdgeConfig', description: 'Tool to retrieve detailed information about a specific Edge Config by ID. Use when you need to inspect edge config metad', tool: vercelGetEdgeConfig, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetEdgeConfigBackup', description: 'Tool to retrieve a specific backup version of an Edge Config. Use when you need to inspect or restore a previous version', tool: vercelGetEdgeConfigBackup, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetEdgeConfigItem', description: 'Tool to retrieve a specific item within an Edge Config. Use after obtaining the Edge Config ID and when you need to insp', tool: vercelGetEdgeConfigItem, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetEdgeConfigSchema', description: 'Tool to retrieve the JSON schema of a specific Edge Config. Use when you need to inspect the schema definition of an edg', tool: vercelGetEdgeConfigSchema, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetEdgeConfigToken', description: 'Tool to retrieve details of a specific token associated with an Edge Config. Use when you need metadata for an existing ', tool: vercelGetEdgeConfigToken, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetFirewallConfig', description: 'Tool to retrieve firewall configuration for a Vercel project. Use when you need to inspect current firewall rules and se', tool: vercelGetFirewallConfig, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetGitNamespaces', description: 'Tool to list Git namespaces (organizations/users) by provider. Use this to discover available Git namespaces for integra', tool: vercelGetGitNamespaces, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetProject', description: 'DEPRECATED: Use VERCEL_VERCEL_GET_PROJECT2 instead. Tool to retrieve information about a Vercel project by ID or name. U', tool: vercelGetProject, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetProject2', description: 'Tool to find a project by ID or name with comprehensive details. Use when you need complete project metadata including c', tool: vercelGetProject2, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetProjectDomain', description: 'Tool to retrieve details about a specific domain attached to a Vercel project. Use when you need to check domain configu', tool: vercelGetProjectDomain, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetProjectDomains', description: 'Tool to retrieve all domains attached to a Vercel project. Use when you need to verify domain configuration, check verif', tool: vercelGetProjectDomains, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetProjectEnv', description: 'Tool to retrieve the decrypted value of an environment variable from a Vercel project. Use when you need to access the a', tool: vercelGetProjectEnv, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetProjects', description: 'Tool to retrieve a list of projects from Vercel. Use this to get project information with optional filtering by reposito', tool: vercelGetProjects, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetPromoteAliases', description: 'Tool to get a list of aliases with status for the current promote operation. Use when you need to check the status of al', tool: vercelGetPromoteAliases, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetRollingRelease', description: 'Tool to retrieve active rolling release information for a Vercel project. Use when you need to check the status of a gra', tool: vercelGetRollingRelease, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetRollingReleaseBillingStatus', description: 'Tool to retrieve the rolling release billing status for a Vercel project. Use when you need to check if rolling releases', tool: vercelGetRollingReleaseBillingStatus, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetRollingReleaseConfig', description: 'Tool to get rolling release configuration for a Vercel project. Use when you need to retrieve the project-level rolling ', tool: vercelGetRollingReleaseConfig, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetRuntimeLogs', description: 'DEPRECATED: Use VERCEL_GET_DEPLOYMENT_LOGS2 instead. Tool to retrieve runtime logs for a specific Vercel deployment. Use', tool: vercelGetRuntimeLogs, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetSharedEnvVar', description: 'Tool to retrieve the decrypted value of a Shared Environment Variable by id. Use when you need to inspect a specific sha', tool: vercelGetSharedEnvVar, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetSharedEnvVariables', description: 'Tool to list all shared environment variables for a team. Use when you need to retrieve or inspect shared environment va', tool: vercelGetSharedEnvVariables, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetTeam', description: 'Retrieves detailed information about a specific Vercel team by its ID or slug. Returns comprehensive team metadata inclu', tool: vercelGetTeam, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetTeams', description: 'Tool to list all teams accessible to the authenticated user with detailed information. Use when you need comprehensive t', tool: vercelGetTeams, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetTldInfo', description: 'Tool to get information about a specific top-level domain (TLD). Use when you need to check supported language codes for', tool: vercelGetTldInfo, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetTldPrice', description: 'Tool to get pricing information for a specific top-level domain (TLD). Use when you need to check domain registration, r', tool: vercelGetTldPrice, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetUserEvents', description: 'Tool to list user events. Use when you need to retrieve events generated by a user or team, such as logins, deployments,', tool: vercelGetUserEvents, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelGetWebhook', description: 'Tool to retrieve details of a specific webhook by ID. Use when you need to inspect webhook configuration, events, or met', tool: vercelGetWebhook, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelInvalidateCacheBySrcImages', description: 'Tool to invalidate edge cache by source image URLs. Use when you need to mark cached images as stale for specific source', tool: vercelInvalidateCacheBySrcImages, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelInvalidateCacheByTags', description: 'Tool to invalidate edge cache by tags. Use when you need to mark cached content as stale for specific cache tags. Invali', tool: vercelInvalidateCacheByTags, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelListAliases', description: 'Tool to list aliases from Vercel API. Use when you need to retrieve aliases with optional filtering by domain, project, ', tool: vercelListAliases, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListAllDeployments', description: 'DEPRECATED: Use VERCEL_GET_DEPLOYMENTS instead. Lists deployments under your user or team context. Results are cursor-pa', tool: vercelListAllDeployments, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListAuthTokens', description: 'Tool to list authentication tokens. Use when you need to retrieve all tokens for the current user or an optional team.', tool: vercelListAuthTokens, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListDeploymentAliases', description: 'Tool to list all aliases assigned to a specific deployment. Use when you need to retrieve the aliases (custom domains or', tool: vercelListDeploymentAliases, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListDeploymentChecks', description: 'Tool to retrieve a list of checks for a specific deployment. Use after a deployment to inspect check statuses and result', tool: vercelListDeploymentChecks, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListDeploymentFiles', description: 'Tool to list all files in a specific deployment. Use when you need to inspect the file tree structure of a deployed appl', tool: vercelListDeploymentFiles, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListDnsRecords', description: 'Tool to list existing DNS records for a domain. Use when you need to retrieve, audit, or verify DNS configuration for a ', tool: vercelListDnsRecords, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListDomains', description: 'Tool to list all domains from Vercel. Use this to retrieve domain information including verification status, nameservers', tool: vercelListDomains, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListEdgeConfigBackups', description: 'Tool to retrieve backups for a specific Edge Config. Use when you need to list or inspect available backups for recovery', tool: vercelListEdgeConfigBackups, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListEdgeConfigItems', description: 'Tool to retrieve all items from a specific Edge Config. Use when you need to inspect all key-value pairs stored in an Ed', tool: vercelListEdgeConfigItems, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListEdgeConfigs', description: 'Tool to retrieve all Edge Configs for an account or team. Use when you need to list all Edge Config definitions.', tool: vercelListEdgeConfigs, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListEdgeConfigTokens', description: 'Tool to get all tokens of an Edge Config. Use when you need to retrieve the complete list of tokens associated with a sp', tool: vercelListEdgeConfigTokens, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListEnvVariables', description: 'DEPRECATED: Use FilterProjectEnvs instead. Tool to list environment variables for a specific project. Use when you need ', tool: vercelListEnvVariables, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListFirewallEvents', description: 'Retrieve firewall events and security actions for a specific Vercel project. Use this tool when you need to: - Monitor s', tool: vercelListFirewallEvents, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListIntegrationLogDrains', description: 'Retrieves a list of Integration log drains for a team or account. Log drains forward logs from deployments to external e', tool: vercelListIntegrationLogDrains, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListProjectCustomEnvironments', description: 'Tool to retrieve custom environments for a Vercel project. Use when you need to list all custom environments or filter b', tool: vercelListProjectCustomEnvironments, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListProjectMembers', description: 'Tool to list all members of a Vercel project. Use when you need to retrieve member information, check access permissions', tool: vercelListProjectMembers, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListProjects', description: 'DEPRECATED: Use GetProjects instead. Tool to list all projects accessible to the authenticated user or team. Use this to', tool: vercelListProjects, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListSupportedTlds', description: 'Tool to retrieve all TLDs (top-level domains) supported by Vercel for domain registration. Use when you need to verify i', tool: vercelListSupportedTlds, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListTeamMembers', description: 'Tool to list all members of a Vercel team. Use when you need to retrieve team member information, check team access perm', tool: vercelListTeamMembers, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListTeams', description: 'DEPRECATED: Use VERCEL_VERCEL_GET_TEAMS instead. Tool to list all teams accessible to the authenticated user. Use after ', tool: vercelListTeams, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelListWebhooks', description: 'Tool to retrieve a list of all webhooks for the authenticated account or team. Use this to discover configured webhooks ', tool: vercelListWebhooks, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelMoveProjectDomain', description: 'Tool to move a domain from one Vercel project to another. Use when you need to transfer domain ownership between project', tool: vercelMoveProjectDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelPauseProject', description: 'Tool to pause a Vercel project. Use when you need to temporarily disable a project to prevent new deployments and stop s', tool: vercelPauseProject, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelReadFirewallConfig', description: 'Tool to read firewall configuration for a Vercel project. Use when you need to inspect current firewall settings, IP rul', tool: vercelReadFirewallConfig, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelRecordEvents', description: 'Tool to record artifacts cache usage events. Use when tracking cache hits and misses for artifact hashes to monitor remo', tool: vercelRecordEvents, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelRemoveProjectDomain', description: 'Tool to remove a domain from a Vercel project. Use when you need to detach a domain from a project or clean up domain as', tool: vercelRemoveProjectDomain, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelReplaceFirewallConfig', description: 'Tool to update firewall configuration for a Vercel project. Use when you need to enable/disable firewall, configure CRS ', tool: vercelReplaceFirewallConfig, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelRequestDeleteUser', description: 'Tool to initiate user account deletion on Vercel. Use when a user wants to delete their account. This triggers a verific', tool: vercelRequestDeleteUser, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelRequestPromote', description: 'Tool to promote a deployment to production by pointing all production domains for a project to the given deployment. Use', tool: vercelRequestPromote, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelSearchRepo', description: 'Tool to search and list Git repositories linked to a namespace by provider. Use this to discover available repositories ', tool: vercelSearchRepo, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelTestDrain', description: 'Tool to validate a drain delivery configuration by sending a test request. Use when you need to verify that a drain endp', tool: vercelTestDrain, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
    { name: 'vercelTransferInDomain', description: 'Tool to transfer a domain to Vercel from another registrar. Use when you need to migrate domain registration to Vercel. ', tool: vercelTransferInDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUnlinkSharedEnvVariable', description: 'Tool to disconnect a shared environment variable from a Vercel project. Use when you need to remove the linkage between ', tool: vercelUnlinkSharedEnvVariable, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUnpauseProject', description: 'Tool to unpause a specific project by its ID. Use after identifying a paused project to enable auto assigning custom pro', tool: vercelUnpauseProject, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateAttackChallengeMode', description: 'Tool to update Attack Challenge mode for a Vercel project. Use when you need to enable or disable enhanced security prot', tool: vercelUpdateAttackChallengeMode, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateDnsRecord', description: 'Tool to update an existing DNS record. Use when you need to modify DNS record properties such as value, name, type, TTL,', tool: vercelUpdateDnsRecord, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateDomain', description: 'Tool to update or move an apex domain on Vercel. Use when you need to modify domain configuration (zone settings) or tra', tool: vercelUpdateDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateEdgeConfig', description: 'Tool to update an Edge Config by changing its slug. Use when you need to rename an Edge Config to reflect a new purpose ', tool: vercelUpdateEdgeConfig, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateEdgeConfigItems', description: 'Tool to update items within a specific Edge Config. Use when you need to batch modify, add, or remove key-value pairs in', tool: vercelUpdateEdgeConfigItems, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelUpdateEdgeConfigSchema', description: 'Tool to update the JSON Schema for an Edge Config. Use when you need to define or modify validation rules for Edge Confi', tool: vercelUpdateEdgeConfigSchema, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateFirewallConfig', description: 'Tool to incrementally update Vercel Firewall configuration for a project using PATCH. Use when you need to: enable/disab', tool: vercelUpdateFirewallConfig, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelUpdateProject', description: 'DEPRECATED: Use VERCEL_VERCEL_UPDATE_PROJECT2 instead. Tool to update an existing project. Partial-update: omitted field', tool: vercelUpdateProject, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateProject2', description: 'Tool to update an existing Vercel project configuration. Use when you need to modify project settings such as framework,', tool: vercelUpdateProject2, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateProjectDataCache', description: 'Tool to update the data cache feature for a Vercel project. Use when you need to enable or disable data caching for a pr', tool: vercelUpdateProjectDataCache, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateProjectDomain', description: 'Tool to update a project domain in Vercel. Use when you need to modify domain settings such as git branch association, r', tool: vercelUpdateProjectDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateProjectProtectionBypass', description: 'Tool to update protection bypass for automation on a Vercel project. Use when you need to generate, revoke, or update au', tool: vercelUpdateProjectProtectionBypass, requiredAuth: 'vercelToken' as const, scope: 'delete' as const },
    { name: 'vercelUpdateSharedEnvVariable', description: 'Tool to update one or more shared environment variables. Use when you need to modify shared env var properties like valu', tool: vercelUpdateSharedEnvVariable, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateStaticIps', description: 'Tool to configure Static IPs for a Vercel project. Use when you need to enable or configure Static IPs for builds or spe', tool: vercelUpdateStaticIps, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateTeam', description: 'Tool to update a Vercel team\'s configuration. Use when you need to modify team settings like name, description, securit', tool: vercelUpdateTeam, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUpdateUrlProtectionBypass', description: 'Tool to update the protection bypass for a URL. Use when you need to configure shareable links with TTL, revoke/regenera', tool: vercelUpdateUrlProtectionBypass, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUploadArtifact', description: 'Tool to upload a cache artifact to Vercel. Use when you need to store build artifacts in Vercel\'s remote cache.', tool: vercelUploadArtifact, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelUploadFile', description: 'Tool to upload deployment files to Vercel. Use when preparing files for a Vercel deployment. The uploaded file is stored', tool: vercelUploadFile, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelVerifyProjectDomain', description: 'Attempts to verify a project domain by checking if DNS challenges are correctly configured. Call this after adding a dom', tool: vercelVerifyProjectDomain, requiredAuth: 'vercelToken' as const, scope: 'write' as const },
    { name: 'vercelWhoAmI', description: 'Return the identity (email, username) of the connected Vercel account.', tool: vercelWhoAmI, requiredAuth: 'vercelToken' as const, scope: 'read' as const },
];