// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField } from './client.js';

const userTier = z.enum(['BASIC_USER_TIER', 'CORE_USER_TIER', 'FULL_USER_TIER']).describe('BASIC: view-only; CORE: query + dashboards; FULL: full platform');

// ---- User management ----

export const createUser = tool({
    description: 'Adds a user to an authentication domain with an access tier. Needs the domain ID and a unique email.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        authenticationDomainId: z.string().describe('Auth domain UUID for the new user'),
        email: z.string().describe('Unique valid email for the user'),
        name: z.string().describe('Full name'),
        userType: userTier,
    }),
    execute: async ({ newRelicApiKey, authenticationDomainId, email, name, userType }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($authenticationDomainId: ID!, $user: UserManagementCreateUserInput!) { userManagementCreateUser(authenticationDomainId: $authenticationDomainId, user: $user) { createdUser { id email name type { id displayName } authenticationDomainId } } }',
            { authenticationDomainId, user: { email, name, userType } },
            'create user',
        ),
});

export const updateUser = tool({
    description: "Updates a user's email and/or access tier. ID required; include at least one field to change.",
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        id: z.string().describe('User ID to update'),
        email: z.string().optional().describe('New email address'),
        userType: z.enum(['BASIC_USER_TIER', 'CORE_USER_TIER', 'FULL_USER_TIER']).optional().describe('New access tier'),
    }),
    execute: async ({ newRelicApiKey, id, email, userType }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($id: ID!, $user: UserManagementUpdateUserInput!) { userManagementUpdateUser(id: $id, user: $user) { user { id email name type { id displayName } } } }',
            { id, user: { email, userType } },
            'update user',
        ),
});

export const deleteUserManagementUser = tool({
    description: 'Removes a user from New Relic after confirming the user ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        userId: z.string().describe('User ID to delete'),
    }),
    execute: async ({ newRelicApiKey, userId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($id: ID!) { userManagementDeleteUser(id: $id) { deletedUser { id } } }',
            { id: userId },
            'delete user',
        ),
});

export const updateAccount = tool({
    description: 'Renames a managed account in the organization.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        managedAccount: z.object({
            id: z.number().int().describe('Account ID to rename'),
            name: z.string().describe('New account name'),
        }).describe('Account ID + new name'),
    }),
    execute: async ({ newRelicApiKey, managedAccount }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($managedAccount: AccountManagementUpdateAccountInput!) { accountManagementUpdateAccount(managedAccount: $managedAccount) { managedAccount { id name regionCode } } }',
            { managedAccount },
            'update account',
        ),
});

export const revokeAuthorizationAccess = tool({
    description: 'Revokes role grants (account + role pairs) from a group. Use to remove access without deleting the group.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        revokeAccessOptions: z.object({
            groupId: z.string().describe('Group ID losing access'),
            accountAccessGrants: z.array(z.object({
                accountId: z.number().int().describe('Account losing the grant'),
                roleId: z.string().describe('Role ID to revoke'),
            })).min(1),
        }).describe('Group + grants to revoke'),
    }),
    execute: async ({ newRelicApiKey, revokeAccessOptions }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($revokeAccessOptions: AuthorizationManagementRevokeAccessInput!) { authorizationManagementRevokeAccess(revokeAccessOptions: $revokeAccessOptions) { roles { accountId displayName } } }',
            { revokeAccessOptions },
            'revoke authorization access',
        ),
});

// ---- API access keys ----

const KEY_RESULT = 'errors { message type }';

