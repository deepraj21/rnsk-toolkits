// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldDelete, cldGet, cldJson, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );

const fieldType = z
  .enum(['string', 'integer', 'date', 'enum', 'set'])
  .describe('Metadata field type');
const datasourceValue = z.object({
  externalId: z.string().describe('Unique immutable ID for this list value'),
  value: z.string().describe('Display string for this list entry'),
  state: z.string().optional().describe('Entry state (read-only; managed via delete/restore)'),
  position: z.number().int().optional().describe('Position/order in the datasource list'),
});

export const cloudinaryListMetadataFields = tool({
  description:
    'List all structured metadata field definitions, optionally filtered by external IDs.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalIds: z.array(z.string()).optional().describe('Return only these field external IDs'),
  }),
  execute: async ({ cloudinaryCredentials, externalIds }) => {
    const result: any = await cldGet(parseCreds(cloudinaryCredentials), '/metadata_fields');
    if (result && Array.isArray(externalIds) && Array.isArray((result as any).metadata_fields)) {
      return {
        metadata_fields: (result as any).metadata_fields.filter((f: any) =>
          externalIds.includes(f.external_id),
        ),
      };
    }
    return result;
  },
});

export const cloudinaryGetMetadataFieldById = tool({
  description: 'Get a single metadata field definition by external ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID, e.g. "color_id"'),
  }),
  execute: ({ cloudinaryCredentials, externalId }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/metadata_fields/${encodeURIComponent(externalId)}`),
});

export const cloudinaryCreateMetadataField = tool({
  description: 'Create a structured metadata field (string, integer, date, enum, or set).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    type: fieldType,
    label: z.string().describe('Human-readable label shown in the UI'),
    externalId: z.string().optional().describe('Unique field ID (auto-generated if omitted)'),
    mandatory: z.boolean().optional().describe('Whether a value is required (default false)'),
    defaultValue: z
      .any()
      .optional()
      .describe('Default value (list for set type); required if mandatory'),
    defaultDisabled: z.boolean().optional().describe('Disable field by default for new assets'),
    allowDynamicListValues: z.boolean().optional().describe('Allow dynamic set value additions'),
    datasource: z
      .object({ values: z.array(datasourceValue) })
      .optional()
      .describe('Predefined values for enum/set (max 3000)'),
    validation: z
      .record(z.any())
      .optional()
      .describe('Validation rules, e.g. {type:"greater_than",value:10}'),
    restrictions: z
      .record(z.boolean())
      .optional()
      .describe('UI restrictions, e.g. {readonly_ui:true}'),
  }),
  execute: ({
    cloudinaryCredentials,
    type,
    label,
    externalId,
    mandatory,
    defaultValue,
    defaultDisabled,
    allowDynamicListValues,
    datasource,
    validation,
    restrictions,
  }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/metadata_fields', {
      type,
      label,
      external_id: externalId,
      mandatory,
      default_value: defaultValue,
      default_disabled: defaultDisabled,
      allow_dynamic_list_values: allowDynamicListValues,
      datasource: datasource
        ? { values: datasource.values.map((v) => ({ external_id: v.externalId, value: v.value })) }
        : undefined,
      validation,
      restrictions,
    }),
});

export const cloudinaryUpdateMetadataField = tool({
  description:
    'Partially update a metadata field definition (label, mandatory, validation, ...) by external ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID to update'),
    label: z.string().optional().describe('New label'),
    mandatory: z.boolean().optional().describe('Whether a value is required'),
    defaultValue: z.any().optional().describe('New default value'),
    defaultDisabled: z.boolean().optional().describe('Disable by default for new assets'),
    allowDynamicListValues: z.boolean().optional().describe('Allow dynamic set value additions'),
    datasource: z
      .object({ values: z.array(datasourceValue) })
      .optional()
      .describe('Replacement predefined values'),
    validation: z.record(z.any()).optional().describe('Validation rules'),
    restrictions: z.record(z.boolean()).optional().describe('UI restrictions'),
  }),
  execute: ({
    cloudinaryCredentials,
    externalId,
    label,
    mandatory,
    defaultValue,
    defaultDisabled,
    allowDynamicListValues,
    datasource,
    validation,
    restrictions,
  }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/metadata_fields/${encodeURIComponent(externalId)}`,
      {
        label,
        mandatory,
        default_value: defaultValue,
        default_disabled: defaultDisabled,
        allow_dynamic_list_values: allowDynamicListValues,
        datasource: datasource
          ? {
              values: datasource.values.map((v) => ({ external_id: v.externalId, value: v.value })),
            }
          : undefined,
        validation,
        restrictions,
      },
    ),
});

