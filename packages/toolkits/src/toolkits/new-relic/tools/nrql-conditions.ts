// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField, restV2 } from './client.js';

const signalInput = z.object({
    aggregationWindow: z.number().int().min(30).describe('Aggregation window seconds (static: 30-120; baseline: 30-3600)'),
    aggregationMethod: z.enum(['EVENT_FLOW', 'EVENT_TIMER', 'CADENCE']).describe('EVENT_FLOW recommended'),
    aggregationDelay: z.number().int().min(0).max(1200).optional().describe('Delay seconds for late data (0-1200)'),
}).describe('Signal aggregation config');

const staticTerm = z.object({
    threshold: z.number().describe('Threshold value triggering the alert'),
    thresholdDuration: z.number().int().min(60).describe('Seconds violated before alerting (multiple of 60)'),
    thresholdOccurrences: z.enum(['ALL', 'AT_LEAST_ONCE']).describe('ALL: every point violates; AT_LEAST_ONCE: one point'),
    operator: z.enum(['ABOVE', 'ABOVE_OR_EQUALS', 'BELOW', 'BELOW_OR_EQUALS', 'EQUALS', 'NOT_EQUALS']),
    priority: z.enum(['CRITICAL', 'WARNING']),
});

const CONDITION_SELECT = 'id name enabled';

export const createStaticNrqlCondition = tool({
    description:
        'Creates a static NRQL alert condition (threshold-based) via NerdGraph. Find the policy ID via getAlertPolicies first.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the condition'),
        policyId: z.string().describe('Policy ID to attach the condition to'),
        name: z.string().describe('Condition name, unique within the policy'),
        nrql: z.object({ query: z.string().describe("NRQL query, e.g. 'SELECT count(*) FROM Transaction'") }).describe('Query to monitor'),
        signal: signalInput,
        terms: staticTerm.describe('Threshold definition'),
        valueFunction: z.enum(['SINGLE_VALUE', 'SUM']).describe('SINGLE_VALUE for scalars, SUM for aggregates'),
        violationTimeLimitSeconds: z.number().int().min(300).max(2592000).describe('Max seconds a violation stays open (300-2592000)'),
        enabled: z.boolean().optional().describe('Actively monitoring (default true)'),
        description: z.string().optional(),
        expiration: z.object({
            expirationDuration: z.number().int().min(30).max(172800).optional(),
            openViolationOnExpiration: z.boolean().optional().describe('Loss-of-signal detection'),
            closeViolationsOnExpiration: z.boolean().optional(),
        }).optional().describe('Signal-loss handling'),
    }),
    execute: async ({ newRelicApiKey, accountId, policyId, ...condition }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $policyId: ID!, $condition: AlertsNrqlStaticConditionInput!) { alertsNrqlConditionStaticCreate(accountId: $accountId, policyId: $policyId, condition: $condition) { ${CONDITION_SELECT} } }`,
            { accountId, policyId, condition: { enabled: true, ...condition } },
            'create static NRQL condition',
        ),
});

export const updateStaticNrqlCondition = tool({
    description: 'Updates a static NRQL condition via NerdGraph. Only provided fields change; static-type conditions only.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the condition'),
        id: z.string().describe('Condition ID to update'),
        condition: z.record(z.any()).describe("Fields to change: name, nrql {query}, signal, terms, valueFunction, enabled, description, expiration, etc."),
    }),
    execute: async ({ newRelicApiKey, accountId, id, condition }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $id: ID!, $condition: AlertsNrqlStaticConditionUpdateInput!) { alertsNrqlConditionStaticUpdate(accountId: $accountId, id: $id, condition: $condition) { ${CONDITION_SELECT} } }`,
            { accountId, id, condition },
            'update static NRQL condition',
        ),
});

const baselineTerm = z.object({
    threshold: z.number().describe('Standard deviations from baseline triggering the alert'),
    thresholdDuration: z.number().int().min(60).max(7200).describe('Breach seconds before alerting (60-7200)'),
    thresholdOccurrences: z.enum(['ALL', 'AT_LEAST_ONCE']),
    operator: z.enum(['ABOVE', 'BELOW', 'EQUALS']),
    priority: z.enum(['CRITICAL', 'WARNING']),
});

