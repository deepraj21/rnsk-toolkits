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

export const hubspotArchiveBatchOfQuotes = tool({
  description:
    'Archives a batch of existing quotes by their IDs, removing them from active views while keeping them accessible in your HubSpot account for viewing, downloading, cloning, or deletion; note that archived quotes cannot be restored to active status.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('A list of objects, where each object contains the ID of a quote to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/quotes/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotArchiveQuote = tool({
  description:
    'Archives a HubSpot Quote object by ID, moving it to the recycling bin where it can be restored within 90 days.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    quoteId: z
      .string()
      .describe(
        'The unique identifier (ID) of an existing Quote object in HubSpot CRM to be archived.',
      ),
  }),
  execute: async ({ hubspotToken, quoteId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/quotes/${encodeURIComponent(String(quoteId))}`);
  },
});

export const hubspotBatchUpdateQuotes = tool({
  description:
    'Updates multiple existing HubSpot quotes in a batch; each quote is identified by its object ID or a custom unique property (via `idProperty`), and only writable properties are modified.',
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
        'List of `InputsRequest` objects, each specifying a quote to update and its new property values.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/quotes/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});

export const hubspotCreateBatchOfQuotes = tool({
  description:
    'Creates multiple HubSpot CRM quotes in a batch, ideal for bulk operations; provide meaningful quote details in `inputs` as property requirements can vary, and inspect response for individual quote statuses as partial success is possible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({ properties: z.record(z.any()), associations: z.array(z.record(z.any())) })
          .catchall(z.any()),
      )
      .describe(
        'A list of quote objects to be created. Each object in the list defines the properties and associations for a new quote.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/quotes/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateQuoteObject = tool({
  description:
    'Creates a new quote object in HubSpot CRM with specified properties and associations.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    properties: z
      .record(z.any())
      .describe(
        'A dictionary of key-value pairs representing the properties of the quote to be created. Property names are HubSpot internal names.',
      ),
    associations: z
      .array(
        z
          .object({ to: z.record(z.any()).optional(), types: z.array(z.record(z.any())) })
          .catchall(z.any()),
      )
      .describe(
        'A list of associations to create for the new quote. Each item specifies the object to associate with and the type of association.',
      ),
  }),
  execute: async ({ hubspotToken, properties, associations }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/quotes`, {
      body: pickDefined({ properties: properties, associations: associations }),
    });
  },
});

