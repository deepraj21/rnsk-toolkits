// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceCreateARecord = tool({
  description:
    'Tool to create a Salesforce record using the UI API. Use when you need to create any type of Salesforce record with layout metadata and formatted field values.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .record(z.any())
      .describe(
        "Dictionary mapping field API names to their values. Keys are field API names (e.g., 'Name', 'FirstName', 'AccountId') and values are the data to set for those fields. Custom fields (ending in '__c') should be passed as direct key-value pair",
      ),
    apiName: z
      .string()
      .describe(
        "The API name of the Salesforce object to create (e.g., 'Account', 'Contact', 'Opportunity', 'ContentNote').",
      ),
  }),
  execute: async ({ salesforceCredentials, fields, apiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/ui-api/records`, {
      body: { fields: fields, apiName: apiName },
    });
  },
});

export const salesforceGetABatchOfRecords = tool({
  description:
    'Tool to retrieve multiple Salesforce records in a single request with customizable field selection. Use when you need to fetch data for multiple records at once (up to 200 records).',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of qualified field names to retrieve. Format: ObjectApiName.FieldName (e.g., 'Account.Name,Account.Phone'). If the user doesn't have access to a field, an error occurs. Either fields or optionalFields must be provided.",
      ),
    recordIds: z
      .string()
      .describe(
        'Comma-separated list of record IDs to retrieve. All record IDs must be from supported objects. Maximum 200 records per request.',
      ),
    optionalFields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of qualified optional field names. Format: ObjectApiName.FieldName (e.g., 'Account.AnnualRevenue'). If the user doesn't have access to an optional field, it's excluded from the response without error. Can be used with f",
      ),
  }),
  execute: async ({ salesforceCredentials, fields, recordIds, optionalFields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/records/batch/get`, {
      query: { fields: fields, recordIds: recordIds, optionalFields: optionalFields },
    });
  },
});

export const salesforceGetAllFieldsForObject = tool({
  description:
    'Retrieves all fields (standard and custom) for a Salesforce object with complete metadata including field types, constraints, picklist values, and relationships.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    objectName: z
      .string()
      .describe(
        'API name of the Salesforce object to describe. Use standard object names (Account, Contact, Lead, Opportunity) or custom object API names ending in __c.',
      ),
  }),
  execute: async ({ salesforceCredentials, objectName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/object-info/${objectName}`);
  },
});

export const salesforceGetAllNavigationItems = tool({
  description:
    'Gets all navigation items (tabs) that the user has access to. Use when you need to retrieve available navigation tabs for display or navigation purposes.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    page: z
      .number()
      .int()
      .optional()
      .describe(
        'Page offset for paginated results. Default is 0. For example, page=2 with pageSize=10 returns items starting at position 21.',
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of navigation items to return per page. Default is 25.'),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Specifies the display size. Valid values: 'Large' (desktop, default), 'Medium' (tablet), or 'Small' (phone). Determines which navigation items are returned based on the form factor.",
      ),
    navItemNames: z
      .string()
      .optional()
      .describe(
        'Comma-delimited list of TabDefinition name values to include in the response. If omitted, all navigation items for the specified form factor are returned.',
      ),
  }),
  execute: async ({ salesforceCredentials, page, pageSize, formFactor, navItemNames }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/nav-items`, {
      query: { page: page, pageSize: pageSize, formFactor: formFactor, navItemNames: navItemNames },
    });
  },
});

export const salesforceGetApp = tool({
  description:
    'Tool to get metadata about a specific Salesforce app by ID. Use when you need to retrieve app configuration details and navigation items for a particular application.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    appId: z
      .string()
      .describe(
        'The 18-character ID of the app or the API name (developerName) of the app to retrieve.',
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Specifies the device form factor for which to retrieve app metadata. Required by the UI API; defaults to 'Large'. 'Large' for desktop/web client, 'Medium' for tablet client, 'Small' for phone/mobile client.",
      ),
  }),
  execute: async ({ salesforceCredentials, appId, formFactor }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/apps/${appId}`, {
      query: { formFactor: formFactor },
    });
  },
});

export const salesforceGetApps = tool({
  description:
    "Tool to get metadata for all apps a user has access to. Use when you need to list available Salesforce applications or check app navigation items. Metadata for the selected app includes tabs on the app's navigation bar, while other apps don't include tab details.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Specifies the form factor of the hardware/device the browser is running on. Determines which navigation items and metadata are returned. 'Large' for desktop/laptop, 'Medium' for tablets, 'Small' for mobile phones.",
      ),
  }),
  execute: async ({ salesforceCredentials, formFactor }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/apps`, { query: { formFactor: formFactor } });
  },
});

