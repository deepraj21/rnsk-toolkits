// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceExecuteSoqlQuery = tool({
  description:
    "DEPRECATED: Use SALESFORCE_RUN_SOQL_QUERY instead. Executes the provided SOQL query against Salesforce; the query must begin with 'SELECT'.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    soqlQuery: z
      .string()
      .describe(
        "The SOQL (Salesforce Object Query Language) query to execute. Example: 'SELECT Id, Name, Email FROM Contact WHERE Name LIKE '%John%' LIMIT 10'. Make sure to follow SOQL syntax and escape single quotes properly. IMPORTANT - DateTime field fi",
      ),
  }),
  execute: async ({ salesforceCredentials, soqlQuery }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/query`, { query: { q: soqlQuery } });
  },
});

export const salesforceExecuteSoslSearch = tool({
  description:
    'Execute a SOSL search to search across multiple Salesforce objects. Use when you need to search for text across multiple object types simultaneously.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .describe(
        "SOSL search query string to execute. Must follow SOSL syntax with FIND clause. Special characters and spaces must be URL-encoded. Example: 'FIND {Acme} IN ALL FIELDS RETURNING Account(Name, Phone), Contact(FirstName, LastName)'",
      ),
  }),
  execute: async ({ salesforceCredentials, q }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/search`, { query: { q: q } });
  },
});

export const salesforcePostParameterizedSearch = tool({
  description:
    'Tool to execute parameterized search across Salesforce objects with advanced filtering. Use when you need to search for records using specific search terms with fine-grained control over which objects to search, which fields to return, and additional filtering criteria.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .describe(
        'The search string to search for across Salesforce objects. This is the primary search term used in the SOSL FIND clause.',
      ),
    searchIn: z
      .enum(['ALL', 'NAME', 'EMAIL', 'PHONE', 'SIDEBAR'])
      .optional()
      .describe(
        "Search scope specifying which fields to search. Valid values: 'ALL' (ALL FIELDS), 'NAME' (NAME FIELDS), 'EMAIL' (EMAIL FIELDS), 'PHONE' (PHONE FIELDS), 'SIDEBAR' (SIDEBAR FIELDS). Defaults to 'ALL'.",
      ),
    where: z
      .string()
      .optional()
      .describe(
        'Global WHERE clause applied to all sObjects (without the WHERE keyword). Uses standard SOQL WHERE clause syntax.',
      ),
    fields: z
      .array(z.string())
      .optional()
      .describe(
        "Default fields to return for all sObjects if not specified per object. Field API names like ['Id', 'Name', 'Email'].",
      ),
    sobjects: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Array of sObject specifications to limit search scope. Each object specifies which Salesforce object type to search and optional filters.',
      ),
    defaultLimit: z
      .number()
      .int()
      .optional()
      .describe(
        'Default limit per sObject when not specified in the sobjects array. Default is 25.',
      ),
    overallLimit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum total number of records to return across all sObjects. Default is 2000, maximum is 2000.',
      ),
    spellCorrection: z
      .boolean()
      .optional()
      .describe('Enable spell correction for search terms. Default is true.'),
  }),
  execute: async ({
    salesforceCredentials,
    q,
    searchIn,
    where,
    fields,
    sobjects,
    defaultLimit,
    overallLimit,
    spellCorrection,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/parameterizedSearch`, {
      body: {
        q: q,
        in: searchIn,
        where: where,
        fields: fields,
        sobjects: sobjects,
        defaultLimit: defaultLimit,
        overallLimit: overallLimit,
        spellCorrection: spellCorrection,
      },
    });
  },
});

export const salesforceQuery = tool({
  description:
    'DEPRECATED: Use SALESFORCE_RUN_SOQL_QUERY instead. Tool to execute SOQL queries against Salesforce. Use when you need to retrieve data from Salesforce objects using SOQL syntax. Returns up to 2000 records per request with pagination support via nextRecordsUrl.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .describe(
        "The SOQL query string to execute. Must be a valid SOQL statement (e.g., 'SELECT Name FROM Account'). The query will be automatically URL-encoded.",
      ),
  }),
  execute: async ({ salesforceCredentials, q }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/query`, { query: { q: q } });
  },
});

export const salesforceQueryAll = tool({
  description:
    'Tool to execute SOQL queries including soft-deleted and archived records. Use when you need to query records that have been deleted via merge or delete operations, or when accessing archived Task and Event records.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .describe(
        "The SOQL query to execute. Unlike standard queries, QueryAll includes soft-deleted records (from merge or delete operations) and archived Task/Event records. Example: 'SELECT Id, Name FROM Account WHERE IsDeleted = true'. Use standard SOQL ",
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/queryAll`, { query: { q: query } });
  },
});

export const salesforceQueryMore = tool({
  description:
    "Retrieve the next page of SOQL results using a query locator (GET /query/{queryLocator}). SOQL queries return at most ~2000 rows per response plus a nextRecordsUrl when more remain; this action follows that locator. Call it repeatedly, passing each response's nextRecordsUrl, until done=true. Without it, run_soql_query / query results beyond the first page are unreachable.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    nextRecordsUrl: z
      .string()
      .describe(
        "The nextRecordsUrl from a previous query / queryAll / run_soql_query response where done=false. Pass it exactly as returned — the relative path '/services/data/v<ver>/query/<locator>' (or '/queryAll/<locator>'). Call this action repeatedly,",
      ),
  }),
  execute: async ({ salesforceCredentials, nextRecordsUrl }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (!nextRecordsUrl || !nextRecordsUrl.startsWith('/services/data/'))
      return {
        error:
          'Invalid nextRecordsUrl. Pass the nextRecordsUrl value from a previous query response.',
      };
    return sfGet(salesforceCredentials, nextRecordsUrl);
  },
});

export const salesforceRunSoqlQuery = tool({
  description:
    'Executes a SOQL query against Salesforce data. Returns records matching the query with pagination support.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .describe(
        "SOQL query to execute. Must start with SELECT. Field names must match object schema exactly — use SALESFORCE_GET_ALL_FIELDS_FOR_OBJECT for unfamiliar objects. ALIASES: No 'AS' keyword (use 'SUM(Amount) TotalSales' NOT 'SUM(Amount) AS TotalS",
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceSearch = tool({
  description:
    'DEPRECATED: Use SALESFORCE_EXECUTE_SOSL_SEARCH instead. Executes a SOSL search query across multiple Salesforce objects. Use when you need to search for text across multiple object types simultaneously.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .describe(
        "URL-encoded SOSL search query string to execute. Must follow SOSL syntax with FIND clause. Example: 'FIND {Acme} IN ALL FIELDS RETURNING Account(Name, Phone), Contact(FirstName, LastName)'",
      ),
  }),
  execute: async ({ salesforceCredentials, q }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/search`, { query: { q: q } });
  },
});

export const salesforceToolingQuery = tool({
  description:
    'Tool to execute SOQL queries against Salesforce Tooling API metadata objects. Use when you need to query metadata components like ApexClass, ApexTrigger, ValidationRule, WorkflowRule, FieldDefinition, or EntityDefinition. The Tooling API exposes objects that use the external object framework and provides granular access to metadata components for development and deployment tasks.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .describe(
        "The SOQL query to execute against Tooling API metadata objects. Example: 'SELECT Id, Name FROM ApexClass LIMIT 10'. Can query metadata objects like ApexClass, ApexTrigger, ValidationRule, WorkflowRule, FieldDefinition, EntityDefinition, etc",
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/tooling/query`, { query: { q: query } });
  },
});