export const createNrqlBaselineCondition = tool({
    description:
        'Creates a NRQL baseline condition (ML anomaly detection vs historical baseline) via NerdGraph. Use for anomaly detection instead of static thresholds.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the condition'),
        policyId: z.number().int().describe('Policy ID to attach the condition to'),
        condition: z.object({
            name: z.string().describe('Condition name'),
            enabled: z.boolean().describe('Actively monitoring'),
            baselineDirection: z.enum(['LOWER_ONLY', 'UPPER_ONLY', 'UPPER_AND_LOWER']).describe('Anomaly direction'),
            nrql: z.object({ query: z.string().describe("NRQL query, e.g. 'SELECT average(duration) FROM Transaction'") }),
            signal: signalInput,
            terms: z.array(baselineTerm).min(1).describe('Threshold terms (at least one)'),
            runbookUrl: z.string().optional(),
            description: z.string().optional(),
        }).describe('Baseline condition configuration'),
    }),
    execute: async ({ newRelicApiKey, accountId, policyId, condition }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $policyId: ID!, $condition: AlertsNrqlBaselineConditionInput!) { alertsNrqlConditionBaselineCreate(accountId: $accountId, policyId: $policyId, condition: $condition) { ${CONDITION_SELECT} baselineDirection } }`,
            { accountId, policyId: String(policyId), condition },
            'create NRQL baseline condition',
        ),
});

export const updateNrqlBaselineCondition = tool({
    description: 'Updates a baseline NRQL condition via NerdGraph (name, direction, thresholds, query, etc.). Baseline-type only.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the condition'),
        id: z.string().describe('Baseline condition ID to update'),
        condition: z.record(z.any()).describe('Fields to change: name, baselineDirection, nrql {query, dataAccountId}, terms, signal, expiration, enabled, etc.'),
    }),
    execute: async ({ newRelicApiKey, accountId, id, condition }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $id: ID!, $condition: AlertsNrqlBaselineConditionUpdateInput!) { alertsNrqlConditionBaselineUpdate(accountId: $accountId, id: $id, condition: $condition) { ${CONDITION_SELECT} baselineDirection } }`,
            { accountId, id, condition },
            'update NRQL baseline condition',
        ),
});

const restTerm = z.object({
    duration: z.string().describe("Minutes as string, e.g. '5'"),
    operator: z.enum(['above', 'below', 'equal']),
    priority: z.enum(['critical', 'warning']),
    threshold: z.string().describe("Numeric string, e.g. '100'"),
    timeFunction: z.enum(['all', 'any']).describe('all: entire duration; any: at least once'),
});

export const createNrqlCondition = tool({
    description: 'Creates a NRQL alert condition via REST API v2 for threshold alerting on custom queries.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().describe('Policy ID to add the condition to'),
        nrqlCondition: z.object({
            name: z.string().describe('Condition name, unique within the policy'),
            enabled: z.boolean().describe('Active immediately'),
            nrql: z.object({ query: z.string().describe("Valid NRQL SELECT, e.g. 'SELECT count(*) FROM Transaction'") }),
            terms: z.array(restTerm).min(1).describe('Threshold terms (at least one)'),
            type: z.enum(['static']).optional().describe("Condition type (default 'static')"),
            runbookUrl: z.string().optional(),
            valueFunction: z.string().optional().describe("e.g. 'single_value'"),
        }).describe('NRQL condition configuration'),
    }),
    execute: async ({ newRelicApiKey, policyId, nrqlCondition }) =>
        restV2(newRelicApiKey, 'POST', `/alerts_nrql_conditions/policies/${policyId}.json`, { body: { nrql_condition: { type: 'static', ...nrqlCondition } } }, 'create NRQL condition'),
});

export const updateNrqlCondition = tool({
    description: 'Updates a NRQL condition (name, query, thresholds, enabled) via REST API v2. Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().describe('NRQL condition ID to update'),
        nrqlCondition: z.record(z.any()).describe('Fields to change: name, nrql {query}, terms, enabled, runbook_url, value_function, etc.'),
    }),
    execute: async ({ newRelicApiKey, conditionId, nrqlCondition }) =>
        restV2(newRelicApiKey, 'PUT', `/alerts_nrql_conditions/${conditionId}.json`, { body: { nrql_condition: nrqlCondition } }, 'update NRQL condition'),
});

export const deleteNrqlCondition = tool({
    description: 'Deletes a NRQL alert condition via REST API v2 after confirming the condition ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().describe('NRQL condition ID to delete'),
    }),
    execute: async ({ newRelicApiKey, conditionId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_nrql_conditions/${conditionId}.json`, undefined, 'delete NRQL condition'),
});

export const listNrqlConditions = tool({
    description: 'Lists NRQL conditions for a policy via REST API v2 (queries, thresholds, enabled state).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().describe('Policy ID to list NRQL conditions for'),
        page: z.number().int().min(1).optional().describe('Page number for large result sets'),
    }),
    execute: async ({ newRelicApiKey, policyId, page }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_nrql_conditions.json', { query: { policy_id: policyId, page } }, 'list NRQL conditions'),
});