export const salesforceGetChildRecords = tool({
  description:
    'Tool to get child records for a specified parent record and child relationship name. Use when you need to retrieve related records from a parent-child relationship in Salesforce, such as getting all Contacts for an Account or all Opportunities for an Account. Results are paginated with configurable page size.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of API names of the related list's column fields to query. Supports spanning relationships in the format ObjectApiName.ChildRelationshipName.FieldApiName (e.g., Opportunity.Account.BillingAddress). If not specified, def",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'The number of list records to return per page. The default value is 5 and the value can be 1-2000.',
      ),
    recordId: z
      .string()
      .describe(
        'The unique 18-character Salesforce ID of the parent record. This is the record whose child records you want to retrieve.',
      ),
    pageToken: z
      .string()
      .optional()
      .describe(
        "Token for pagination, used to navigate to a specific page of results. Obtained from the response's nextPageToken or previousPageToken fields.",
      ),
    optionalFields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of additional field API names in the related list to query. These are additional fields queried for the records returned that don't create visible columns. If the field is not available to the user, no error occurs.",
      ),
    relationshipName: z
      .string()
      .describe(
        "The API name of the child relationship (typically the plural form of the child object name). Common examples include 'Contacts', 'Opportunities', 'Cases', 'Tasks'.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    fields,
    pageSize,
    recordId,
    pageToken,
    optionalFields,
    relationshipName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(
      salesforceCredentials,
      `/ui-api/records/${recordId}/child-relationships/${relationshipName}`,
      {
        query: {
          fields: fields,
          pageSize: pageSize,
          pageToken: pageToken,
          optionalFields: optionalFields,
        },
      },
    );
  },
});

export const salesforceGetCompactLayouts = tool({
  description:
    'Tool to retrieve compact layout information for multiple Salesforce objects. Use when you need to display object data in compact form for Lightning Experience, mobile apps, or custom interfaces.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    objectList: z
      .string()
      .describe(
        "Comma-separated list of Salesforce object names to retrieve compact layouts for (e.g., 'Account', 'Account,Contact', 'Account,Contact,Lead').",
      ),
  }),
  execute: async ({ salesforceCredentials, objectList }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/layout/${objectList}`, {
      query: { layoutType: 'Compact' },
    });
  },
});

export const salesforceGetGlobalActions = tool({
  description:
    'Tool to retrieve actions displayed in the Salesforce Global Actions menu with metadata. Use when you need to discover available global actions, quick actions, or custom buttons in the UI.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    apiNames: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of action API names to filter results (e.g., 'NewTask,NewEvent,LogACall').",
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Device form factor to filter actions. Valid values: 'Large' (Desktop), 'Medium' (Tablet), 'Small' (Mobile).",
      ),
    actionTypes: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of action types to filter (e.g., 'StandardButton,QuickAction,CustomButton,ProductivityAction').",
      ),
  }),
  execute: async ({ salesforceCredentials, apiNames, formFactor, actionTypes }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/actions/global`, {
      query: { apiNames: apiNames, formFactor: formFactor, actionTypes: actionTypes },
    });
  },
});

export const salesforceGetLastSelectedApp = tool({
  description:
    'Retrieves the app the current user last selected or the app the user sees by default. Use when you need to determine which application the user is currently working in or should be using.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Specifies the form factor of the hardware the browser is running on. Required by the UI API; defaults to 'Large'. 'Large' for desktop, 'Medium' for tablet, 'Small' for mobile.",
      ),
  }),
  execute: async ({ salesforceCredentials, formFactor }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/apps/selected`, {
      query: { formFactor: formFactor },
    });
  },
});

export const salesforceGetListViewActions = tool({
  description:
    'Tool to retrieve header actions on list views. Use when you need to get available actions, buttons, and quick actions displayed on a specific list view header in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    listViewId: z
      .string()
      .describe(
        'The 18-character ID or API name of the list view for which to retrieve header actions.',
      ),
  }),
  execute: async ({ salesforceCredentials, listViewId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/actions/list-view/${listViewId}`);
  },
});

export const salesforceGetListViewMetadataByName = tool({
  description:
    'Returns list view metadata by object and list view API name. Use when you need to retrieve complete metadata information for a specific list view, including display columns, filters, sort order, permissions, and user preferences.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobjectApiName: z.string().describe('The API name of a supported Salesforce object.'),
    listViewApiName: z.string().describe('The API name of the list view.'),
  }),
  execute: async ({ salesforceCredentials, sobjectApiName, listViewApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/list-info/${sobjectApiName}/${listViewApiName}`);
  },
});

export const salesforceGetListViewRecordsById = tool({
  description:
    'Returns record data for a list view by its ID. Use when you need to retrieve records from a specific Salesforce list view.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .array(z.string())
      .optional()
      .describe(
        "Additional fields queried for the records returned. These fields don't create visible columns. If the field is not available to the user, an error occurs.",
      ),
    sortBy: z
      .string()
      .optional()
      .describe(
        "The API name of the field the list view is sorted by. If the name is preceded with '-', the sort order is descending.",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'The number of list records viewed at one time. Default value is 50. Value can be 1-2000.',
      ),
    pageToken: z
      .string()
      .optional()
      .describe('A token that represents the page offset used for pagination through result sets.'),
    listViewId: z.string().describe('The ID of the list view to retrieve records from.'),
    optionalFields: z
      .array(z.string())
      .optional()
      .describe(
        "Additional fields queried for the records returned. These fields don't create visible columns. If the field is not available to the user, no error occurs and the field isn't included in the records.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    fields,
    sortBy,
    pageSize,
    pageToken,
    listViewId,
    optionalFields,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/list-records/${listViewId}`, {
      query: {
        fields: fields,
        sortBy: sortBy,
        pageSize: pageSize,
        pageToken: pageToken,
        optionalFields: optionalFields,
      },
    });
  },
});

