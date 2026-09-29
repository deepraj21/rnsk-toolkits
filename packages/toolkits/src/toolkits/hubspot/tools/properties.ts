// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotArchiveBatchOfProperties = tool({
  description:
    'Archives a batch of properties by their internal names for a specified HubSpot CRM object type; this operation is idempotent and safe to retry.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ name: z.string() }).catchall(z.any()))
      .describe('A list of properties to archive, each specified by its internal `name`.'),
    objectType: z
      .string()
      .describe('The HubSpot CRM object type for which properties are being archived.'),
  }),
  execute: async ({ hubspotToken, inputs, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/batch/archive`,
      {
        body: { inputs: inputs },
      },
    );
  },
});

export const hubspotArchivePropertyByObjectTypeAndName = tool({
  description:
    'Archives a specified CRM property by its object type and name, moving it to the recycling bin; note that some default HubSpot properties cannot be archived.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "The case-sensitive type of CRM object (e.g., 'contacts', 'companies') for which the property is being archived; must match an existing object type.",
      ),
    propertyName: z
      .string()
      .describe(
        "The case-sensitive internal name of the property to archive (e.g., 'custom_field_1', 'annual_revenue').",
      ),
  }),
  execute: async ({ hubspotToken, objectType, propertyName }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(propertyName))}`,
    );
  },
});

export const hubspotArchivePropertyGroup = tool({
  description:
    'Archives a HubSpot property group, making it inactive and hidden (not permanently deleted, allowing potential restoration) with immediate effect on its CRM visibility and usability.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    groupName: z
      .string()
      .describe(
        "The unique internal name of the property group you want to archive. This name is case-sensitive and must exactly match an existing property group's name within the specified `objectType`.",
      ),
    objectType: z
      .string()
      .describe(
        "The specific CRM object type (e.g., 'contacts', 'companies', 'deals', or custom object types) that the property group belongs to. This value must be in lowercase and match an existing object type definition in your HubSpot account.",
      ),
  }),
  execute: async ({ hubspotToken, groupName, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/groups/${encodeURIComponent(String(groupName))}`,
    );
  },
});

export const hubspotCreateAndReturnANewPropertyGroup = tool({
  description:
    'Creates a new, empty property group for a specified CRM object type in HubSpot, requiring a unique group name for that object type; properties must be added separately.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .describe(
        'The unique internal programmatic name for the property group within the specified `objectType`, used for API referencing.',
      ),
    label: z
      .string()
      .describe('Human-readable label for the property group, displayed in the HubSpot UI.'),
    objectType: z
      .string()
      .describe('The CRM object type for which the property group will be created.'),
    displayOrder: z
      .number()
      .int()
      .optional()
      .describe(
        'Order in which the group appears in the HubSpot UI. Positive values are sorted ascendingly; -1 places it after groups with positive `displayOrder`. If unspecified, the group is added at the end.',
      ),
  }),
  execute: async ({ hubspotToken, name, label, objectType, displayOrder }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/groups`,
      {
        body: pickDefined({ name: name, label: label, displayOrder: displayOrder }),
      },
    );
  },
});

