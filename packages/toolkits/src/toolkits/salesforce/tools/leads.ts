// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceCreateLead = tool({
  description:
    'Creates a new lead in Salesforce. `LastName` and `Company` are required. Org-level validation rules (e.g., email format, custom required fields) may reject requests beyond these; inspect the error response body for the failing field. The created lead `id` is returned in a response wrapper, not at the top level.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    city: z.string().optional().describe("Lead's city."),
    email: z.string().optional().describe("Lead's email address."),
    phone: z.string().optional().describe("Lead's phone number."),
    state: z.string().optional().describe("Lead's state/province."),
    title: z.string().optional().describe("Lead's job title. Maximum length is 128 characters."),
    rating: z.string().optional().describe('Lead rating.'),
    status: z.string().optional().describe('Lead status.'),
    street: z.string().optional().describe("Lead's street address."),
    company: z
      .string()
      .describe("Lead's company name. Required - must be provided to create a lead."),
    country: z.string().optional().describe("Lead's country."),
    website: z.string().optional().describe("Lead's company website."),
    industry: z.string().optional().describe("Lead's industry."),
    lastName: z
      .string()
      .describe("Lead's last name. Required - must be provided to create a lead."),
    firstName: z.string().optional().describe("Lead's first name."),
    leadSource: z.string().optional().describe('Source of the lead.'),
    postalCode: z.string().optional().describe("Lead's postal/zip code."),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Level__c', 'Languages__c'). Use this to set any custom fields defined in your Salesforce org.",
      ),
    annualRevenue: z.number().optional().describe("Lead's company annual revenue."),
    allowDuplicates: z
      .boolean()
      .optional()
      .describe(
        'When True, allows creating duplicate leads even if Salesforce duplicate detection rules are triggered. When False (default), creation fails if duplicates are detected and returns duplicate information in the response.',
      ),
    numberOfEmployees: z
      .number()
      .int()
      .optional()
      .describe("Number of employees at lead's company."),
  }),
  execute: async ({
    salesforceCredentials,
    city,
    email,
    phone,
    state,
    title,
    rating,
    status,
    street,
    company,
    country,
    website,
    industry,
    lastName,
    firstName,
    leadSource,
    postalCode,
    customFields,
    annualRevenue,
    allowDuplicates,
    numberOfEmployees,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const extraHeaders = allowDuplicates
      ? { 'Sforce-Duplicate-Rule-Header': 'allowSave=true' }
      : {};
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Lead`, {
      body: {
        City: city,
        Email: email,
        Phone: phone,
        State: state,
        Title: title,
        Rating: rating,
        Status: status,
        Street: street,
        Company: company,
        Country: country,
        Website: website,
        Industry: industry,
        LastName: lastName,
        FirstName: firstName,
        LeadSource: leadSource,
        PostalCode: postalCode,
        ...customSpread,
        AnnualRevenue: annualRevenue,
        NumberOfEmployees: numberOfEmployees,
      },
      headers: { ...extraHeaders },
    });
  },
});

export const salesforceCreateLeadWithSpecifiedContentType = tool({
  description:
    'DEPRECATED: Creates a new Lead in Salesforce, requiring `LastName` and `Company` unless person accounts are enabled and `Company` is null.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    city: z.string().optional().describe('City for the address.'),
    email: z.string().optional().describe('Email address.'),
    phone: z.string().optional().describe('Primary phone number.'),
    state: z.string().optional().describe('State or province for the address.'),
    title: z.string().optional().describe('Title (e.g., CFO, CEO; up to 128 characters).'),
    jigsaw: z
      .string()
      .optional()
      .describe(
        'Data.com contact ID (max 20 chars). Indicates Data.com import. Do not modify; for import troubleshooting.',
      ),
    rating: z.string().optional().describe('Rating (e.g., Hot, Warm, Cold).'),
    status: z
      .string()
      .optional()
      .describe(
        'Current status (e.g., Open, Contacted). Defined in LeadStatus object in Salesforce setup.',
      ),
    street: z.string().optional().describe('Street address.'),
    company: z
      .string()
      .describe(
        'Company name (up to 255 characters). If person accounts are enabled and this is null, lead converts to a person account.',
      ),
    country: z.string().optional().describe('Country for the address.'),
    ownerId: z
      .string()
      .optional()
      .describe(
        "ID of the owner (must be a valid 15 or 18-character Salesforce User ID starting with '005', e.g., '005XXXXXXXXXXXXXXX'). Omit or set to null to assign to the current user. The string 'me' is automatically converted to null to use the defaul",
      ),
    website: z.string().optional().describe('Website URL.'),
    industry: z.string().optional().describe("Primary industry of the lead's company."),
    lastName: z.string().describe('Last name of the lead (up to 80 characters).'),
    photoUrl: z
      .string()
      .optional()
      .describe(
        'Path for social network profile image URL; used with Salesforce instance URL. Empty if Social Accounts/Contacts disabled.',
      ),
    firstName: z.string().optional().describe('First name (up to 40 characters).'),
    isDeleted: z
      .boolean()
      .optional()
      .describe(
        'Indicates if the lead is in the Recycle Bin (true) or not (false). Salesforce defaults to false if this field is omitted.',
      ),
    leadSource: z
      .enum(['Web', 'Other', 'Phone Inquiry', 'Partner Referral', 'Purchased List'])
      .optional()
      .describe('Source of the lead.'),
    postalCode: z.string().optional().describe('Postal or ZIP code for the address.'),
    primary__c: z
      .string()
      .optional()
      .describe('Custom field, possibly indicates if primary contact/lead.'),
    SICCode__c: z
      .string()
      .optional()
      .describe('Custom field for Standard Industrial Classification (SIC) code.'),
    salutation: z
      .enum(['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'])
      .optional()
      .describe('Salutation for the lead.'),
    cleanStatus: z
      .string()
      .optional()
      .describe(
        "Record's clean status compared with Data.com (e.g., Matched, Different, Pending).",
      ),
    createdById: z
      .string()
      .optional()
      .describe('ID of user who created this. System-generated, read-only.'),
    createdDate: z.string().optional().describe('Creation timestamp. System-generated, read-only.'),
    description: z.string().optional().describe('Description (up to 32,000 characters).'),
    isConverted: z
      .boolean()
      .optional()
      .describe(
        'True if converted to Account/Contact/Opportunity; false otherwise. Read-only; set upon conversion.',
      ),
    individualId: z
      .string()
      .optional()
      .describe('Associated data privacy record ID. Available if Data Protection/Privacy enabled.'),
    annualRevenue: z.number().int().optional().describe('Annual revenue of the lead’s company.'),
    convertedDate: z
      .string()
      .optional()
      .describe('Conversion date. Read-only; set upon conversion.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    dandbCompanyId: z
      .string()
      .optional()
      .describe('Associated D&B Company record ID. Available if Data.com used.'),
    lastViewedDate: z
      .string()
      .optional()
      .describe(
        'Timestamp when current user last viewed. Null if only accessed (LastReferencedDate) but not viewed. Read-only.',
      ),
    masterRecordId: z
      .string()
      .optional()
      .describe('ID of the master record if this lead was deleted due to a merge; null otherwise.'),
    systemModstamp: z
      .string()
      .optional()
      .describe('Timestamp of last modification by user or system. System-generated, read-only.'),
    isUnreadByOwner: z
      .boolean()
      .optional()
      .describe(
        'True if assigned to an owner but not yet viewed by them. Salesforce defaults to true when a lead is created or its owner changes.',
      ),
    jigsawContactId: z.string().optional().describe('Jigsaw contact ID. Read-only.'),
    attributes__url: z
      .string()
      .optional()
      .describe('Relative URL of SObject record. Usually metadata, not set by user on creation.'),
    emailBouncedDate: z
      .string()
      .optional()
      .describe('Date/time of last email bounce (if bounce management active).'),
    isPriorityRecord: z
      .boolean()
      .optional()
      .describe('True if this lead is marked as a priority record.'),
    lastActivityDate: z
      .string()
      .optional()
      .describe(
        "Later of most recent event's Due Date or most recently closed task's Due Date. Read-only.",
      ),
    lastModifiedById: z
      .string()
      .optional()
      .describe('ID of user who last modified this. System-generated, read-only.'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Last modification timestamp. System-generated, read-only.'),
    attributes__type: z
      .string()
      .optional()
      .describe("SObject type (typically 'Lead'). Usually metadata, not set by user on creation."),
    numberOfEmployees: z
      .number()
      .int()
      .optional()
      .describe('Number of employees at the lead’s company.'),
    convertedAccountId: z
      .string()
      .optional()
      .describe('ID of the Account object from conversion. Read-only.'),
    convertedContactId: z
      .string()
      .optional()
      .describe('ID of the Contact object from conversion. Read-only.'),
    emailBouncedReason: z
      .string()
      .optional()
      .describe('Reason for last email bounce (if bounce management active).'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe('Timestamp when current user last accessed this or related record. Read-only.'),
    productInterest__c: z
      .string()
      .optional()
      .describe('Custom field indicating the product(s) the lead is interested in.'),
    currentGenerators__c: z
      .string()
      .optional()
      .describe(
        'Custom field for information about current generators or similar equipment/services.',
      ),
    numberofLocations__c: z
      .number()
      .int()
      .optional()
      .describe("Custom field for the number of locations the lead's company has."),
    convertedOpportunityId: z
      .string()
      .optional()
      .describe('ID of the Opportunity from conversion. Read-only.'),
  }),
  execute: async ({
    salesforceCredentials,
    city,
    email,
    phone,
    state,
    title,
    jigsaw,
    rating,
    status,
    street,
    company,
    country,
    ownerId,
    website,
    industry,
    lastName,
    photoUrl,
    firstName,
    isDeleted,
    leadSource,
    postalCode,
    primary__c,
    SICCode__c,
    salutation,
    cleanStatus,
    createdById,
    createdDate,
    description,
    isConverted,
    individualId,
    annualRevenue,
    convertedDate,
    customFields,
    dandbCompanyId,
    lastViewedDate,
    masterRecordId,
    systemModstamp,
    isUnreadByOwner,
    jigsawContactId,
    attributes__url,
    emailBouncedDate,
    isPriorityRecord,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    attributes__type,
    numberOfEmployees,
    convertedAccountId,
    convertedContactId,
    emailBouncedReason,
    lastReferencedDate,
    productInterest__c,
    currentGenerators__c,
    numberofLocations__c,
    convertedOpportunityId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Lead`, {
      body: {
        City: city,
        Email: email,
        Phone: phone,
        State: state,
        Title: title,
        Jigsaw: jigsaw,
        Rating: rating,
        Status: status,
        Street: street,
        Company: company,
        Country: country,
        OwnerId: ownerId,
        Website: website,
        Industry: industry,
        LastName: lastName,
        PhotoUrl: photoUrl,
        FirstName: firstName,
        IsDeleted: isDeleted,
        LeadSource: leadSource,
        PostalCode: postalCode,
        Primary__c: primary__c,
        SICCode__c: SICCode__c,
        Salutation: salutation,
        CleanStatus: cleanStatus,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        IsConverted: isConverted,
        IndividualId: individualId,
        AnnualRevenue: annualRevenue,
        ConvertedDate: convertedDate,
        ...customSpread,
        DandbCompanyId: dandbCompanyId,
        LastViewedDate: lastViewedDate,
        MasterRecordId: masterRecordId,
        SystemModstamp: systemModstamp,
        IsUnreadByOwner: isUnreadByOwner,
        JigsawContactId: jigsawContactId,
        attributes__url: attributes__url,
        EmailBouncedDate: emailBouncedDate,
        IsPriorityRecord: isPriorityRecord,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        attributes__type: attributes__type,
        NumberOfEmployees: numberOfEmployees,
        ConvertedAccountId: convertedAccountId,
        ConvertedContactId: convertedContactId,
        EmailBouncedReason: emailBouncedReason,
        LastReferencedDate: lastReferencedDate,
        ProductInterest__c: productInterest__c,
        CurrentGenerators__c: currentGenerators__c,
        NumberofLocations__c: numberofLocations__c,
        ConvertedOpportunityId: convertedOpportunityId,
      },
    });
  },
});