export const salesforceGetListViewRecordsByName = tool({
  description:
    "Retrieves paginated record data for a specified list view using the object and list view API names. Use when you need to fetch records that match a specific list view's filters and sorting criteria. Returns the same data that powers Lightning Experience list views.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    where: z.string().optional().describe('Filter applied to returned records in GraphQL syntax.'),
    fields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of additional fields to query for the records returned. If a field is not available to the user, an error occurs. Example: 'Industry,AnnualRevenue,Description'",
      ),
    sortBy: z
      .string()
      .optional()
      .describe(
        "The API name of the field to sort by. Prefix with '-' for descending order. Examples: 'Name', '-CreatedDate'",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('Number of list records to return per page. Default: 50. Valid range: 1-2000.'),
    pageToken: z
      .string()
      .optional()
      .describe(
        'Token representing the page offset for pagination. Obtained from nextPageToken in previous responses.',
      ),
    searchTerm: z
      .string()
      .optional()
      .describe('A search term to filter results. Wildcards are supported.'),
    optionalFields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of additional fields queried for the records. If a field is not available to the user, no error occurs and the field is not included. Example: 'CustomField__c,Phone'",
      ),
    sobjectApiName: z
      .string()
      .describe(
        "The API name of a supported Salesforce object (e.g., 'Account', 'Contact', 'Opportunity', 'Lead', 'Case').",
      ),
    listViewApiName: z
      .string()
      .describe(
        "The API name of a list view (e.g., 'AllAccounts', 'MyAccounts') or the 18-character list view ID.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    where,
    fields,
    sortBy,
    pageSize,
    pageToken,
    searchTerm,
    optionalFields,
    sobjectApiName,
    listViewApiName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/list-records/${listViewApiName}`, {
      query: {
        where: where,
        fields: fields,
        sortBy: sortBy,
        pageSize: pageSize,
        pageToken: pageToken,
        searchTerm: searchTerm,
        optionalFields: optionalFields,
        sobject_api_name: sobjectApiName,
      },
    });
  },
});

export const salesforceGetLookupFieldSuggestions = tool({
  description:
    'Tool to retrieve lookup field suggestions for editing lookup fields with search filtering. Use when searching for records to populate a lookup field, supporting typeahead, recent, and full-text search.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .optional()
      .describe(
        'Search query string used to filter and find matching records. Use for typeahead search.',
      ),
    page: z.number().int().optional().describe('Page number for pagination of results.'),
    pageSize: z.number().int().optional().describe('Number of records to return per page.'),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Device form factor: 'Large' for desktop, 'Medium' for tablet, 'Small' for mobile.",
      ),
    searchType: z
      .enum(['Recent', 'Search', 'TypeAhead'])
      .optional()
      .describe(
        "Type of search to perform: 'Recent' for most recently used matches, 'Search' for any match in searchable fields, 'TypeAhead' for matching names.",
      ),
    fieldApiName: z
      .string()
      .describe(
        "API name of the lookup field on the source object (e.g., 'AccountId', 'OwnerId').",
      ),
    objectApiName: z
      .string()
      .describe(
        "API name of the object containing the lookup field (e.g., 'Opportunity', 'Account', 'Contact').",
      ),
    dependentFieldBindings: z
      .string()
      .optional()
      .describe(
        'Lookup filter bindings for dependent lookups, specified as JSON string with field-value pairs for filtering.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    q,
    page,
    pageSize,
    formFactor,
    searchType,
    fieldApiName,
    objectApiName,
    dependentFieldBindings,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/lookups/${objectApiName}/${fieldApiName}`, {
      query: {
        q: q,
        page: page,
        pageSize: pageSize,
        formFactor: formFactor,
        searchType: searchType,
        dependentFieldBindings: dependentFieldBindings,
      },
    });
  },
});

export const salesforceGetLookupSuggestionsCaseContact = tool({
  description:
    'Tool to get lookup field suggestions with POST request. Use when editing lookup fields with dependent lookup filtering or when you need to pass source record context in the request body.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .optional()
      .describe(
        'The search term being queried. Used with TypeAhead or Search to find matching records. Leave empty for Recent searches.',
      ),
    page: z
      .number()
      .int()
      .optional()
      .describe(
        'The page number for paginated results. Use this to navigate through multiple pages of lookup results.',
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'Number of items to return per page. Controls the size of each page in paginated responses.',
      ),
    searchType: z
      .string()
      .optional()
      .describe(
        "The type of search to perform. Valid values: 'Recent' (most recently used), 'TypeAhead' (matching names as user types), 'Search' (full search across searchable fields).",
      ),
    sourceRecord: z
      .record(z.any())
      .describe(
        'The source record context, including the object API name and fields. Required for dependent lookup filtering.',
      ),
    fieldApiName: z
      .string()
      .describe("The API name of the lookup field (e.g., 'ContactId', 'AccountId', 'OwnerId')."),
    objectApiName: z
      .string()
      .describe(
        "The API name of the source object containing the lookup field (e.g., 'Case', 'Opportunity', 'Account').",
      ),
    dependentFieldBindings: z
      .record(z.any())
      .optional()
      .describe(
        'Bindings for dependent lookup fields to apply contextual filtering based on other field values.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    q,
    page,
    pageSize,
    searchType,
    sourceRecord,
    fieldApiName,
    objectApiName,
    dependentFieldBindings,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/ui-api/lookups/${objectApiName}/${fieldApiName}`, {
      body: { sourceRecord: sourceRecord, dependentFieldBindings: dependentFieldBindings },
      query: { q: q, page: page, pageSize: pageSize, searchType: searchType },
    });
  },
});

export const salesforceGetMruListViewMetadata = tool({
  description:
    'Tool to retrieve MRU list view metadata for a Salesforce object. Use when you need to understand the structure and configuration of the most recently used list view for an object.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobjectApiName: z
      .string()
      .describe('The API name of the Salesforce object to retrieve MRU list view metadata for.'),
  }),
  execute: async ({ salesforceCredentials, sobjectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/mru-list-info/${sobjectApiName}`);
  },
});

