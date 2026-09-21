// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField, restV2 } from './client.js';

const incidentPreference = z.enum(['PER_POLICY', 'PER_CONDITION', 'PER_CONDITION_AND_TARGET']).optional();
const POLICY_SELECT = 'id name incidentPreference';

export const createAlertPolicy = tool({
    description:
        'Creates an alert policy via REST API v2 (container for conditions; defines incident grouping). Use for basic policy setup.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().describe('Policy name, unique within the account'),
        incidentPreference: z.enum(['PER_POLICY', 'PER_CONDITION', 'PER_CONDITION_AND_TARGET']).optional().describe('Incident grouping (default PER_POLICY)'),
    }),
    execute: async ({ newRelicApiKey, name, incidentPreference }) =>
        restV2(newRelicApiKey, 'POST', '/alerts_policies.json', { body: { policy: { name, incident_preference: incidentPreference ?? 'PER_POLICY' } } }, 'create alert policy'),
});

export const getAlertPolicies = tool({
    description: 'Lists alert policies with optional name filter and pagination. Use to find policy IDs for conditions and channels.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().optional().describe('Partial-match name filter'),
        incidentPreference: incidentPreference.describe('Filter by incident preference'),
        page: z.number().int().min(1).optional().describe('Page number (starts at 1)'),
    }),
    execute: async ({ newRelicApiKey, name, incidentPreference, page }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_policies.json', { query: { 'filter[name]': name, 'filter[incident_preference]': incidentPreference, page } }, 'list alert policies'),
});

export const updateAlertPolicyRest = tool({
    description: 'Updates a policy name and/or incident preference via REST API v2. Provide at least one field.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().min(1).describe('Policy ID to update'),
        name: z.string().optional().describe('New unique policy name'),
        incidentPreference: incidentPreference.describe('New incident preference'),
    }),
    execute: async ({ newRelicApiKey, policyId, name, incidentPreference }) => {
        if (!name && !incidentPreference) return { error: 'Provide at least one of name or incidentPreference' };
        return restV2(newRelicApiKey, 'PUT', `/alerts_policies/${policyId}.json`, { body: { policy: { name, incident_preference: incidentPreference } } }, 'update alert policy');
    },
});

export const deleteAlertPolicy = tool({
    description: 'Deletes an alert policy via REST API v2 after confirming the policy ID. Conditions in the policy are removed with it.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.string().describe('Policy ID to delete'),
    }),
    execute: async ({ newRelicApiKey, policyId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_policies/${policyId}.json`, undefined, 'delete alert policy'),
});

export const createAlertPolicyGraphql = tool({
    description: 'Creates an alert policy via NerdGraph. Prefer over REST when already working in GraphQL flows.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the new policy'),
        name: z.string().describe('Policy name, unique within the account'),
        incidentPreference: z.enum(['PER_POLICY', 'PER_CONDITION', 'PER_CONDITION_AND_TARGET']).optional().describe('Incident grouping (default PER_POLICY)'),
    }),
    execute: async ({ newRelicApiKey, accountId, name, incidentPreference }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $policy: AlertsPolicyInput!) { alertsPolicyCreate(accountId: $accountId, policy: $policy) { ${POLICY_SELECT} } }`,
            { accountId, policy: { name, incidentPreference: incidentPreference ?? 'PER_POLICY' } },
            'create alert policy',
        ),
});

