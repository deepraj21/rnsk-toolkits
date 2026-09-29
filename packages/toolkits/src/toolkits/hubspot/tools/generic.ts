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

export const hubspotArchiveBatchOfObjects = tool({
  description:
    'Archives a batch of existing, non-archived CRM objects of a specified `objectType` by their IDs, effectively hiding them from active use.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        "A list of input objects, where each object contains the 'id' of a CRM record to be archived.",
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object to archive (e.g., 'contacts', 'companies', 'deals', 'tickets').",
      ),
  }),
  execute: async ({ hubspotToken, inputs, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/batch/archive`,
      {
        body: { inputs: inputs },
      },
    );
  },
});

export const hubspotArchiveCrmObjectById = tool({
  description:
    'Archives a specific HubSpot CRM object by its type and ID, moving it to the recycling bin; this action is irreversible via the API but objects can often be restored via the HubSpot UI.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z
      .string()
      .describe(
        'The unique identifier for the CRM object to be archived. This ID must correspond to an existing object of the specified `objectType`. The format is typically a string of numbers or a UUID. Ensure the correct ID is provided as this operation is irreversible via the API.',
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object to be archived. This value is case-sensitive, must be a valid HubSpot CRM object type (e.g., contacts, companies, deals, quotes), and should be provided in lowercase plural form (e.g., 'contacts', not 'Contact').",
      ),
  }),
  execute: async ({ hubspotToken, objectId, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(objectId))}`,
    );
  },
});

export const hubspotCreateBatchOfObjects = tool({
  description:
    'Creates multiple CRM objects of a specified `objectType` (e.g., contacts, companies, deals) in a single batch operation, where each object can have its own set of properties and associations.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            properties: z.record(z.any()),
            associations: z.array(z.record(z.any())).optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        'A list of objects to be created in batch. Each item in the list defines the properties and associations for a new object.',
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object to create in batch (e.g., 'contacts', 'companies', 'deals', 'tickets', 'products', 'line_items', or a custom object ID). Must be a valid HubSpot CRM object type.",
      ),
  }),
  execute: async ({ hubspotToken, inputs, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/batch/create`,
      {
        body: { inputs: inputs },
      },
    );
  },
});

export const hubspotCreateCrmObjectFromNl = tool({
  description:
    "Creates a new CRM object (contact, deal, company, ticket, or custom object) in HubSpot from a natural language description. Fetches the object's property schema at runtime, uses an LLM to generate the correct property payload, and creates the object. Tries JSON properties first, then per-type heuristics (contacts need an email, deals use the text as dealname).",
  inputSchema: z.object({
    hubspotToken: tokenField,
    nlQuery: z
      .string()
      .describe(
        "Natural language description of the record to create. Example: 'Create a contact named John Doe with email john@example.com and phone +1-555-0100'.",
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object to create. Standard types: 'contacts', 'deals', 'companies', 'tickets'. Can also be a custom object type ID.",
      ),
    associations: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Optional associations to create between the new object and other CRM objects. Pass-through field, not LLM-generated. Each association should include 'to' and 'types'.",
      ),
  }),
  execute: async ({ hubspotToken, nlQuery, objectType, associations }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    const text = String(nlQuery || '');
    let properties = null;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) properties = parsed;
    } catch {
      /* fall through to heuristics */
    }
    if (!properties) {
      if (objectType === 'contacts') {
        const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (!emailMatch)
          return {
            error: 'Could not find an email address in nl_query for a contact.',
            message: 'Include an email or pass JSON properties.',
          };
        properties = { email: emailMatch[0] };
      } else if (objectType === 'deals') {
        properties = { dealname: text.slice(0, 280) };
      } else if (objectType === 'companies') {
        properties = { name: text.slice(0, 280) };
      } else {
        return {
          error: 'nl_query must be a JSON object of properties for this object type.',
          message: 'Pass properties as a JSON string.',
        };
      }
    }
    return hubPost(hubspotToken, `/crm/v3/objects/${encodeURIComponent(String(objectType))}`, {
      body: { properties, ...(associations ? { associations } : {}) },
    });
  },
});

export const hubspotCreateCrmObjectWithProperties = tool({
  description:
    'Creates a new HubSpot CRM object (e.g., contact, company, custom object) with specified `properties` (using valid internal names) and `associations` (to existing objects via valid type IDs).',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "Type of CRM object to create (e.g., 'contacts', 'companies', 'deals', or custom object schema ID like 'p12345678').",
      ),
    properties: z
      .record(z.any())
      .describe(
        "Key-value pairs for the object's properties. Keys must be internal HubSpot property names valid for the `objectType`. IMPORTANT: Some properties are enumeration types that only accept specific values. For CONTACTS: 'email' (string), 'firstname' (string), 'lastname' (string), 'phone' (string), 'lifecyclestage' (enum: subscriber, lead, marketingqualifiedlead, salesqualifiedlead, opportunity, customer, evangelist, other). For COMPANIES: 'name' (string, required), 'domain' (string), 'phone' (string), 'city' (string), 'state' (string), 'country' (string), 'industry' (enum - must use UPPERCASE values like: ACCOUNTING, AIRLINES_AVIATION, BANKING, BIOTECHNOLOGY, COMPUTER_SOFTWARE, CONSTRUCTION, CONSUMER_GOODS, EDUCATION_MANAGEMENT, ENTERTAINMENT, FINANCIAL_SERVICES, FOOD_BEVERAGES, GOVERNMENT_ADMINISTRATION, HEALTH_WELLNESS_AND_FITNESS, HOSPITAL_HEALTH_CARE, HOSPITALITY, INFORMATION_TECHNOLOGY_AND_SERVICES, INSURANCE, INTERNET, LEGAL_SERVICES, MANAGEMENT_CONSULTING, MANUFACTURING, MARKETING_AND_ADVERTISING, MEDIA_PRODUCTION, NON_PROFIT_ORGANIZATION_MANAGEMENT, OIL_ENERGY, PHARMACEUTICALS, REAL_ESTATE, RETAIL, TELECOMMUNICATIONS, TRANSPORTATION_TRUCKING_RAILROAD, VENTURE_CAPITAL_PRIVATE_EQUITY, WHOLESALE, and ~115 more). For DEALS: 'dealname' (string, required), 'amount' (string/number), 'dealstage' (enum: pipeline-specific stage IDs), 'closedate' (ISO 8601 date), 'pipeline' (pipeline ID). For TICKETS: 'subject' (string), 'content' (string), 'hs_pipeline' (pipeline ID), 'hs_pipeline_stage' (stage ID), 'hs_ticket_priority' (enum: LOW, MEDIUM, HIGH). Use GET /crm/v3/properties/{objectType} to retrieve all valid properties and their enum options for any object type.",
      ),
    associations: z
      .array(
        z
          .object({
            to: z.union([z.string(), z.record(z.any())]).optional(),
            types: z.array(z.record(z.any())),
          })
          .catchall(z.any()),
      )
      .describe(
        'List of associations to create between the new object and existing CRM objects, using `to_id` and `types`.',
      ),
  }),
  execute: async ({ hubspotToken, objectType, properties, associations }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/${encodeURIComponent(String(objectType))}`, {
      body: pickDefined({ properties: properties, associations: associations }),
    });
  },
});

