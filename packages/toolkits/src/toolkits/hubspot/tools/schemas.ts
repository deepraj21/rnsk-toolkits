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

export const hubspotCreateObjectSchema = tool({
  description:
    "Creates a new custom object schema in HubSpot CRM with unique naming for schema and properties, defined display/required/searchable properties within the 'properties' list, provided immutable labels, and correctly configured 'enumeration' type properties (options/referencedObjectType). Creates the schema first, then creates each nested property; returns the schema plus per-property results.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .describe(
        'Unique, immutable programmatic name for the schema (used in API calls); must be unique in the account.',
      ),
    properties: z
      .array(
        z
          .object({
            name: z.string(),
            type: z.enum(['string', 'number', 'date', 'datetime', 'enumeration', 'bool']),
            label: z.string(),
            hidden: z.boolean().optional(),
            options: z.array(z.record(z.any())).optional(),
            fieldType: z.string(),
            formField: z.boolean().optional(),
            groupName: z.string().optional(),
            description: z.string().optional(),
            displayOrder: z.number().int().optional(),
            hasUniqueValue: z.boolean().optional(),
            textDisplayHint: z
              .enum([
                'unformatted_single_line',
                'multi_line',
                'email',
                'phone_number',
                'domain_name',
                'ip_address',
                'physical_address',
                'postal_code',
              ])
              .optional(),
            numberDisplayHint: z
              .enum([
                'unformatted',
                'formatted',
                'currency',
                'percentage',
                'duration',
                'probability',
              ])
              .optional(),
            optionSortStrategy: z.enum(['DISPLAY_ORDER', 'ALPHABETICAL']).optional(),
            showCurrencySymbol: z.boolean().optional(),
            referencedObjectType: z.string().optional(),
            searchableInGlobalSearch: z.boolean().optional(),
          })
          .catchall(z.any()),
      )
      .describe('List of property definitions for this custom object schema.'),
    description: z
      .string()
      .optional()
      .describe('Optional human-readable description for the custom object schema.'),
    labelsPlural: z
      .string()
      .optional()
      .describe('Plural display name used in HubSpot UI; immutable after creation.'),
    labelsSingular: z
      .string()
      .optional()
      .describe('Singular display name used in HubSpot UI; immutable after creation.'),
    associatedObjects: z
      .array(z.string())
      .describe(
        "Object type IDs (e.g., 'CONTACT', 'COMPANY', 'p123456') this schema can be associated with.",
      ),
    requiredProperties: z
      .array(z.string())
      .describe(
        "Internal names of properties required for new records; must be defined in 'properties'.",
      ),
    searchableProperties: z
      .array(z.string())
      .optional()
      .describe(
        "Internal names of properties indexed for global search; must be defined in 'properties'.",
      ),
    primaryDisplayProperty: z
      .string()
      .optional()
      .describe(
        "Internal name of the primary identifier property; must be defined in 'properties'.",
      ),
    secondaryDisplayProperties: z
      .array(z.string())
      .optional()
      .describe(
        "Internal names of properties for secondary display on record pages; must be defined in 'properties'.",
      ),
  }),
  execute: async ({
    hubspotToken,
    name,
    labelsPlural,
    labelsSingular,
    requiredProperties,
    searchableProperties,
    primaryDisplayProperty,
    secondaryDisplayProperties,
    associatedObjects,
    description,
    properties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    const schema = await hubPost(hubspotToken, '/crm/v3/schemas', {
      body: pickDefined({
        name,
        labels: pickDefined({ singular: labelsSingular, plural: labelsPlural }),
        requiredProperties,
        searchableProperties,
        primaryDisplayProperty,
        secondaryDisplayProperties,
        associatedObjects,
        description,
      }),
    });
    if (
      !schema ||
      typeof schema !== 'object' ||
      'error' in schema ||
      !Array.isArray(properties) ||
      !properties.length
    ) {
      return schema;
    }
    const objectType = schema.fullyQualifiedName || schema.objectTypeId || name;
    const created = [];
    const failed = [];
    for (const prop of properties) {
      const res = await hubPost(
        hubspotToken,
        `/crm/v3/properties/${encodeURIComponent(String(objectType))}`,
        { body: prop },
      );
      if (res && typeof res === 'object' && 'error' in res)
        failed.push({ property: prop && prop.name, error: res });
      else created.push(res);
    }
    return { schema, propertiesCreated: created, propertyErrors: failed };
  },
});

