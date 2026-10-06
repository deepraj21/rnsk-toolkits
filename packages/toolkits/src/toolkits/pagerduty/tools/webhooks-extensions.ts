// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');
const fromField = z.string().optional().describe('Acting user email for the From header');
const pageFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Pagination offset'),
  total: z.boolean().optional().describe('Populate the total count (slower)'),
};

export const pagerdutyListWebhookSubscriptions = tool({
  description: 'List webhook subscriptions receiving event webhooks.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/webhook_subscriptions', { query }),
});

export const pagerdutyGetWebhookSubscription = tool({
  description: 'Get one webhook subscription with URL, events, and filter.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    subscriptionId: z.string().describe('Webhook subscription ID'),
  }),
  execute: ({ pagerdutyApiKey, subscriptionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/webhook_subscriptions/${encodeURIComponent(subscriptionId)}`,
    ),
});

export const pagerdutyCreateWebhookSubscription = tool({
  description: 'Subscribe a URL to PagerDuty event webhooks with type and optional filter.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    deliveryUrl: z.string().describe('HTTPS endpoint receiving webhooks'),
    description: z.string().optional().describe('Purpose of this subscription'),
    events: z
      .array(z.string())
      .optional()
      .describe('Event types, e.g. ["incident.triggered","incident.resolved"]'),
    filterType: z.enum(['account', 'service', 'team']).optional().describe('Scope filter kind'),
    filterId: z.string().optional().describe('Service or team ID when filterType is set'),
    active: z.boolean().optional().describe('Start active (default true)'),
  }),
  execute: ({ pagerdutyApiKey, deliveryUrl, description, events, filterType, filterId, active }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/webhook_subscriptions', {
      body: {
        webhook_subscription: {
          type: 'webhook_subscription',
          delivery_method: { type: 'http_delivery_method', url: deliveryUrl },
          ...(description ? { description } : {}),
          ...(events ? { events } : {}),
          ...(filterType
            ? {
                filter: {
                  type: `${filterType}_reference`,
                  ...(filterId ? { id: filterId } : {}),
                },
              }
            : {}),
          ...(active !== undefined ? { active } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateWebhookSubscription = tool({
  description: 'Update a webhook subscription URL, events, or filter.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    subscriptionId: z.string().describe('Webhook subscription ID'),
    deliveryUrl: z.string().optional().describe('New HTTPS endpoint'),
    description: z.string().optional().describe('New description'),
    events: z.array(z.string()).optional().describe('New event list'),
    active: z.boolean().optional().describe('Enable or pause delivery'),
  }),
  execute: ({ pagerdutyApiKey, subscriptionId, deliveryUrl, description, events, active }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/webhook_subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        body: {
          webhook_subscription: {
            ...(deliveryUrl
              ? { delivery_method: { type: 'http_delivery_method', url: deliveryUrl } }
              : {}),
            ...(description ? { description } : {}),
            ...(events ? { events } : {}),
            ...(active !== undefined ? { active } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteWebhookSubscription = tool({
  description: 'Delete a webhook subscription to stop event delivery.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    subscriptionId: z.string().describe('Webhook subscription ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, subscriptionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/webhook_subscriptions/${encodeURIComponent(subscriptionId)}`,
    ),
});

export const pagerdutyEnableWebhookSubscription = tool({
  description: 'Enable a paused webhook subscription.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    subscriptionId: z.string().describe('Webhook subscription ID'),
  }),
  execute: ({ pagerdutyApiKey, subscriptionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/webhook_subscriptions/${encodeURIComponent(subscriptionId)}/enable`,
    ),
});

export const pagerdutyPingWebhookSubscription = tool({
  description: 'Send a test ping event to verify a webhook endpoint.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    subscriptionId: z.string().describe('Webhook subscription ID to test'),
  }),
  execute: ({ pagerdutyApiKey, subscriptionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/webhook_subscriptions/${encodeURIComponent(subscriptionId)}/ping`,
    ),
});

export const pagerdutyListExtensions = tool({
  description: 'List extensions (Slack, Jira, ServiceNow, etc.) attached to objects.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    extensionObjectType: z.string().optional().describe('Filter by object type, e.g. "service"'),
    extensionObjectId: z.string().optional().describe('Filter by attached object ID'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, extensionObjectType, extensionObjectId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/extensions', {
      query: {
        ...query,
        extension_object_type: extensionObjectType,
        extension_object_id: extensionObjectId,
      },
    }),
});

