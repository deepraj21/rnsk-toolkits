// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceCompositeGraphAction = tool({
  description:
    'DEPRECATED: Use SALESFORCE_POST_COMPOSITE_GRAPH instead. Tool to execute multiple Salesforce REST API requests in a single call using composite graphs. Use when you need to perform a series of related operations that should either all succeed or all fail together. Composite graphs support up to 500 subrequests per graph (compared to 25 for regular composite requests) and allow referencing outputs ',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    graphs: z
      .array(z.record(z.any()))
      .describe(
        'Array of graph objects to execute. Each graph is transactional. Multiple graphs can be submitted in one request.',
      ),
  }),
  execute: async ({ salesforceCredentials, graphs }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/composite/graph`, { body: { graphs: graphs } });
  },
});

export const salesforceCreateSObjectRecord = tool({
  description:
    'Tool to create a new Salesforce SObject record. Use when you need to create any type of standard or custom Salesforce object record by specifying the object type and field values.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .record(z.any())
      .describe(
        "Dictionary of field API names and their values to set on the new record. Keys must be valid field API names for the specified object type. Required fields for the object must be included. Custom field names typically end with '__c'.",
      ),
    sobjectType: z
      .string()
      .describe(
        "The API name of the Salesforce object type to create (e.g., 'Account', 'Contact', 'Opportunity', 'Lead', 'Case', 'Task'). This is case-sensitive and must match the exact API name in Salesforce.",
      ),
  }),
  execute: async ({ salesforceCredentials, fields, sobjectType }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/sobjects/${sobjectType}`, { body: fields });
  },
});

export const salesforceCreateSobjectTree = tool({
  description:
    'Tool to create one or more sObject trees with root records of the specified type. Use when creating nested parent-child record hierarchies in a single atomic operation (e.g., Account with Contacts and Opportunities). Supports up to 200 total records across all trees, up to 5 levels deep, with maximum 5 different object types. All records succeed or all fail together.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    records: z
      .array(z.record(z.any()))
      .describe(
        "Array of sObject record trees to create. Each record must include 'attributes' object with 'type' (matching sobject_api_name) and 'referenceId' fields, plus any standard or custom field values. Can include nested child records using relatio",
      ),
    sobjectApiName: z
      .string()
      .describe(
        'The API name of the sObject type for root records (e.g., Account, Contact, Opportunity). All root records in the request must be of this type.',
      ),
  }),
  execute: async ({ salesforceCredentials, records, sobjectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/composite/tree/${sobjectApiName}`, {
      body: { records: records },
    });
  },
});

export const salesforceDeleteSobject = tool({
  description:
    'Tool to delete a single Salesforce record by its ID. Use when you need to permanently remove a specific record from Salesforce. This operation is idempotent - deleting the same record multiple times returns success. Works with standard and custom objects.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'The unique identifier of the record to delete. Must be a valid 15 or 18-character Salesforce ID format.',
      ),
    sobjectName: z
      .string()
      .describe(
        'The API name of the Salesforce object (sObject) to delete. Examples: Account, Contact, Opportunity, CustomObject__c. Must be a valid sObject type with proper permissions.',
      ),
  }),
  execute: async ({ salesforceCredentials, id, sobjectName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/${sobjectName}/${id}`);
  },
});

export const salesforceDeleteSobjectCollections = tool({
  description:
    'Tool to delete up to 200 records in one request with optional rollback. Use when you need to delete multiple records efficiently, reducing API calls.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ids: z
      .array(z.string())
      .describe(
        'List of record IDs to delete. Can specify up to 200 record IDs. Each ID should be a valid 15 or 18-character Salesforce ID.',
      ),
    allOrNone: z
      .boolean()
      .optional()
      .describe(
        'Specifies whether the operation should roll back if any record fails. When true, all records must be successfully deleted or the entire operation rolls back (atomic transaction). When false (default), partial success is allowed - successful',
      ),
  }),
  execute: async ({ salesforceCredentials, ids, allOrNone }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const idsCsv = Array.isArray(ids) ? ids.join(',') : ids;
    return sfDelete(salesforceCredentials, `/composite/sobjects`, {
      query: { ids: idsCsv, allOrNone: allOrNone },
    });
  },
});

export const salesforceGetCompositeResources = tool({
  description:
    'Tool to retrieve a list of available composite resources in Salesforce. Use when you need to discover which composite API endpoints are available for batch operations.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/composite`);
  },
});

