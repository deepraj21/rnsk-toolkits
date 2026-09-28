// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceAccountCreationWithContentTypeOption = tool({
  description:
    "DEPRECATED: Creates a new Salesforce Account using a JSON POST request, requiring 'Name'; specific fields (e.g., custom, DunsNumber) may have org-level prerequisites.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .optional()
      .describe(
        'Unique identifier for the account (system-generated and read-only upon creation).',
      ),
    fax: z.string().optional().describe('Fax number for the account.'),
    sic: z
      .string()
      .optional()
      .describe(
        'Standard Industrial Classification (SIC) code (max 20 chars). For business accounts only.',
      ),
    name: z
      .string()
      .describe(
        'Name of the account (required, max 255 chars). For Person Accounts, this is a concatenated field from the associated contact and not directly modifiable.',
      ),
    site: z
      .string()
      .optional()
      .describe('Name of the account’s specific location or site (max 80 chars).'),
    type: z
      .string()
      .optional()
      .describe('Type of account, influencing categorization and behavior.'),
    phone: z.string().optional().describe('Primary phone number for the account (max 40 chars).'),
    jigsaw: z
      .string()
      .optional()
      .describe(
        'Data.com company ID reference (max 20 chars, API v22.0+). For business accounts. Read-only, do not modify.',
      ),
    rating: z.string().optional().describe('Prospect rating (picklist).'),
    SLA__c: z
      .string()
      .optional()
      .describe('Custom field for Service Level Agreement (SLA) type/details.'),
    ownerId: z
      .string()
      .optional()
      .describe(
        "ID of the Salesforce user owning this account. 'Transfer Record' permission may be needed to update if not the API user (API v16.0+).",
      ),
    sicDesc: z
      .string()
      .optional()
      .describe(
        'Description of line of business based on SIC code (max 80 chars). For business accounts only.',
      ),
    website: z.string().optional().describe('Website URL of the account (max 255 chars).'),
    industry: z
      .string()
      .optional()
      .describe('Primary industry of the account (picklist, max 40 chars).'),
    parentId: z
      .string()
      .optional()
      .describe('ID of the parent account for subsidiary or hierarchical relationships.'),
    photoUrl: z
      .string()
      .optional()
      .describe(
        'URL path for the social network profile image (read-only). Blank if Social Accounts and Contacts is not enabled for the user.',
      ),
    active__c: z.string().optional().describe('Custom field indicating if the account is active.'),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Indicates if the account is in the Recycle Bin (read-only).'),
    naicsCode: z
      .string()
      .optional()
      .describe(
        'NAICS code (6-digit industry classifier, max 8 chars). For business accounts. Requires Data.com Prospector/Clean.',
      ),
    naicsDesc: z
      .string()
      .optional()
      .describe(
        'Description of line of business based on NAICS code (max 120 chars). For business accounts. Requires Data.com Prospector/Clean.',
      ),
    ownership: z.string().optional().describe('Ownership structure (picklist).'),
    dunsNumber: z
      .string()
      .optional()
      .describe(
        'D-U-N-S number (9-digit identifier, max 9 chars). For business accounts. Requires Data.com Prospector/Clean.',
      ),
    tradestyle: z
      .string()
      .optional()
      .describe(
        "Organization's 'Doing Business As' (DBA) name (max 255 chars). For business accounts. Requires Data.com Prospector/Clean.",
      ),
    billingCity: z.string().optional().describe('City for the billing address (max 40 chars).'),
    cleanStatus: z.string().optional().describe('Data quality status compared with Data.com.'),
    createdById: z
      .string()
      .optional()
      .describe('ID of the user who created the account (read-only).'),
    createdDate: z.string().optional().describe('Date and time of account creation (read-only).'),
    description: z
      .string()
      .optional()
      .describe('Text description of the account (max 32,000 chars).'),
    yearStarted: z
      .string()
      .optional()
      .describe(
        'Year the organization was established (max 4 chars). For business accounts. Requires Data.com Prospector/Clean.',
      ),
    billingState: z
      .string()
      .optional()
      .describe('State or province for the billing address (max 80 chars).'),
    shippingCity: z.string().optional().describe('City for the shipping address (max 40 chars).'),
    tickerSymbol: z
      .string()
      .optional()
      .describe('Stock market ticker symbol (max 20 chars). For business accounts only.'),
    accountNumber: z
      .string()
      .optional()
      .describe('Account number assigned to this account (max 40 chars).'),
    accountSource: z
      .string()
      .optional()
      .describe(
        'Origin source of the account record (admin-defined picklist, values max 40 chars).',
      ),
    annualRevenue: z.number().int().optional().describe('Estimated annual revenue.'),
    billingStreet: z.string().optional().describe('Street address for the billing location.'),
    shippingState: z
      .string()
      .optional()
      .describe('State or province for the shipping address (max 80 chars).'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    billingCountry: z
      .string()
      .optional()
      .describe('Country for the billing address (max 80 chars).'),
    dandbCompanyId: z
      .string()
      .optional()
      .describe('Associated Dun & Bradstreet company ID for D&B integration (read-only).'),
    lastViewedDate: z
      .string()
      .optional()
      .describe('Timestamp of when current user last viewed this account record (read-only).'),
    masterRecordId: z
      .string()
      .optional()
      .describe('ID of the master record if this account was merged (read-only).'),
    shippingStreet: z
      .string()
      .optional()
      .describe('Street address for the shipping location (max 255 chars).'),
    systemModstamp: z
      .string()
      .optional()
      .describe('Timestamp of last modification by user or automated process (read-only).'),
    billingLatitude: z
      .number()
      .int()
      .optional()
      .describe('Latitude for the billing address (-90 to 90, up to 15 decimal places).'),
    jigsawCompanyId: z.string().optional().describe('Associated Data.com company ID (read-only).'),
    shippingCountry: z
      .string()
      .optional()
      .describe('Country for the shipping address (max 80 chars).'),
    attributes__url: z
      .string()
      .optional()
      .describe(
        'Internal Salesforce field: Relative API URL for this SObject record. System-set or read-only.',
      ),
    billingLongitude: z
      .number()
      .int()
      .optional()
      .describe('Longitude for the billing address (-180 to 180, up to 15 decimal places).'),
    lastActivityDate: z
      .string()
      .optional()
      .describe(
        'Most recent due date of an event or closed task associated with the record (read-only).',
      ),
    lastModifiedById: z
      .string()
      .optional()
      .describe('ID of the user who last modified the account (read-only).'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Date and time of last modification (read-only).'),
    operatingHoursId: z
      .string()
      .optional()
      .describe('ID of associated operating hours. Requires Salesforce Field Service.'),
    shippingLatitude: z
      .number()
      .int()
      .optional()
      .describe('Latitude for the shipping address (-90 to 90, up to 15 decimal places).'),
    attributes__type: z
      .string()
      .optional()
      .describe(
        "Internal Salesforce field: Type of the SObject (e.g., 'Account'). System-set or read-only.",
      ),
    billingPostalCode: z
      .string()
      .optional()
      .describe('Postal code for the billing address (max 20 chars).'),
    numberOfEmployees: z.number().int().optional().describe('Number of employees (max 8 digits).'),
    shippingLongitude: z
      .number()
      .int()
      .optional()
      .describe('Longitude for the shipping address (-180 to 180, up to 15 decimal places).'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        'Timestamp of when current user last accessed this record or related items (read-only).',
      ),
    SLASerialNumber__c: z.string().optional().describe('Custom field for SLA serial number.'),
    shippingPostalCode: z
      .string()
      .optional()
      .describe('Postal code for the shipping address (max 20 chars).'),
    customerPriority__c: z
      .string()
      .optional()
      .describe('Custom field for customer priority (e.g., High, Medium, Low).'),
    numberofLocations__c: z
      .number()
      .int()
      .optional()
      .describe('Custom field for the number of physical locations.'),
    SLAExpirationDate__c: z.string().optional().describe('Custom field for SLA expiration date.'),
    upsellOpportunity__c: z
      .string()
      .optional()
      .describe('Custom field indicating upsell opportunity potential.'),
    billingGeocodeAccuracy: z
      .string()
      .optional()
      .describe('Accuracy level of the geocode for the billing address.'),
    shippingGeocodeAccuracy: z
      .string()
      .optional()
      .describe('Accuracy level of the geocode for the shipping address.'),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    fax,
    sic,
    name,
    site,
    type,
    phone,
    jigsaw,
    rating,
    SLA__c,
    ownerId,
    sicDesc,
    website,
    industry,
    parentId,
    photoUrl,
    active__c,
    isDeleted,
    naicsCode,
    naicsDesc,
    ownership,
    dunsNumber,
    tradestyle,
    billingCity,
    cleanStatus,
    createdById,
    createdDate,
    description,
    yearStarted,
    billingState,
    shippingCity,
    tickerSymbol,
    accountNumber,
    accountSource,
    annualRevenue,
    billingStreet,
    shippingState,
    customFields,
    billingCountry,
    dandbCompanyId,
    lastViewedDate,
    masterRecordId,
    shippingStreet,
    systemModstamp,
    billingLatitude,
    jigsawCompanyId,
    shippingCountry,
    attributes__url,
    billingLongitude,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    operatingHoursId,
    shippingLatitude,
    attributes__type,
    billingPostalCode,
    numberOfEmployees,
    shippingLongitude,
    lastReferencedDate,
    SLASerialNumber__c,
    shippingPostalCode,
    customerPriority__c,
    numberofLocations__c,
    SLAExpirationDate__c,
    upsellOpportunity__c,
    billingGeocodeAccuracy,
    shippingGeocodeAccuracy,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Account`, {
      body: {
        Id: id,
        Fax: fax,
        Sic: sic,
        Name: name,
        Site: site,
        Type: type,
        Phone: phone,
        Jigsaw: jigsaw,
        Rating: rating,
        SLA__c: SLA__c,
        OwnerId: ownerId,
        SicDesc: sicDesc,
        Website: website,
        Industry: industry,
        ParentId: parentId,
        PhotoUrl: photoUrl,
        Active__c: active__c,
        IsDeleted: isDeleted,
        NaicsCode: naicsCode,
        NaicsDesc: naicsDesc,
        Ownership: ownership,
        DunsNumber: dunsNumber,
        Tradestyle: tradestyle,
        BillingCity: billingCity,
        CleanStatus: cleanStatus,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        YearStarted: yearStarted,
        BillingState: billingState,
        ShippingCity: shippingCity,
        TickerSymbol: tickerSymbol,
        AccountNumber: accountNumber,
        AccountSource: accountSource,
        AnnualRevenue: annualRevenue,
        BillingStreet: billingStreet,
        ShippingState: shippingState,
        ...customSpread,
        BillingCountry: billingCountry,
        DandbCompanyId: dandbCompanyId,
        LastViewedDate: lastViewedDate,
        MasterRecordId: masterRecordId,
        ShippingStreet: shippingStreet,
        SystemModstamp: systemModstamp,
        BillingLatitude: billingLatitude,
        JigsawCompanyId: jigsawCompanyId,
        ShippingCountry: shippingCountry,
        attributes__url: attributes__url,
        BillingLongitude: billingLongitude,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        OperatingHoursId: operatingHoursId,
        ShippingLatitude: shippingLatitude,
        attributes__type: attributes__type,
        BillingPostalCode: billingPostalCode,
        NumberOfEmployees: numberOfEmployees,
        ShippingLongitude: shippingLongitude,
        LastReferencedDate: lastReferencedDate,
        SLASerialNumber__c: SLASerialNumber__c,
        ShippingPostalCode: shippingPostalCode,
        CustomerPriority__c: customerPriority__c,
        NumberofLocations__c: numberofLocations__c,
        SLAExpirationDate__c: SLAExpirationDate__c,
        UpsellOpportunity__c: upsellOpportunity__c,
        BillingGeocodeAccuracy: billingGeocodeAccuracy,
        ShippingGeocodeAccuracy: shippingGeocodeAccuracy,
      },
    });
  },
});

export const salesforceCreateAccount = tool({
  description:
    "Creates a new account in Salesforce with the specified information. Returns the created Account's ID at `data.response_data.id`.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fax: z.string().optional().describe('Fax number.'),
    name: z.string().describe('Account name (required field in Salesforce).'),
    type: z.string().optional().describe('Type of account.'),
    phone: z.string().optional().describe('Main phone number.'),
    website: z.string().optional().describe('Company website URL.'),
    industry: z.string().optional().describe('Industry the account belongs to.'),
    sicDesc: z
      .string()
      .optional()
      .describe('Standard Industrial Classification (SIC) description.'),
    parentId: z
      .string()
      .optional()
      .describe(
        'ID of the parent account if this is a subsidiary. Must be a valid Salesforce Account Id (15- or 18-character).',
      ),
    description: z.string().optional().describe('Text description of the account.'),
    billingCity: z.string().optional().describe('Billing address city.'),
    billingState: z
      .string()
      .optional()
      .describe(
        "Billing address state/province. For US/Canada addresses, use full state/province names (e.g., 'California', 'New York', 'Ontario') or abbreviations ('CA', 'NY') which are auto-converted. For other countries, leave empty unless you know the ",
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Custom fields to set on the account. Use Salesforce API field names (e.g., 'Level__c', 'Languages__c'). Values can be strings, numbers, booleans, or null.",
      ),
    shippingCity: z.string().optional().describe('Shipping address city.'),
    accountSource: z.string().optional().describe('Source of the account.'),
    annualRevenue: z.number().optional().describe('Estimated annual revenue.'),
    billingStreet: z.string().optional().describe('Billing address street.'),
    shippingState: z
      .string()
      .optional()
      .describe(
        "Shipping address state/province. For US/Canada addresses, use full state/province names (e.g., 'California', 'New York', 'Ontario') or abbreviations ('CA', 'NY') which are auto-converted. For other countries, leave empty unless you know the",
      ),
    billingCountry: z.string().optional().describe('Billing address country.'),
    shippingStreet: z.string().optional().describe('Shipping address street.'),
    shippingCountry: z.string().optional().describe('Shipping address country.'),
    billingPostalCode: z.string().optional().describe('Billing address postal/zip code.'),
    numberOfEmployees: z.number().int().optional().describe('Number of employees.'),
    shippingPostalCode: z.string().optional().describe('Shipping address postal/zip code.'),
  }),
  execute: async ({
    salesforceCredentials,
    fax,
    name,
    type,
    phone,
    website,
    industry,
    sicDesc,
    parentId,
    description,
    billingCity,
    billingState,
    customFields,
    shippingCity,
    accountSource,
    annualRevenue,
    billingStreet,
    shippingState,
    billingCountry,
    shippingStreet,
    shippingCountry,
    billingPostalCode,
    numberOfEmployees,
    shippingPostalCode,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Account`, {
      body: {
        fax: fax,
        name: name,
        type: type,
        phone: phone,
        website: website,
        industry: industry,
        SicDesc: sicDesc,
        ParentId: parentId,
        description: description,
        BillingCity: billingCity,
        BillingState: billingState,
        ...customSpread,
        ShippingCity: shippingCity,
        AccountSource: accountSource,
        AnnualRevenue: annualRevenue,
        BillingStreet: billingStreet,
        ShippingState: shippingState,
        BillingCountry: billingCountry,
        ShippingStreet: shippingStreet,
        ShippingCountry: shippingCountry,
        BillingPostalCode: billingPostalCode,
        NumberOfEmployees: numberOfEmployees,
        ShippingPostalCode: shippingPostalCode,
      },
    });
  },
});