export const hubspotGetQuote = tool({
  description: 'Retrieves a specific HubSpot quote by its unique identifier.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    quoteId: z
      .string()
      .describe(
        'Unique identifier of the quote; can be the HubSpot object ID or a custom unique property value if `idProperty` is specified.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Specifies whether the quote to retrieve is archived (`True`) or active (`False`).',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        'Internal name of a unique custom property to use as the quote identifier instead of the HubSpot object ID; this property must have unique values across all quotes.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'HubSpot property internal names to include in the response; limits data returned and improves performance. Non-existent properties are ignored.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Object type names (e.g., 'deals', 'contacts') for which to retrieve IDs of associated objects; fetches linked CRM object IDs. Non-existent association types are ignored.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'HubSpot property internal names for which to include historical values; retrieves change history. Non-existent properties or those without history are ignored.',
      ),
  }),
  execute: async ({
    hubspotToken,
    quoteId,
    archived,
    idProperty,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/quotes/${encodeURIComponent(String(quoteId))}`, {
      query: pickDefined({
        archived: archived,
        idProperty: idProperty,
        properties: properties,
        associations: associations,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotListQuotes = tool({
  description:
    'Retrieves a paginated list of quotes, allowing selection of specific properties, property history, associated object IDs, and filtering by archived status.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Pagination token from a previous response's `paging.next.after` property to fetch the subsequent page. Use the exact token provided by the API; do not modify it.",
      ),
    limit: z.number().int().optional().describe('Maximum number of quotes to return per page.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'If true, returns only archived quotes. If false, returns only active (non-archived) quotes.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of quote property names to include in the response for each quote (e.g., `hs_title`, `hs_quote_amount`). Non-existent properties for a quote are ignored. If omitted, a default set of properties is returned.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        'A list of object types (e.g., `contacts`, `companies`, `deals`) for which to retrieve IDs of associated records. Non-existent association types or associations for a specific quote are ignored.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'A list of quote property names for which historical values should be included (e.g., `hs_quote_amount`, `hs_expiration_date`). Using this may reduce the maximum number of quotes returnable per request due to increased data volume.',
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
    return hubGet(hubspotToken, `/crm/v3/objects/quotes`, {
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

export const hubspotMergeQuotes = tool({
  description:
    'Merges two distinct quotes of the same type by consolidating `objectIdToMerge` into `primaryObjectId` (e.g., for combining information or updating terms); this operation is irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe(
        'The unique identifier of the quote to be merged into the primary quote. This quote will be archived after the merge.',
      ),
    primaryObjectId: z
      .string()
      .describe(
        'The unique identifier of the quote that will remain after the merge and will be updated with information from the other quote. Its properties take precedence in case of conflicts.',
      ),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/quotes/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotReadBatchOfQuotesByPropertyValues = tool({
  description:
    'Efficiently retrieves a batch of HubSpot CRM quotes by their IDs (or a specified unique property), optionally including archived quotes, specific properties, and property history.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        'A list of objects, each specifying a quote to retrieve. Each object must contain an `id` field that holds the identifier of the quote, corresponding to `idProperty` or the primary object ID.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Specifies whether to include archived quotes in the results. If `true`, only archived quotes are returned. If `false` (default) or omitted, only active (non-archived) quotes are returned.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "The name of the property to use as the unique identifier for the quotes specified in the `inputs` list. If omitted, the quote's primary object ID (e.g., `hs_object_id`) is used. This property must be a unique identifier for quotes.",
      ),
    properties: z
      .array(z.string())
      .describe(
        'A list of internal names of quote properties to be included in the response for each quote. If omitted, a default set of properties is returned by HubSpot. Refer to HubSpot documentation for default properties.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .describe(
        'A list of internal names of quote properties for which historical values should be retrieved. The response will include the history of changes for these properties.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/quotes/batch/read`, {
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

export const hubspotSearchQuotesByCriteria = tool({
  description:
    'Searches HubSpot CRM quotes using a text query, complex filter criteria, sorting, and pagination.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "A cursor for pagination. Set this to the 'paging.next.after' value from a previous response to get the next page of results. If not provided, the first page is returned.",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of quote records to return in the response. Default is 10, maximum is 200.',
      ),
    query: z
      .string()
      .optional()
      .describe(
        'A string to search across all searchable properties of quotes. This performs a broad text search.',
      ),
    sorts: z
      .array(
        z.object({ direction: z.string().optional(), propertyName: z.string() }).catchall(z.any()),
      )
      .optional()
      .describe(
        "A list of sort rules to order the results. Only one sort rule can be applied. Each sort contains 'propertyName' and 'direction' ('ASCENDING' or 'DESCENDING'). If omitted, results are ordered by creation date (oldest first).",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Specific quote property internal names to include in the response. If omitted, a default set of properties is returned. Include custom property names here.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())) }).catchall(z.any()))
      .optional()
      .describe(
        'A list of filter groups to apply to the search. Multiple filter groups are combined with an OR logic, while filters within a group are combined with AND logic. Maximum 5 filter groups with up to 6 filters each.',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, query, sorts, properties, filterGroups }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/quotes/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after }),
    });
  },
});

export const hubspotUpdateQuote = tool({
  description:
    "Performs a partial update on an existing HubSpot quote's specified properties, identifying the quote by `quoteId` (either its internal ID or a custom unique property value if `idProperty` is provided).",
  inputSchema: z.object({
    hubspotToken: tokenField,
    quoteId: z
      .string()
      .describe(
        'Unique identifier of the quote. Typically an internal HubSpot object ID, or a unique property value if `idProperty` is specified.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Optional. Name of a unique quote property. If provided, `quoteId` is interpreted as this property's value, not the internal object ID.",
      ),
    properties: z
      .record(z.any())
      .describe(
        'Properties to update on the quote (internal property names to new values). Only included properties will be updated.',
      ),
  }),
  execute: async ({ hubspotToken, quoteId, idProperty, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(hubspotToken, `/crm/v3/objects/quotes/${encodeURIComponent(String(quoteId))}`, {
      body: pickDefined({ properties: properties }),
    });
  },
});