export const salesforceGetCompositeSobjects = tool({
  description:
    'Retrieves multiple records of the same object type by IDs with a request body. Use when you need to retrieve more records than URL length limits allow (up to 2000 records vs ~800 via GET).',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ids: z
      .array(z.string())
      .describe('Array of record IDs to retrieve. Maximum 2000 IDs per request.'),
    fields: z
      .array(z.string())
      .describe(
        'Array of field names to retrieve for each record. Specifies which fields to return in the response.',
      ),
    sobjectName: z
      .string()
      .describe(
        "The sObject type name (e.g., 'Account', 'Contact', 'Lead', 'Opportunity'). This specifies which type of records to retrieve.",
      ),
  }),
  execute: async ({ salesforceCredentials, ids, fields, sobjectName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/composite/sobjects`, {
      body: { ids: ids, fields: fields, sobject_name: sobjectName },
    });
  },
});

export const salesforceGetSobjectByExternalId = tool({
  description:
    'Tool to retrieve a Salesforce record by matching an external ID field value. Use when you need to find a record using a custom external identifier instead of the Salesforce ID. The field specified must be marked as an External ID in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of field names to return. If not specified, returns all fields.',
      ),
    sobject: z
      .string()
      .describe('The API name of the Salesforce object (e.g., Account, Contact, Custom__c).'),
    fieldName: z
      .string()
      .describe(
        "The API name of the external ID field. Must be marked as an External ID field in the object's field definition.",
      ),
    fieldValue: z
      .string()
      .describe('The value of the external ID field to match. Will be URL-encoded automatically.'),
  }),
  execute: async ({ salesforceCredentials, fields, sobject, fieldName, fieldValue }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobject}/${fieldName}/${fieldValue}`, {
      query: { fields: fields },
    });
  },
});

export const salesforceGetSobjectCollections = tool({
  description:
    'Tool to retrieve multiple records of the same sObject type in a single API call. Use when you need to fetch up to 200 records by their IDs. Returns an array of sObjects with the specified fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ids: z
      .string()
      .describe(
        "Comma-separated list of record IDs to retrieve. Maximum 200 IDs for GET requests. Example: '001xx000003DGb2AAG,001xx000003DGb3AAG'.",
      ),
    fields: z
      .string()
      .describe(
        "Comma-separated list of field names to retrieve for each record. Specifies which fields to return in the response. Example: 'Name,BillingCity,Email'.",
      ),
    allOrNone: z
      .boolean()
      .optional()
      .describe(
        'If true, the entire operation rolls back if any record fails. If false (default), partial success is allowed and errors are returned for individual failed records.',
      ),
    sobjectType: z
      .string()
      .describe(
        "The sObject type name to retrieve records from (e.g., 'Account', 'Contact', 'Lead', 'Opportunity').",
      ),
  }),
  execute: async ({ salesforceCredentials, ids, fields, allOrNone, sobjectType }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/composite/sobjects/${sobjectType}`, {
      query: { ids: ids, fields: fields, allOrNone: allOrNone },
    });
  },
});

export const salesforceGetSObjectRecord = tool({
  description:
    'Tool to retrieve a single Salesforce record by ID from any sObject type. Use when you need to get detailed information about a specific record.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of field names to retrieve from the record. If omitted, all fields are returned. Example: Name,Id,CreatedDate,Industry',
      ),
    recordId: z
      .string()
      .describe(
        "The unique Salesforce record ID (15 or 18 characters). The 3-character prefix indicates the object type (e.g., '001' for Account, '003' for Contact, '00Q' for Lead). Ensure the sobject_api_name matches the record ID prefix.",
      ),
    sobjectApiName: z
      .string()
      .describe(
        "The API name of the Salesforce sObject type (e.g., Account, Contact, Opportunity, Custom__c). Object names are not case-sensitive. Ensure the sObject type matches the record ID prefix (e.g., Account IDs start with '001', Contact with '003',",
      ),
  }),
  execute: async ({ salesforceCredentials, fields, recordId, sobjectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobjectApiName}/${recordId}`, {
      query: { fields: fields },
    });
  },
});

export const salesforceGetSobjectRelationship = tool({
  description:
    'Retrieves records by traversing sObject relationships using friendly URLs. Use when you need to get related records through a relationship field (e.g., all Contacts for an Account).',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('The 15 or 18-character Salesforce ID of the parent record.'),
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of fields to retrieve from the related records. If not specified, returns default fields.',
      ),
    sobject: z
      .string()
      .describe(
        "The parent sObject type (e.g., 'Account', 'Contact', 'Opportunity'). Must be a valid Salesforce object type.",
      ),
    relationshipFieldName: z
      .string()
      .describe(
        "The name of the relationship field to traverse (e.g., 'Contacts' for Account.Contacts, 'Opportunities' for Account.Opportunities).",
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields, sobject, relationshipFieldName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobject}/${id}/${relationshipFieldName}`, {
      query: { fields: fields },
    });
  },
});

export const salesforceGetSObjectsUpdated = tool({
  description:
    'Tool to retrieve a list of sObject records that have been updated within a given timeframe. Use when you need to synchronize records or track changes to specific sObject types over a time period.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    end: z
      .string()
      .describe(
        'End of the timeframe for which to retrieve updated records. Must be in ISO 8601 format (e.g., 2025-12-23T23:59:59Z). The date range between start and end cannot exceed 30 days.',
      ),
    start: z
      .string()
      .describe(
        'Start of the timeframe for which to retrieve updated records. Must be in ISO 8601 format (e.g., 2025-12-23T10:22:26Z). Cannot be more than 30 days ago from the current date.',
      ),
    sobject: z
      .string()
      .describe(
        'The API name of the sObject type to query for updated records (e.g., Account, Contact, CustomObject__c).',
      ),
  }),
  execute: async ({ salesforceCredentials, end, start, sobject }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobject}/updated`, {
      query: { end: end, start: start },
    });
  },
});