export const salesforceGetMruListViewRecords = tool({
  description:
    "Tool to retrieve record data for an object's most recently used (MRU) list view. Use when you need to get the records that a user has recently accessed for a specific Salesforce object type.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of additional fields to query for returned records. An error occurs if a field is unavailable to the user.',
      ),
    sortBy: z
      .string()
      .optional()
      .describe(
        "API name of the field to sort by. Prefix with '-' for descending order (e.g., 'CreatedDate' for ascending, '-CreatedDate' for descending).",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'Number of list records to view at one time. Default is 50, minimum is 1, maximum is 2000.',
      ),
    pageToken: z
      .string()
      .optional()
      .describe(
        'Token representing the page offset for pagination to retrieve subsequent pages of results.',
      ),
    optionalFields: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of additional fields to query for returned records. No error occurs if a field is unavailable to the user.',
      ),
    sobjectApiName: z
      .string()
      .describe(
        "The API name of the Salesforce object to retrieve MRU list view records for (e.g., 'Account', 'Contact', 'Opportunity').",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    fields,
    sortBy,
    pageSize,
    pageToken,
    optionalFields,
    sobjectApiName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/mru-list-records/${sobjectApiName}`, {
      query: {
        fields: fields,
        sortBy: sortBy,
        pageSize: pageSize,
        pageToken: pageToken,
        optionalFields: optionalFields,
      },
    });
  },
});

export const salesforceGetObjectListViews = tool({
  description:
    'Returns a collection of list views associated with a Salesforce object. Use when you need to discover available list views for an object like Account, Contact, or Opportunity.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobjectApiName: z
      .string()
      .describe(
        'The API name of the Salesforce object to retrieve list views for (e.g., Account, Contact, Opportunity).',
      ),
  }),
  execute: async ({ salesforceCredentials, sobjectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/list-info/${sobjectApiName}`);
  },
});

export const salesforceGetPhotoActions = tool({
  description:
    'Tool to retrieve available photo actions for Salesforce pages. Use when you need to get photo management actions for user or group pages. Currently, only group and user pages support photo actions.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    recordIds: z
      .string()
      .describe(
        'The record ID(s) for which to retrieve photo actions. Can be a single User ID or Group ID, or comma-separated list of IDs.',
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        'Specifies the device form factor for which to return actions. Large for Desktop/laptop, Medium for Tablet, Small for Mobile phone screens. If not specified, returns actions for all form factors.',
      ),
    actionTypes: z
      .string()
      .optional()
      .describe(
        'Filters the types of actions to return. Can be a single value or comma-separated list. Valid values: StandardButton, QuickAction, CustomButton, ProductivityAction.',
      ),
  }),
  execute: async ({ salesforceCredentials, recordIds, formFactor, actionTypes }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/actions/photo/${recordIds}`, {
      query: { formFactor: formFactor, actionTypes: actionTypes },
    });
  },
});

export const salesforceGetPicklistValuesByRecordType = tool({
  description:
    'Tool to get values for all picklist fields of a record type, including dependent picklists. Use when you need to retrieve available picklist options for a specific object and record type, especially for dependent picklist hierarchies.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    recordTypeId: z
      .string()
      .describe(
        "The 18-character Record Type ID. Use '012000000000000AAA' for objects without record types (default record type).",
      ),
    sobjectApiName: z
      .string()
      .describe(
        "The API name of the Salesforce object (e.g., 'Account', 'Contact', 'Opportunity', or custom object like 'Car__c').",
      ),
  }),
  execute: async ({ salesforceCredentials, recordTypeId, sobjectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(
      salesforceCredentials,
      `/ui-api/object-info/${sobjectApiName}/picklist-values/${recordTypeId}`,
    );
  },
});

export const salesforceGetRecordEditPageActions = tool({
  description:
    'Tool to get available actions on record edit pages. Use when you need to retrieve metadata about actions (standard actions, custom actions, quick actions, productivity actions) displayed on the record edit page for specific records.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    recordIds: z
      .string()
      .describe(
        'Comma-separated list of 18-character Salesforce record IDs for which to retrieve record edit actions. Multiple IDs can be provided to retrieve actions for multiple records in a single request.',
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "The device form factor for which to retrieve actions. Valid values: 'Large' (desktop), 'Medium' (tablet), 'Small' (mobile/phone). This affects which actions are returned based on device type.",
      ),
    actionTypes: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of action types to filter results. Common values include: 'Standard', 'Custom', 'QuickAction', 'ProductivityAction', 'DefaultButton'.",
      ),
    retrievalMode: z
      .string()
      .optional()
      .describe(
        'Specifies how actions should be retrieved to control the retrieval behavior for actions.',
      ),
  }),
  execute: async ({ salesforceCredentials, recordIds, formFactor, actionTypes, retrievalMode }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/actions/record/${recordIds}/edit`, {
      query: { formFactor: formFactor, actionTypes: actionTypes, retrievalMode: retrievalMode },
    });
  },
});