export const hubspotCreateBatchOfProperties = tool({
  description:
    "Efficiently creates multiple CRM properties in a single batch for a specified HubSpot object type (e.g., 'contacts', 'companies', custom object ID), ideal for schema setup or updates.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            name: z.string(),
            type: z.enum(['string', 'number', 'date', 'datetime', 'enumeration', 'bool']),
            label: z.string(),
            hidden: z.boolean().optional(),
            options: z.array(z.record(z.any())).optional(),
            fieldType: z.enum([
              'textarea',
              'text',
              'date',
              'file',
              'number',
              'select',
              'radio',
              'checkbox',
              'booleancheckbox',
              'calculation_equation',
            ]),
            formField: z.boolean().optional(),
            groupName: z.string(),
            description: z.string().optional(),
            displayOrder: z.number().int().optional(),
            hasUniqueValue: z.boolean().optional(),
            externalOptions: z.boolean().optional(),
            calculationFormula: z.string().optional(),
            referencedObjectType: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .describe('List of definitions for the new properties to be created.'),
    objectType: z
      .string()
      .describe(
        "Target HubSpot CRM object type (e.g., 'contacts', 'companies', 'deals', or custom object ID) for property creation.",
      ),
  }),
  execute: async ({ hubspotToken, inputs, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/batch/create`,
      {
        body: { inputs: inputs },
      },
    );
  },
});

export const hubspotCreatePropertyForSpecifiedObjectType = tool({
  description:
    'Creates a new custom property for a specified HubSpot CRM object type; ensure `groupName` refers to an existing property group for the `objectType`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .describe(
        'Internal programmatic name (snake_case), unique within the `objectType`, used for API referencing.',
      ),
    type: z
      .enum(['string', 'number', 'date', 'datetime', 'enumeration', 'bool'])
      .describe('The data type of the property.'),
    label: z.string().describe('Human-readable label for the property shown in HubSpot UI.'),
    hidden: z
      .boolean()
      .optional()
      .describe(
        'If true, hides property in HubSpot UI, lists, and forms. Defaults to false if not set.',
      ),
    options: z
      .array(
        z
          .object({
            label: z.string(),
            value: z.string(),
            hidden: z.boolean(),
            description: z.string().optional(),
            displayOrder: z.number().int(),
          })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        "List of predefined options. Required if `type` is 'enumeration'. For `fieldType` of 'booleancheckbox', must include exactly two options with values 'true' and 'false'. Each option defines a possible value.",
      ),
    fieldType: z
      .enum([
        'textarea',
        'text',
        'date',
        'file',
        'number',
        'select',
        'radio',
        'checkbox',
        'booleancheckbox',
        'calculation_equation',
      ])
      .describe(
        'Controls UI display and interaction method (e.g., text input, dropdown, checkbox).',
      ),
    formField: z
      .boolean()
      .optional()
      .describe('If true, property can be used in HubSpot forms. Defaults to false if not set.'),
    groupName: z.string().describe('Name of the property group for organization in HubSpot UI.'),
    objectType: z
      .string()
      .describe(
        'Target HubSpot CRM object type (e.g., contacts, companies) for the new property. Case-sensitive.',
      ),
    description: z
      .string()
      .optional()
      .describe('Optional description for the property, displayed as help text in HubSpot UI.'),
    displayOrder: z
      .number()
      .int()
      .optional()
      .describe(
        'Controls display order of properties in HubSpot UI, sorted ascending; -1 displays after positive values.',
      ),
    hasUniqueValue: z
      .boolean()
      .optional()
      .describe(
        "If true, property's value must be unique across all records for the `objectType`. Cannot be changed to false after being set to true.",
      ),
    externalOptions: z
      .boolean()
      .optional()
      .describe(
        "If true, 'enumeration' options are sourced externally, requiring `referencedObjectType` (e.g., 'OWNER' for HubSpot users). Defaults to false. Only for 'enumeration' type.",
      ),
    calculationFormula: z
      .string()
      .optional()
      .describe(
        "Formula for calculated property, required if `fieldType` is 'calculation_equation'. Can reference other properties by their internal names.",
      ),
    referencedObjectType: z
      .string()
      .optional()
      .describe(
        'For properties referencing other HubSpot objects (e.g., "OWNER" when `externalOptions` is true and `type` is "enumeration" to populate options with users). Applicable for specific property types.',
      ),
  }),
  execute: async ({
    hubspotToken,
    name,
    type,
    label,
    hidden,
    options,
    fieldType,
    formField,
    groupName,
    objectType,
    description,
    displayOrder,
    hasUniqueValue,
    externalOptions,
    calculationFormula,
    referencedObjectType,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/properties/${encodeURIComponent(String(objectType))}`, {
      body: pickDefined({
        name: name,
        type: type,
        label: label,
        hidden: hidden,
        options: options,
        fieldType: fieldType,
        formField: formField,
        groupName: groupName,
        description: description,
        displayOrder: displayOrder,
        hasUniqueValue: hasUniqueValue,
        externalOptions: externalOptions,
        calculationFormula: calculationFormula,
        referencedObjectType: referencedObjectType,
      }),
    });
  },
});