export const salesforceDeleteALeadObjectByItsId = tool({
  description:
    'DEPRECATED: Permanently deletes an existing Lead object from Salesforce using its unique ID.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        "The unique 15-character or 18-character ID of the Lead object to be deleted. Lead object IDs typically start with the prefix '00Q'. This is a required path parameter.",
      ),
  }),
  execute: async ({ salesforceCredentials, id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Lead/${id}`);
  },
});

export const salesforceDeleteLead = tool({
  description: 'Permanently deletes a lead from Salesforce. This action cannot be undone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    leadId: z.string().describe('The Salesforce ID of the lead to delete.'),
  }),
  execute: async ({ salesforceCredentials, leadId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Lead/${leadId}`);
  },
});

export const salesforceGetLead = tool({
  description: 'Retrieves a specific lead by ID from Salesforce, returning all available fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    leadId: z
      .string()
      .describe(
        "The Salesforce ID of the lead to retrieve. Must be a Salesforce record ID (18-char format like '00QWd000005V3RmMAK'); names, emails, or external codes are not accepted — resolve to a Salesforce ID first using a search or query tool.",
      ),
  }),
  execute: async ({ salesforceCredentials, leadId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Lead/${leadId}`);
  },
});

export const salesforceListLeads = tool({
  description:
    'Lists leads from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Results are paginated; follow nextRecordsUrl in the response to retrieve subsequent pages — the first page may silently omit matching records beyond the page limit.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch leads. Use standard SOQL syntax to filter, sort, and limit results. Field API names must be exact (e.g., LeadSource, LastModifiedDate) — invalid names cause MALFORMED_QUERY errors. Date literals like TODAY use the org ti',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, FirstName, LastName, Company, Title, Email, Phone, Status, LeadSource, Rating, Industry FROM Lead';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceRetrieveLeadById = tool({
  description:
    'Retrieves details for a Salesforce Lead by its ID; the specified Lead ID must exist in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('Unique identifier (ID) of the Salesforce Lead to retrieve.'),
    fields: z
      .string()
      .optional()
      .describe(
        "Comma-delimited list of Salesforce Lead field API names to return (e.g., Name,Email,Company). Field names must be exact API names (alphanumeric with underscores, no spaces). Custom fields typically end with '__c'. If omitted, all accessible",
      ),
    filteredFieldsMessage: z
      .string()
      .optional()
      .describe('Internal field to store message about filtered fields.'),
  }),
  execute: async ({ salesforceCredentials, id, fields, filteredFieldsMessage }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Lead/${id}`, {
      query: { fields: fields, filtered_fields_message: filteredFieldsMessage },
    });
  },
});