export const cloudinaryDeleteMetadataField = tool({
  description: 'Delete a metadata field definition by external ID (external ID becomes reusable).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID to delete'),
  }),
  execute: ({ cloudinaryCredentials, externalId }) =>
    cldDelete(
      parseCreds(cloudinaryCredentials),
      `/metadata_fields/${encodeURIComponent(externalId)}`,
    ),
});

export const cloudinaryUpdateMetadataFieldDatasource = tool({
  description:
    'Update enum/set datasource entries (existing external IDs update, new ones append).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID'),
    values: z.array(datasourceValue).min(1).describe('Entries to set/update'),
  }),
  execute: ({ cloudinaryCredentials, externalId, values }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/metadata_fields/${encodeURIComponent(externalId)}/datasource`,
      {
        values: values.map((v) => ({
          external_id: v.externalId,
          value: v.value,
          state: v.state,
          position: v.position,
        })),
      },
    ),
});

export const cloudinaryDeleteMetadataFieldDatasourceEntries = tool({
  description:
    'Soft-delete (inactivate) datasource entries; they remain listed with state inactive until restored.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID, e.g. "color_id"'),
    externalIds: z
      .array(z.string())
      .min(1)
      .describe('Entry external IDs to inactivate, e.g. ["color1"]'),
  }),
  execute: ({ cloudinaryCredentials, externalId, externalIds }) =>
    cldDelete(
      parseCreds(cloudinaryCredentials),
      `/metadata_fields/${encodeURIComponent(externalId)}/datasource`,
      {
        external_ids: externalIds,
      },
    ),
});

export const cloudinaryRestoreMetadataFieldDatasourceEntries = tool({
  description: 'Reactivate previously soft-deleted datasource entries.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID'),
    externalIds: z.array(z.string()).min(1).describe('Entry external IDs to restore'),
  }),
  execute: ({ cloudinaryCredentials, externalId, externalIds }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'POST',
      `/metadata_fields/${encodeURIComponent(externalId)}/datasource_restore`,
      {
        external_ids: externalIds,
      },
    ),
});

export const cloudinaryOrderMetadataFieldDatasource = tool({
  description: 'Sort an enum/set datasource by value, ascending or descending.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID'),
    orderBy: z.string().describe('Sort criteria (only "value" is supported)'),
    direction: z.enum(['asc', 'desc']).describe('Sort direction'),
  }),
  execute: ({ cloudinaryCredentials, externalId, orderBy, direction }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/metadata_fields/${encodeURIComponent(externalId)}/datasource/order`,
      {
        order_by: orderBy,
        direction,
      },
    ),
});

export const cloudinarySearchDatasourceInMetadataField = tool({
  description: 'Search values inside one enum/set field datasource by substring or exact match.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID to search in'),
    term: z.string().optional().describe('Substring to match against values'),
    exactMatch: z.boolean().optional().describe('Require an exact match (default false)'),
    maxResults: z.number().int().min(1).optional().describe('Max values to return (default 255)'),
    payload: z.record(z.any()).optional().describe('Metadata payload for rule-based inference'),
  }),
  execute: ({ cloudinaryCredentials, externalId, term, exactMatch, maxResults, payload }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'POST',
      `/metadata_fields/${encodeURIComponent(externalId)}/datasource/search`,
      {
        term,
        exact_match: exactMatch,
        max_results: maxResults,
        payload,
      },
    ),
});

export const cloudinarySearchMetadataFieldDatasource = tool({
  description: 'Search datasource values across all metadata fields without knowing field IDs.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    term: z.string().optional().describe('Substring to match, e.g. "red"'),
    maxResults: z.number().int().min(1).optional().describe('Max entries to return (default 100)'),
  }),
  execute: ({ cloudinaryCredentials, term, maxResults }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/metadata_fields/datasource/search', {
      term,
      max_results: maxResults,
    }),
});

