// @ts-nocheck
import { pulumiCreateStack } from './stacks.js';
import { pulumiGetStack } from './stacks.js';
import { pulumiDeleteStack } from './stacks.js';
import { pulumiGetStackActivity } from './stacks.js';
import { pulumiListStackCollaborators } from './stacks.js';
import { pulumiGetStackConfig } from './stacks.js';
import { pulumiSetStackConfig } from './stacks.js';
import { pulumiDeleteStackConfig } from './stacks.js';
import { pulumiGetStackOutputs } from './stacks.js';
import { pulumiGetStackMetadata } from './stacks.js';
import { pulumiRenameStack } from './stacks.js';
import { pulumiTransferStack } from './stacks.js';
import { pulumiGetStackTags } from './stacks.js';
import { pulumiSetStackTags } from './stacks.js';
import { pulumiDeleteStackTag } from './stacks.js';
import { pulumiGetStackTeams } from './stacks.js';
import { pulumiTriggerUpdate } from './stacks.js';
import { pulumiListUpdates } from './stacks.js';
import { pulumiGetLatestUpdate } from './stacks.js';
import { pulumiGetUpdate } from './stacks.js';
import { pulumiCancelUpdate } from './stacks.js';
import { pulumiGetResourceCount } from './stacks.js';
import { pulumiGetLatestResources } from './stacks.js';
import { pulumiGetResource } from './stacks.js';
import { pulumiExportStack } from './stacks.js';
import { pulumiImportStack } from './stacks.js';
import { pulumiGetDriftStatus } from './stacks.js';
import { pulumiListDriftRuns } from './stacks.js';
import { pulumiListDeployments } from './stacks.js';
import { pulumiGetDeployment } from './stacks.js';
import { pulumiCancelDeployment } from './stacks.js';
import { pulumiGetDeploymentLogs } from './stacks.js';
import { pulumiGetDeploymentSettings } from './stacks.js';
import { pulumiSetDeploymentSettings } from './stacks.js';
import { pulumiPauseDeployments } from './stacks.js';
import { pulumiResumeDeployments } from './stacks.js';
import { pulumiListWebhooks } from './stacks.js';
import { pulumiCreateWebhook } from './stacks.js';
import { pulumiDeleteWebhook } from './stacks.js';
import { pulumiPingWebhook } from './stacks.js';
import { pulumiEncryptValue } from './stacks.js';
import { pulumiDecryptValue } from './stacks.js';
import { pulumiGetOrg } from './orgs.js';
import { pulumiGetOrgMetadata } from './orgs.js';
import { pulumiListOrgTeams } from './orgs.js';
import { pulumiListOrgMembers } from './orgs.js';
import { pulumiProjectExists } from './orgs.js';
import { pulumiGetUser } from './user.js';
import { pulumiListUserStacks } from './user.js';
import { pulumiListAccessTokens } from './user.js';
import { pulumiCreateAccessToken } from './user.js';
import { pulumiDeleteAccessToken } from './user.js';

export {
  pulumiCreateStack,
  pulumiGetStack,
  pulumiDeleteStack,
  pulumiGetStackActivity,
  pulumiListStackCollaborators,
  pulumiGetStackConfig,
  pulumiSetStackConfig,
  pulumiDeleteStackConfig,
  pulumiGetStackOutputs,
  pulumiGetStackMetadata,
  pulumiRenameStack,
  pulumiTransferStack,
  pulumiGetStackTags,
  pulumiSetStackTags,
  pulumiDeleteStackTag,
  pulumiGetStackTeams,
  pulumiTriggerUpdate,
  pulumiListUpdates,
  pulumiGetLatestUpdate,
  pulumiGetUpdate,
  pulumiCancelUpdate,
  pulumiGetResourceCount,
  pulumiGetLatestResources,
  pulumiGetResource,
  pulumiExportStack,
  pulumiImportStack,
  pulumiGetDriftStatus,
  pulumiListDriftRuns,
  pulumiListDeployments,
  pulumiGetDeployment,
  pulumiCancelDeployment,
  pulumiGetDeploymentLogs,
  pulumiGetDeploymentSettings,
  pulumiSetDeploymentSettings,
  pulumiPauseDeployments,
  pulumiResumeDeployments,
  pulumiListWebhooks,
  pulumiCreateWebhook,
  pulumiDeleteWebhook,
  pulumiPingWebhook,
  pulumiEncryptValue,
  pulumiDecryptValue,
  pulumiGetOrg,
  pulumiGetOrgMetadata,
  pulumiListOrgTeams,
  pulumiListOrgMembers,
  pulumiProjectExists,
  pulumiGetUser,
  pulumiListUserStacks,
  pulumiListAccessTokens,
  pulumiCreateAccessToken,
  pulumiDeleteAccessToken,
};

