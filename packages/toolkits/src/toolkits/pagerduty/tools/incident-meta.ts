// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');

export const pagerdutyListIncidentTypes = tool({
  description: 'List incident types (e.g. default, major) used to categorize incidents.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/incidents/types'),
});

export const pagerdutyGetIncidentType = tool({
  description: 'Get one incident type by ID or name.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    typeIdOrName: z.string().describe('Incident type ID or name'),
  }),
  execute: ({ pagerdutyApiKey, typeIdOrName }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incidents/types/${encodeURIComponent(typeIdOrName)}`),
});

export const pagerdutyCreateIncidentType = tool({
  description: 'Create a new incident type for categorization.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Type name, e.g. "security_incident"'),
    displayName: z.string().optional().describe('Human-readable label'),
    description: z.string().optional().describe('What this type covers'),
    enabled: z.boolean().optional().describe('Whether the type is active (default true)'),
  }),
  execute: ({ pagerdutyApiKey, name, displayName, description, enabled }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/incidents/types', {
      body: {
        incident_type: {
          type: 'incident_type',
          name,
          ...(displayName ? { display_name: displayName } : {}),
          ...(description ? { description } : {}),
          ...(enabled !== undefined ? { enabled } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateIncidentType = tool({
  description: 'Rename, describe, or enable/disable an incident type.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    typeIdOrName: z.string().describe('Incident type ID or name'),
    displayName: z.string().optional().describe('New label'),
    description: z.string().optional().describe('New description'),
    enabled: z.boolean().optional().describe('Active flag'),
  }),
  execute: ({ pagerdutyApiKey, typeIdOrName, displayName, description, enabled }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/incidents/types/${encodeURIComponent(typeIdOrName)}`, {
      body: {
        incident_type: {
          type: 'incident_type',
          ...(displayName ? { display_name: displayName } : {}),
          ...(description ? { description } : {}),
          ...(enabled !== undefined ? { enabled } : {}),
        },
      },
    }),
});

export const pagerdutyListIncidentCustomFields = tool({
  description: 'List global incident custom fields available across incident types.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/incidents/custom_fields'),
});

export const pagerdutyCreateIncidentCustomField = tool({
  description:
    'Create a global incident custom field (text, number, single/multi-select, URL, datetime).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Field name, e.g. "Customer impact"'),
    dataType: z
      .enum(['string', 'integer', 'float', 'boolean', 'datetime', 'url'])
      .optional()
      .describe('Value type (default string)'),
    fieldType: z
      .enum(['single_value', 'multi_value'])
      .optional()
      .describe('Single or multi value (default single_value)'),
    displayName: z.string().optional().describe('Label shown in the UI'),
  }),
  execute: ({ pagerdutyApiKey, name, dataType, fieldType, displayName }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/incidents/custom_fields', {
      body: {
        field: {
          type: 'custom_field',
          name,
          ...(dataType ? { data_type: dataType } : {}),
          ...(fieldType ? { field_type: fieldType } : {}),
          ...(displayName ? { display_name: displayName } : {}),
        },
      },
    }),
});

