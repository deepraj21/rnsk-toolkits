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

export const hubspotCreateAssociation = tool({
  description:
    'Creates a new custom association definition (schema) for a custom object in HubSpot, specifying how this object type can relate to another object type; this defines the association type itself, not actual record-to-record links. Note: This endpoint requires crm.schemas.custom.write scope and only works with custom objects (not standard HubSpot objects like contacts or companies). Defines a new association type on a custom-object schema; it does not link records.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .optional()
      .describe(
        "Optional, user-defined unique name for the new association type (e.g., 'contact_to_company_custom'). If not supplied, HubSpot may generate a default.",
      ),
    objectType: z
      .string()
      .describe(
        "Fully qualified name or object type ID (e.g., '2-12345') of the CUSTOM object schema for which the new association type is being defined. Must be a custom object, not a standard HubSpot object.",
      ),
    toObjectTypeId: z
      .string()
      .describe(
        "Object type ID or fully qualified name for the 'to' side of the association. For standard objects use names ('contacts', 'companies', 'deals', 'tickets') or IDs ('0-1', '0-2', '0-3', '0-5'). For custom objects use their objectTypeId (e.g., '2-12345').",
      ),
    fromObjectTypeId: z
      .string()
      .describe(
        "Object type ID or fully qualified name for the 'from' side of the association. For standard objects use names ('contacts', 'companies', 'deals', 'tickets') or IDs ('0-1', '0-2', '0-3', '0-5'). For custom objects use their objectTypeId (e.g., '2-12345').",
      ),
  }),
  execute: async ({ hubspotToken, name, objectType, toObjectTypeId, fromObjectTypeId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/schemas/${encodeURIComponent(String(objectType))}/associations`,
      {
        body: pickDefined({
          name: name,
          toObjectTypeId: toObjectTypeId,
          fromObjectTypeId: fromObjectTypeId,
        }),
      },
    );
  },
});

export const hubspotCreateObjectAssociation = tool({
  description:
    'Tool to create or label an association between two CRM records using HubSpot Associations v4 API. Use when you need to link records (e.g., contact to company, deal to contact) with explicit association labels.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    labels: z
      .array(
        z
          .object({
            associationTypeId: z.number().int(),
            associationCategory: z.enum(['HUBSPOT_DEFINED', 'USER_DEFINED', 'INTEGRATOR_DEFINED']),
          })
          .catchall(z.any()),
      )
      .describe(
        'Array of association label descriptors defining the type(s) of relationship between the two records. Each label includes an associationCategory and associationTypeId.',
      ),
    objectId: z.string().describe('The unique ID of the source CRM record.'),
    objectType: z
      .string()
      .describe(
        "The type of the source object (e.g., 'contacts', 'companies', 'deals', 'tickets', or a custom object type).",
      ),
    toObjectId: z.string().describe('The unique ID of the target CRM record to associate with.'),
    toObjectType: z
      .string()
      .describe(
        "The type of the target object to associate with (e.g., 'contacts', 'companies', 'deals', 'tickets', or a custom object type).",
      ),
  }),
  execute: async ({ hubspotToken, labels, objectId, objectType, toObjectId, toObjectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v4/associations/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(toObjectType))}/batch/create`,
      {
        body: {
          inputs: [
            { from: { id: String(objectId) }, to: { id: String(toObjectId) }, types: labels },
          ],
        },
      },
    );
  },
});

export const hubspotListAssociationTypes = tool({
  description: 'Lists all valid association types between two specified HubSpot CRM object types.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    toObjectType: z
      .string()
      .describe('The type of the second object in the association (e.g., contact, company, deal).'),
    fromObjectType: z
      .string()
      .describe('The type of the first object in the association (e.g., contact, company, deal).'),
  }),
  execute: async ({ hubspotToken, toObjectType, fromObjectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/associations/${encodeURIComponent(String(fromObjectType))}/${encodeURIComponent(String(toObjectType))}/labels`,
    );
  },
});

export const hubspotListObjectAssociations = tool({
  description:
    'List all associations from a single CRM record to a specified target object type. Use when you need to expand associations for a single record without fetching the full CRM object.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Paging cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of associations to return per page. Default is 500.'),
    objectId: z
      .string()
      .describe('The unique ID of the source CRM record whose associations you want to retrieve.'),
    objectType: z
      .string()
      .describe(
        "Source object type (e.g., 'deals', 'contacts', 'companies', 'tickets'). The object type of the record you want to list associations from.",
      ),
    toObjectType: z
      .string()
      .describe(
        "Target object type (e.g., 'contacts', 'companies', 'deals'). The object type you want to see associations to.",
      ),
  }),
  execute: async ({ hubspotToken, after, limit, objectId, objectType, toObjectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(objectId))}/associations/${encodeURIComponent(String(toObjectType))}`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotReadAssociationsBatch = tool({
  description:
    'Tool to batch-read CRM associations (e.g., deals\u2192contacts, deals\u2192companies) for up to 1,000 source record IDs in one request. Use when you need to retrieve associated target IDs and association type metadata for multiple records efficiently, avoiding rate-limit issues from per-record GET calls.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string(), after: z.string().optional() }).catchall(z.any()))
      .describe(
        "List of source record IDs to retrieve associations for (max 1,000 per request). Each input can include an optional 'after' cursor for per-source pagination.",
      ),
    toObjectType: z
      .string()
      .describe(
        "Target object type for associations. Use standard names (e.g., 'contacts', 'companies', 'deals') or object type IDs (e.g., '0-1' for contacts). For custom objects, use their objectTypeId.",
      ),
    fromObjectType: z
      .string()
      .describe(
        "Source object type for associations. Use standard names (e.g., 'deals', 'contacts', 'companies', 'tickets') or object type IDs (e.g., '0-3' for deals). For custom objects, use their objectTypeId (e.g., '2-12345').",
      ),
  }),
  execute: async ({ hubspotToken, inputs, toObjectType, fromObjectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v4/associations/${encodeURIComponent(String(fromObjectType))}/${encodeURIComponent(String(toObjectType))}/batch/read`,
      {
        body: { inputs: inputs },
      },
    );
  },
});

export const hubspotRemoveAssociation = tool({
  description:
    'Tool to remove all associations between two CRM records using the v4 associations endpoint. Use when unlinking records or cleaning up incorrect associations.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z.string().describe('ID of the source CRM record.'),
    objectType: z
      .string()
      .describe("Source object type (e.g., 'contacts', 'deals', 'companies', 'tickets')."),
    toObjectId: z.string().describe('ID of the target CRM record.'),
    toObjectType: z
      .string()
      .describe("Target object type (e.g., 'companies', 'contacts', 'deals', 'tickets')."),
  }),
  execute: async ({ hubspotToken, objectId, objectType, toObjectId, toObjectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v4/objects/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(objectId))}/associations/${encodeURIComponent(String(toObjectType))}/${encodeURIComponent(String(toObjectId))}`,
    );
  },
});

export const hubspotRemoveAssociationFromSchema = tool({
  description:
    "Permanently removes a specified association definition (type) from a HubSpot object's schema, preventing future creations of this association type without affecting existing instances. Removes an association definition from a schema without affecting existing record links.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        'The fully qualified name or ID of the HubSpot object schema from which to remove the association definition.',
      ),
    associationIdentifier: z
      .string()
      .describe(
        'The unique ID of the association definition to remove from the specified object schema.',
      ),
  }),
  execute: async ({ hubspotToken, objectType, associationIdentifier }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/schemas/${encodeURIComponent(String(objectType))}/associations/${encodeURIComponent(String(associationIdentifier))}`,
    );
  },
});