export const updateAlertPolicy = tool({
    description: 'Updates a policy name and/or incident preference via NerdGraph. Provide at least one field in policy.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the policy'),
        policyId: z.string().describe('Policy ID to update'),
        policy: z.object({
            name: z.string().optional().describe('New unique policy name'),
            incidentPreference: z.enum(['PER_POLICY', 'PER_CONDITION', 'PER_CONDITION_AND_TARGET']).optional(),
        }).describe('Fields to update (at least one)'),
    }),
    execute: async ({ newRelicApiKey, accountId, policyId, policy }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $id: ID!, $policy: AlertsPolicyUpdateInput!) { alertsPolicyUpdate(accountId: $accountId, id: $id, policy: $policy) { ${POLICY_SELECT} } }`,
            { accountId, id: policyId, policy },
            'update alert policy',
        ),
});

export const deleteAlertPolicyGraphql = tool({
    description: 'Deletes an alert policy via NerdGraph. Use when operating in GraphQL flows instead of REST.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the policy'),
        policyId: z.string().describe('Policy ID to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, policyId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $id: ID!) { alertsPolicyDelete(accountId: $accountId, id: $id) { id } }',
            { accountId, id: policyId },
            'delete alert policy',
        ),
});

export const deleteAlertsCondition = tool({
    description: 'Deletes any alert condition type by ID via NerdGraph (NRQL static/baseline/outlier all supported). Only the id is returned.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the condition'),
        id: z.number().int().describe('Condition ID to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, id }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $id: ID!) { alertsConditionDelete(accountId: $accountId, id: $id) { id } }',
            { accountId, id: String(id) },
            'delete alert condition',
        ),
});

export const updateCrossAccountElections = tool({
    description: 'Enables/disables cross-account alerting elections for up to 20 accounts (alerts visible across account boundaries).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountIds: z.array(z.number().int()).min(1).max(20).describe('Account IDs to update (max 20)'),
        electionStatus: z.boolean().describe('true to enable cross-account alerting, false to disable'),
    }),
    execute: async ({ newRelicApiKey, accountIds, electionStatus }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountIds: [Int!]!, $electionStatus: Boolean!) { alertsUpdateCrossAccountElections(accountIds: $accountIds, electionStatus: $electionStatus) { electionStatus } }',
            { accountIds, electionStatus },
            'update cross-account elections',
        ),
});

export const addNotificationChannelsToPolicy = tool({
    description: 'Associates existing notification channels with an alert policy via NerdGraph. Pass one or comma-separated channel IDs.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID containing the policy and channels'),
        policyId: z.string().describe('Policy ID to add channels to'),
        notificationChannelIds: z.string().describe("Channel ID(s), e.g. '888888' or '888888,888889'"),
    }),
    execute: async ({ newRelicApiKey, accountId, policyId, notificationChannelIds }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $policyId: ID!, $ids: [ID!]!) { alertsNotificationChannelsAddToPolicy(accountId: $accountId, policyId: $policyId, notificationChannelIds: $ids) { policyId } }',
            { accountId, policyId, ids: notificationChannelIds.split(',').map((s) => s.trim()).filter(Boolean) },
            'add notification channels to policy',
        ),
});

export const removeNotificationChannelsFromPolicy = tool({
    description: 'Detaches notification channels from a policy via NerdGraph without deleting the channels themselves.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID containing the policy'),
        policyId: z.number().int().describe('Policy ID to remove channels from'),
        notificationChannelIds: z.array(z.number().int()).min(1).describe('Channel IDs to detach'),
    }),
    execute: async ({ newRelicApiKey, accountId, policyId, notificationChannelIds }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $policyId: ID!, $ids: [ID!]!) { alertsNotificationChannelsRemoveFromPolicy(accountId: $accountId, policyId: $policyId, notificationChannelIds: $ids) { policyId } }',
            { accountId, policyId: String(policyId), ids: notificationChannelIds.map(String) },
            'remove notification channels from policy',
        ),
});

export const updatePolicyChannels = tool({
    description: 'Replaces all notification-channel associations on a policy via REST API v2 (existing links are overwritten).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().describe('Policy ID to associate channels with'),
        channelIds: z.array(z.number().int()).min(1).describe('Channel IDs (replaces existing associations)'),
    }),
    execute: async ({ newRelicApiKey, policyId, channelIds }) =>
        restV2(
            newRelicApiKey,
            'PUT',
            '/alerts_policy_channels.json',
            { query: { policy_id: policyId, channel_ids: channelIds.join(',') } },
            'update policy channels',
        ),
});

export const deletePolicyChannel = tool({
    description: 'Removes one notification channel from a policy via REST API v2 without deleting either resource.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().describe('Policy ID to remove the channel from'),
        channelId: z.number().int().describe('Channel ID to remove'),
    }),
    execute: async ({ newRelicApiKey, policyId, channelId }) =>
        restV2(
            newRelicApiKey,
            'DELETE',
            '/alerts_policy_channels.json',
            { query: { policy_id: policyId, channel_id: channelId } },
            'remove channel from policy',
        ),
});