export const pagerdutyGetIncidentCustomField = tool({
  description: 'Get one global incident custom field definition.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID'),
  }),
  execute: ({ pagerdutyApiKey, fieldId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incidents/custom_fields/${encodeURIComponent(fieldId)}`),
});

export const pagerdutyUpdateIncidentCustomField = tool({
  description: 'Update a global incident custom field name, label, or display settings.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID'),
    name: z.string().optional().describe('New name'),
    displayName: z.string().optional().describe('New UI label'),
    description: z.string().optional().describe('New description'),
    enabled: z.boolean().optional().describe('Active flag'),
  }),
  execute: ({ pagerdutyApiKey, fieldId, ...patch }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/incidents/custom_fields/${encodeURIComponent(fieldId)}`, {
      body: {
        field: {
          type: 'custom_field',
          ...(patch.name ? { name: patch.name } : {}),
          ...(patch.displayName ? { display_name: patch.displayName } : {}),
          ...(patch.description ? { description: patch.description } : {}),
          ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteIncidentCustomField = tool({
  description: 'Delete a global incident custom field.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, fieldId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/incidents/custom_fields/${encodeURIComponent(fieldId)}`),
});

export const pagerdutyListIncidentFieldOptions = tool({
  description: 'List selectable options for a global incident custom field.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID'),
  }),
  execute: ({ pagerdutyApiKey, fieldId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/custom_fields/${encodeURIComponent(fieldId)}/field_options`,
    ),
});

export const pagerdutyCreateIncidentFieldOption = tool({
  description: 'Add a selectable option to a global incident custom field.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID'),
    value: z.string().describe('Option value/label'),
  }),
  execute: ({ pagerdutyApiKey, fieldId, value }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incidents/custom_fields/${encodeURIComponent(fieldId)}/field_options`,
      { body: { field_option: { type: 'field_option', value } } },
    ),
});

export const pagerdutyUpdateIncidentFieldOption = tool({
  description: 'Rename a global incident custom field option.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID'),
    optionId: z.string().describe('Option ID'),
    value: z.string().describe('New option value'),
  }),
  execute: ({ pagerdutyApiKey, fieldId, optionId, value }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incidents/custom_fields/${encodeURIComponent(fieldId)}/field_options/${encodeURIComponent(optionId)}`,
      { body: { field_option: { type: 'field_option', value } } },
    ),
});

export const pagerdutyDeleteIncidentFieldOption = tool({
  description: 'Delete an option from a global incident custom field.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fieldId: z.string().describe('Custom field ID'),
    optionId: z.string().describe('Option ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, fieldId, optionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/incidents/custom_fields/${encodeURIComponent(fieldId)}/field_options/${encodeURIComponent(optionId)}`,
    ),
});

export const pagerdutyGetIncidentCustomFieldValues = tool({
  description: 'Read the custom field values set on an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/custom_fields/values`,
    ),
});

export const pagerdutyUpdateIncidentCustomFieldValues = tool({
  description: 'Set custom field values on an incident (e.g. ticket link, customer impact).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    values: z
      .array(z.object({ fieldId: z.string(), value: z.any() }).passthrough())
      .min(1)
      .describe('Values as [{fieldId, value}] where value matches the field data type'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, values }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incidents/${encodeURIComponent(incidentId)}/custom_fields/values`,
      {
        body: {
          custom_fields: values.map((v) => ({
            field: { id: v.fieldId, type: 'custom_field_reference' },
            value: v.value,
          })),
        },
      },
    ),
});

export const pagerdutyListTypeCustomFields = tool({
  description: 'List custom fields attached to a specific incident type.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    typeIdOrName: z.string().describe('Incident type ID or name'),
  }),
  execute: ({ pagerdutyApiKey, typeIdOrName }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/types/${encodeURIComponent(typeIdOrName)}/custom_fields`,
    ),
});

export const pagerdutyCreateTypeCustomField = tool({
  description: 'Attach a custom field to a specific incident type.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    typeIdOrName: z.string().describe('Incident type ID or name'),
    name: z.string().describe('Field name'),
    dataType: z.string().optional().describe('Value type, e.g. "string"'),
    fieldType: z.string().optional().describe('"single_value" or "multi_value"'),
    displayName: z.string().optional().describe('UI label'),
  }),
  execute: ({ pagerdutyApiKey, typeIdOrName, name, dataType, fieldType, displayName }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incidents/types/${encodeURIComponent(typeIdOrName)}/custom_fields`,
      {
        body: {
          field: {
            type: 'custom_field',
            name,
            ...(dataType ? { data_type: dataType } : {}),
            ...(fieldType ? { field_type: fieldType } : {}),
            ...(displayName ? { display_name: displayName } : {}),
          },
        },
      },
    ),
});