export const cloudinaryReorderMetadataField = tool({
  description: 'Move one metadata field to a new 0-indexed display position.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Field external ID to move'),
    position: z.number().int().min(0).describe('New 0-indexed position'),
  }),
  execute: ({ cloudinaryCredentials, externalId, position }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/metadata_fields/${encodeURIComponent(externalId)}/reorder`,
      {
        position,
      },
    ),
});

export const cloudinaryReorderMetadataFields = tool({
  description: 'Reorder all metadata fields by label, creation date, or external ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    orderBy: z.enum(['label', 'created_at', 'external_id']).describe('Field to sort by'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
  }),
  execute: ({ cloudinaryCredentials, orderBy, direction }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'PUT', '/metadata_fields/order', {
      order_by: orderBy,
      direction,
    }),
});

const ruleShapes = {
  name: z.string().optional().describe('Descriptive rule name'),
  state: z.enum(['active', 'inactive']).optional().describe('Rule state'),
  position: z.number().int().optional().describe('Execution order position'),
  metadataFieldId: z.string().optional().describe('Target field modified when the rule triggers'),
  condition: z
    .object({
      metadataFieldId: z.string().describe('Field ID evaluated in the condition'),
      populated: z
        .boolean()
        .optional()
        .describe('Require the field populated (true) or empty (false)'),
    })
    .passthrough()
    .optional()
    .describe('Trigger condition (supports and/or/includes/equals operators)'),
  result: z
    .object({
      applyValue: z
        .object({
          mode: z.string().describe('Apply mode, e.g. "default"'),
          value: z.string().describe('Value applied to the target field'),
        })
        .passthrough(),
    })
    .passthrough()
    .optional()
    .describe('Action applied when the condition is met'),
};

export const cloudinaryListMetadataRules = tool({
  description: 'List all conditional metadata rules (auto-fill dependencies between fields).',
  inputSchema: z.object({ cloudinaryCredentials: credField }),
  execute: ({ cloudinaryCredentials }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/metadata_rules'),
});

export const cloudinaryCreateMetadataRule = tool({
  description:
    'Create a conditional metadata rule that auto-populates a field when a condition is met.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    metadataFieldId: z.string().describe('Target field modified when the rule triggers'),
    name: z.string().describe('Descriptive rule name'),
    condition: ruleShapes.condition.describe('Trigger condition with metadata_field_id'),
    result: ruleShapes.result.describe('Action with apply_value {mode, value}'),
    state: ruleShapes.state,
    position: ruleShapes.position,
  }),
  execute: ({ cloudinaryCredentials, metadataFieldId, name, condition, result, state, position }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/metadata_rules', {
      metadata_field_id: metadataFieldId,
      name,
      condition: condition
        ? {
            ...condition,
            metadata_field_id:
              (condition as any).metadataFieldId ?? (condition as any).metadata_field_id,
          }
        : undefined,
      result: result
        ? { apply_value: (result as any).applyValue ?? (result as any).apply_value }
        : undefined,
      state,
      position,
    }),
});

export const cloudinaryUpdateMetadataRule = tool({
  description: 'Update a conditional metadata rule name, condition, result, state, or position.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Rule external ID to update'),
    ...ruleShapes,
  }),
  execute: ({
    cloudinaryCredentials,
    externalId,
    name,
    state,
    position,
    metadataFieldId,
    condition,
    result,
  }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/metadata_rules/${encodeURIComponent(externalId)}`,
      {
        name,
        state,
        position,
        metadata_field_id: metadataFieldId,
        condition: condition
          ? {
              ...condition,
              metadata_field_id:
                (condition as any).metadataFieldId ?? (condition as any).metadata_field_id,
            }
          : undefined,
        result: result
          ? { apply_value: (result as any).applyValue ?? (result as any).apply_value }
          : undefined,
      },
    ),
});

export const cloudinaryDeleteMetadataRule = tool({
  description: 'Delete a conditional metadata rule by external ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalId: z.string().describe('Rule external ID to delete'),
  }),
  execute: ({ cloudinaryCredentials, externalId }) =>
    cldDelete(
      parseCreds(cloudinaryCredentials),
      `/metadata_rules/${encodeURIComponent(externalId)}`,
    ),
});