export const pagerdutyGetExtension = tool({
  description: 'Get one extension with its configuration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    extensionId: z.string().describe('Extension ID'),
  }),
  execute: ({ pagerdutyApiKey, extensionId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/extensions/${encodeURIComponent(extensionId)}`),
});

export const pagerdutyCreateExtension = tool({
  description: 'Attach an extension (Slack channel, Jira project, webhook) to a service or object.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Extension name'),
    extensionSchemaId: z
      .string()
      .describe('Extension schema ID (see pagerdutyListExtensionSchemas)'),
    extensionObjectType: z.string().describe('Attached object type, e.g. "service"'),
    extensionObjectId: z.string().describe('Attached object ID'),
    config: z
      .record(z.any())
      .optional()
      .describe('Extension-specific config (webhook URL, channel, project key)'),
  }),
  execute: ({
    pagerdutyApiKey,
    name,
    extensionSchemaId,
    extensionObjectType,
    extensionObjectId,
    config,
  }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/extensions', {
      body: {
        extension: {
          type: 'extension',
          name,
          extension_schema: { id: extensionSchemaId, type: 'extension_schema_reference' },
          extension_objects: [{ id: extensionObjectId, type: `${extensionObjectType}_reference` }],
          ...(config ? { config } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateExtension = tool({
  description: 'Update an extension name or configuration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    extensionId: z.string().describe('Extension ID'),
    name: z.string().optional().describe('New name'),
    config: z.record(z.any()).optional().describe('New config object'),
  }),
  execute: ({ pagerdutyApiKey, extensionId, name, config }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/extensions/${encodeURIComponent(extensionId)}`, {
      body: {
        extension: {
          ...(name ? { name } : {}),
          ...(config ? { config } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteExtension = tool({
  description: 'Delete an extension.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    extensionId: z.string().describe('Extension ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, extensionId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/extensions/${encodeURIComponent(extensionId)}`),
});

export const pagerdutyEnableExtension = tool({
  description: 'Enable a temporarily disabled extension.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    extensionId: z.string().describe('Extension ID'),
  }),
  execute: ({ pagerdutyApiKey, extensionId }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/extensions/${encodeURIComponent(extensionId)}/enable`),
});

export const pagerdutyListExtensionSchemas = tool({
  description: 'List available extension types (Slack, Jira, webhooks) with their schemas.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/extension_schemas'),
});

export const pagerdutyGetExtensionSchema = tool({
  description: 'Get one extension schema with its config requirements.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    schemaId: z.string().describe('Extension schema ID'),
  }),
  execute: ({ pagerdutyApiKey, schemaId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/extension_schemas/${encodeURIComponent(schemaId)}`),
});

export const pagerdutyListAddons = tool({
  description: 'List legacy add-ons (incident action buttons) installed on the account.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().optional().describe('Only add-ons for this service'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, serviceId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/addons', {
      query: { ...query, service_id: serviceId },
    }),
});

export const pagerdutyGetAddon = tool({
  description: 'Get one add-on with its source URL template.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    addonId: z.string().describe('Add-on ID'),
  }),
  execute: ({ pagerdutyApiKey, addonId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/addons/${encodeURIComponent(addonId)}`),
});

export const pagerdutyInstallAddon = tool({
  description: 'Install a third-party add-on on a service or incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    name: z.string().describe('Add-on name'),
    src: z.string().describe('Add-on iframe source URL template'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, name, src }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/addons', {
      fromEmail,
      body: { addon: { type: 'full_page_addon', name, src } },
    }),
});

export const pagerdutyUpdateAddon = tool({
  description: 'Update an add-on name or source URL.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    addonId: z.string().describe('Add-on ID'),
    name: z.string().optional().describe('New name'),
    src: z.string().optional().describe('New source URL'),
  }),
  execute: ({ pagerdutyApiKey, addonId, name, src }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/addons/${encodeURIComponent(addonId)}`, {
      body: {
        addon: {
          ...(name ? { name } : {}),
          ...(src ? { src } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteAddon = tool({
  description: 'Uninstall an add-on.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    addonId: z.string().describe('Add-on ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, addonId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/addons/${encodeURIComponent(addonId)}`),
});

export const pagerdutyListAlertGroupingSettings = tool({
  description: 'List intelligent alert grouping configurations per service.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/alert_grouping_settings'),
});

export const pagerdutyGetAlertGroupingSetting = tool({
  description: 'Get one alert grouping setting.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    settingId: z.string().describe('Setting ID (service ID)'),
  }),
  execute: ({ pagerdutyApiKey, settingId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/alert_grouping_settings/${encodeURIComponent(settingId)}`),
});

export const pagerdutyCreateAlertGroupingSetting = tool({
  description: 'Configure intelligent alert grouping for services.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    setting: z
      .record(z.any())
      .describe('Grouping config {services:[{id,type}], config:{type, timeout, ...}}'),
  }),
  execute: ({ pagerdutyApiKey, setting }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/alert_grouping_settings', {
      body: setting,
    }),
});

export const pagerdutyUpdateAlertGroupingSetting = tool({
  description: 'Update an alert grouping setting timeout or grouping type.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    settingId: z.string().describe('Setting ID'),
    setting: z.record(z.any()).describe('Replacement grouping config'),
  }),
  execute: ({ pagerdutyApiKey, settingId, setting }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/alert_grouping_settings/${encodeURIComponent(settingId)}`, {
      body: setting,
    }),
});

export const pagerdutyDeleteAlertGroupingSetting = tool({
  description: 'Delete an alert grouping setting (falls back to default grouping).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    settingId: z.string().describe('Setting ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, settingId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/alert_grouping_settings/${encodeURIComponent(settingId)}`,
    ),
});
