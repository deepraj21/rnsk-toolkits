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

export const hubspotArchiveBatchOfLineItems = tool({
  description:
    'Archives a batch of existing line items by their unique IDs in HubSpot CRM; this operation is irreversible via the API.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        "A list of objects, where each object contains the 'id' of a line item to be archived.",
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotArchiveLineItem = tool({
  description: 'Archives a specific HubSpot line item by its ID, moving it to a recoverable state.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    lineItemId: z
      .string()
      .describe('The unique identifier of the existing line item in HubSpot CRM to be archived.'),
  }),
  execute: async ({ hubspotToken, lineItemId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/line_items/${encodeURIComponent(String(lineItemId))}`,
    );
  },
});

export const hubspotCreateLineItem = tool({
  description: 'Creates a new HubSpot line item.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    properties: z
      .record(z.any())
      .describe('Line item properties to set. Keys are HubSpot internal property names.'),
  }),
  execute: async ({ hubspotToken, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items`, {
      body: pickDefined({ properties: properties }),
    });
  },
});

export const hubspotCreateLineItems = tool({
  description: 'Creates multiple HubSpot line items in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ properties: z.record(z.any()) }).catchall(z.any()))
      .describe('List of line item objects to create.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotDeleteLineItemsGdpr = tool({
  description:
    'Permanently deletes a specified line item and its associated content for GDPR compliance; this action is irreversible and cannot be undone. GDPR deletion is permanent and irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z
      .string()
      .describe(
        "The value of the unique identifier for the line item to be permanently deleted. This corresponds to the property named in `idProperty`, or the line item's primary HubSpot ID if `idProperty` is not provided.",
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "The name of the property that uniquely identifies the line item, if `objectId` is not its primary HubSpot ID. For example, 'external_id'. If omitted, `objectId` is assumed to be the line item's primary HubSpot ID.",
      ),
  }),
  execute: async ({ hubspotToken, objectId, idProperty }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/gdpr-delete`, {
      body: pickDefined({ objectId: objectId, idProperty: idProperty }),
    });
  },
});

export const hubspotMergeLineItems = tool({
  description:
    'Merges two line items, `objectIdToMerge` into `primaryObjectId`, which must be of the same type; `objectIdToMerge` is absorbed and the operation is irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe(
        'The ID of the line item that will be merged into the primary line item. This line item will be absorbed and will no longer exist as a separate entity after the merge.',
      ),
    primaryObjectId: z
      .string()
      .describe(
        'The ID of the primary line item that will remain after the merge. Its record will be updated with data from the line item specified by `objectIdToMerge`.',
      ),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotReadBatchOfLineItemsByIdOrPropertyValues = tool({
  description:
    'Retrieves a batch of HubSpot CRM line items by their IDs, or optionally by values of a custom unique property defined in `idProperty`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        "A list of objects, where each object contains the 'id' of a line item to retrieve. The 'id' can be the line item's unique ID or the value of the property specified in `idProperty`.",
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Whether to return only archived line items. If true, returns only archived line items; if false (default), returns only non-archived line items.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "The name of a property whose values are unique for that object type. Use this if you want to identify line items by a custom unique property instead of the default 'id'.",
      ),
    properties: z
      .array(z.string())
      .describe(
        'A list of property names to be returned in the response. If not specified, all readable properties will be returned.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .describe(
        'A list of property names for which to return historical values; if a property has been updated, the response includes its previous values.',
      ),
  }),
  execute: async ({
    hubspotToken,
    inputs,
    archived,
    idProperty,
    properties,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/batch/read`, {
      body: pickDefined({
        inputs: inputs,
        archived: archived,
        idProperty: idProperty,
        properties: properties,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotRetrieveLineItemById = tool({
  description:
    'Retrieves a HubSpot CRM line item by its ID or a specified unique property (`idProperty`).',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `True` to retrieve archived Line Items; `False` (default) retrieves non-archived items.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Name of a unique property (e.g., 'sku') to use as the identifier instead of the HubSpot ID. Must be unique across all Line Items.",
      ),
    lineItemId: z
      .string()
      .describe(
        "The Line Item's unique identifier. Must be a valid numeric HubSpot object ID of an existing line item, or the value of the property specified in `idProperty`. Use HUBSPOT_RETRIEVE_LINE_ITEMS_LIST or HUBSPOT_SEARCH_LINE_ITEMS_BY_CRITERIA to find valid IDs.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Optional list of property names to return for the Line Item. Non-existent properties are ignored.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Optional list of object types (e.g., 'deal') for which to retrieve IDs of associated objects. Ignores non-existent association types.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Optional list of property names for which to retrieve historical values. Ignores non-existent properties or those without history.',
      ),
  }),
  execute: async ({
    hubspotToken,
    archived,
    idProperty,
    lineItemId,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/objects/line_items/${encodeURIComponent(String(lineItemId))}`,
      {
        query: pickDefined({
          archived: archived,
          idProperty: idProperty,
          properties: properties,
          associations: associations,
          propertiesWithHistory: propertiesWithHistory,
        }),
      },
    );
  },
});

export const hubspotRetrieveLineItems = tool({
  description:
    'Fetches a paginated list of HubSpot CRM line items, allowing selection of specific properties (including history), associated object IDs, and filtering by archive status; ensure property and association names are valid HubSpot internal names.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Pagination token from 'paging.next.after' of a previous response to fetch the subsequent page. Omit for the first request.",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of line items to return per page; controls response size. An API-defined upper limit may apply.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Filter by archive status: `true` for archived only, `false` (default) for active only. Manages historical or current items.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Property names to include for each line item (e.g., `["name", "price"]`); customizes returned data. Non-existent properties are ignored. If omitted, a default set is returned.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        'Object types (e.g., `["deal", "product"]`) for which to retrieve associated IDs. Invalid types are ignored. Valid types depend on HubSpot data model.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Property names for which to include historical values (e.g., `["status", "amount"]`); tracks changes. May reduce items returned per request due to increased payload.',
      ),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    archived,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/line_items`, {
      query: pickDefined({
        after: after,
        limit: limit,
        archived: archived,
        properties: properties,
        associations: associations,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotSearchLineItemsByCriteria = tool({
  description:
    'Searches HubSpot line items using criteria including filters, sorting, and pagination; `after` must be a valid cursor from a previous response, and `sorts`/`properties` must refer to valid line item property names.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Pagination cursor from a prior response to fetch the next page of results. Leave empty for the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of line items to retrieve per page (default: 10, max: 200).'),
    query: z
      .string()
      .optional()
      .describe('Optional search string applied across all searchable line item properties.'),
    sorts: z
      .array(z.string())
      .optional()
      .describe(
        "List of property names for sorting results. Prepend '-' for descending order. Defaults to creation date ascending if omitted.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Specific line item property names to include in results. If omitted or empty, a default set of properties is returned.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())) }).catchall(z.any()))
      .optional()
      .describe(
        'List of filter groups. Line items must match all filters in at least one group (filters within a group are ANDed; groups are ORed). Leave empty to return all line items.',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, query, sorts, properties, filterGroups }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after }),
    });
  },
});

export const hubspotUpdateLineItem = tool({
  description:
    'Partially updates specified properties of an existing HubSpot Line Item, identified by `lineItemId` (as HubSpot object ID or value of `idProperty` if used); new values overwrite existing ones, and an empty string clears a property.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    idProperty: z
      .string()
      .optional()
      .describe(
        "Name of a unique property on the Line Item used for identification instead of HubSpot object ID. If used, `lineItemId` must contain this property's value. Must be a valid, unique-value property for Line Items.",
      ),
    lineItemId: z
      .string()
      .describe(
        'Identifier for the Line Item to update: HubSpot object ID by default, or the value of the unique property if `idProperty` is specified. Must be non-empty.',
      ),
    properties: z
      .record(z.any())
      .describe(
        "Properties to update. Keys are internal HubSpot line item property names (e.g., 'quantity', 'price'), values are new string values. Example: `{'quantity': '5', 'name': 'New Product Name'}`.",
      ),
  }),
  execute: async ({ hubspotToken, idProperty, lineItemId, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/line_items/${encodeURIComponent(String(lineItemId))}`,
      {
        body: pickDefined({ properties: properties }),
      },
    );
  },
});

export const hubspotUpdateLineItems = tool({
  description:
    'Updates a batch of existing HubSpot CRM line items in a single operation, identifying each by its primary ID or a unique `idProperty` (which must be a unique identifier property in HubSpot), and modifies their specified properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            id: z.string(),
            idProperty: z.string().optional(),
            properties: z.record(z.any()),
          })
          .catchall(z.any()),
      )
      .describe(
        'A list of objects, where each object defines a line item to be updated and its new property values. Each object must conform to the InputsRequest schema.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/line_items/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});