export const salesforceDeleteAccount = tool({
  description: 'Permanently deletes an account from Salesforce. This action cannot be undone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    accountId: z.string().describe('The Salesforce ID of the account to delete.'),
  }),
  execute: async ({ salesforceCredentials, accountId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Account/${accountId}`);
  },
});

export const salesforceFetchAccountByIdWithQuery = tool({
  description:
    'DEPRECATED: Use this action to retrieve a Salesforce Account by its unique ID, which must be a valid and existing Salesforce Account ID; you can optionally specify a comma-delimited list of fields to return.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('Unique identifier (ID) of the Salesforce Account to retrieve.'),
    fields: z
      .string()
      .optional()
      .describe(
        "Optional comma-delimited list of Account field names to retrieve (e.g., 'Name,BillingCity,Industry'). If unspecified, null, or empty, all accessible Account fields are returned.",
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Account/${id}`, { query: { fields: fields } });
  },
});

export const salesforceGetAccount = tool({
  description:
    'Retrieves a specific account by ID from Salesforce, returning all available fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    accountId: z.string().describe('The Salesforce ID of the account to retrieve.'),
  }),
  execute: async ({ salesforceCredentials, accountId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Account/${accountId}`);
  },
});

export const salesforceListAccounts = tool({
  description:
    'Lists accounts from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Results paginate via nextRecordsUrl with up to ~2000 rows per page. REQUEST_LIMIT_EXCEEDED requires exponential backoff; INVALID_FIELD or INSUFFICIENT_ACCESS_OR_READONLY errors indicate profile or field-level restrictions — simplify SELECT/WHERE clauses.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch accounts. Use standard SOQL syntax to filter, sort, and limit results. Always include WHERE and LIMIT clauses to avoid oversized responses. Avoid FIELDS(ALL) without LIMIT. Website and Phone are frequently null; avoid fi',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, Name, Type, Industry, Phone, Website, BillingCity, ShippingCity, AnnualRevenue, NumberOfEmployees FROM Account';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceRemoveAccountByUniqueIdentifier = tool({
  description:
    'DEPRECATED: Deletes an existing Salesforce Account using its unique ID, returning an empty response on success (HTTP 204).',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('Unique Salesforce Account ID (typically 15 or 18 characters).'),
  }),
  execute: async ({ salesforceCredentials, id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Account/${id}`);
  },
});