export const createApiAccessKeys = tool({
    description: 'Generates user keys or ingest keys (BROWSER/LICENSE, max 1000 per type). Store returned key values securely. Provide user and/or ingest.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        user: z.object({
            accountId: z.number().int().describe('Account for the user key'),
            userId: z.number().int().describe('User receiving the key'),
            name: z.string().optional(),
            notes: z.string().optional(),
        }).optional(),
        ingest: z.object({
            accountId: z.number().int().describe('Account for the ingest key'),
            ingestType: z.enum(['BROWSER', 'LICENSE']).describe('BROWSER: browser monitoring; LICENSE: license key'),
            name: z.string().optional(),
            notes: z.string().optional(),
        }).optional(),
    }),
    execute: async ({ newRelicApiKey, ...keys }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($keys: ApiAccessCreateKeysInput!) { apiAccessCreateKeys(keys: $keys) { createdKeys { id key name type notes createdAt } ${KEY_RESULT} } }`,
            { keys },
            'create API access keys',
        ),
});

export const updateApiAccessKeys = tool({
    description: 'Renames or re-notes existing keys by key ID (not the key value). Provide ingest and/or user lists.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        keys: z.object({
            ingest: z.array(z.object({
                keyId: z.string().describe('Ingest key ID (64-hex, not the key value)'),
                name: z.string().optional(),
                notes: z.string().optional(),
            })).optional(),
            user: z.array(z.object({
                keyId: z.string().describe('User key ID (40-char, not the key value)'),
                name: z.string().optional(),
                notes: z.string().optional(),
            })).optional(),
        }).describe("Keys to update ('ingest' and/or 'user' lists)"),
    }),
    execute: async ({ newRelicApiKey, keys }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($keys: ApiAccessUpdateKeysInput!) { apiAccessUpdateKeys(keys: $keys) { updatedKeys { id key name type notes } ${KEY_RESULT} } }`,
            { keys },
            'update API access keys',
        ),
});

