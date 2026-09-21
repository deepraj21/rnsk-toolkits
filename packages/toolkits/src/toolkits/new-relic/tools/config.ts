// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { RULE_RESULT_FIELDS, accountIdField, nerdgraph, newRelicApiKeyField } from './client.js';

// ---- Metric normalization rules ----

const normalizationRule = {
    action: z.enum(['REPLACE', 'IGNORE', 'DENY_NEW_METRICS']).describe('REPLACE: rewrite match; IGNORE: drop; DENY_NEW_METRICS: block new names'),
    matchExpression: z.string().describe("Full-match regex, e.g. '^WebTransaction/Uri/users/[0-9]+$'"),
    evalOrder: z.number().int().min(0).optional().describe('Ascending eval order (use 2000 for custom rules)'),
    replacement: z.string().optional().describe("Replacement for REPLACE (capture groups like '{id}'), e.g. 'WebTransaction/Uri/users/{id}'"),
    notes: z.string().optional(),
    enabled: z.boolean().optional().describe('Active when true'),
    terminateChain: z.boolean().optional().describe('Stop further rules after match'),
    applicationGuid: z.string().optional().describe('Scope to one app (omit for account-wide)'),
};

export const createMetricNormalizationRule = tool({
    description: 'Creates a metric normalization rule (rename/drop/block metrics) to consolidate names and reduce cardinality. Regex must be ^...$ anchored.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID for the rule'),
        rule: z.object({
            action: normalizationRule.action,
            matchExpression: normalizationRule.matchExpression,
            evalOrder: z.number().int().min(0).describe('Ascending eval order (use 2000 for custom rules)'),
            replacement: normalizationRule.replacement,
            notes: normalizationRule.notes,
            enabled: z.boolean().optional().describe('Active when true (default true)'),
            terminateChain: normalizationRule.terminateChain,
            applicationGuid: normalizationRule.applicationGuid,
        }).describe('Rule configuration'),
    }),
    execute: async ({ newRelicApiKey, accountId, rule }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: String!, $rule: MetricNormalizationRuleInput!) { metricNormalizationCreateRule(accountId: $accountId, rule: $rule) { ${RULE_RESULT_FIELDS} } }`,
            { accountId, rule: { enabled: true, ...rule } },
            'create metric normalization rule',
        ),
});

export const editMetricNormalizationRule = tool({
    description: 'Edits a normalization rule (match, action, enabled, replacement). Only provided fields change; action + enabled are required by the API — resend current values.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID owning the rule'),
        rule: z.object({
            id: z.number().int().positive().describe('Rule ID to edit'),
            action: normalizationRule.action,
            enabled: z.boolean(),
            matchExpression: normalizationRule.matchExpression.optional(),
            replacement: normalizationRule.replacement,
            notes: normalizationRule.notes,
        }).describe('Rule ID + fields to update'),
    }),
    execute: async ({ newRelicApiKey, accountId, rule }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: String!, $rule: MetricNormalizationEditRuleInput!) { metricNormalizationEditRule(accountId: $accountId, rule: $rule) { ${RULE_RESULT_FIELDS} } }`,
            { accountId, rule },
            'edit metric normalization rule',
        ),
});

export const enableMetricNormalizationRule = tool({
    description: 'Reactivates a disabled normalization rule by ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID owning the rule'),
        ruleId: z.number().int().positive().describe('Rule ID to enable'),
    }),
    execute: async ({ newRelicApiKey, accountId, ruleId }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: String!, $ruleId: ID!) { metricNormalizationEnableRule(accountId: $accountId, ruleId: $ruleId) { ${RULE_RESULT_FIELDS} } }`,
            { accountId, ruleId: String(ruleId) },
            'enable metric normalization rule',
        ),
});

export const disableMetricNormalizationRule = tool({
    description: 'Deactivates a normalization rule without deleting it (reversible via enable).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID owning the rule'),
        ruleId: z.number().int().positive().describe('Rule ID to disable'),
    }),
    execute: async ({ newRelicApiKey, accountId, ruleId }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: String!, $ruleId: ID!) { metricNormalizationDisableRule(accountId: $accountId, ruleId: $ruleId) { ${RULE_RESULT_FIELDS} } }`,
            { accountId, ruleId: String(ruleId) },
            'disable metric normalization rule',
        ),
});