export const salesforceRetrieveAccountDataAndErrorResponses = tool({
  description:
    'DEPRECATED: Retrieves comprehensive metadata for the Salesforce Account sObject, detailing its properties, recent records, and related resource URLs.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Account`);
  },
});

export const salesforceUpdateAccount = tool({
  description:
    'Updates an existing account in Salesforce with the specified changes. Only provided fields will be updated.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fax: z.string().optional().describe('Updated fax number. Leave empty to keep unchanged.'),
    name: z.string().optional().describe('Updated account name. Leave empty to keep unchanged.'),
    type: z.string().optional().describe('Updated account type. Leave empty to keep unchanged.'),
    phone: z.string().optional().describe('Updated phone number. Leave empty to keep unchanged.'),
    website: z.string().optional().describe('Updated website URL. Leave empty to keep unchanged.'),
    industry: z.string().optional().describe('Updated industry. Leave empty to keep unchanged.'),
    sicDesc: z
      .string()
      .optional()
      .describe('Updated SIC description. Leave empty to keep unchanged.'),
    parentId: z
      .string()
      .optional()
      .describe('Updated parent account ID. Leave empty to keep unchanged.'),
    accountId: z.string().describe('The Salesforce ID of the account to update.'),
    description: z
      .string()
      .optional()
      .describe('Updated description. Leave empty to keep unchanged.'),
    billingCity: z
      .string()
      .optional()
      .describe('Updated billing city. Leave empty to keep unchanged.'),
    billingState: z
      .string()
      .optional()
      .describe(
        "Updated billing state. Leave empty to keep unchanged. If your org has State and Country/Territory picklists enabled, provide the exact picklist value (e.g., 'California' instead of 'CA').",
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Level__c', 'Languages__c'). Values can be strings, numbers, booleans, or null depending on the field type.",
      ),
    shippingCity: z
      .string()
      .optional()
      .describe('Updated shipping city. Leave empty to keep unchanged.'),
    accountSource: z
      .string()
      .optional()
      .describe('Updated account source. Leave empty to keep unchanged.'),
    annualRevenue: z
      .number()
      .optional()
      .describe('Updated annual revenue. Leave empty to keep unchanged.'),
    billingStreet: z
      .string()
      .optional()
      .describe('Updated billing street. Leave empty to keep unchanged.'),
    shippingState: z
      .string()
      .optional()
      .describe('Updated shipping state. Leave empty to keep unchanged.'),
    billingCountry: z
      .string()
      .optional()
      .describe(
        "Updated billing country. Leave empty to keep unchanged. If your org has State and Country/Territory picklists enabled, provide the exact picklist value (e.g., 'United States' instead of 'USA').",
      ),
    shippingStreet: z
      .string()
      .optional()
      .describe('Updated shipping street. Leave empty to keep unchanged.'),
    shippingCountry: z
      .string()
      .optional()
      .describe('Updated shipping country. Leave empty to keep unchanged.'),
    billingPostalCode: z
      .string()
      .optional()
      .describe('Updated billing postal code. Leave empty to keep unchanged.'),
    numberOfEmployees: z
      .number()
      .int()
      .optional()
      .describe('Updated number of employees. Leave empty to keep unchanged.'),
    shippingPostalCode: z
      .string()
      .optional()
      .describe('Updated shipping postal code. Leave empty to keep unchanged.'),
  }),
  execute: async ({
    salesforceCredentials,
    fax,
    name,
    type,
    phone,
    website,
    industry,
    sicDesc,
    parentId,
    accountId,
    description,
    billingCity,
    billingState,
    customFields,
    shippingCity,
    accountSource,
    annualRevenue,
    billingStreet,
    shippingState,
    billingCountry,
    shippingStreet,
    shippingCountry,
    billingPostalCode,
    numberOfEmployees,
    shippingPostalCode,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      fax: fax,
      name: name,
      type: type,
      phone: phone,
      website: website,
      industry: industry,
      SicDesc: sicDesc,
      ParentId: parentId,
      description: description,
      BillingCity: billingCity,
      BillingState: billingState,
      ...customSpread,
      ShippingCity: shippingCity,
      AccountSource: accountSource,
      AnnualRevenue: annualRevenue,
      BillingStreet: billingStreet,
      ShippingState: shippingState,
      BillingCountry: billingCountry,
      ShippingStreet: shippingStreet,
      ShippingCountry: shippingCountry,
      BillingPostalCode: billingPostalCode,
      NumberOfEmployees: numberOfEmployees,
      ShippingPostalCode: shippingPostalCode,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Account/${accountId}`, { body: sfBody });
  },
});

export const salesforceUpdateAccountObjectById = tool({
  description:
    'DEPRECATED: Updates specified fields of an existing Salesforce Account object identified by its unique ID; field names are case-sensitive and read-only fields are ignored.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        "Unique identifier (ID) of the Account object to be updated (e.g., '001R0000005hDFYIA2').",
      ),
    fax: z.string().optional().describe('Fax number (max 40 chars).'),
    sic: z.string().optional().describe('SIC code for business accounts (max 20 chars).'),
    name: z
      .string()
      .optional()
      .describe(
        'Name of the account (max 255 chars). For Person Accounts, this is a concatenated field (FirstName, MiddleName, LastName, Suffix) and not directly modifiable here.',
      ),
    site: z
      .string()
      .optional()
      .describe('Account site/location name (e.g., Headquarters, max 80 chars).'),
    type: z.string().optional().describe('Type of account (picklist).'),
    phone: z.string().optional().describe('Primary phone number (max 40 chars).'),
    jigsaw: z
      .string()
      .optional()
      .describe(
        'Data.com (Jigsaw) company ID reference (max 20 chars). Typically managed by Data.com integration.',
      ),
    rating: z.string().optional().describe('Account prospect rating (picklist).'),
    SLA__c: z
      .string()
      .optional()
      .describe('Custom field: Service Level Agreement (SLA) information.'),
    ownerId: z
      .string()
      .optional()
      .describe(
        'ID of the user owning this account. Defaults to current user on creation. Requires permission to change.',
      ),
    sicDesc: z
      .string()
      .optional()
      .describe('SIC code description for business accounts (max 80 chars).'),
    website: z
      .string()
      .optional()
      .describe('Account website (fully qualified URL, max 255 chars).'),
    industry: z.string().optional().describe('Primary industry (picklist, max 40 chars).'),
    parentId: z.string().optional().describe('ID of the parent account, if any.'),
    photoUrl: z
      .string()
      .optional()
      .describe('Path for social network profile image URL. Typically read-only.'),
    active__c: z.string().optional().describe('Custom field: Indicates if the account is active.'),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Indicates if the object is in the Recycle Bin. Typically read-only for updates.'),
    naicsCode: z
      .string()
      .optional()
      .describe(
        'NAICS code for business accounts (6 digits, max 8 chars total). Typically requires Data.com.',
      ),
    naicsDesc: z
      .string()
      .optional()
      .describe(
        'NAICS code description for business accounts (max 120 chars). Typically requires Data.com.',
      ),
    ownership: z.string().optional().describe('Ownership type (picklist).'),
    dunsNumber: z
      .string()
      .optional()
      .describe('D-U-N-S number for business accounts (9 digits). Typically requires Data.com.'),
    tradestyle: z
      .string()
      .optional()
      .describe(
        "Tradestyle or 'DBA' name for business accounts (max 255 chars). Typically requires Data.com.",
      ),
    billingCity: z.string().optional().describe('Billing city (max 40 chars).'),
    cleanStatus: z
      .string()
      .optional()
      .describe(
        'Data quality status compared with Data.com (e.g., Matched, Pending). Typically managed by Data.com Clean.',
      ),
    createdById: z
      .string()
      .optional()
      .describe('ID of the user who created the account (read-only).'),
    createdDate: z.string().optional().describe('Creation date and time (read-only).'),
    description: z
      .string()
      .optional()
      .describe('Text description (max 32,000 chars; 255 in reports).'),
    yearStarted: z
      .string()
      .optional()
      .describe(
        'Year organization was established for business accounts (4 chars). Typically requires Data.com.',
      ),
    billingState: z.string().optional().describe('Billing state/province (max 80 chars).'),
    shippingCity: z.string().optional().describe('Shipping city (max 40 chars).'),
    tickerSymbol: z
      .string()
      .optional()
      .describe('Stock market symbol for business accounts (max 20 chars).'),
    accountNumber: z
      .string()
      .optional()
      .describe('Account number (not the system ID, max 40 chars).'),
    accountSource: z
      .string()
      .optional()
      .describe('Source of the account record (picklist, max 40 chars).'),
    annualRevenue: z.number().int().optional().describe('Estimated annual revenue.'),
    billingStreet: z.string().optional().describe('Billing street address.'),
    shippingState: z.string().optional().describe('Shipping state/province (max 80 chars).'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    billingCountry: z.string().optional().describe('Billing country (max 80 chars).'),
    dandbCompanyId: z
      .string()
      .optional()
      .describe('D&B Company ID for Dun & Bradstreet integration (typically read-only).'),
    lastViewedDate: z
      .string()
      .optional()
      .describe('Timestamp of last view by current user (read-only).'),
    masterRecordId: z
      .string()
      .optional()
      .describe(
        'ID of the master record if this account was merged and deleted; null otherwise. Typically read-only.',
      ),
    shippingStreet: z.string().optional().describe('Shipping street address (max 255 chars).'),
    systemModstamp: z.string().optional().describe('System modification timestamp (read-only).'),
    billingLatitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Latitude for billing address (-90 to 90, up to 15 decimal places). Part of BillingAddress compound field.',
      ),
    jigsawCompanyId: z
      .string()
      .optional()
      .describe('Jigsaw company ID (read-only, for Data.com integration).'),
    shippingCountry: z.string().optional().describe('Shipping country (max 80 chars).'),
    attributes__url: z
      .string()
      .optional()
      .describe('URL for the Salesforce SObject. Read-only, ignored in updates.'),
    billingLongitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Longitude for billing address (-180 to 180, up to 15 decimal places). Part of BillingAddress compound field.',
      ),
    lastActivityDate: z.string().optional().describe('Most recent activity date (read-only).'),
    lastModifiedById: z
      .string()
      .optional()
      .describe('ID of the user who last modified the account (read-only).'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Last modification date and time (read-only).'),
    operatingHoursId: z
      .string()
      .optional()
      .describe(
        'ID of operating hours associated with the account. Requires Field Service to be enabled.',
      ),
    shippingLatitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Latitude for shipping address (-90 to 90, up to 15 decimal places). Part of ShippingAddress compound field.',
      ),
    attributes__type: z
      .string()
      .optional()
      .describe("Salesforce SObject type (e.g., 'Account'). Read-only, ignored in updates."),
    billingPostalCode: z.string().optional().describe('Billing postal code (max 20 chars).'),
    numberOfEmployees: z.number().int().optional().describe('Number of employees (max 8 digits).'),
    shippingLongitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Longitude for shipping address (-180 to 180, up to 15 decimal places). Part of ShippingAddress compound field.',
      ),
    lastReferencedDate: z
      .string()
      .optional()
      .describe('Timestamp of last access by current user (read-only).'),
    SLASerialNumber__c: z.string().optional().describe('Custom field: SLA serial number.'),
    shippingPostalCode: z.string().optional().describe('Shipping postal code (max 20 chars).'),
    customerPriority__c: z.string().optional().describe('Custom field: Customer priority.'),
    numberofLocations__c: z
      .number()
      .int()
      .optional()
      .describe('Custom field: Number of locations for the account.'),
    SLAExpirationDate__c: z.string().optional().describe('Custom field: SLA expiration date.'),
    upsellOpportunity__c: z
      .string()
      .optional()
      .describe('Custom field: Potential upsell opportunities.'),
    billingGeocodeAccuracy: z
      .string()
      .optional()
      .describe('Geocode accuracy for billing address. Part of BillingAddress compound field.'),
    shippingGeocodeAccuracy: z
      .string()
      .optional()
      .describe('Geocode accuracy for shipping address. Part of ShippingAddress compound field.'),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    fax,
    sic,
    name,
    site,
    type,
    phone,
    jigsaw,
    rating,
    SLA__c,
    ownerId,
    sicDesc,
    website,
    industry,
    parentId,
    photoUrl,
    active__c,
    isDeleted,
    naicsCode,
    naicsDesc,
    ownership,
    dunsNumber,
    tradestyle,
    billingCity,
    cleanStatus,
    createdById,
    createdDate,
    description,
    yearStarted,
    billingState,
    shippingCity,
    tickerSymbol,
    accountNumber,
    accountSource,
    annualRevenue,
    billingStreet,
    shippingState,
    customFields,
    billingCountry,
    dandbCompanyId,
    lastViewedDate,
    masterRecordId,
    shippingStreet,
    systemModstamp,
    billingLatitude,
    jigsawCompanyId,
    shippingCountry,
    attributes__url,
    billingLongitude,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    operatingHoursId,
    shippingLatitude,
    attributes__type,
    billingPostalCode,
    numberOfEmployees,
    shippingLongitude,
    lastReferencedDate,
    SLASerialNumber__c,
    shippingPostalCode,
    customerPriority__c,
    numberofLocations__c,
    SLAExpirationDate__c,
    upsellOpportunity__c,
    billingGeocodeAccuracy,
    shippingGeocodeAccuracy,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Account/${id}`, {
      body: {
        Fax: fax,
        Sic: sic,
        Name: name,
        Site: site,
        Type: type,
        Phone: phone,
        Jigsaw: jigsaw,
        Rating: rating,
        SLA__c: SLA__c,
        OwnerId: ownerId,
        SicDesc: sicDesc,
        Website: website,
        Industry: industry,
        ParentId: parentId,
        PhotoUrl: photoUrl,
        Active__c: active__c,
        IsDeleted: isDeleted,
        NaicsCode: naicsCode,
        NaicsDesc: naicsDesc,
        Ownership: ownership,
        DunsNumber: dunsNumber,
        Tradestyle: tradestyle,
        BillingCity: billingCity,
        CleanStatus: cleanStatus,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        YearStarted: yearStarted,
        BillingState: billingState,
        ShippingCity: shippingCity,
        TickerSymbol: tickerSymbol,
        AccountNumber: accountNumber,
        AccountSource: accountSource,
        AnnualRevenue: annualRevenue,
        BillingStreet: billingStreet,
        ShippingState: shippingState,
        ...customSpread,
        BillingCountry: billingCountry,
        DandbCompanyId: dandbCompanyId,
        LastViewedDate: lastViewedDate,
        MasterRecordId: masterRecordId,
        ShippingStreet: shippingStreet,
        SystemModstamp: systemModstamp,
        BillingLatitude: billingLatitude,
        JigsawCompanyId: jigsawCompanyId,
        ShippingCountry: shippingCountry,
        attributes__url: attributes__url,
        BillingLongitude: billingLongitude,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        OperatingHoursId: operatingHoursId,
        ShippingLatitude: shippingLatitude,
        attributes__type: attributes__type,
        BillingPostalCode: billingPostalCode,
        NumberOfEmployees: numberOfEmployees,
        ShippingLongitude: shippingLongitude,
        LastReferencedDate: lastReferencedDate,
        SLASerialNumber__c: SLASerialNumber__c,
        ShippingPostalCode: shippingPostalCode,
        CustomerPriority__c: customerPriority__c,
        NumberofLocations__c: numberofLocations__c,
        SLAExpirationDate__c: SLAExpirationDate__c,
        UpsellOpportunity__c: upsellOpportunity__c,
        BillingGeocodeAccuracy: billingGeocodeAccuracy,
        ShippingGeocodeAccuracy: shippingGeocodeAccuracy,
      },
    });
  },
});
