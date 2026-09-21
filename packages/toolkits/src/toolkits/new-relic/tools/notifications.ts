// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField, restV2 } from './client.js';

const channelProperty = z.object({
    key: z.string().describe("Property key, e.g. 'channelId', 'payload', 'subject'"),
    value: z.string().describe('Property value (JSON payloads as escaped strings)'),
});

const CHANNEL_SELECT = 'channel { id name type }';

// ---- AI notification channels ----

export const createAiNotificationsChannel = tool({
    description:
        'Creates an AI Notifications channel for Applied Intelligence alerts. Needs a pre-existing destination (create one first).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID for the channel'),
        type: z.enum(['WEBHOOK', 'EMAIL', 'SLACK', 'PAGERDUTY_ACCOUNT_INTEGRATION', 'PAGERDUTY_SERVICE_INTEGRATION', 'SERVICENOW_INCIDENTS', 'JIRA_CLASSIC', 'JIRA_NEXTGEN', 'MOBILE_PUSH']),
        name: z.string().describe("Channel name, e.g. 'Production Slack Alerts'"),
        destinationId: z.string().describe('Destination UUID (create destination first)'),
        product: z.enum(['IINT', 'ERROR_TRACKING', 'DISCUSSIONS']).describe('IINT = Applied Intelligence alerts'),
        properties: z.array(channelProperty).min(1).describe("Type-specific props: SLACK needs channelId; WEBHOOK needs payload"),
    }),
    execute: async ({ newRelicApiKey, accountId, ...channel }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $channel: AiNotificationsChannelInput!) { aiNotificationsCreateChannel(accountId: $accountId, channel: $channel) { ${CHANNEL_SELECT} } }`,
            { accountId: Number(accountId), channel },
            'create AI notifications channel',
        ),
});

export const updateAiNotificationsChannel = tool({
    description: 'Updates an AI channel name or active status. Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID owning the channel'),
        channelId: z.string().describe('Channel UUID to update'),
        channel: z.object({
            name: z.string().optional().describe('New channel name'),
            active: z.boolean().optional().describe('Activate/deactivate'),
        }).describe('Fields to update'),
    }),
    execute: async ({ newRelicApiKey, accountId, channelId, channel }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $channelId: ID!, $channel: AiNotificationsChannelUpdateInput!) { aiNotificationsUpdateChannel(accountId: $accountId, channelId: $channelId, channel: $channel) { ${CHANNEL_SELECT} } }`,
            { accountId: Number(accountId), channelId, channel },
            'update AI notifications channel',
        ),
});

export const deleteAiNotificationsChannel = tool({
    description: 'Deletes an AI notifications channel by ID after confirming ownership.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: z.string().describe('Account ID owning the channel'),
        channelId: z.string().describe('Channel UUID to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, channelId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $channelId: ID!) { aiNotificationsDeleteChannel(accountId: $accountId, channelId: $channelId) { ids } }',
            { accountId: Number(accountId), channelId },
            'delete AI notifications channel',
        ),
});

export const testAiNotificationsChannel = tool({
    description: 'Tests an AI channel configuration before saving by sending a trial notification. Reports SUCCESS/FAIL.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the test'),
        channel: z.object({
            type: z.enum(['EMAIL', 'WEBHOOK', 'PAGERDUTY_ACCOUNT_INTEGRATION', 'PAGERDUTY_SERVICE_INTEGRATION', 'SLACK', 'SLACK_COLLABORATION', 'SERVICENOW_INCIDENTS', 'JIRA_CLASSIC']),
            name: z.string().describe('Display name for the test channel'),
            destinationId: z.string().describe('Destination endpoint UUID'),
            product: z.enum(['DISCUSSIONS', 'ERROR_TRACKING', 'IINT']),
            properties: z.array(channelProperty).min(1),
        }).describe('Channel configuration to test'),
    }),
    execute: async ({ newRelicApiKey, accountId, channel }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $channel: AiNotificationsChannelInput!) { aiNotificationsTestChannel(accountId: $accountId, channel: $channel) { result details error { details } } }',
            { accountId, channel },
            'test AI notifications channel',
        ),
});

export const testNotificationChannel = tool({
    description: 'Sends a test notification through an existing AI channel to verify it delivers correctly.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the channel'),
        channelId: z.string().describe('Channel UUID to test'),
    }),
    execute: async ({ newRelicApiKey, accountId, channelId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $channelId: ID!) { aiNotificationsTestChannelById(accountId: $accountId, channelId: $channelId) { result details error { details } } }',
            { accountId, channelId },
            'test notification channel',
        ),
});

// ---- AI notification destinations ----

const destinationProperty = z.object({
    key: z.string().describe("Property key, e.g. 'url' for Jira/webhook, 'email' for EMAIL"),
    value: z.string().describe('Property value'),
});