// ---- Log data partition rules ----

const PARTITION_RESULT = 'rule { id targetDataPartition description enabled } errors { type message }';

export const createLogDataPartitionRule = tool({
    description: 'Creates a log partition rule routing matching logs to a Log_* partition with STANDARD or SECONDARY (30-day) retention.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the rule'),
        targetDataPartition: z.string().describe("Target partition, must start with 'Log_', e.g. 'Log_ProductionLogs'"),
        description: z.string().describe('Purpose of the rule'),
        nrql: z.string().describe("WHERE clause without WHERE keyword, e.g. \"appName = 'prod' AND level = 'error'\""),
        retentionPolicy: z.enum(['STANDARD', 'SECONDARY']).describe('STANDARD: account default; SECONDARY: 30-day rolling'),
        enabled: z.boolean().describe('Route matching logs when true'),
    }),
    execute: async ({ newRelicApiKey, accountId, ...rule }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $rule: LogsDataPartitionRuleCreateInput!) { logConfigurationsDataPartitionRuleCreate(accountId: $accountId, rule: $rule) { ${PARTITION_RESULT} } }`,
            { accountId, rule },
            'create log data partition rule',
        ),
});

export const updateDataPartitionRule = tool({
    description: 'Updates a partition rule (description, NRQL criteria, enabled). All non-ID fields optional — partial updates supported.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the rule'),
        rule: z.object({
            id: z.string().describe('Rule ID to update'),
            description: z.string().optional(),
            nrql: z.string().optional().describe("New WHERE clause, e.g. \"logtype = 'apache'\""),
            enabled: z.boolean().optional().describe('false disables without deleting'),
        }).describe('Rule ID + fields to update'),
    }),
    execute: async ({ newRelicApiKey, accountId, rule }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $rule: LogsDataPartitionRuleUpdateInput!) { logConfigurationsDataPartitionRuleUpdate(accountId: $accountId, rule: $rule) { ${PARTITION_RESULT} } }`,
            { accountId, rule },
            'update data partition rule',
        ),
});

export const deleteDataPartitionRule = tool({
    description: 'Deletes a log partition rule. Already-partitioned data is retained per its retention policy.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the rule'),
        id: z.string().describe('Rule ID to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, id }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $id: ID!) { logConfigurationsDataPartitionRuleDelete(accountId: $accountId, id: $id) { errors { type message } } }',
            { accountId, id },
            'delete data partition rule',
        ),
});

// ---- Browser / mobile fetchers ----

export const fetchBrowserConfiguration = tool({
    description: 'Reads browser app JS config (jsConfig for source code, jsConfigScript for head-tag injection) by entity GUID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Browser application entity GUID'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `query($guid: EntityGuid!) { actor { entity(guid: $guid) { guid name ... on BrowserApplicationEntity { browserProperties { jsConfig jsConfigScript } } } } }`,
            { guid },
            'fetch browser configuration',
        ),
});

export const fetchBrowserJavaScriptSnippet = tool({
    description: 'Reads the browser loader script snippet (jsLoaderScript) to embed for browser monitoring.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Browser application entity GUID'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `query($guid: EntityGuid!) { actor { entity(guid: $guid) { guid name ... on BrowserApplicationEntity { browserProperties { jsLoaderScript } } } } }`,
            { guid },
            'fetch browser JavaScript snippet',
        ),
});

export const fetchMobileApplicationToken = tool({
    description: 'Reads the mobile application token (applicationToken) for SDK authentication and setup.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Mobile application entity GUID'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `query($guid: EntityGuid!) { actor { entity(guid: $guid) { guid name ... on MobileApplicationEntity { mobileProperties { applicationToken } } } } } }`,
            { guid },
            'fetch mobile application token',
        ),
});
