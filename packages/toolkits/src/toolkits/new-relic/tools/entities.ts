// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nerdgraph, newRelicApiKeyField, tagInput } from './client.js';

const guidField = z.string().describe('Entity GUID (base64 identifier from entity search)');
const TAGGING_ERRORS = 'errors { message }';

// ---- Entities & relationships ----

export const deleteEntity = tool({
    description: 'Deletes APM-APPLICATION, EXT-SERVICE, or REF-REPOSITORY entities by GUID. Reports successes and per-GUID failures.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guids: z.array(z.string()).min(1).describe('Entity GUIDs to delete (deletable types only)'),
    }),
    execute: async ({ newRelicApiKey, guids }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($guids: [EntityGuid!]!) { entityDelete(guids: $guids) { deletedEntities failures { guid message } } }',
            { guids },
            'delete entities',
        ),
});

const relationshipType = z.enum(['CONTAINS', 'CALLS', 'HOSTS', 'SERVES', 'IS', 'OPERATES_IN', 'CONNECTS_TO', 'BUILT_FROM', 'MEASURES', 'PRODUCES', 'CONSUMES', 'MANAGES', 'OWNS', 'TEST']);

export const createEntityRelationship = tool({
    description: 'Creates or replaces a custom relationship (CALLS, BUILT_FROM, CONTAINS, etc.) between two entities. Existing links are refreshed.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        sourceEntityGuid: guidField.describe('Source (origin) entity GUID'),
        targetEntityGuid: guidField.describe('Target entity GUID'),
        type: relationshipType.describe('Relationship semantics'),
    }),
    execute: async ({ newRelicApiKey, sourceEntityGuid, targetEntityGuid, type }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($source: EntityGuid!, $target: EntityGuid!, $type: EntityRelationshipUserDefinedType!) { entityRelationshipUserDefinedCreateOrReplace(sourceEntityGuid: $source, targetEntityGuid: $target, type: $type) { ${TAGGING_ERRORS} } }`,
            { source: sourceEntityGuid, target: targetEntityGuid, type },
            'create entity relationship',
        ),
});

export const deleteEntityRelationshipUserDefined = tool({
    description: 'Removes custom relationships between two entities. Omit type to remove all user-defined links between them.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        sourceEntityGuid: guidField.describe('Source entity GUID'),
        targetEntityGuid: guidField.describe('Target entity GUID'),
        type: z.string().optional().describe("Specific type, e.g. 'BUILT_FROM' (omit for all)"),
    }),
    execute: async ({ newRelicApiKey, sourceEntityGuid, targetEntityGuid, type }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($source: EntityGuid!, $target: EntityGuid!, $type: EntityRelationshipUserDefinedType) { entityRelationshipUserDefinedDelete(sourceEntityGuid: $source, targetEntityGuid: $target, type: $type) { errors { message type } } }',
            { source: sourceEntityGuid, target: targetEntityGuid, type: type ?? null },
            'delete entity relationship',
        ),
});

// ---- Tags ----

export const addTagsToEntity = tool({
    description: 'Adds tags to an entity for filtering and organization. APM agents may need a restart to pick up new tags.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('Entity GUID to tag (find via searchEntities)'),
        tags: z.array(tagInput).min(1).describe("Tags, e.g. [{key:'environment',values:['production']}]"),
    }),
    execute: async ({ newRelicApiKey, guid, tags }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $tags: [TaggingTagInput!]!) { taggingAddTagsToEntity(guid: $guid, tags: $tags) { ${TAGGING_ERRORS} } }`,
            { guid, tags },
            'add tags to entity',
        ),
});

export const deleteTagValuesFromEntity = tool({
    description: 'Removes specific tag values while keeping other values under the same key.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('Entity GUID to untag (find via entitySearch)'),
        tagValues: z.array(z.object({
            key: z.string().describe("Tag key, e.g. 'environment'"),
            value: z.string().describe("Exact value to remove, e.g. 'production'"),
        })).min(1),
    }),
    execute: async ({ newRelicApiKey, guid, tagValues }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $tagValues: [TaggingTagValueInput!]!) { taggingDeleteTagValuesFromEntity(guid: $guid, tagValues: $tagValues) { ${TAGGING_ERRORS} } }`,
            { guid, tagValues },
            'delete tag values from entity',
        ),
});

export const replaceTagsOnEntity = tool({
    description: "Replaces the entity's entire tag set. All existing tags are removed — send the complete desired set.",
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('Entity GUID to retag'),
        tags: z.array(tagInput).min(1).describe('Complete replacement tag set'),
    }),
    execute: async ({ newRelicApiKey, guid, tags }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $tags: [TaggingTagInput!]!) { taggingReplaceTagsOnEntity(guid: $guid, tags: $tags) { ${TAGGING_ERRORS} } }`,
            { guid, tags },
            'replace tags on entity',
        ),
});

// ---- Golden metrics & tags ----

const domainTypeInput = (desc: string) =>
    z.object({
        domain: z.string().describe("Domain, e.g. 'APM', 'BROWSER', 'MOBILE', 'INFRA', 'SYNTH'"),
        type: z.string().describe("Type, e.g. 'APPLICATION', 'HOST', 'MONITOR'"),
    }).describe(desc);