export const salesforceGetRelatedListActions = tool({
  description:
    'Tool to get actions on related lists for record detail pages. Use when you need to retrieve metadata about all available actions (standard buttons, quick actions, custom buttons, and productivity actions) that can be performed on records within a specific related list context.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    recordIds: z
      .string()
      .describe(
        'The 18-character Salesforce ID of the parent record for which to retrieve related list actions.',
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Device form factor to filter actions by device type. 'Large' for desktop, 'Medium' for tablet, 'Small' for mobile.",
      ),
    actionTypes: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of action types to filter results. Valid values: 'StandardButton', 'QuickAction', 'CustomButton', 'ProductivityAction'.",
      ),
    retrievalMode: z
      .string()
      .optional()
      .describe(
        'Controls data retrieval from cache or server. Specifies how actions should be retrieved.',
      ),
    relatedListIds: z
      .string()
      .describe(
        "The API name of the related list (e.g., 'Contacts', 'Opportunities', 'Cases'). For custom objects, use the plural form with '__r' suffix (e.g., 'Custom_Objects__r').",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    recordIds,
    formFactor,
    actionTypes,
    retrievalMode,
    relatedListIds,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(
      salesforceCredentials,
      `/ui-api/actions/record/${recordIds}/related-list/${relatedListIds}`,
      { query: { formFactor: formFactor, actionTypes: actionTypes, retrievalMode: retrievalMode } },
    );
  },
});

export const salesforceGetRelatedListPreferencesBatch = tool({
  description:
    'Tool to get a batch of related list user preferences from Salesforce. Use when retrieving display preferences, column widths, or sort orders for multiple related lists simultaneously.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    relatedListIds: z
      .string()
      .describe(
        "Comma-separated list of related list IDs. Each ID follows the format 'objectApiName.relatedListId' (e.g., 'Account.Contacts,Account.Opportunities').",
      ),
  }),
  execute: async ({ salesforceCredentials, relatedListIds }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/ui-api/related-list-preferences/batch`, {
      body: { relatedListIds: relatedListIds },
    });
  },
});

export const salesforceGetRelatedListRecordsContacts = tool({
  description:
    'Tool to retrieve related list records with request body parameters for filtering and pagination. Use when you need to get records from a related list associated with a parent record with complex query parameters. Returns up to 1,999 records per related list with pagination support.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    where: z
      .string()
      .optional()
      .describe(
        "Filter to apply to related list records, written in GraphQL syntax (e.g., '{Name: {like: 'A%'}}'). Note: Semi-joins and anti-joins filters are currently not supported.",
      ),
    fields: z
      .array(z.string())
      .optional()
      .describe(
        "The API names of the related list's column fields to query. Supports spanning relationships using dot notation (e.g., 'Opportunity.Account.Name').",
      ),
    sortBy: z
      .array(z.string())
      .optional()
      .describe(
        'An array of field API names to sort the related list by. Important: Despite being an array, it accepts only ONE value per request.',
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('The number of list records to return per page. Default: 50. Range: 1-1999.'),
    pageToken: z
      .string()
      .optional()
      .describe(
        'Token for pagination to navigate to a specific page of results. Obtained from nextPageToken or previousPageToken in previous responses.',
      ),
    optionalFields: z
      .array(z.string())
      .optional()
      .describe(
        "API names of additional fields in the related list that don't create visible columns. If a field is not available to the user, no error occurs - it's simply omitted from the response.",
      ),
    relatedListId: z
      .string()
      .describe(
        "The API name of the related list or child relationship (e.g., 'Contacts', 'Opportunities', 'Cases'). This is typically the plural form of the object name.",
      ),
    parentRecordId: z
      .string()
      .describe(
        'The 18-character Salesforce ID of the parent record for which to retrieve related lists (e.g., Account ID, Opportunity ID).',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    where,
    fields,
    sortBy,
    pageSize,
    pageToken,
    optionalFields,
    relatedListId,
    parentRecordId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/ui-api/related-list-records`, {
      body: {
        where: where,
        fields: fields,
        sortBy: sortBy,
        pageSize: pageSize,
        pageToken: pageToken,
        optionalFields: optionalFields,
        relatedListId: relatedListId,
        parentRecordId: parentRecordId,
      },
    });
  },
});

export const salesforceGetSobjectPlatformaction = tool({
  description:
    'Retrieves metadata description of PlatformAction SObject. Use when you need to understand the structure and fields of PlatformAction for querying UI actions.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/PlatformAction`);
  },
});

export const salesforceGetSObjectsDescribeLayoutsRecordTypeId = tool({
  description:
    'Tool to retrieve layout metadata for a specific record type on an object. Use when you need detailed information about page layouts, field positioning, sections, quick actions, related lists, and buttons for a particular record type.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobject: z
      .string()
      .describe('The API name of the Salesforce object to retrieve layout information for.'),
    recordTypeId: z
      .string()
      .describe('The 18-character ID of the record type for which to retrieve layout information.'),
  }),
  execute: async ({ salesforceCredentials, sobject, recordTypeId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobject}/describe/layouts/${recordTypeId}`);
  },
});

export const salesforceGetSobjectsSobjectDescribeApprovallayouts = tool({
  description:
    'Retrieves approval layouts for a specified Salesforce object. Use when you need to understand which fields are displayed in approval pages or to dynamically build approval interfaces.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobjectName: z
      .string()
      .describe(
        'The API name of the Salesforce object to retrieve approval layouts for. Use standard object names (Account, Contact, Opportunity, Case) or custom object API names ending in __c.',
      ),
  }),
  execute: async ({ salesforceCredentials, sobjectName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobjectName}/describe/approvalLayouts`);
  },
});