export const hubspotListContactProperties = tool({
  description:
    "Lists all contact properties in your HubSpot account, including custom properties you've created. Use this action to discover: - Available property names for updating contacts - Custom properties specific to your HubSpot account - Property types and valid options for enumeration fields - Which properties are read-only vs writable",
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Whether to include archived properties. Set to true to see archived properties, false for active only.',
      ),
    customOnly: z
      .boolean()
      .optional()
      .describe(
        'Filter to only return custom properties (excludes HubSpot default properties). Custom properties are ones you created in your HubSpot account.',
      ),
  }),
  execute: async ({ hubspotToken, archived, customOnly }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    const data = await hubGet(hubspotToken, '/crm/v3/properties/contacts', {
      query: pickDefined({ archived }),
    });
    if (customOnly === true && data && Array.isArray(data.results)) {
      const hasFlag = data.results.some((p) => p && typeof p.hubspotDefined === 'boolean');
      if (hasFlag)
        return { ...data, results: data.results.filter((p) => p && p.hubspotDefined === false) };
    }
    return data;
  },
});

export const hubspotReadACrmPropertyByName = tool({
  description:
    'Reads a specific CRM property definition for a given HubSpot object type by its internal name.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'If true, retrieves an archived property definition; retrieves active property definitions by default.',
      ),
    objectType: z
      .string()
      .describe(
        "Specifies the CRM object type (e.g., 'contacts', 'deals') for which the property is retrieved.",
      ),
    properties: z
      .string()
      .optional()
      .describe(
        'Optional comma-separated list of additional property attributes to return; consult HubSpot API documentation for available attributes and format.',
      ),
    propertyName: z
      .string()
      .describe(
        "The internal, unique name of the property to retrieve (e.g., 'firstname', 'dealname').",
      ),
  }),
  execute: async ({ hubspotToken, archived, objectType, properties, propertyName }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(propertyName))}`,
      {
        query: pickDefined({ archived: archived, properties: properties }),
      },
    );
  },
});

export const hubspotReadAllPropertiesForObjectType = tool({
  description:
    "Retrieves definitions and metadata (not actual values) for properties of a specified HubSpot CRM object type (e.g., 'contacts', 'companies', 'deals', or custom objects).",
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Filter properties by their archived status: `true` for archived, `false` for active (non-archived).',
      ),
    objectType: z
      .string()
      .describe(
        "Identifier for the CRM object type (e.g., 'contacts', 'companies'). Must be a valid, case-sensitive object type name existing in HubSpot.",
      ),
    properties: z
      .string()
      .optional()
      .describe(
        'DEPRECATED/NON-FUNCTIONAL: This parameter appears in the API but does not work as expected. When provided, the API returns empty property objects instead of filtered results. Leave this parameter unset (None) to retrieve all properties.',
      ),
  }),
  execute: async ({ hubspotToken, archived, objectType, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/properties/${encodeURIComponent(String(objectType))}`, {
      query: pickDefined({ archived: archived, properties: properties }),
    });
  },
});

export const hubspotReadBatchCrmObjectProperties = tool({
  description:
    'Retrieves property definitions (metadata) for a batch of CRM object properties for a specified object type. Returns detailed information about property structure, data types, options, and configuration\u2014not the actual property values of CRM records. dataSensitivity is accepted but ignored by the HubSpot properties batch-read API.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ name: z.string() }).catchall(z.any()))
      .describe(
        "A list of property identifiers, each specifying the 'name' of a property whose definition should be retrieved for the given `objectType`.",
      ),
    archived: z
      .boolean()
      .describe(
        'If true, retrieves only archived property definitions; otherwise, retrieves non-archived definitions.',
      ),
    objectType: z
      .string()
      .describe(
        "The case-sensitive CRM object type (e.g., 'contacts', 'companies') for which properties are being read, matching the type in your HubSpot account.",
      ),
  }),
  execute: async ({ hubspotToken, inputs, archived, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/batch/read`,
      {
        body: pickDefined({ inputs: inputs, archived: archived }),
      },
    );
  },
});

export const hubspotReadPropertyGroup = tool({
  description:
    'Retrieves metadata for a specific property group of a given CRM object type, detailing its structure and attributes, but not the actual property values of CRM objects.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    groupName: z
      .string()
      .describe(
        'Unique identifier (name) of the property group to retrieve. These names are case-sensitive and often use lowercase letters and underscores.',
      ),
    objectType: z
      .string()
      .describe('The type of CRM object for which to retrieve the property group.'),
  }),
  execute: async ({ hubspotToken, groupName, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/groups/${encodeURIComponent(String(groupName))}`,
    );
  },
});