export const createAiNotificationsDestination = tool({
    description: 'Creates an AI notifications destination (Jira, ServiceNow, webhook, Slack, PagerDuty). Channels attach to destinations.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the destination'),
        destination: z.object({
            type: z.enum(['JIRA', 'SERVICENOW', 'WEBHOOK', 'EMAIL', 'SLACK', 'PAGERDUTY']),
            name: z.string().describe('Destination name'),
            properties: z.array(destinationProperty).min(1).describe("Config props: Jira needs 'url'"),
            auth: z.object({
                type: z.enum(['BASIC', 'TOKEN', 'OAUTH2']),
                basic: z.object({ user: z.string(), password: z.string() }).optional().describe('BASIC credentials'),
            }).optional(),
        }).describe('Destination configuration'),
    }),
    execute: async ({ newRelicApiKey, accountId, destination }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $destination: AiNotificationsDestinationInput!) { aiNotificationsCreateDestination(accountId: $accountId, destination: $destination) { destination { id name } error { type description } } }',
            { accountId, destination },
            'create AI notifications destination',
        ),
});

export const updateAiNotificationsDestination = tool({
    description: 'Renames an AI destination. Partial update — only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the destination'),
        destinationId: z.string().describe('Destination UUID to update'),
        destination: z.object({ name: z.string().describe('New destination name') }).describe('Fields to update'),
    }),
    execute: async ({ newRelicApiKey, accountId, destinationId, destination }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $destinationId: ID!, $destination: AiNotificationsDestinationUpdateInput!) { aiNotificationsUpdateDestination(accountId: $accountId, destinationId: $destinationId, destination: $destination) { destination { id name type } error { type description } } }',
            { accountId, destinationId, destination },
            'update AI notifications destination',
        ),
});

export const deleteAiNotificationsDestination = tool({
    description: 'Deletes an AI notifications destination by ID after confirming ownership.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the destination'),
        destinationId: z.string().describe('Destination UUID to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, destinationId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $destinationId: ID!) { aiNotificationsDeleteDestination(accountId: $accountId, destinationId: $destinationId) { ids } }',
            { accountId, destinationId },
            'delete AI notifications destination',
        ),
});

export const testAiNotificationsDestination = tool({
    description: 'Validates a destination configuration (EMAIL/WEBHOOK/etc.) before or after creating it.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the test'),
        destination: z.object({
            type: z.string().describe("Destination type, e.g. 'EMAIL', 'WEBHOOK', 'SLACK_COLLABORATION'"),
            name: z.string().describe('Test destination name'),
            properties: z.array(destinationProperty).min(1).describe("EMAIL needs 'email'; WEBHOOK needs 'url'"),
        }).describe('Destination configuration to test'),
    }),
    execute: async ({ newRelicApiKey, accountId, destination }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $destination: AiNotificationsDestinationInput!) { aiNotificationsTestDestination(accountId: $accountId, destination: $destination) { result details error { details } } }',
            { accountId, destination },
            'test AI notifications destination',
        ),
});

export const testAiNotificationDestinationById = tool({
    description: 'Tests an existing destination by UUID to verify it can receive messages.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the destination'),
        destinationId: z.string().describe('Destination UUID to test'),
    }),
    execute: async ({ newRelicApiKey, accountId, destinationId }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $destinationId: ID!) { aiNotificationsTestDestinationById(accountId: $accountId, destinationId: $destinationId) { result details error { details } } }',
            { accountId, destinationId },
            'test AI notification destination by ID',
        ),
});

// ---- AI workflows ----

const workflowPredicate = z.object({
    attribute: z.string().describe("Filter attribute, e.g. 'priority', 'labels.policyIds'"),
    operator: z.string().describe("Operator, e.g. 'EQUAL', 'EXACTLY_MATCHES', 'CONTAINS'"),
    values: z.array(z.string()).min(1),
});