const goldenContext = (desc: string, requireGuid = false) =>
    z.object({
        account: z.number().int().positive().optional().describe('Account ID (provide account XOR guid)'),
        guid: z.string().optional().describe('Workload GUID (provide account XOR guid)'),
    }).describe(desc);

export const overrideEntityGoldenMetrics = tool({
    description: 'Sets custom primary (golden) metrics for an entity type at account or workload scope. Empty metrics array resets to defaults.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        context: goldenContext('Account or workload scope (exactly one)'),
        domainType: domainTypeInput('Entity domain + type to customize'),
        metrics: z.array(z.object({
            name: z.string().describe("Internal name, e.g. 'responseTime'"),
            title: z.string().describe("UI title, e.g. 'Response Time'"),
            select: z.string().describe("SELECT clause, e.g. 'average(duration)'"),
            from: z.string().describe("FROM event, e.g. 'Transaction'"),
            eventId: z.string().describe("Entity filter field, usually 'entity.guid'"),
            where: z.string().optional().describe('Extra WHERE clause (eventId filter is automatic)'),
            facet: z.string().optional().describe("FACET attribute, e.g. 'host'"),
        })).describe('Golden metric definitions (empty resets to defaults)'),
    }),
    execute: async ({ newRelicApiKey, context, domainType, metrics }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($context: GoldenMetricsContextInput!, $domainType: GoldenMetricsDomainTypeInput!, $metrics: [GoldenMetricsMetricInput!]!) { entityGoldenMetricsOverride(context: $context, domainType: $domainType, metrics: $metrics) { context { account guid } domainType { domain type } metrics { name title } errors { message type } } }',
            { context, domainType, metrics },
            'override entity golden metrics',
        ),
});

export const resetEntityGoldenMetrics = tool({
    description: 'Restores New Relic default golden metrics/tags for an entity type when customizations are no longer relevant.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        context: z.object({ guid: z.string().describe('Account or workload GUID to reset') }).describe('Reset scope'),
        domainType: domainTypeInput('Entity domain + type to reset'),
    }),
    execute: async ({ newRelicApiKey, context, domainType }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($context: GoldenMetricsResetContextInput!, $domainType: GoldenMetricsDomainTypeInput!) { entityGoldenMetricsReset(context: $context, domainType: $domainType) { metrics { context { account guid } domainType { domain type } metrics { name title query } } errors { message type } } }',
            { context, domainType },
            'reset entity golden metrics',
        ),
});

export const overrideEntityGoldenTags = tool({
    description: 'Sets which tags appear prominently (golden tags) for an entity type for filtering and organization.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        context: z.object({ account: z.number().int().positive().describe('Account ID for the override') }).describe('Account scope'),
        domainType: domainTypeInput('Entity domain + type for the tags'),
        tags: z.array(z.object({ key: z.string().describe("Tag key, e.g. 'environment'") })).min(1).describe('Golden tag keys'),
    }),
    execute: async ({ newRelicApiKey, context, domainType, tags }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($context: GoldenTagsContextInput!, $domainType: GoldenTagsDomainTypeInput!, $tags: [GoldenTagsTagInput!]!) { entityGoldenTagsOverride(context: $context, domainType: $domainType, tags: $tags) { tags { context { account } domainType { domain type } tags { key } } errors { message type } } }',
            { context, domainType, tags },
            'override entity golden tags',
        ),
});

export const resetEntityGoldenTags = tool({
    description: 'Restores default golden tags for an entity domain + type. Provide account XOR workload guid.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        context: goldenContext('Account or workload scope (exactly one)'),
        domainType: domainTypeInput('Entity domain + type to reset'),
    }),
    execute: async ({ newRelicApiKey, context, domainType }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($context: GoldenTagsContextInput!, $domainType: GoldenTagsDomainTypeInput!) { entityGoldenTagsReset(context: $context, domainType: $domainType) { tags { context { account guid } domainType { domain type } tags { key } } errors { message type } } }',
            { context, domainType },
            'reset entity golden tags',
        ),
});

// ---- Change tracking / deployments ----

export const createDeploymentMarker = tool({
    description: 'Records a deployment marker (version, changelog, CI link) on an entity for correlating releases with performance in charts.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        entityGuid: guidField.describe('Entity GUID supporting change tracking (APM, Browser, Mobile, Synthetics, etc.)'),
        version: z.string().describe("Version, e.g. '1.0.0', 'build-12345'"),
        user: z.string().optional().describe("Deployer, e.g. 'deploy-bot@example.com'"),
        commit: z.string().optional().describe('Commit SHA'),
        groupId: z.string().optional().describe("Group related deploys, e.g. 'release-2024-q1'"),
        changelog: z.string().optional().describe('Changelog URL or text'),
        description: z.string().optional().describe('Context, e.g. Hotfix for login bug'),
        deepLink: z.string().optional().describe('CI/CD pipeline URL'),
        timestamp: z.number().int().optional().describe('Epoch millis (within ±24h; default now)'),
        deploymentType: z.enum(['BASIC', 'BLUE_GREEN', 'CANARY', 'ROLLING', 'SHADOW', 'OTHER']).optional(),
    }),
    execute: async ({ newRelicApiKey, entityGuid, ...deployment }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($entityGuid: EntityGuid!, $deployment: ChangeTrackingDeploymentInput!) { changeTrackingCreateDeployment(entityGuid: $entityGuid, deployment: $deployment) { deploymentId version description timestamp entityGuid deploymentType user commit groupId changelog deepLink } }',
            { entityGuid, deployment },
            'create deployment marker',
        ),
});