export const hubspotReadPropertyGroupsForObjectType = tool({
  description:
    "Retrieves all property groups in a single call for a specified HubSpot CRM object type (e.g., 'contacts', 'companies'), returning only the groups themselves, not the individual properties within them.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        'Specifies the HubSpot CRM object type for which property groups will be retrieved.',
      ),
  }),
  execute: async ({ hubspotToken, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/groups`,
    );
  },
});

export const hubspotUpdateCrmProperty = tool({
  description:
    "Updates attributes of an existing HubSpot CRM property, identified by its `objectType` and `propertyName`; only provided fields are modified, and changing a property's `type` can cause data loss if incompatible with existing data.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    type: z
      .enum(['string', 'number', 'date', 'datetime', 'enumeration', 'bool'])
      .optional()
      .describe(
        'New data type for the property. Modifying the `type` of an existing property with data can cause data loss; use with caution.',
      ),
    label: z
      .string()
      .optional()
      .describe('New human-readable label for the property, displayed in the HubSpot UI.'),
    hidden: z
      .boolean()
      .optional()
      .describe(
        'If true, hides the property in the HubSpot UI, making it not generally visible or usable in standard interfaces.',
      ),
    options: z
      .array(
        z
          .object({
            label: z.string(),
            value: z.string(),
            hidden: z.boolean(),
            description: z.string().optional(),
            displayOrder: z.number().int(),
          })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        "List of new option definitions if property `type` is 'enumeration'; supplying a new list overwrites existing options.",
      ),
    fieldType: z
      .enum([
        'textarea',
        'text',
        'date',
        'file',
        'number',
        'select',
        'radio',
        'checkbox',
        'booleancheckbox',
        'calculation_equation',
      ])
      .optional()
      .describe(
        'New field type controlling how the property is displayed and interacted with in the HubSpot UI.',
      ),
    formField: z
      .boolean()
      .optional()
      .describe(
        'If true, allows this property to be included as a field in HubSpot forms and available in the form editor.',
      ),
    groupName: z
      .string()
      .optional()
      .describe(
        'New internal name of the property group for this property; groups help organize properties in the HubSpot UI.',
      ),
    objectType: z
      .string()
      .describe(
        'Type of CRM object for which the property is being updated; this determines its context.',
      ),
    description: z
      .string()
      .optional()
      .describe('New description for the property, displayed as help text in the HubSpot UI.'),
    displayOrder: z
      .number()
      .int()
      .optional()
      .describe(
        'New display order for the property within its group. Lower positive integers appear first; -1 typically places it after positively numbered properties.',
      ),
    propertyName: z
      .string()
      .describe(
        'Internal name of the property to update (case-sensitive); must correspond to an existing property for the specified `objectType`.',
      ),
    calculationFormula: z
      .string()
      .optional()
      .describe(
        "New formula if `fieldType` is 'calculation_equation'; defines how its value is auto-computed. Ensure valid HubSpot calculation syntax.",
      ),
  }),
  execute: async ({
    hubspotToken,
    type,
    label,
    hidden,
    options,
    fieldType,
    formField,
    groupName,
    objectType,
    description,
    displayOrder,
    propertyName,
    calculationFormula,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(propertyName))}`,
      {
        body: pickDefined({
          type: type,
          label: label,
          hidden: hidden,
          options: options,
          fieldType: fieldType,
          formField: formField,
          groupName: groupName,
          description: description,
          displayOrder: displayOrder,
          calculationFormula: calculationFormula,
        }),
      },
    );
  },
});

export const hubspotUpdatePropertyGroup = tool({
  description:
    "Partially updates a property group's `displayOrder` or `label` for a specified CRM `objectType` in HubSpot.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z
      .string()
      .optional()
      .describe(
        'Human-readable label for the property group in the UI. If omitted, the current label is unchanged.',
      ),
    groupName: z
      .string()
      .describe(
        'The unique, case-sensitive internal name of the existing property group to be updated for the specified `objectType`.',
      ),
    objectType: z
      .string()
      .describe(
        'The CRM object type (e.g., "contacts", "companies") for which the property group is updated; must be a valid HubSpot CRM object type.',
      ),
    displayOrder: z
      .number()
      .int()
      .optional()
      .describe(
        'Order for displaying the property group: lowest positive integer first, -1 places it after positive values. If omitted, the current order is unchanged.',
      ),
  }),
  execute: async ({ hubspotToken, label, groupName, objectType, displayOrder }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/properties/${encodeURIComponent(String(objectType))}/groups/${encodeURIComponent(String(groupName))}`,
      {
        body: pickDefined({ label: label, displayOrder: displayOrder }),
      },
    );
  },
});