export const hubspotMergeObjects = tool({
  description:
    'Merges two distinct HubSpot CRM objects of the same `objectType`, consolidating data into `primaryObjectId` (which is preserved) and deleting `objectIdToMerge`; this operation is permanent and irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "The CRM object type (e.g., 'contacts', 'companies') of the two records to merge. Must be a valid object type in your HubSpot account.",
      ),
    objectIdToMerge: z
      .string()
      .describe('ID of the object to be merged into the primary object and subsequently deleted.'),
    primaryObjectId: z
      .string()
      .describe(
        'ID of the object that will remain after the merge, into which data from `objectIdToMerge` is consolidated.',
      ),
  }),
  execute: async ({ hubspotToken, objectType, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/merge`,
      {
        body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
      },
    );
  },
});

export const hubspotPartiallyUpdateCrmObjectById = tool({
  description:
    'Partially updates specified properties of a CRM object (e.g., contact, company, deal) identified by its type and ID, or optionally by a unique property value if `idProperty` is specified.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z
      .union([z.string(), z.number().int(), z.number()])
      .describe(
        "Unique identifier of the CRM object. Can be provided as a string, integer, or float. If `idProperty` is specified, this is the value of that unique property; otherwise, it's the internal object ID.",
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Name of a unique property (e.g., 'email' for contacts) to use for identifying the object instead of its internal ID. If set, `objectId` should be the value of this property.",
      ),
    objectType: z.string().describe('Type of the CRM object to be updated.'),
    properties: z
      .record(z.any())
      .describe(
        "Dictionary of properties to update. Keys are internal property names (e.g., 'firstname', 'dealstage'), and values are their new values. Some properties are enum fields with specific valid values: For 'deals', the 'dealstage' property requires a valid pipeline stage ID from the deal's pipeline (use HUBSPOT_RETRIEVE_PIPELINE_STAGES to get valid stage IDs for a pipeline). For 'tickets', the 'hs_pipeline_stage' property requires a valid ticket pipeline stage ID. For other enum properties, use HUBSPOT_READ_A_CRM_PROPERTY_BY_NAME to discover valid options.",
      ),
  }),
  execute: async ({ hubspotToken, objectId, idProperty, objectType, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(objectId))}`,
      {
        body: pickDefined({ properties: properties }),
      },
    );
  },
});