export const deleteApiAccessKeys = tool({
    description: 'Permanently deletes keys by key ID (ingest and/or user IDs). Deleted keys lose all access immediately.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        keys: z.object({
            ingestKeyIds: z.array(z.string()).optional().describe('Ingest key IDs (64-hex each)'),
            userKeyIds: z.array(z.string()).optional().describe('User key IDs (40-char each)'),
        }).describe("IDs to delete ('ingestKeyIds' and/or 'userKeyIds')"),
    }),
    execute: async ({ newRelicApiKey, keys }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($keys: ApiAccessDeleteKeysInput!) { apiAccessDeleteKeys(keys: $keys) { deletedKeys { id } ${KEY_RESULT} } }`,
            { keys },
            'delete API access keys',
        ),
});

// ---- Cloud integrations ----

const cloudServiceConfig = (regions: boolean) =>
    z.array(z.object({
        linkedAccountId: z.number().int().describe('Linked cloud account ID (link first)'),
        ...(regions ? { awsRegions: z.array(z.string()).optional().describe("Regions, e.g. ['us-east-1'] (default all)") } : {}),
        metricsPollingInterval: z.number().int().min(300).optional().describe('Poll seconds (min 300, default per service)'),
    })).optional();

export const linkCloudAccount = tool({
    description: 'Links AWS/Azure/GCP accounts to New Relic for monitoring. Needs cloud-side IAM roles/permissions first. Returns linked account IDs for integrations.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('New Relic account ID to link under'),
        accounts: z.object({
            aws: z.array(z.object({
                name: z.string().describe('Unique display name'),
                arn: z.string().describe("IAM role ARN, e.g. 'arn:aws:iam::123:role/NewRelicInfrastructure-Integrations'"),
                metricCollectionMode: z.string().optional().describe("PULL (polling) or PUSH (Metric Streams)"),
            })).optional(),
            gcp: z.array(z.object({
                name: z.string(),
                projectId: z.string().describe('GCP project ID to monitor'),
            })).optional(),
            azure: z.array(z.object({
                name: z.string(),
                applicationId: z.string().describe('Entra application (client) ID'),
                clientSecret: z.string().describe('Entra client secret'),
                subscriptionId: z.string().describe('Subscription to monitor'),
                tenantId: z.string().describe('Entra tenant (directory) ID'),
            })).optional(),
        }).describe('Provider accounts to link (aws and/or gcp and/or azure)'),
    }),
    execute: async ({ newRelicApiKey, accountId, accounts }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $accounts: CloudLinkAccountInput!) { cloudLinkAccount(accountId: $accountId, accounts: $accounts) { linkedAccounts { id name authLabel createdAt updatedAt } errors { type message } } }',
            { accountId, accounts },
            'link cloud account',
        ),
});

export const renameCloudAccount = tool({
    description: 'Renames linked cloud accounts (new names must be unique and non-empty).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('New Relic account ID holding the links'),
        accounts: z.array(z.object({
            linkedAccountId: z.number().int().describe('Linked account ID from linking'),
            name: z.string().describe('New unique display name'),
        })).min(1),
    }),
    execute: async ({ newRelicApiKey, accountId, accounts }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $accounts: [CloudRenameAccountInput!]!) { cloudRenameAccount(accountId: $accountId, accounts: $accounts) { linkedAccounts { id name } } }',
            { accountId, accounts },
            'rename cloud account',
        ),
});

export const configureCloudIntegration = tool({
    description: 'Enables service monitoring (EC2, S3, Lambda, GKE, VMs, etc.) on linked cloud accounts. Link accounts first.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('New Relic account ID to configure under'),
        integrations: z.object({
            aws: z.object({
                s3: cloudServiceConfig(true), alb: cloudServiceConfig(true), ec2: cloudServiceConfig(true),
                ecs: cloudServiceConfig(true), eks: cloudServiceConfig(true), rds: cloudServiceConfig(true),
                sqs: cloudServiceConfig(true), lambda: cloudServiceConfig(true), dynamodb: cloudServiceConfig(true),
                elasticache: cloudServiceConfig(true),
            }).optional().describe('AWS services (any subset)'),
            gcp: z.object({
                gke: cloudServiceConfig(false), cloudSql: cloudServiceConfig(false),
                cloudStorage: cloudServiceConfig(false), computeEngine: cloudServiceConfig(false),
            }).optional().describe('GCP services (any subset)'),
            azure: z.object({
                appServices: cloudServiceConfig(false), sqlDatabases: cloudServiceConfig(false),
                storageAccounts: cloudServiceConfig(false), virtualMachines: cloudServiceConfig(false),
            }).optional().describe('Azure services (any subset)'),
        }).describe('Provider integrations (at least one provider + service)'),
    }),
    execute: async ({ newRelicApiKey, accountId, integrations }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $integrations: CloudConfigureIntegrationsInput!) { cloudConfigureIntegration(accountId: $accountId, integrations: $integrations) { integrations { id name service { slug } } errors { type message } } }',
            { accountId, integrations },
            'configure cloud integration',
        ),
});

export const disableCloudIntegration = tool({
    description: 'Stops monitoring one cloud-service integration on a linked account.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('New Relic account ID'),
        providerSlug: z.string().describe("Provider, e.g. 'aws', 'azure', 'gcp'"),
        integrationSlug: z.string().describe("Service, e.g. 'sqs', 'ec2', 'lambda'"),
        linkedAccountId: z.number().int().describe('Linked cloud account ID to disable'),
    }),
    execute: async ({ newRelicApiKey, accountId, providerSlug, integrationSlug, linkedAccountId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $providerSlug: String!, $integrationSlug: String!, $linkedAccountId: Int!) { cloudDisableIntegration(accountId: $accountId, providerSlug: $providerSlug, integrationSlug: $integrationSlug, linkedAccountId: $linkedAccountId) { disabledIntegrations { id name } errors { type message } } }',
            { accountId, providerSlug, integrationSlug, linkedAccountId },
            'disable cloud integration',
        ),
});

// ---- Service levels ----

const sliEventQuery = z.object({
    from: z.string().describe("Event/metric source, e.g. 'Transaction', 'Metric', 'PageView'"),
    where: z.string().optional().describe("NRQL WHERE clause (single quotes), e.g. \"entityGuid = '...'\""),
    select: z.object({
        function: z.enum(['COUNT', 'SUM']).optional().describe('Aggregation (default COUNT)'),
        attribute: z.string().optional().describe("Attribute for SUM, e.g. 'duration'"),
    }).optional(),
});

const sloObjective = z.object({
    target: z.number().min(0).max(100).describe('Target percent, e.g. 99.9'),
    timeWindow: z.object({
        rolling: z.object({
            count: z.number().int().describe('Window length (1,7,14,28,30 days; weeks for updates)'),
            unit: z.enum(['DAY', 'WEEK']).optional().describe("Unit (create: DAY only)"),
        }),
    }),
});

export const createServiceLevel = tool({
    description: 'Creates an SLI (valid vs good/bad events) with optional SLO targets on an entity. Use for latency, error-rate, or availability tracking.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        entityGuid: z.string().describe('Entity GUID (APM service, browser app, etc.) for the SLI'),
        indicator: z.object({
            name: z.string().describe('SLI name, unique on the entity'),
            description: z.string().optional().describe('What good means + threshold context'),
            events: z.object({
                accountId: accountIdField('Account holding the NRDB data'),
                validEvents: sliEventQuery.describe('100% baseline query (required)'),
                goodEvents: sliEventQuery.optional().describe('Good subset (or badEvents, not both)'),
                badEvents: sliEventQuery.optional().describe('Bad subset (or goodEvents, not both)'),
            }),
            objectives: z.array(sloObjective).optional().describe('SLO targets (omit for SLI-only)'),
        }).describe('SLI configuration'),
    }),
    execute: async ({ newRelicApiKey, entityGuid, indicator }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($entityGuid: EntityGuid!, $indicator: ServiceLevelIndicatorInput!) { serviceLevelCreate(entityGuid: $entityGuid, indicator: $indicator) { id description } }',
            { entityGuid, indicator },
            'create service level',
        ),
});

export const updateServiceLevel = tool({
    description: 'Updates an SLI (targets, windows, event definitions, metadata). Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        id: z.string().describe('SLI ID to update'),
        indicator: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            events: z.object({
                validEvents: z.object({ query: z.string().describe('NRQL query string') }).optional(),
                goodEvents: z.object({ query: z.string() }).optional(),
                badEvents: z.object({ query: z.string() }).optional(),
            }).optional().describe('Event queries (good or bad, not both)'),
            objectives: z.array(sloObjective).optional().describe('Replacement SLO list'),
        }).describe('SLI fields to update'),
    }),
    execute: async ({ newRelicApiKey, id, indicator }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($id: ID!, $indicator: ServiceLevelIndicatorUpdateInput!) { serviceLevelUpdate(id: $id, indicator: $indicator) { id name description } }',
            { id, indicator },
            'update service level',
        ),
});

// ---- Workloads ----

export const updateWorkload = tool({
    description: 'Updates a workload (name, entity GUIDs, search queries, scope accounts). Query list is a full replacement — resend all queries to keep.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Workload GUID to update'),
        workload: z.object({
            name: z.string().optional().describe('New unique name'),
            entityGuids: z.array(z.string()).optional().describe('Explicit member entity GUIDs'),
            entitySearchQueries: z.array(z.object({
                id: z.number().int().optional().describe('Existing query ID (omit to add new)'),
                query: z.string().describe("Search query, e.g. \"(domain = 'INFRA' and type = 'HOST')\""),
            })).optional().describe('Full dynamic-membership list'),
            scopeAccounts: z.object({ accountIds: z.array(z.number().int()).min(1) }).optional().describe('Accounts to fetch entity data from'),
        }).describe('Fields to update (at least one)'),
    }),
    execute: async ({ newRelicApiKey, guid, workload }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($guid: EntityGuid!, $workload: WorkloadUpdateInput!) { workloadUpdate(guid: $guid, workload: $workload) { guid name } }',
            { guid, workload },
            'update workload',
        ),
});

export const duplicateWorkload = tool({
    description: 'Clones a workload with all configuration into the same or another account. Optionally rename the copy.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the duplicate'),
        sourceGuid: z.string().describe('Workload GUID to copy'),
        workload: z.object({ name: z.string().optional().describe('Name for the copy (default generated)') }).optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, sourceGuid, workload }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $sourceGuid: EntityGuid!, $workload: WorkloadDuplicateInput) { workloadDuplicate(accountId: $accountId, sourceGuid: $sourceGuid, workload: $workload) { guid name } }',
            { accountId, sourceGuid, workload: workload ?? {} },
            'duplicate workload',
        ),
});

export const deleteWorkload = tool({
    description: 'Permanently deletes a workload by GUID. Cannot be recovered.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Workload GUID to delete'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($guid: EntityGuid!) { workloadDelete(guid: $guid) { guid } }',
            { guid },
            'delete workload',
        ),
});