export const salesforceRetrieveLeadDataWithVariousResponses = tool({
  description:
    'DEPRECATED: Retrieves Lead sObject data from Salesforce, such as recently viewed leads or general Lead object information.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Lead`);
  },
});

export const salesforceUpdateLead = tool({
  description:
    'Updates an existing lead in Salesforce with the specified changes. Only provided fields will be updated.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    city: z.string().optional().describe('Updated city. Leave empty to keep unchanged.'),
    email: z.string().optional().describe('Updated email address. Leave empty to keep unchanged.'),
    phone: z.string().optional().describe('Updated phone number. Leave empty to keep unchanged.'),
    state: z.string().optional().describe('Updated state/province. Leave empty to keep unchanged.'),
    title: z.string().optional().describe('Updated job title. Leave empty to keep unchanged.'),
    rating: z
      .string()
      .optional()
      .describe(
        'Updated rating. Leave empty to keep unchanged. Must match a valid picklist value configured in the org; invalid values cause a validation error. Represents lead quality (Hot/Warm/Cold), not pipeline stage.',
      ),
    status: z
      .string()
      .optional()
      .describe(
        'Updated status. Leave empty to keep unchanged. Must match a valid picklist value configured in the org; invalid values cause a validation error. Represents pipeline stage, not lead quality rating.',
      ),
    street: z
      .string()
      .optional()
      .describe('Updated street address. Leave empty to keep unchanged.'),
    company: z.string().optional().describe('Updated company name. Leave empty to keep unchanged.'),
    country: z.string().optional().describe('Updated country. Leave empty to keep unchanged.'),
    leadId: z.string().describe('The Salesforce ID of the lead to update.'),
    website: z.string().optional().describe('Updated website. Leave empty to keep unchanged.'),
    industry: z.string().optional().describe('Updated industry. Leave empty to keep unchanged.'),
    lastName: z.string().optional().describe('Updated last name. Leave empty to keep unchanged.'),
    firstName: z.string().optional().describe('Updated first name. Leave empty to keep unchanged.'),
    description: z
      .string()
      .optional()
      .describe('Updated description. Leave empty to keep unchanged.'),
    leadSource: z
      .string()
      .optional()
      .describe('Updated lead source. Leave empty to keep unchanged.'),
    postalCode: z
      .string()
      .optional()
      .describe('Updated postal/zip code. Leave empty to keep unchanged.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Custom fields to update on the lead. Pass a dictionary where keys are the Salesforce API names of custom fields (e.g., 'Level__c', 'Languages__c') and values are the field values to set. Custom field names typically end with '__c'.",
      ),
    annualRevenue: z
      .number()
      .optional()
      .describe(
        'Updated annual revenue. Leave unset to keep unchanged. Negative values are passed through to Salesforce as-is (useful for adjustments/write-offs).',
      ),
    numberOfEmployees: z
      .number()
      .int()
      .optional()
      .describe('Updated number of employees. Leave unset to keep unchanged.'),
  }),
  execute: async ({
    salesforceCredentials,
    city,
    email,
    phone,
    state,
    title,
    rating,
    status,
    street,
    company,
    country,
    leadId,
    website,
    industry,
    lastName,
    firstName,
    description,
    leadSource,
    postalCode,
    customFields,
    annualRevenue,
    numberOfEmployees,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      city: city,
      email: email,
      phone: phone,
      state: state,
      title: title,
      rating: rating,
      status: status,
      street: street,
      company: company,
      country: country,
      website: website,
      industry: industry,
      LastName: lastName,
      FirstName: firstName,
      description: description,
      LeadSource: leadSource,
      PostalCode: postalCode,
      ...customSpread,
      AnnualRevenue: annualRevenue,
      NumberOfEmployees: numberOfEmployees,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Lead/${leadId}`, { body: sfBody });
  },
});

export const salesforceUpdateLeadByIdWithJsonPayload = tool({
  description:
    'DEPRECATED: Updates specified fields of an existing Lead in Salesforce via its unique ID (path parameter), returning HTTP 204 on success or error details on failure; request body must contain at least one field to update.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'Unique Salesforce ID of the Lead to update (e.g., 001R0000005hDFYIA2); this is a required path parameter.',
      ),
    fax: z.string().optional().describe('Fax number.'),
    city: z.string().optional().describe("City for the lead's address."),
    name: z
      .string()
      .optional()
      .describe(
        'Read-only full name of the lead (concatenation of FirstName, MiddleName, LastName, Suffix; max 203 characters).',
      ),
    email: z.string().optional().describe('Email address.'),
    phone: z.string().optional().describe('Primary phone number.'),
    state: z.string().optional().describe('State or province (e.g., CA, California).'),
    title: z.string().optional().describe("Lead's job title."),
    jigsaw: z
      .string()
      .optional()
      .describe(
        'Data.com (Jigsaw) contact ID reference (max 20 chars). Indicates Data.com import. Do not modify. Label: Data.com Key.',
      ),
    rating: z.string().optional().describe('Lead rating (e.g., potential or priority).'),
    status: z
      .string()
      .optional()
      .describe('Current status (e.g., Open, Contacted); defined in LeadStatus picklist.'),
    street: z.string().optional().describe('Street address (e.g., 123 Main St).'),
    company: z
      .string()
      .optional()
      .describe(
        'Required. Company the lead works for. If person accounts are enabled and Company is null, the lead converts to a person account.',
      ),
    country: z.string().optional().describe("Country for the lead's address."),
    ownerId: z.string().optional().describe('Salesforce User ID of the lead owner.'),
    website: z.string().optional().describe('Website URL.'),
    industry: z.string().optional().describe("Primary industry of the lead's company."),
    lastName: z.string().optional().describe("Lead's last name (up to 80 characters)."),
    latitude: z
      .number()
      .optional()
      .describe('WGS84 latitude in decimal degrees (-90.0 to 90.0, up to 15 decimal places).'),
    photoUrl: z
      .string()
      .optional()
      .describe(
        "Relative URL path to the lead's photo; combine with Salesforce instance URL for full image URL. Empty if Social Accounts and Contacts is disabled.",
      ),
    firstName: z.string().optional().describe("Lead's first name (up to 40 characters)."),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Specifies if the Lead is in the Recycle Bin. Label: Deleted.'),
    longitude: z
      .number()
      .optional()
      .describe('WGS84 longitude in decimal degrees (-180.0 to 180.0, up to 15 decimal places).'),
    leadSource: z
      .enum(['Web', 'Other', 'Phone Inquiry', 'Partner Referral', 'Purchased List'])
      .optional()
      .describe('Source of the lead.'),
    postalCode: z
      .string()
      .optional()
      .describe('Postal code (e.g., ZIP code). Label: Zip/Postal Code.'),
    primary__c: z
      .string()
      .optional()
      .describe('Custom field, often indicating primary contact status.'),
    SICCode__c: z
      .string()
      .optional()
      .describe('Custom field for Standard Industrial Classification (SIC) code.'),
    salutation: z
      .enum(['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'])
      .optional()
      .describe("Lead's salutation."),
    cleanStatus: z
      .string()
      .optional()
      .describe(
        'Data cleanliness status compared with Data.com (e.g., Matched/In Sync, Acknowledged/Reviewed).',
      ),
    createdById: z.string().optional().describe('Read-only ID of the user who created the lead.'),
    createdDate: z.string().optional().describe('Read-only creation timestamp (ISO 8601).'),
    description: z
      .string()
      .optional()
      .describe('Free-text description or notes (up to 32,000 characters).'),
    isConverted: z
      .boolean()
      .optional()
      .describe('Read-only flag indicating if the lead has been converted. Label: Converted.'),
    mobilePhone: z.string().optional().describe('Mobile phone number.'),
    individualId: z
      .string()
      .optional()
      .describe(
        'ID of the associated Individual (data privacy) record. Available if Data Protection and Privacy is enabled.',
      ),
    annualRevenue: z.number().optional().describe("Annual revenue of the lead's company."),
    convertedDate: z
      .string()
      .optional()
      .describe('Read-only date of lead conversion (YYYY-MM-DD).'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    dandbCompanyId: z
      .string()
      .optional()
      .describe('Typically read-only D&B Company ID used by Data.com.'),
    lastViewedDate: z
      .string()
      .optional()
      .describe('Read-only timestamp of when the current user last viewed this lead (ISO 8601).'),
    masterRecordId: z
      .string()
      .optional()
      .describe(
        'ID of the master Lead record if this Lead was merged and deleted; `null` otherwise.',
      ),
    systemModstamp: z
      .string()
      .optional()
      .describe('Read-only timestamp of last system modification (ISO 8601).'),
    geocodeAccuracy: z
      .string()
      .optional()
      .describe(
        "Accuracy level of the geocoded address, specific to Salesforce's geocoding service.",
      ),
    isUnreadByOwner: z
      .boolean()
      .optional()
      .describe('Specifies if the lead is unread by its owner. Label: Unread By Owner.'),
    jigsawContactId: z
      .string()
      .optional()
      .describe('Typically read-only Data.com (Jigsaw) contact ID for integration.'),
    attributes__url: z
      .string()
      .optional()
      .describe('API URL for this Lead record. Generally not set by user for simple updates.'),
    emailBouncedDate: z
      .string()
      .optional()
      .describe('Date and time of email bounce (ISO 8601), if bounce management is active.'),
    isPriorityRecord: z
      .boolean()
      .optional()
      .describe(
        'Indicates if this is a priority record; meaning varies by Salesforce customization.',
      ),
    lastActivityDate: z
      .string()
      .optional()
      .describe('Read-only most recent activity date (YYYY-MM-DD).'),
    lastModifiedById: z
      .string()
      .optional()
      .describe('Read-only ID of the user who last modified the lead.'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Read-only last modification timestamp (ISO 8601).'),
    attributes__type: z
      .string()
      .optional()
      .describe(
        "Salesforce sObject type (e.g., 'Lead'). Generally not set by user for simple updates.",
      ),
    companyDunsNumber: z
      .string()
      .optional()
      .describe('Company D-U-N-S number (max 9 chars). Requires Data.com Prospector/Clean.'),
    numberOfEmployees: z
      .number()
      .int()
      .optional()
      .describe("Number of employees at the lead's company. Label: Employees."),
    convertedAccountId: z
      .string()
      .optional()
      .describe('Read-only Salesforce ID of the Account created from this lead.'),
    convertedContactId: z
      .string()
      .optional()
      .describe('Read-only Salesforce ID of the Contact created from this lead.'),
    emailBouncedReason: z
      .string()
      .optional()
      .describe('Reason for email bounce, if bounce management is active.'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        'Read-only timestamp of when the current user last accessed this lead or related record (ISO 8601).',
      ),
    productInterest__c: z.string().optional().describe("Custom field for lead's product interest."),
    currentGenerators__c: z
      .string()
      .optional()
      .describe("Custom field, possibly detailing current solutions or 'generators' used."),
    numberofLocations__c: z
      .number()
      .int()
      .optional()
      .describe("Custom field for the number of locations of the lead's company."),
    convertedOpportunityId: z
      .string()
      .optional()
      .describe('Read-only Salesforce ID of the Opportunity created from this lead.'),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    fax,
    city,
    name,
    email,
    phone,
    state,
    title,
    jigsaw,
    rating,
    status,
    street,
    company,
    country,
    ownerId,
    website,
    industry,
    lastName,
    latitude,
    photoUrl,
    firstName,
    isDeleted,
    longitude,
    leadSource,
    postalCode,
    primary__c,
    SICCode__c,
    salutation,
    cleanStatus,
    createdById,
    createdDate,
    description,
    isConverted,
    mobilePhone,
    individualId,
    annualRevenue,
    convertedDate,
    customFields,
    dandbCompanyId,
    lastViewedDate,
    masterRecordId,
    systemModstamp,
    geocodeAccuracy,
    isUnreadByOwner,
    jigsawContactId,
    attributes__url,
    emailBouncedDate,
    isPriorityRecord,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    attributes__type,
    companyDunsNumber,
    numberOfEmployees,
    convertedAccountId,
    convertedContactId,
    emailBouncedReason,
    lastReferencedDate,
    productInterest__c,
    currentGenerators__c,
    numberofLocations__c,
    convertedOpportunityId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Lead/${id}`, {
      body: {
        Fax: fax,
        City: city,
        Name: name,
        Email: email,
        Phone: phone,
        State: state,
        Title: title,
        Jigsaw: jigsaw,
        Rating: rating,
        Status: status,
        Street: street,
        Company: company,
        Country: country,
        OwnerId: ownerId,
        Website: website,
        Industry: industry,
        LastName: lastName,
        Latitude: latitude,
        PhotoUrl: photoUrl,
        FirstName: firstName,
        IsDeleted: isDeleted,
        Longitude: longitude,
        LeadSource: leadSource,
        PostalCode: postalCode,
        Primary__c: primary__c,
        SICCode__c: SICCode__c,
        Salutation: salutation,
        CleanStatus: cleanStatus,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        IsConverted: isConverted,
        MobilePhone: mobilePhone,
        IndividualId: individualId,
        AnnualRevenue: annualRevenue,
        ConvertedDate: convertedDate,
        ...customSpread,
        DandbCompanyId: dandbCompanyId,
        LastViewedDate: lastViewedDate,
        MasterRecordId: masterRecordId,
        SystemModstamp: systemModstamp,
        GeocodeAccuracy: geocodeAccuracy,
        IsUnreadByOwner: isUnreadByOwner,
        JigsawContactId: jigsawContactId,
        attributes__url: attributes__url,
        EmailBouncedDate: emailBouncedDate,
        IsPriorityRecord: isPriorityRecord,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        attributes__type: attributes__type,
        CompanyDunsNumber: companyDunsNumber,
        NumberOfEmployees: numberOfEmployees,
        ConvertedAccountId: convertedAccountId,
        ConvertedContactId: convertedContactId,
        EmailBouncedReason: emailBouncedReason,
        LastReferencedDate: lastReferencedDate,
        ProductInterest__c: productInterest__c,
        CurrentGenerators__c: currentGenerators__c,
        NumberofLocations__c: numberofLocations__c,
        ConvertedOpportunityId: convertedOpportunityId,
      },
    });
  },
});