// ---- Agent applications ----

export const createExampleBrowserApplication = tool({
    description: 'Creates a browser application for web monitoring. Returns the GUID plus loader settings for installation.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.number().int().positive().describe('Account ID for the browser app'),
        name: z.string().describe('Browser application name'),
        settings: z.object({
            loaderType: z.enum(['SPA', 'PRO', 'LITE']).optional().describe('Agent loader type'),
            cookiesEnabled: z.boolean().optional().describe('Session tracking + user identification'),
            distributedTracingEnabled: z.boolean().optional().describe('Cross-service request tracking'),
        }).optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, name, settings }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $application: AgentApplicationCreateBrowserInput!) { agentApplicationCreateBrowser(accountId: $accountId, application: $application) { guid name settings { loaderType cookiesEnabled distributedTracingEnabled } } }',
            { accountId, application: { name, settings } },
            'create browser application',
        ),
});

export const createExampleMobileApplication = tool({
    description: 'Creates a mobile application for iOS/Android monitoring. Returns the application token for SDK setup.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.number().int().describe('Account ID for the mobile app'),
        name: z.string().describe('Mobile application name'),
    }),
    execute: async ({ newRelicApiKey, accountId, name }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $application: AgentApplicationCreateMobileInput!) { agentApplicationCreateMobile(accountId: $accountId, application: $application) { guid name accountId applicationToken } }',
            { accountId, application: { name } },
            'create mobile application',
        ),
});

export const deleteAgentApplication = tool({
    description: 'Deletes an APM application. The agent must have been silent for 12+ hours or deletion is rejected.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('APM application GUID to delete'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($guid: EntityGuid!) { agentApplicationDelete(guid: $guid) { success } }',
            { guid },
            'delete agent application',
        ),
});

export const updateAgentApplicationSettings = tool({
    description: 'Toggles server-side config for an APM app (UI-managed vs local config file).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('APM application GUID'),
        settings: z.object({
            apmConfig: z.object({
                useServerSideConfig: z.boolean().describe('true: manage from UI; false: local agent config file'),
            }),
        }).describe('APM configuration'),
    }),
    execute: async ({ newRelicApiKey, guid, settings }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $settings: AgentApplicationSettingsUpdateInput!) { agentApplicationSettingsUpdate(guid: $guid, settings: $settings) { apmSettings { apmConfig { useServerSideConfig } } ${TAGGING_ERRORS} } }`,
            { guid, settings },
            'update agent application settings',
        ),
});

export const updateBrowserSettings = tool({
    description: 'Updates browser agent settings (loader type SPA/PRO/LITE, pinned agent version).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('Browser application entity GUID'),
        settings: z.object({
            browserMonitoring: z.object({
                loader: z.string().optional().describe("Loader type, e.g. 'SPA'"),
                pinnedVersion: z.string().optional().describe("Pinned version, e.g. '1.229.0' ('x' ranges allowed; null = latest)"),
            }),
        }).describe('Browser monitoring settings'),
    }),
    execute: async ({ newRelicApiKey, guid, settings }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $settings: AgentApplicationSettingsUpdateInput!) { agentApplicationSettingsUpdate(guid: $guid, settings: $settings) { browserSettings { browserConfig { browserMonitoring { loader pinnedVersion } } } ${TAGGING_ERRORS} } }`,
            { guid, settings },
            'update browser settings',
        ),
});

export const updateMobileSettingsExample = tool({
    description: 'Updates mobile settings (crash reporting, network URL hide/show filters with wildcard patterns).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: guidField.describe('Mobile application entity GUID'),
        settings: z.object({
            mobileSettings: z.object({
                useCrashReports: z.boolean().optional().describe('Collect crash data'),
                networkSettings: z.object({
                    filterMode: z.enum(['DISABLED', 'SHOW', 'HIDE']).optional(),
                    hideList: z.array(z.string()).optional().describe("Hidden URL patterns, e.g. ['*.internal.company.com']"),
                    showList: z.array(z.string()).optional().describe('Shown URL patterns for SHOW mode'),
                }).optional(),
            }),
        }).describe('Mobile configuration'),
    }),
    execute: async ({ newRelicApiKey, guid, settings }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $settings: AgentApplicationSettingsUpdateInput!) { agentApplicationSettingsUpdate(guid: $guid, settings: $settings) { mobileSettings { useCrashReports networkSettings { filterMode hideList showList } } ${TAGGING_ERRORS} } }`,
            { guid, settings },
            'update mobile settings',
        ),
});