const auth = 'pulumiAccessToken' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[] = []) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const pulumiTools = [
  entry('pulumiCreateStack', pulumiCreateStack, 'write', []),
  entry('pulumiGetStack', pulumiGetStack, 'read', []),
  entry('pulumiDeleteStack', pulumiDeleteStack, 'delete', []),
  entry('pulumiGetStackActivity', pulumiGetStackActivity, 'read', []),
  entry('pulumiListStackCollaborators', pulumiListStackCollaborators, 'read', []),
  entry('pulumiGetStackConfig', pulumiGetStackConfig, 'read', []),
  entry('pulumiSetStackConfig', pulumiSetStackConfig, 'write', []),
  entry('pulumiDeleteStackConfig', pulumiDeleteStackConfig, 'delete', []),
  entry('pulumiGetStackOutputs', pulumiGetStackOutputs, 'read', ['outputs']),
  entry('pulumiGetStackMetadata', pulumiGetStackMetadata, 'read', []),
  entry('pulumiRenameStack', pulumiRenameStack, 'write', []),
  entry('pulumiTransferStack', pulumiTransferStack, 'write', []),
  entry('pulumiGetStackTags', pulumiGetStackTags, 'read', []),
  entry('pulumiSetStackTags', pulumiSetStackTags, 'write', []),
  entry('pulumiDeleteStackTag', pulumiDeleteStackTag, 'delete', []),
  entry('pulumiGetStackTeams', pulumiGetStackTeams, 'read', []),
  entry('pulumiTriggerUpdate', pulumiTriggerUpdate, 'write', ['pulumi up', 'preview', 'destroy']),
  entry('pulumiListUpdates', pulumiListUpdates, 'read', []),
  entry('pulumiGetLatestUpdate', pulumiGetLatestUpdate, 'read', []),
  entry('pulumiGetUpdate', pulumiGetUpdate, 'read', []),
  entry('pulumiCancelUpdate', pulumiCancelUpdate, 'delete', []),
  entry('pulumiGetResourceCount', pulumiGetResourceCount, 'read', []),
  entry('pulumiGetLatestResources', pulumiGetLatestResources, 'read', []),
  entry('pulumiGetResource', pulumiGetResource, 'read', []),
  entry('pulumiExportStack', pulumiExportStack, 'read', ['state export']),
  entry('pulumiImportStack', pulumiImportStack, 'write', ['state import']),
  entry('pulumiGetDriftStatus', pulumiGetDriftStatus, 'read', ['drift detection']),
  entry('pulumiListDriftRuns', pulumiListDriftRuns, 'read', []),
  entry('pulumiListDeployments', pulumiListDeployments, 'read', ['deployments', 'ci']),
  entry('pulumiGetDeployment', pulumiGetDeployment, 'read', []),
  entry('pulumiCancelDeployment', pulumiCancelDeployment, 'delete', []),
  entry('pulumiGetDeploymentLogs', pulumiGetDeploymentLogs, 'read', []),
  entry('pulumiGetDeploymentSettings', pulumiGetDeploymentSettings, 'write', []),
  entry('pulumiSetDeploymentSettings', pulumiSetDeploymentSettings, 'write', []),
  entry('pulumiPauseDeployments', pulumiPauseDeployments, 'write', []),
  entry('pulumiResumeDeployments', pulumiResumeDeployments, 'read', []),
  entry('pulumiListWebhooks', pulumiListWebhooks, 'read', ['hooks']),
  entry('pulumiCreateWebhook', pulumiCreateWebhook, 'write', []),
  entry('pulumiDeleteWebhook', pulumiDeleteWebhook, 'delete', []),
  entry('pulumiPingWebhook', pulumiPingWebhook, 'write', []),
  entry('pulumiEncryptValue', pulumiEncryptValue, 'write', []),
  entry('pulumiDecryptValue', pulumiDecryptValue, 'read', []),
  entry('pulumiGetOrg', pulumiGetOrg, 'read', []),
  entry('pulumiGetOrgMetadata', pulumiGetOrgMetadata, 'read', []),
  entry('pulumiListOrgTeams', pulumiListOrgTeams, 'read', []),
  entry('pulumiListOrgMembers', pulumiListOrgMembers, 'read', []),
  entry('pulumiProjectExists', pulumiProjectExists, 'read', ['project check']),
  entry('pulumiGetUser', pulumiGetUser, 'read', []),
  entry('pulumiListUserStacks', pulumiListUserStacks, 'read', ['stacks', 'inventory']),
  entry('pulumiListAccessTokens', pulumiListAccessTokens, 'read', []),
  entry('pulumiCreateAccessToken', pulumiCreateAccessToken, 'write', ['pat', 'token']),
  entry('pulumiDeleteAccessToken', pulumiDeleteAccessToken, 'delete', ['revoke']),
];