export const salesforcePatchCompositeSobjects = tool({
  description:
    'Tool to upsert up to 200 records using external ID field matching. Use when you need to create or update multiple records efficiently in a single API call based on an external ID field.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    records: z
      .array(z.record(z.any()))
      .describe(
        "Array of record objects to upsert. Maximum 200 records. Each record must include the 'attributes' object with the 'type' field, and the external ID field value for matching.",
      ),
    allOrNone: z
      .boolean()
      .optional()
      .describe(
        'Controls transaction behavior. If true, rolls back all changes if any record fails. If false (default), commits successful records even if others fail.',
      ),
    sobjectName: z
      .string()
      .describe(
        "The API name of the Salesforce object (e.g., 'Account', 'Contact', 'CustomObject__c').",
      ),
    externalIdFieldName: z
      .string()
      .describe(
        "The API name of the external ID field to use for matching records (e.g., 'External_Account_ID__c', 'Id'). This field must be defined as an external ID field in Salesforce.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    records,
    allOrNone,
    sobjectName,
    externalIdFieldName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPatch(
      salesforceCredentials,
      `/composite/sobjects/${sobjectName}/${externalIdFieldName}`,
      { body: { records: records, all_or_none: allOrNone } },
    );
  },
});

export const salesforcePostCompositeGraph = tool({
  description:
    'Tool to execute multiple related REST API requests in a single transactional call with up to 500 subrequests per graph. Use when you need to perform multiple Salesforce operations atomically where all operations must succeed or fail together. Supports referencing output from one request as input to subsequent requests using @{referenceId.fieldName} syntax.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    graphs: z
      .array(z.record(z.any()))
      .describe(
        'Array of graph objects. Each graph can contain up to 500 subrequests and reach up to 15 levels of depth. All operations within a graph succeed or fail together. Subrequests in one graph cannot reference subrequests from another graph.',
      ),
  }),
  execute: async ({ salesforceCredentials, graphs }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/composite/graph`, { body: { graphs: graphs } });
  },
});

export const salesforcePostCompositeSobjects = tool({
  description:
    'Tool to create up to 200 records in one request using sObject Collections. Use when you need to create multiple records of potentially different sObject types efficiently in a single API call.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    records: z
      .array(z.record(z.any()))
      .describe(
        "Array of sObject records to create. Minimum 1 record, maximum 200 records per request. Each record must include an 'attributes' object with the 'type' field specifying the sObject API name (e.g., Account, Contact), followed by field name-va",
      ),
    allOrNone: z
      .boolean()
      .optional()
      .describe(
        'Determines whether the request should be processed atomically. When true, all records must succeed or the entire request is rolled back. When false (default), partial success is allowed and each record is processed independently.',
      ),
  }),
  execute: async ({ salesforceCredentials, records, allOrNone }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/composite/sobjects`, {
      body: { records: records, all_or_none: allOrNone },
    });
  },
});

export const salesforceSobjectRowsUpdate = tool({
  description:
    'Tool to update specific fields in an existing Salesforce sObject record. Use when you need to modify one or more fields in a record without affecting other fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .record(z.any())
      .describe(
        "Dictionary of field name/value pairs to update. Only include fields that need to be updated. Field names must match the API names of the sObject fields (e.g., 'Phone', 'Name', 'CustomField__c'). Field names are case-sensitive.",
      ),
    recordId: z
      .string()
      .describe('The unique 15 or 18-character Salesforce ID of the record to update.'),
    sobjectApiName: z
      .string()
      .describe(
        'The API name of the Salesforce object type to update (e.g., Account, Contact, Opportunity, CustomObject__c). Case-sensitive.',
      ),
  }),
  execute: async ({ salesforceCredentials, fields, recordId, sobjectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPatch(salesforceCredentials, `/sobjects/${sobjectApiName}/${recordId}`, {
      body: fields,
    });
  },
});

export const salesforceUpsertSobjectByExternalId = tool({
  description:
    "Tool to upsert records using sObject Rows by External ID. Use when you need to create or update a Salesforce record based on an external ID field value - creates a new record if the external ID doesn't exist, or updates the existing record if it does.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .record(z.any())
      .describe(
        'JSON object containing the fields to create or update. Field names should be the Salesforce API names with their corresponding values.',
      ),
    sobject: z
      .string()
      .describe('The API name of the Salesforce object (e.g., Account, Contact, CustomObject__c).'),
    fieldName: z
      .string()
      .describe(
        "The API name of the external ID field. This field must be marked as 'External ID' in Salesforce.",
      ),
    fieldValue: z
      .string()
      .describe('The value of the external ID for the specific record to upsert.'),
    updateOnly: z
      .boolean()
      .optional()
      .describe(
        "Available in API v62.0+. When set to true, only updates existing records without creating new ones. Returns 404 if record doesn't exist.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    fields,
    sobject,
    fieldName,
    fieldValue,
    updateOnly,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPatch(salesforceCredentials, `/sobjects/${sobject}/${fieldName}/${fieldValue}`, {
      body: fields,
    });
  },
});