export const salesforceGetSupportedObjectsDirectory = tool({
  description:
    "Tool to get a Salesforce org's active theme and directory of supported objects. Use when you need to discover available objects that are supported by the User Interface API, including their CRUD permissions, labels, and theme information.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of object API names to filter the response. When provided, only returns metadata for the specified objects. If omitted, returns all available objects.',
      ),
  }),
  execute: async ({ salesforceCredentials, q }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/object-info`, { query: { q: q } });
  },
});

export const salesforceGetUiApiActionsLookupAccount = tool({
  description:
    'Tool to get lookup field actions for a Salesforce object. Use when you need to retrieve available actions for lookup fields on a specific object type (e.g., Account, Contact).',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sections: z
      .string()
      .optional()
      .describe('Comma-separated list of action sections to include in the response.'),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "The device form factor for which to retrieve actions. Valid values: 'Large' (desktop), 'Medium' (tablet), 'Small' (mobile).",
      ),
    actionTypes: z
      .string()
      .optional()
      .describe("Comma-separated list of action types to filter (e.g., 'standard,custom')."),
    objectApiName: z
      .string()
      .optional()
      .describe('The API name of the object for which to retrieve lookup field actions.'),
  }),
  execute: async ({ salesforceCredentials, sections, formFactor, actionTypes, objectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (objectApiName === undefined) objectApiName = 'Account';
    return sfGet(salesforceCredentials, `/ui-api/actions/lookup/${objectApiName}`, {
      query: { sections: sections, formFactor: formFactor, actionTypes: actionTypes },
    });
  },
});

export const salesforceGetUiapiActionsMruListAccount = tool({
  description:
    "Tool to retrieve header actions available on the MRU (Most Recently Used) list view for a specified Salesforce object. Use when you need to get available actions, buttons, and quick actions for an object's list view.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    formFactor: z
      .string()
      .optional()
      .describe(
        "Specifies the device form factor for which to return actions (e.g., 'Large' for desktop, 'Small' for mobile).",
      ),
    actionTypes: z
      .string()
      .optional()
      .describe(
        'Filters the types of actions to return. Can be used to limit the response to specific action categories.',
      ),
    objectApiName: z
      .string()
      .optional()
      .describe(
        'The API name of the Salesforce object for which to retrieve MRU list view actions.',
      ),
  }),
  execute: async ({ salesforceCredentials, formFactor, actionTypes, objectApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (objectApiName === undefined) objectApiName = 'Account';
    return sfGet(salesforceCredentials, `/ui-api/actions/mru-list/${objectApiName}`, {
      query: { formFactor: formFactor, actionTypes: actionTypes },
    });
  },
});

export const salesforceGetUiApiActionsRecordRelatedList = tool({
  description:
    'Tool to get available actions on related lists for a record detail page. Use when you need to retrieve metadata about actions (standard actions, custom actions, quick actions, productivity actions) displayed on related lists for a specific parent record.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    recordId: z
      .string()
      .describe(
        'The 18-character ID of the parent record for which to retrieve related list actions.',
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "The form factor of the device running the browser. Valid values: 'Large' (desktop), 'Medium' (tablet), 'Small' (phone). This affects which actions are returned based on device type.",
      ),
    actionTypes: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of action types to filter results. Common values include: 'Standard', 'Custom', 'QuickAction', 'ProductivityAction', 'DefaultButton'.",
      ),
    retrievalMode: z
      .string()
      .optional()
      .describe(
        'Specifies how actions should be retrieved to control the retrieval behavior for actions.',
      ),
    relatedListIds: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of related list API names to filter the actions. For custom objects, use the plural form with '__r' suffix (e.g., 'Custom_Objects__r').",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    recordId,
    formFactor,
    actionTypes,
    retrievalMode,
    relatedListIds,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/actions/record/${recordId}/related-list`, {
      query: {
        formFactor: formFactor,
        actionTypes: actionTypes,
        retrievalMode: retrievalMode,
        relatedListIds: relatedListIds,
      },
    });
  },
});

export const salesforceGetUiApiAppsUserNavItems = tool({
  description:
    'Tool to get personalized navigation items for a specific Salesforce app. Use when you need to retrieve the navigation tabs that a user has access to within an application.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    page: z
      .number()
      .int()
      .optional()
      .describe(
        'Page offset starting position (default: 0). Example: page=2 with pageSize=10 returns items 21-30.',
      ),
    appId: z
      .string()
      .describe('The ID of the Salesforce application for which to retrieve navigation items.'),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of navigation items per page (default: 25).'),
    formFactor: z
      .string()
      .optional()
      .describe(
        "Specifies the device form factor for which to retrieve navigation items. Valid values: 'Large' (desktop, default), 'Medium' (tablet), or 'Small' (phone).",
      ),
    navItemNames: z
      .array(z.string())
      .optional()
      .describe(
        'List of TabDefinition name values to include. If omitted, returns all navigation items for the specified form factor.',
      ),
  }),
  execute: async ({ salesforceCredentials, page, appId, pageSize, formFactor, navItemNames }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/apps/${appId}/user-nav-items`, {
      query: { page: page, pageSize: pageSize, formFactor: formFactor, navItemNames: navItemNames },
    });
  },
});

export const salesforceGetUiapiListInfoAccountAllAccounts = tool({
  description:
    'Retrieves list view metadata for the Account AllAccounts view using Salesforce UI API. Use when you need to understand the structure, columns, filters, and sorting of the standard AllAccounts list view.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/list-info/Account/AllAccounts`);
  },
});