export const hubspotPermanentlyDeleteContactViaGdpr = tool({
  description:
    'Permanently deletes a HubSpot contact and all its associated data for GDPR compliance, identifying the contact by its ID or another unique property. GDPR deletion is permanent and irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z
      .string()
      .describe(
        "The unique identifier of the contact to be permanently deleted. This could be the contact's HubSpot ID or another unique property value (e.g., email address) if `idProperty` is specified.",
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "The name of the property that contains the unique identifier of the contact specified in `objectId`. For example, if `objectId` is an email address, set this to 'email'. If `objectId` is the HubSpot contact ID, this field can be omitted (or set to None).",
      ),
    objectType: z
      .string()
      .describe(
        "The type of HubSpot object to be deleted. Must be 'contacts' for this GDPR deletion endpoint. This parameter is part of the URL path.",
      ),
  }),
  execute: async ({ hubspotToken, objectId, idProperty, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/gdpr-delete`,
      {
        body: pickDefined({ objectId: objectId, idProperty: idProperty }),
      },
    );
  },
});

export const hubspotReadApageOfObjectsByType = tool({
  description:
    "Retrieves a paginated list of objects for a specified and valid HubSpot CRM object type (e.g., 'contacts', 'companies', 'deals', or custom ID).",
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Pagination token from a previous response's `paging.next.after` property, used to fetch the next page of results.",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of results to return per page (must be an integer between 1 and 100).',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to true to retrieve only archived objects. If false or omitted (default), non-archived objects are returned.',
      ),
    objectType: z
      .string()
      .describe(
        "Identifier for the type of CRM object to retrieve (e.g., 'contacts', 'companies', 'deals', or a custom object type ID).",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'List of property names to include for each object; non-existent properties on an object are ignored. Customizes response and can reduce payload size.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "List of object types (e.g., 'companies', 'deals') for which to retrieve associated IDs. Only existing associations are returned.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'List of property names for which to include historical values. Using this parameter may reduce the maximum number of objects returnable in a single request.',
      ),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    archived,
    objectType,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/${encodeURIComponent(String(objectType))}`, {
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

export const hubspotReadBatchOfCrmObjectsByIdOrPropertyValues = tool({
  description:
    'Reads a batch of CRM objects of a specified `objectType` using their HubSpot IDs or unique property values from the `inputs` list, allowing retrieval of specific `properties`, their historical values (`propertiesWithHistory`), and filtering by `archived` status.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        "List of objects, each with an 'id' identifying a CRM object to retrieve, using the HubSpot object ID or the value of `idProperty`.",
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'If true, retrieves only archived CRM objects; if false (default), retrieves non-archived objects.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Alternate unique identifier property name (e.g., 'email' for contacts) to use instead of the default object ID.",
      ),
    objectType: z
      .string()
      .describe(
        "Type of CRM object to read (e.g., 'contacts', 'companies'). Determines which object collection to query.",
      ),
    properties: z
      .array(z.string())
      .describe(
        'List of property names to return for each CRM object. If omitted, default properties are returned.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .describe('List of property names for which to retrieve historical values.'),
  }),
  execute: async ({
    hubspotToken,
    inputs,
    archived,
    idProperty,
    objectType,
    properties,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/batch/read`,
      {
        body: pickDefined({
          inputs: inputs,
          archived: archived,
          idProperty: idProperty,
          properties: properties,
          propertiesWithHistory: propertiesWithHistory,
        }),
      },
    );
  },
});

export const hubspotReadCrmObjectById = tool({
  description:
    'Retrieves a specific CRM object (e.g., contact, company, deal, ticket) by its ID or a unique property, optionally including specific properties, history, and associations.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to retrieve only archived objects. Defaults to `false` (non-archived objects).',
      ),
    objectId: z
      .string()
      .describe(
        'The unique identifier of the CRM object, or the value of the unique property if `idProperty` is specified. Accepts both string and numeric values (numeric IDs are converted to strings automatically).',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "The name of a unique property (e.g., 'email' for contacts, 'domain' for companies) to use for lookup instead of the internal object ID. If omitted, the internal object ID is used.",
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object to retrieve. Valid standard object types are: 'contacts', 'companies', 'deals', 'tickets', 'line_items', 'products', 'quotes', 'calls', 'emails', 'meetings', 'notes', 'tasks', 'postal_mail', 'communications', 'feedback_submissions', 'goals', 'leads', 'invoices', 'subscriptions', 'orders', 'payments', 'carts', 'appointments', 'courses', 'listings', 'services', 'users'. You can also use numeric object type IDs (e.g., '0-1' for contacts, '0-2' for companies, '0-3' for deals, '0-5' for tickets). For custom objects, use 'p_{internal_name}' format or the objectTypeId (e.g., '2-12345'). Note: 'owners' is NOT a valid object type - use the dedicated Owners API instead.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of property names to include in the response. Non-existent properties are ignored. If omitted, a default set of properties is returned.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "A list of object types (e.g., 'contacts', 'companies') for which to retrieve associated IDs (e.g., to get associated companies for a contact). Non-existent associations are ignored.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'A list of property names to retrieve value history for, showing changes over time. Non-existent properties or those without history are ignored.',
      ),
  }),
  execute: async ({
    hubspotToken,
    archived,
    objectId,
    idProperty,
    objectType,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(objectId))}`,
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

export const hubspotSearchCrmObjectsByCriteria = tool({
  description:
    "Searches HubSpot CRM objects (e.g., 'contacts', 'companies') by `objectType` using complex criteria including filters, sorting, and pagination; property names used in filters, sorts, and returned properties must be valid for the specified `objectType`.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Optional. Cursor for pagination (from previous response). Must be formatted as an integer string (e.g., '100', '200'). HubSpot's search API has a hard limit of 10,000 total results; pagination cannot proceed beyond this point (i.e., after >= 10000 is not allowed).",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Optional. Max results per page (default 10, max 100).'),
    query: z
      .string()
      .optional()
      .describe(
        'A string for a broad search across multiple fields on the object. Use this for quick text searches. Optional - can be omitted to retrieve all objects.',
      ),
    sorts: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Optional. List of sort rules. Accepts either simple strings (e.g., 'createdate' for ascending, '-createdate' for descending) or object format [{'propertyName': 'createdate', 'direction': 'ASCENDING'}]. Simple strings are automatically converted to the object format. Only one sorting rule can be applied to any search.",
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object to search. VALID VALUES: 'contacts', 'companies', 'deals', 'tickets', 'tasks', 'line_items', 'products', 'quotes', 'calls', 'emails', 'meetings', 'notes', or custom object IDs like '2-1234567'. Must be lowercase and plural for standard types. IMPORTANT: This is the OBJECT TYPE, not a property name. Do NOT pass property names like 'hs_task_status', 'email', 'dealname', etc. here - those belong in filterGroups.filters.propertyName. Example: To search for tasks with a specific status, use objectType='tasks' and add a filter with propertyName='hs_task_status'.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Optional. List of property names to include in the response. Property names must be valid for the objectType. For tasks: use hs_task_subject, hs_task_body, hs_task_status, hs_task_priority, hs_timestamp (due date), hs_task_type, hubspot_owner_id. Do NOT use hs_status, hs_due_date, or hs_priority for tasks. Note: Properties filtered with HAS_PROPERTY or NOT_HAS_PROPERTY operators cannot be included here and will be automatically removed.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())) }).catchall(z.any()))
      .optional()
      .describe(
        'Optional. List of filter groups (AND within, OR between). Can be omitted to retrieve all objects without filtering. Maximum of 5 filter groups with up to 6 filters each (18 total).',
      ),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    query,
    sorts,
    objectType,
    properties,
    filterGroups,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/search`,
      {
        body: searchBody({ query, filterGroups, sorts, properties, limit, after }),
      },
    );
  },
});

export const hubspotUpdateBatchOfObjectsByIdorPropertyValues = tool({
  description:
    'Performs a batch update on a valid `objectType` where properties are writeable and any `idProperty` used is designated unique; updates can be partial.',
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
        'List of objects to update, each detailing the object and its property changes. Max 100 objects per batch.',
      ),
    objectType: z
      .string()
      .describe(
        "Case-sensitive CRM object type to be updated in bulk (e.g., 'contacts', 'p_customobject'), determining the target object set.",
      ),
  }),
  execute: async ({ hubspotToken, inputs, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/objects/${encodeURIComponent(String(objectType))}/batch/update`,
      {
        body: pickDefined({ inputs: inputs }),
      },
    );
  },
});