export const hubspotDeleteSchema = tool({
  description:
    'Deletes a HubSpot custom object schema by `objectType`. With `archived=false` (default), it archives the schema (soft delete). With `archived=true`, it permanently deletes an already-archived schema (hard delete). Prerequisites: All object instances, associations, and properties must be deleted first.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Controls deletion type: `false` (default) archives the schema (soft delete), `true` permanently deletes an already-archived schema (hard delete). To fully remove a schema, first call with `false` to archive it, then call again with `true` to purge it.',
      ),
    objectType: z
      .string()
      .describe(
        'The fully qualified name or object type ID of the custom object schema to delete. Must be an exact match to an existing schema. Note: All object instances, associations, and properties must be deleted before the schema can be removed.',
      ),
  }),
  execute: async ({ hubspotToken, archived, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/schemas/${encodeURIComponent(String(objectType))}`, {
      query: pickDefined({ archived: archived }),
    });
  },
});

export const hubspotPurgeSchema = tool({
  description:
    'Permanently and irreversibly deletes the schema for an existing `objectType` in HubSpot CRM; this deprecated endpoint should be used with extreme caution. Purges an archived custom-object schema. This is permanent and irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "The specific object type (e.g., 'contacts', 'companies', or a custom object ID) for which the schema will be permanently deleted. Must be an exact, case-sensitive match to a valid object type defined in HubSpot.",
      ),
  }),
  execute: async ({ hubspotToken, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/schemas/${encodeURIComponent(String(objectType))}`);
  },
});

export const hubspotRetrieveAllObjectSchemas = tool({
  description:
    'Retrieves all object schema definitions (not data records) for a HubSpot account, supporting retrieval of either active or archived schemas.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to true to retrieve only archived object schemas, or false for only active, non-archived schemas. Archived schemas are typically inactive but retained for historical/compliance.',
      ),
  }),
  execute: async ({ hubspotToken, archived }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/schemas`, {
      query: pickDefined({ archived: archived }),
    });
  },
});

export const hubspotRetrieveObjectSchema = tool({
  description:
    'Fetches the detailed schema definition for a specified, existing standard or custom HubSpot CRM object type; this action is read-only and does not create or modify schemas.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "Fully qualified name for standard HubSpot objects (e.g., 'contacts', 'companies') or unique object type ID for custom objects (e.g., 'p123456', '2-xxxxxxx'). Case-sensitive and must match an existing object type as defined in HubSpot.",
      ),
  }),
  execute: async ({ hubspotToken, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/schemas/${encodeURIComponent(String(objectType))}`);
  },
});

export const hubspotUpdateObjectSchema = tool({
  description:
    "Updates an existing custom object schema's metadata in HubSpot, such as its description, labels, display properties, required properties, searchable properties, and restorability, for a specified `objectType` that must already exist.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        'The fully qualified name or object type ID that uniquely identifies the custom object schema to be updated. This must correspond to an existing schema in your HubSpot account.',
      ),
    restorable: z
      .boolean()
      .optional()
      .describe(
        'A boolean indicating whether records of this object type can be restored from the recycle bin if deleted. Set to `true` to enable restoration, `false` otherwise.',
      ),
    description: z
      .string()
      .optional()
      .describe('A human-readable description for the custom object schema itself.'),
    labelsPlural: z
      .string()
      .optional()
      .describe(
        "The plural display name for the custom object type (e.g., 'Companies', 'Tickets'), used in the HubSpot UI for multiple records of this type.",
      ),
    labelsSingular: z
      .string()
      .optional()
      .describe(
        "The singular display name for the custom object type (e.g., 'Company', 'Ticket'), used in the HubSpot UI for a single record of this type.",
      ),
    requiredProperties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of internal names of properties that are mandatory when creating a new record of this object type.',
      ),
    searchableProperties: z
      .array(z.string())
      .optional()
      .describe(
        "A list of internal names of properties that will be indexed and searchable within HubSpot's product search for this object type.",
      ),
    primaryDisplayProperty: z
      .string()
      .optional()
      .describe(
        'The internal name of the property that will serve as the primary display identifier on the HubSpot record page for this object type. This is typically a unique identifier like a name or ID.',
      ),
    secondaryDisplayProperties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of internal names of properties to be displayed as secondary information on the HubSpot record page for this object type. These properties appear below the primary display property.',
      ),
  }),
  execute: async ({
    hubspotToken,
    objectType,
    restorable,
    description,
    labelsPlural,
    labelsSingular,
    requiredProperties,
    searchableProperties,
    primaryDisplayProperty,
    secondaryDisplayProperties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(hubspotToken, `/crm/v3/schemas/${encodeURIComponent(String(objectType))}`, {
      body: pickDefined({
        restorable: restorable,
        description: description,
        labels__plural: labelsPlural,
        labels__singular: labelsSingular,
        requiredProperties: requiredProperties,
        searchableProperties: searchableProperties,
        primaryDisplayProperty: primaryDisplayProperty,
        secondaryDisplayProperties: secondaryDisplayProperties,
      }),
    });
  },
});