export const salesforceGetUiapiListInfoAccountRecent = tool({
  description:
    'Tool to get list view metadata from Salesforce UI API. Use when you need to retrieve configuration details for a list view including columns, filters, sorting, and permissions.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    objectApiName: z
      .string()
      .optional()
      .describe(
        'The API name of the Salesforce object. Examples: Account, Contact, Lead, Opportunity, CustomObject__c.',
      ),
    listViewApiName: z
      .string()
      .optional()
      .describe(
        'The API name of the list view. Examples: AllAccounts, MyAccounts, __Recent. Special values like __Recent represent system-defined list views.',
      ),
  }),
  execute: async ({ salesforceCredentials, objectApiName, listViewApiName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (objectApiName === undefined) objectApiName = 'Account';
    if (listViewApiName === undefined) listViewApiName = '__Recent';
    return sfGet(salesforceCredentials, `/ui-api/list-info/${objectApiName}/${listViewApiName}`);
  },
});

export const salesforceGetUiapiListInfoAccountSearchResult = tool({
  description:
    'Retrieves list view metadata for the Account __SearchResult view using Salesforce UI API. Use when you need to understand the structure, columns, filters, and sorting of search results for Accounts.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/list-info/Account/__SearchResult`);
  },
});

export const salesforceGetUiApiListInfoRecent = tool({
  description:
    'Tool to get list views for a Salesforce object. Use when you need to retrieve available list views with options to filter by recent usage and search.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .optional()
      .describe('Search term to filter list view results. Supports wildcards.'),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'Number of list view records to return per page. Valid range: 1-2000. Default: 20.',
      ),
    pageToken: z
      .number()
      .int()
      .optional()
      .describe('Page offset for pagination. Maximum offset: 2000. Default: 0.'),
    objectApiName: z
      .string()
      .optional()
      .describe(
        'The API name of the Salesforce object to retrieve list views for. Examples: Account, Contact, Lead, Opportunity, CustomObject__c.',
      ),
    recentListsOnly: z
      .boolean()
      .optional()
      .describe(
        'When true, returns only recently used list views. When false, returns all list views for the object.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    q,
    pageSize,
    pageToken,
    objectApiName,
    recentListsOnly,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (objectApiName === undefined) objectApiName = 'Account';
    if (recentListsOnly === undefined) recentListsOnly = true;
    return sfGet(salesforceCredentials, `/ui-api/list-info/${objectApiName}`, {
      query: { q: q, pageSize: pageSize, pageToken: pageToken, recentListsOnly: recentListsOnly },
    });
  },
});

export const salesforceGetUiapimruListInfoAccount = tool({
  description:
    'Tool to get Most Recently Used (MRU) list view metadata for Account object. Use when you need to retrieve list view settings, display columns, and preferences. Note: This endpoint is deprecated and no longer updates.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/mru-list-info/Account`);
  },
});

export const salesforceGetUiApiMruListRecordsAccount = tool({
  description:
    'Tool to get Most Recently Used (MRU) list view records for Account object. Use when you need to retrieve recently accessed Account records. Note: This endpoint is deprecated and no longer updates. It is not part of the Services under your Main Services Agreement with Salesforce and is for evaluation purposes only, not for production use.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .array(z.string())
      .optional()
      .describe(
        "Additional fields queried for the records returned that don't create visible columns. If the field is not available to the user, an error occurs.",
      ),
    sortBy: z
      .string()
      .optional()
      .describe(
        "The API name of the field the list view is sorted by. If the name is preceded with '-', the sort order is descending. Example: 'CreatedDate' (ascending) or '-CreatedDate' (descending).",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'The number of list records viewed at one time. Default value is 50. Value can be 1-2000.',
      ),
    pageToken: z
      .string()
      .optional()
      .describe(
        'Token representing the page offset for pagination. Used to retrieve subsequent pages of results.',
      ),
    optionalFields: z
      .array(z.string())
      .optional()
      .describe(
        "Additional fields queried for the records returned that don't create visible columns. If the field is not available to the user, no error occurs and the field isn't included in the records.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    fields,
    sortBy,
    pageSize,
    pageToken,
    optionalFields,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/mru-list-records/Account`, {
      query: {
        fields: fields,
        sortBy: sortBy,
        pageSize: pageSize,
        pageToken: pageToken,
        optionalFields: optionalFields,
      },
    });
  },
});

export const salesforceGetUiApiRecordUi = tool({
  description:
    'Tool to retrieve layout, field metadata, and record data in a single response. Use when you need comprehensive information including UI layout configuration, object metadata, and actual record values with child relationships.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    modes: z
      .string()
      .optional()
      .describe(
        "Comma-separated access modes for the record. Valid values: 'Create' (for creating records), 'Edit' (for editing records), 'View' (for displaying records). Determines which fields to get from layout.",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('Number of child relationship records per page. Default: 5.'),
    recordIds: z
      .string()
      .describe(
        'Comma-separated list of up to 200 record IDs. All IDs must be from supported objects.',
      ),
    formFactor: z
      .enum(['Large', 'Medium', 'Small'])
      .optional()
      .describe(
        "Specifies device form factor. Valid values: 'Large' (desktop), 'Medium' (tablet), 'Small' (mobile phone).",
      ),
    layoutTypes: z
      .string()
      .optional()
      .describe(
        "Comma-separated layout types to return. Valid values: 'Compact' (key fields layout), 'Full' (full layout).",
      ),
    optionalFields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of additional field names to include in format ObjectApiName.FieldApiName. If field is accessible to user, it's included in response; otherwise silently omitted without error.",
      ),
    childRelationships: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of child relationships to include in format ObjectApiName.ChildRelationshipName (e.g., 'Account.Contacts,Account.Opportunities'). Child records are paginated with default pageSize of 5.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    modes,
    pageSize,
    recordIds,
    formFactor,
    layoutTypes,
    optionalFields,
    childRelationships,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/ui-api/record-ui/${recordIds}`, {
      query: {
        modes: modes,
        pageSize: pageSize,
        formFactor: formFactor,
        layoutTypes: layoutTypes,
        optionalFields: optionalFields,
        childRelationships: childRelationships,
      },
    });
  },
});