export const createAiWorkflow = tool({
    description:
        'Creates an AI workflow routing filtered issues to channels with optional NRQL enrichments. Needs channel UUIDs from AI channels first.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the workflow'),
        name: z.string().describe("Workflow name, e.g. 'Production Alert Workflow'"),
        issuesFilter: z.object({
            name: z.string().describe('Filter name'),
            type: z.string().optional().describe("Must be 'FILTER' if provided"),
            predicates: z.array(workflowPredicate).min(1),
        }).describe('Which issues trigger the workflow (at least one predicate)'),
        destinationConfigurations: z.array(z.object({
            channelId: z.string().describe('Notification channel UUID'),
            notificationTriggers: z.array(z.string()).min(1).describe("e.g. ['ACTIVATED','CLOSED']"),
        })).min(1).describe('Channels to notify (at least one)'),
        enrichments: z.object({ nrql: z.array(z.object({ name: z.string(), nrql: z.string() })).optional() }).optional().describe('NRQL enrichments adding context'),
        workflowEnabled: z.boolean().optional().describe('Active on creation (default true)'),
        enrichmentsEnabled: z.boolean().optional(),
        destinationsEnabled: z.boolean().optional(),
        mutingRulesHandling: z.enum(['DONT_NOTIFY_FULLY_MUTED_ISSUES', 'NOTIFY_ALL_ISSUES', 'DONT_NOTIFY_FULLY_OR_PARTIALLY_MUTED_ISSUES']).optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, ...workflow }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $workflow: AiWorkflowsCreateWorkflowInput!) { aiWorkflowsCreateWorkflow(accountId: $accountId, workflow: $workflow) { workflow { id name workflowEnabled destinationsEnabled } errors { type description } } }`,
            { accountId, workflow: { workflowEnabled: true, destinationsEnabled: true, ...workflow } },
            'create AI workflow',
        ),
});

export const updateWorkflow = tool({
    description: 'Updates an AI workflow (name, toggles, destinations, enrichments, filters). Only the ID is required; other fields change if provided.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the workflow'),
        updateWorkflowData: z.object({
            id: z.string().describe('Workflow UUID to update'),
            name: z.string().optional(),
            workflowEnabled: z.boolean().optional(),
            enrichmentsEnabled: z.boolean().optional(),
            destinationsEnabled: z.boolean().optional(),
            mutingRulesHandling: z.string().optional(),
            enrichments: z.array(z.record(z.any())).optional(),
            issuesFilter: z.record(z.any()).optional().describe("Filter update wrapped as {filterInput: {name, type, predicates}}"),
            destinationConfigurations: z.array(z.object({ channelId: z.string(), notificationTriggers: z.array(z.string()).optional() })).optional(),
        }).describe('Workflow update (id required)'),
    }),
    execute: async ({ newRelicApiKey, accountId, updateWorkflowData }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountId: Int!, $updateWorkflowData: AiWorkflowsUpdateWorkflowInput!) { aiWorkflowsUpdateWorkflow(accountId: $accountId, updateWorkflowData: $updateWorkflowData) { workflow { id name workflowEnabled } errors { type description } } }',
            { accountId, updateWorkflowData },
            'update AI workflow',
        ),
});

// ---- Legacy REST notification channels ----

const channelConfig = z.object({
    recipients: z.string().optional().describe("Email: comma-separated addresses (required for 'email')"),
    url: z.string().optional().describe("Webhook/Slack URL (required for 'webhook'/'slack')"),
    channel: z.string().optional().describe("Slack channel name without '#'"),
    serviceKey: z.string().optional().describe("PagerDuty service key (required for 'pagerduty')"),
    apiKey: z.string().optional().describe("OpsGenie API key (required for 'opsgenie')"),
    tags: z.string().optional().describe('OpsGenie tags'),
    teams: z.string().optional().describe('OpsGenie teams'),
    routeKey: z.string().optional().describe("VictorOps routing key (required for 'victorops')"),
    key: z.string().optional().describe("VictorOps API key (required for 'victorops')"),
    authUsername: z.string().optional().describe('Webhook basic-auth username'),
    authPassword: z.string().optional().describe('Webhook basic-auth password'),
}).describe('Type-specific channel configuration');

export const createAlertChannel = tool({
    description: 'Registers a legacy alert channel endpoint (email, Slack, webhook, PagerDuty, OpsGenie, VictorOps). Link it to policies afterwards.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        type: z.enum(['email', 'slack', 'webhook', 'pagerduty', 'opsgenie', 'victorops']),
        name: z.string().describe('Human-readable channel name'),
        configuration: channelConfig,
    }),
    execute: async ({ newRelicApiKey, ...channel }) =>
        restV2(newRelicApiKey, 'POST', '/alerts_channels.json', { body: { channel } }, 'create alert channel'),
});

export const getAlertChannels = tool({
    description: 'Lists legacy alert channels (IDs, names, types, policy links) to discover linkable channels. Paginated.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
    }),
    execute: async ({ newRelicApiKey, page }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_channels.json', { query: { page } }, 'list alert channels'),
});

export const updateAlertChannel = tool({
    description: 'Updates a legacy alert channel (name, type, configuration) after verifying its ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        alertChannelId: z.number().int().min(1).describe('Channel ID to update'),
        name: z.string().optional().describe('New channel name'),
        type: z.enum(['email', 'slack', 'webhook', 'pagerduty', 'opsgenie', 'victorops']).optional().describe('Provide only to change type'),
        configuration: channelConfig.optional(),
    }),
    execute: async ({ newRelicApiKey, alertChannelId, ...channel }) =>
        restV2(newRelicApiKey, 'PUT', `/alerts_channels/${alertChannelId}.json`, { body: { channel } }, 'update alert channel'),
});

export const deleteAlertChannel = tool({
    description: 'Deletes a legacy alert channel by ID after confirming ownership.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        channelId: z.number().int().describe('Channel ID to delete'),
    }),
    execute: async ({ newRelicApiKey, channelId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_channels/${channelId}.json`, undefined, 'delete alert channel'),
});
