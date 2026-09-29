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

export const hubspotArchiveCompanies = tool({
  description: 'Archives multiple HubSpot companies by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('A list of company objects, each specifying the ID of the company to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotArchiveCompany = tool({
  description:
    'Archives an existing company in HubSpot CRM by its `companyId`, moving it to a recycling bin from which it can be restored, rather than permanently deleting it.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    companyId: z
      .string()
      .describe(
        "The numeric identifier for the company to archive. Must contain only digits (e.g., '1234567890'). Do not use email addresses or other non-numeric identifiers.",
      ),
  }),
  execute: async ({ hubspotToken, companyId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/companies/${encodeURIComponent(String(companyId))}`,
    );
  },
});

export const hubspotBatchReadCompaniesByProperties = tool({
  description:
    'Batch-retrieves up to 100 HubSpot company records by their IDs in a single request. Supports custom ID properties (e.g., domain), selective property retrieval, and historical property values.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        'List of company identifiers to retrieve. Each `id` within an input object corresponds to the value of the property specified in `idProperty`.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'If true, returns only archived company records; otherwise (default), returns active, non-archived companies.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        'Property name to use as the unique identifier for companies in `inputs`. Defaults to `hs_object_id` (the HubSpot record ID) if not specified. Can be set to any unique company property configured in your HubSpot account.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Optional list of company property names to retrieve. If omitted, a default set of properties (name, domain, hs_object_id, createdate, hs_lastmodifieddate, etc.) is returned.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Optional list of company property names for which to retrieve historical values. If not provided, no historical data is returned.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/companies/batch/read`, {
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

export const hubspotCreateCompanies = tool({
  description: 'Creates multiple new HubSpot companies in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ properties: z.record(z.any()) }).catchall(z.any()))
      .describe(
        'A list of company objects to create. Each object represents one new company with its properties.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateCompany = tool({
  description: 'Creates a new HubSpot company.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    zip: z.string().optional().describe("Company's postal code."),
    city: z.string().optional().describe('City where the company is located.'),
    name: z.string().optional().describe('Company name.'),
    type: z.string().optional().describe('Type of company.'),
    phone: z.string().optional().describe("Company's primary phone number."),
    state: z.string().optional().describe('State or region where the company is located.'),
    domain: z.string().optional().describe("Company's primary domain name."),
    address: z.string().optional().describe('Company street address.'),
    country: z.string().optional().describe('Country where the company is located.'),
    website: z.string().optional().describe("Company's website URL."),
    aboutUs: z.string().optional().describe('Company description or about us information.'),
    address2: z
      .string()
      .optional()
      .describe('Additional address information (suite, floor, etc.).'),
    industry: z
      .string()
      .optional()
      .describe(
        "The type of business the company performs. Must be one of HubSpot's predefined industry enum values in SCREAMING_SNAKE_CASE (e.g., COMPUTER_SOFTWARE, FINANCIAL_SERVICES, HOSPITAL_HEALTH_CARE, RETAIL, BIOTECHNOLOGY). See HubSpot's company properties documentation for the full list of ~120 valid values.",
      ),
    timezone: z.string().optional().describe("Company's timezone."),
    isPublic: z.string().optional().describe('Whether the company is publicly traded.'),
    description: z.string().optional().describe('Brief description of the company.'),
    associations: z
      .array(
        z
          .object({ types: z.array(z.record(z.any())), to__id: z.string().optional() })
          .catchall(z.any()),
      )
      .optional()
      .describe('List of associations to create with other existing HubSpot objects.'),
    foundedYear: z.string().optional().describe('Year the company was founded.'),
    annualrevenue: z.string().optional().describe("Company's annual revenue."),
    lifecyclestage: z.string().optional().describe('Current lifecycle stage of the company.'),
    customProperties: z.record(z.any()).optional().describe('Custom properties for the company.'),
    numberofemployees: z.string().optional().describe('Number of employees in the company.'),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies`, {
      body: flatProps(input, {
        zip: 'zip',
        city: 'city',
        name: 'name',
        type: 'type',
        phone: 'phone',
        state: 'state',
        domain: 'domain',
        address: 'address',
        country: 'country',
        website: 'website',
        aboutUs: 'about_us',
        address2: 'address2',
        industry: 'industry',
        timezone: 'timezone',
        isPublic: 'is_public',
        description: 'description',
        foundedYear: 'founded_year',
        annualrevenue: 'annualrevenue',
        lifecyclestage: 'lifecyclestage',
        numberofemployees: 'numberofemployees',
      }),
    });
  },
});

export const hubspotDeleteCompanyGdpr = tool({
  description:
    'Permanently deletes a company (identified by objectId) and its associated data from HubSpot for GDPR compliance; this action is irreversible and requires the company to exist. GDPR deletion is permanent and irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z
      .string()
      .describe(
        "The unique identifier of the company to be permanently deleted. If `idProperty` is specified, this is the value of that custom unique property. Otherwise, this is the company's HubSpot Company ID.",
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        'Optional name of an alternate unique identifier property. If provided, objectId must be the value of this property for the company.',
      ),
  }),
  execute: async ({ hubspotToken, objectId, idProperty }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies/gdpr-delete`, {
      body: pickDefined({ objectId: objectId, idProperty: idProperty }),
    });
  },
});

export const hubspotGetCompany = tool({
  description: 'Retrieves a HubSpot company by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to true to include only archived companies; defaults to false (active companies).',
      ),
    companyId: z.string().describe('Unique HubSpot identifier for the company to retrieve.'),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Company property names to include in the response; if omitted, only default properties (name, domain, createdate, etc.) are returned. Use "all" to retrieve all properties, or specify individual property names. Accepts a list of strings or a JSON-stringified array (e.g., \'["name", "domain"]\').',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Object types (e.g., 'contacts', 'deals') to include associated object IDs in the response. Accepts a list of strings or a JSON-stringified array (e.g., '[\"contacts\", \"deals\"]').",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Property names for which to include current and historical values in the response. Accepts a list of strings or a JSON-stringified array.',
      ),
  }),
  execute: async ({
    hubspotToken,
    archived,
    companyId,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/objects/companies/${encodeURIComponent(String(companyId))}`,
      {
        query: pickDefined({
          archived: archived,
          properties: properties,
          associations: associations,
          propertiesWithHistory: propertiesWithHistory,
        }),
      },
    );
  },
});

export const hubspotListCompanies = tool({
  description: 'Retrieves a paginated list of HubSpot companies.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Pagination token from `paging.next.after` of a previous response, used to fetch the subsequent page. Omit for the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of companies to return per page, controlling pagination size (default: 10).',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Boolean flag to filter companies by archived status: `true` returns only archived companies; `false` (default) returns only active companies.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        "List of company property internal names to include in the response (e.g., 'name', 'domain'). If omitted, a default set of properties is returned.",
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "List of object types (e.g., 'contacts', 'deals') for which to retrieve associated IDs with each company.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        "List of property internal names for which to retrieve historical values (e.g., 'industry'). If no history exists for a property, only its current value is returned.",
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
    return hubGet(hubspotToken, `/crm/v3/objects/companies`, {
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

export const hubspotMergeCompanies = tool({
  description:
    'Merges two existing company records of the same type in HubSpot CRM, where `objectIdToMerge` is absorbed into `primaryObjectId`; this operation is irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe(
        'The ID of the company record that will be merged into the primary company record and subsequently deleted.',
      ),
    primaryObjectId: z
      .string()
      .describe(
        'The ID of the company record that will remain as the primary record after the merge, absorbing the information from the other company.',
      ),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotSearchCompanies = tool({
  description: 'Searches for HubSpot companies using flexible criteria and filters.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Pagination cursor; use `paging.next.after` from a previous response to fetch the next page.',
      ),
    limit: z.number().int().optional().describe('Maximum number of company records to return.'),
    query: z
      .string()
      .optional()
      .describe('String to search across default text properties of company records.'),
    sorts: z
      .array(
        z
          .object({ direction: z.enum(['ASCENDING', 'DESCENDING']), propertyName: z.string() })
          .catchall(z.any()),
      )
      .optional()
      .describe('List of sort objects to define the order of results. Maximum 1 sort allowed.'),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'HubSpot company property internal names to include in the response. Supports both standard properties and custom properties; a default set is returned if unspecified.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())).optional() }).catchall(z.any()))
      .optional()
      .describe('Groups of filters to apply to the ticket search.'),
    customProperties: z
      .array(z.string())
      .optional()
      .describe('Custom company property internal names to include in the response.'),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    query,
    sorts,
    properties,
    filterGroups,
    customProperties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after, customProperties }),
    });
  },
});

export const hubspotUpdateCompanies = tool({
  description: 'Updates multiple HubSpot companies in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z.object({ id: z.string(), properties: z.record(z.any()).optional() }).catchall(z.any()),
      )
      .describe(
        "List of company update operations, each specifying company 'id' and 'properties' with new values.",
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/companies/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});

export const hubspotUpdateCompany = tool({
  description: 'Updates properties for an existing HubSpot company.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    companyId: z
      .string()
      .describe(
        'Unique HubSpot identifier for the company to be updated. Can be provided as a string or number.',
      ),
    properties: z
      .record(z.any())
      .describe(
        "Company properties to update. Keys are internal HubSpot property names; use an empty string to clear a property. Common properties and their expected formats: 'name' (string), 'domain' (string, e.g., 'example.com'), 'phone' (string), 'website' (URL string), 'industry' (enum - must use HubSpot's predefined SCREAMING_SNAKE_CASE values, e.g., COMPUTER_SOFTWARE, FINANCIAL_SERVICES, HOSPITAL_HEALTH_CARE, RETAIL, BIOTECHNOLOGY; see HubSpot docs for the full list), 'annualrevenue' (numeric string only, e.g., '150000000' - do NOT include currency symbols, words, or text), 'numberofemployees' (numeric string, e.g., '500'), 'description' (string), 'city' (string), 'state' (string), 'country' (string), 'zip' (string). Read-only properties are ignored.",
      ),
  }),
  execute: async ({ hubspotToken, companyId, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/companies/${encodeURIComponent(String(companyId))}`,
      {
        body: { properties: properties ?? {} },
      },
    );
  },
});