export const salesforceGetUiapiRelatedListPreferences = tool({
  description:
    'Tool to retrieve user preferences for a specific related list on an object. Use when you need to get display settings, column widths, or sort preferences for related lists in Salesforce UI.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    objectApiName: z
      .string()
      .describe(
        'The API name of the parent object whose related list preferences you want to retrieve.',
      ),
    relatedListId: z
      .string()
      .describe(
        'The API name of the related list for which you want to retrieve user preferences.',
      ),
  }),
  execute: async ({ salesforceCredentials, objectApiName, relatedListId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(
      salesforceCredentials,
      `/ui-api/related-list-preferences/${objectApiName}/${relatedListId}`,
    );
  },
});

export const salesforceUpdateListViewPreferences = tool({
  description:
    'Tool to update user preferences for a Salesforce list view including column widths, text wrapping, and display order. Use when you need to customize how columns appear in a list view.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    columnWrap: z
      .record(z.any())
      .optional()
      .describe(
        'Maps field API names to boolean values indicating whether text should wrap to multiple lines (true) or be truncated (false).',
      ),
    columnOrder: z
      .array(z.string())
      .optional()
      .describe('Defines the left-to-right display order of columns using field API names.'),
    columnWidths: z
      .record(z.any())
      .optional()
      .describe(
        'Maps field API names to their desired display widths in pixels. Only include columns you want to resize.',
      ),
    objectApiName: z
      .string()
      .describe("The API name of the Salesforce object (e.g., 'Account', 'Lead', 'Contact')."),
    listViewApiName: z
      .string()
      .describe("The API name of the specific list view (e.g., 'AllAccounts', 'MyLeads')."),
  }),
  execute: async ({
    salesforceCredentials,
    columnWrap,
    columnOrder,
    columnWidths,
    objectApiName,
    listViewApiName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPatch(
      salesforceCredentials,
      `/ui-api/list-info/${objectApiName}/${listViewApiName}/preferences`,
      { body: { columnWrap: columnWrap, columnOrder: columnOrder, columnWidths: columnWidths } },
    );
  },
});

export const salesforceUpdateRecord = tool({
  description:
    "Tool to update a record's data in Salesforce via UI API. Use when you need to modify field values on an existing record. Salesforce validation rules are enforced. Pass If-Unmodified-Since header to prevent conflicts.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .record(z.any())
      .describe(
        "Map of field API names to their new values. Only include fields you want to update. Field names should use API names (e.g., 'FirstName', 'Email', 'CustomField__c'). Unspecified fields remain unchanged.",
      ),
    recordId: z
      .string()
      .describe('The unique 15 or 18-character Salesforce ID of the record to update.'),
    ifUnmodifiedSince: z
      .string()
      .optional()
      .describe(
        "RFC 7231 date/time format. Makes the request conditional - server will only update if the record hasn't been modified since this timestamp. Returns 412 Precondition Failed if the record was modified after this date.",
      ),
  }),
  execute: async ({ salesforceCredentials, fields, recordId, ifUnmodifiedSince }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const extraHeaders = ifUnmodifiedSince ? { 'If-Unmodified-Since': ifUnmodifiedSince } : {};
    return sfPatch(salesforceCredentials, `/ui-api/records/${recordId}`, { body: fields });
  },
});

export const salesforceUpdateRelatedListPreferences = tool({
  description:
    'Tool to update user preferences for a specific related list on an object in Salesforce. Use when customizing display settings such as column widths, text wrapping, column ordering, and sorting preferences for related lists.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    orderedBy: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Array of sort preference objects defining field sorting order. Each object specifies a field and sort direction.',
      ),
    columnWrap: z
      .record(z.any())
      .optional()
      .describe(
        'Text wrapping preferences for columns, mapping field API names to boolean wrap settings. Set to true to enable text wrapping for that column, false to disable.',
      ),
    columnWidths: z
      .record(z.any())
      .optional()
      .describe(
        'User-defined column width preferences mapping field API names to pixel widths. Use this to customize how wide each column appears in the related list.',
      ),
    compositeLayoutName: z
      .string()
      .describe(
        'The composite layout name in format {objectApiName}.{relatedListId}. This identifies which related list on which object to update preferences for.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    orderedBy,
    columnWrap,
    columnWidths,
    compositeLayoutName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const parts = String(compositeLayoutName || '').split('.');
    if (parts.length !== 2)
      return { error: 'composite_layout_name must look like Account.Contacts.' };
    return sfPatch(
      salesforceCredentials,
      `/ui-api/related-list-preferences/${parts[0]}/${parts[1]}`,
      { body: { orderedBy: orderedBy, columnWrap: columnWrap, columnWidths: columnWidths } },
    );
  },
});
