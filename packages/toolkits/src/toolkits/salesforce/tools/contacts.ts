// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceAssociateContactToAccount = tool({
  description:
    "Associates a contact with an account by updating the contact's AccountId field. Overwrites any existing AccountId on the contact. For broader contact field updates alongside the account association, use SALESFORCE_UPDATE_CONTACT instead.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    accountId: z
      .string()
      .describe('The Salesforce ID of the account to associate the contact with.'),
    contactId: z
      .string()
      .describe('The Salesforce ID of the contact to associate with an account.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values to update on the contact. Custom field names typically end with '__c'.",
      ),
  }),
  execute: async ({ salesforceCredentials, accountId, contactId, customFields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Contact/${contactId}`, {
      body: { AccountId: accountId, ...customSpread },
    });
  },
});

export const salesforceCreateContact = tool({
  description:
    'Creates a new contact in Salesforce with the specified information. Writes to live CRM data — obtain explicit user confirmation before executing. Failures may reflect org-specific validation rules, permission restrictions, or duplicate rules rather than invalid inputs.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    email: z.string().optional().describe("Contact's email address."),
    phone: z.string().optional().describe("Contact's primary phone number."),
    title: z.string().optional().describe("Contact's job title."),
    birthdate: z.string().optional().describe("Contact's birthdate in YYYY-MM-DD format."),
    lastName: z.string().describe("Contact's last name (required field in Salesforce)."),
    accountId: z.string().optional().describe('ID of the Account this contact is associated with.'),
    department: z.string().optional().describe("Contact's department."),
    firstName: z.string().optional().describe("Contact's first name."),
    leadSource: z.string().optional().describe('Source from which this contact originated.'),
    mailingCity: z.string().optional().describe("Contact's mailing city."),
    mobilePhone: z.string().optional().describe("Contact's mobile phone number."),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Level__c', 'Languages__c').",
      ),
    mailingState: z.string().optional().describe("Contact's mailing state/province."),
    mailingStreet: z.string().optional().describe("Contact's mailing street address."),
    mailingCountry: z.string().optional().describe("Contact's mailing country."),
    mailingPostalCode: z.string().optional().describe("Contact's mailing postal/zip code."),
  }),
  execute: async ({
    salesforceCredentials,
    email,
    phone,
    title,
    birthdate,
    lastName,
    accountId,
    department,
    firstName,
    leadSource,
    mailingCity,
    mobilePhone,
    customFields,
    mailingState,
    mailingStreet,
    mailingCountry,
    mailingPostalCode,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Contact`, {
      body: {
        email: email,
        phone: phone,
        title: title,
        birthdate: birthdate,
        LastName: lastName,
        AccountId: accountId,
        department: department,
        FirstName: firstName,
        LeadSource: leadSource,
        MailingCity: mailingCity,
        MobilePhone: mobilePhone,
        ...customSpread,
        MailingState: mailingState,
        MailingStreet: mailingStreet,
        MailingCountry: mailingCountry,
        MailingPostalCode: mailingPostalCode,
      },
    });
  },
});

export const salesforceCreateNewContactWithJsonHeader = tool({
  description:
    "DEPRECATED: Creates a new Contact in Salesforce; 'LastName' is required, an existing 'AccountId' must be used if provided, and any custom fields (ending with '__c') must be predefined.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .optional()
      .describe('Unique contact identifier, system-generated; omit for new contact creation.'),
    fax: z.string().optional().describe('Primary business fax. Label: Business Fax.'),
    name: z
      .string()
      .optional()
      .describe(
        'Read-only: Full name, a concatenation of FirstName, MiddleName, LastName, and Suffix (up to 203 characters).',
      ),
    email: z.string().optional().describe('Email address.'),
    phone: z.string().optional().describe('Primary business phone. Label: Business Phone.'),
    title: z.string().optional().describe("Contact's title (e.g., CEO, Vice President)."),
    jigsaw: z
      .string()
      .optional()
      .describe(
        'Read-only: Data.com Company ID (max 20 chars), indicates import from Data.com. Label: Data.com Key. Do not modify.',
      ),
    ownerId: z
      .string()
      .optional()
      .describe(
        'ID of the Salesforce user owning this contact. Defaults to the logged-in user if unspecified.',
      ),
    lastName: z.string().describe("Required: Contact's last name (up to 80 characters)."),
    level__c: z
      .string()
      .optional()
      .describe(
        "Custom field: Contact's level (e.g., Primary, Secondary). '__c' denotes a custom field.",
      ),
    photoUrl: z
      .string()
      .optional()
      .describe(
        'Read-only: Path for social profile image URL (redirects). Empty if Social Accounts & Contacts disabled.',
      ),
    accountId: z
      .string()
      .optional()
      .describe(
        'Parent Account ID; must exist if specified. Caution advised when changing for portal-enabled contacts.',
      ),
    birthdate: z
      .string()
      .optional()
      .describe(
        'Birthdate (YYYY-MM-DD). SOQL queries ignore year for date comparisons (e.g., `Birthdate > TODAY`).',
      ),
    firstName: z.string().optional().describe("Contact's first name (up to 40 characters)."),
    homePhone: z.string().optional().describe('Home phone.'),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Read-only: True if contact is in Recycle Bin. Label: Deleted.'),
    otherCity: z.string().optional().describe('Alternate address: City.'),
    department: z.string().optional().describe("Contact's department."),
    leadSource: z
      .string()
      .optional()
      .describe('Lead source for this contact (e.g., Web, Phone Inquiry).'),
    otherPhone: z.string().optional().describe('Alternate address phone.'),
    otherState: z.string().optional().describe('Alternate address: State or province.'),
    salutation: z
      .string()
      .optional()
      .describe("Honorific for the contact's name (e.g., Dr., Mr., Mrs.)."),
    cleanStatus: z
      .string()
      .optional()
      .describe(
        "Record's clean status compared to Data.com (e.g., 'Matched' may appear as 'In Sync' in UI).",
      ),
    createdById: z.string().optional().describe('Read-only: ID of user who created contact.'),
    createdDate: z.string().optional().describe('Read-only: Timestamp of contact creation.'),
    description: z
      .string()
      .optional()
      .describe('Description (up to 32KB). Label: Contact Description.'),
    mailingCity: z.string().optional().describe('Mailing address: City.'),
    mobilePhone: z.string().optional().describe('Mobile phone.'),
    otherStreet: z.string().optional().describe('Alternate address: Street.'),
    reportsToId: z
      .string()
      .optional()
      .describe(
        'ID of manager contact reports to. Not for person accounts (IsPersonAccount true).',
      ),
    individualId: z
      .string()
      .optional()
      .describe(
        'ID of associated data privacy record. Available if Data Protection & Privacy enabled.',
      ),
    languages__c: z
      .string()
      .optional()
      .describe(
        "Custom field: Languages spoken by the contact (e.g., English;Spanish). '__c' denotes a custom field.",
      ),
    mailingState: z.string().optional().describe('Mailing address: State or province.'),
    otherCountry: z.string().optional().describe('Alternate address: Country.'),
    assistantName: z.string().optional().describe("Assistant's name."),
    contactSource: z
      .string()
      .optional()
      .describe('Source of contact information, for more granular tracking than LeadSource.'),
    mailingStreet: z.string().optional().describe('Mailing address: Street.'),
    otherLatitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Alternate address: Latitude (-90 to 90, 15 decimal places). Use with OtherLongitude.',
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    assistantPhone: z.string().optional().describe("Assistant's phone."),
    isEmailBounced: z
      .boolean()
      .optional()
      .describe('True if email bounced; bounce management must be active.'),
    lastViewedDate: z
      .string()
      .optional()
      .describe('Read-only: Timestamp current user last viewed contact. Null if only referenced.'),
    mailingCountry: z.string().optional().describe('Mailing address: Country.'),
    masterRecordId: z
      .string()
      .optional()
      .describe('Read-only: ID of the master record post-merge deletion; null otherwise.'),
    otherLongitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Alternate address: Longitude (-180 to 180, 15 decimal places). Use with OtherLatitude.',
      ),
    systemModstamp: z
      .string()
      .optional()
      .describe('Read-only: Timestamp of last system modification (user or automated).'),
    jigsawContactId: z
      .string()
      .optional()
      .describe('Read-only: Jigsaw (Data.com) ID, links to Data.com contact data.'),
    mailingLatitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Mailing address: Latitude (-90 to 90, 15 decimal places). Use with MailingLongitude.',
      ),
    otherPostalCode: z.string().optional().describe('Alternate address: Postal code.'),
    attributes__url: z
      .string()
      .optional()
      .describe(
        "Relative URL for this SObject record, usually system-generated. Part of 'attributes' metadata.",
      ),
    emailBouncedDate: z
      .string()
      .optional()
      .describe(
        'Date and time of email bounce, if bounce management is active and an email bounced.',
      ),
    isPriorityRecord: z.boolean().optional().describe('True if contact is a priority record.'),
    lastActivityDate: z
      .string()
      .optional()
      .describe('Read-only: Most recent due date of associated event or closed task.'),
    lastCUUpdateDate: z
      .string()
      .optional()
      .describe('Read-only: Timestamp of last update from a contact update request.'),
    lastModifiedById: z
      .string()
      .optional()
      .describe('Read-only: ID of user who last modified contact.'),
    lastModifiedDate: z.string().optional().describe('Read-only: Timestamp of last modification.'),
    mailingLongitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Mailing address: Longitude (-180 to 180, 15 decimal places). Use with MailingLatitude.',
      ),
    attributes__type: z
      .string()
      .optional()
      .describe("Salesforce SObject type, typically 'Contact'. Part of 'attributes' metadata."),
    lastCURequestDate: z
      .string()
      .optional()
      .describe('Read-only: Timestamp of last contact update request (e.g., Data.com Clean).'),
    mailingPostalCode: z.string().optional().describe('Mailing address: Postal code.'),
    emailBouncedReason: z
      .string()
      .optional()
      .describe('Reason for email bounce, if bounce management is active and an email bounced.'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        'Read-only: Timestamp current user last accessed contact, related record, or its list view.',
      ),
    otherGeocodeAccuracy: z
      .string()
      .optional()
      .describe(
        'Alternate address: Geocode accuracy. See Salesforce docs for geolocation compound fields.',
      ),
    mailingGeocodeAccuracy: z
      .string()
      .optional()
      .describe(
        'Mailing address: Geocode accuracy. See Salesforce docs for geolocation compound fields.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    fax,
    name,
    email,
    phone,
    title,
    jigsaw,
    ownerId,
    lastName,
    level__c,
    photoUrl,
    accountId,
    birthdate,
    firstName,
    homePhone,
    isDeleted,
    otherCity,
    department,
    leadSource,
    otherPhone,
    otherState,
    salutation,
    cleanStatus,
    createdById,
    createdDate,
    description,
    mailingCity,
    mobilePhone,
    otherStreet,
    reportsToId,
    individualId,
    languages__c,
    mailingState,
    otherCountry,
    assistantName,
    contactSource,
    mailingStreet,
    otherLatitude,
    customFields,
    assistantPhone,
    isEmailBounced,
    lastViewedDate,
    mailingCountry,
    masterRecordId,
    otherLongitude,
    systemModstamp,
    jigsawContactId,
    mailingLatitude,
    otherPostalCode,
    attributes__url,
    emailBouncedDate,
    isPriorityRecord,
    lastActivityDate,
    lastCUUpdateDate,
    lastModifiedById,
    lastModifiedDate,
    mailingLongitude,
    attributes__type,
    lastCURequestDate,
    mailingPostalCode,
    emailBouncedReason,
    lastReferencedDate,
    otherGeocodeAccuracy,
    mailingGeocodeAccuracy,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Contact`, {
      body: {
        Id: id,
        Fax: fax,
        Name: name,
        Email: email,
        Phone: phone,
        Title: title,
        Jigsaw: jigsaw,
        OwnerId: ownerId,
        LastName: lastName,
        Level__c: level__c,
        PhotoUrl: photoUrl,
        AccountId: accountId,
        Birthdate: birthdate,
        FirstName: firstName,
        HomePhone: homePhone,
        IsDeleted: isDeleted,
        OtherCity: otherCity,
        Department: department,
        LeadSource: leadSource,
        OtherPhone: otherPhone,
        OtherState: otherState,
        Salutation: salutation,
        CleanStatus: cleanStatus,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        MailingCity: mailingCity,
        MobilePhone: mobilePhone,
        OtherStreet: otherStreet,
        ReportsToId: reportsToId,
        IndividualId: individualId,
        Languages__c: languages__c,
        MailingState: mailingState,
        OtherCountry: otherCountry,
        AssistantName: assistantName,
        ContactSource: contactSource,
        MailingStreet: mailingStreet,
        OtherLatitude: otherLatitude,
        ...customSpread,
        AssistantPhone: assistantPhone,
        IsEmailBounced: isEmailBounced,
        LastViewedDate: lastViewedDate,
        MailingCountry: mailingCountry,
        MasterRecordId: masterRecordId,
        OtherLongitude: otherLongitude,
        SystemModstamp: systemModstamp,
        JigsawContactId: jigsawContactId,
        MailingLatitude: mailingLatitude,
        OtherPostalCode: otherPostalCode,
        attributes__url: attributes__url,
        EmailBouncedDate: emailBouncedDate,
        IsPriorityRecord: isPriorityRecord,
        LastActivityDate: lastActivityDate,
        LastCUUpdateDate: lastCUUpdateDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        MailingLongitude: mailingLongitude,
        attributes__type: attributes__type,
        LastCURequestDate: lastCURequestDate,
        MailingPostalCode: mailingPostalCode,
        EmailBouncedReason: emailBouncedReason,
        LastReferencedDate: lastReferencedDate,
        OtherGeocodeAccuracy: otherGeocodeAccuracy,
        MailingGeocodeAccuracy: mailingGeocodeAccuracy,
      },
    });
  },
});

export const salesforceDeleteContact = tool({
  description:
    'Permanently deletes a contact from Salesforce. This action cannot be undone. Associated records (activities, opportunities) lose the contact reference upon deletion — ensure related data is migrated or acceptable to lose before proceeding. Returns HTTP 204 with empty body on success.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    contactId: z.string().describe('The Salesforce ID of the contact to delete.'),
  }),
  execute: async ({ salesforceCredentials, contactId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Contact/${contactId}`);
  },
});

export const salesforceGetContact = tool({
  description:
    'Retrieves a specific contact by ID from Salesforce, returning all available fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-delimited string of Contact field API names to retrieve. If omitted, all fields are returned.',
      ),
    contactId: z
      .string()
      .describe(
        'The Salesforce ID of the contact to retrieve. Must be a valid 18-character Salesforce ID; names or emails are not valid substitutes.',
      ),
  }),
  execute: async ({ salesforceCredentials, fields, contactId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Contact/${contactId}`, {
      query: { fields: fields },
    });
  },
});

export const salesforceGetContactById = tool({
  description:
    'Retrieves a Salesforce Contact by its unique ID; the ID must correspond to an existing Contact record in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('The unique Salesforce ID of the Contact record to retrieve.'),
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-delimited string of Contact field API names to retrieve. If omitted, a default set of fields is returned.',
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Contact/${id}`, { query: { fields: fields } });
  },
});

export const salesforceListContacts = tool({
  description:
    'Lists contacts from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Results are returned under `response_data.records`; check `response_data.done` and `response_data.totalSize` for pagination — use OFFSET or `nextRecordsUrl` until `done=true` to retrieve all records.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch contacts. Use standard SOQL syntax to filter, sort, and limit results. String literals must be single-quoted. Use correct field API names and relationship traversal (e.g., `Account.Industry`). To filter unassociated cont',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, FirstName, LastName, Email, Phone, Title, Department, AccountId FROM Contact';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceQueryContactsByName = tool({
  description:
    'DEPRECATED: Finds Salesforce Contact records by name using a case-insensitive search.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    limit: z.number().int().optional().describe('Maximum number of contact records to return.'),
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of Salesforce Contact object field API names to retrieve. Common field API names include: Id, Name, FirstName, LastName, Email, Phone, MobilePhone, Title, AccountId.',
      ),
    contactName: z
      .string()
      .describe(
        "The name or partial name to search for within the 'Name' field of Salesforce Contact records. Supports partial matches (e.g., 'John' will find 'John Smith', 'John Doe', etc.).",
      ),
  }),
  execute: async ({ salesforceCredentials, limit, fields, contactName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/query`, {
      query: { limit: limit, fields: fields, contact_name: contactName },
    });
  },
});

export const salesforceRemoveASpecificContactById = tool({
  description:
    'DEPRECATED: Permanently deletes a specific Contact from Salesforce using its unique ID, which must correspond to an existing record.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'The unique identifier (ID) of the Contact object to be deleted. This is a required path parameter. Salesforce IDs are typically 15-character case-sensitive or 18-character case-insensitive.',
      ),
  }),
  execute: async ({ salesforceCredentials, id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Contact/${id}`);
  },
});

export const salesforceRetrieveContactInfoWithStandardResponses = tool({
  description:
    'DEPRECATED: Retrieves comprehensive metadata (e.g., fields, data types, picklist values) for the Salesforce Contact SObject; this action does not retrieve individual contact records.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Contact`);
  },
});

export const salesforceRetrieveSpecificContactById = tool({
  description:
    '(DEPRECATED: use `SALESFORCE_GET_CONTACT_BY_ID`) Retrieves a Salesforce Contact by its unique ID; the ID must correspond to an existing Contact record in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('The unique Salesforce ID of the Contact record to retrieve.'),
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-delimited string of Contact field API names to retrieve. If omitted, a default set of fields is returned.',
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Contact/${id}`, { query: { fields: fields } });
  },
});

export const salesforceUpdateContact = tool({
  description:
    'Updates an existing contact in Salesforce with the specified changes. Only provided fields will be updated. Returns HTTP 204 with no body on success; use SALESFORCE_GET_CONTACT to verify applied changes. Org-level validation rules, duplicate rules, or field-level permissions may reject correctly formatted requests with HTTP 400; inspect the error response to identify the constraint.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    email: z.string().optional().describe('Updated email address. Leave empty to keep unchanged.'),
    phone: z
      .string()
      .optional()
      .describe('Updated primary phone number. Leave empty to keep unchanged.'),
    title: z.string().optional().describe('Updated job title. Leave empty to keep unchanged.'),
    birthdate: z
      .string()
      .optional()
      .describe('Updated birthdate in YYYY-MM-DD format. Leave empty to keep unchanged.'),
    lastName: z.string().optional().describe('Updated last name. Leave empty to keep unchanged.'),
    accountId: z
      .string()
      .optional()
      .describe(
        'Updated Account ID association. Leave empty to keep unchanged. Alternatively use SALESFORCE_ASSOCIATE_CONTACT_TO_ACCOUNT, but prefer setting this field when updating multiple fields simultaneously.',
      ),
    contactId: z
      .string()
      .describe(
        'The Salesforce ID of the contact to update. Must be a valid 18-character Salesforce ID (retrieve via SALESFORCE_SEARCH_CONTACTS); names or emails cannot substitute.',
      ),
    department: z
      .string()
      .optional()
      .describe('Updated department. Leave empty to keep unchanged.'),
    firstName: z.string().optional().describe('Updated first name. Leave empty to keep unchanged.'),
    mailingCity: z
      .string()
      .optional()
      .describe('Updated mailing city. Leave empty to keep unchanged.'),
    mobilePhone: z
      .string()
      .optional()
      .describe('Updated mobile phone number. Leave empty to keep unchanged.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom fields in Salesforce end with '__c' (e.g., 'Level__c', 'Languages__c').",
      ),
    mailingState: z
      .string()
      .optional()
      .describe('Updated mailing state/province. Leave empty to keep unchanged.'),
    mailingStreet: z
      .string()
      .optional()
      .describe('Updated mailing street address. Leave empty to keep unchanged.'),
    mailingCountry: z
      .string()
      .optional()
      .describe('Updated mailing country. Leave empty to keep unchanged.'),
    mailingPostalCode: z
      .string()
      .optional()
      .describe('Updated mailing postal/zip code. Leave empty to keep unchanged.'),
  }),
  execute: async ({
    salesforceCredentials,
    email,
    phone,
    title,
    birthdate,
    lastName,
    accountId,
    contactId,
    department,
    firstName,
    mailingCity,
    mobilePhone,
    customFields,
    mailingState,
    mailingStreet,
    mailingCountry,
    mailingPostalCode,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      email: email,
      phone: phone,
      title: title,
      birthdate: birthdate,
      LastName: lastName,
      AccountId: accountId,
      department: department,
      FirstName: firstName,
      MailingCity: mailingCity,
      MobilePhone: mobilePhone,
      ...customSpread,
      MailingState: mailingState,
      MailingStreet: mailingStreet,
      MailingCountry: mailingCountry,
      MailingPostalCode: mailingPostalCode,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Contact/${contactId}`, { body: sfBody });
  },
});

export const salesforceUpdateContactById = tool({
  description:
    'DEPRECATED: Updates specified fields of an existing Salesforce Contact by its ID; at least one field must be provided for modification.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        "Unique Salesforce ID of the Contact to update (e.g., '001R0000005hDFYIA2'). This is a required path parameter.",
      ),
    fax: z.string().optional().describe("Business fax number. Label: 'Business Fax'."),
    name: z
      .string()
      .optional()
      .describe('Full name (read-only). Concatenation of FirstName, MiddleName, LastName, Suffix.'),
    email: z.string().optional().describe('Email address.'),
    phone: z.string().optional().describe("Primary business phone. Label: 'Business Phone'."),
    title: z.string().optional().describe('Job title (e.g., CEO, Vice President).'),
    jigsaw: z
      .string()
      .optional()
      .describe(
        'Data.com (Salesforce D&B) company ID. Max 20 chars. Do not modify; used for import troubleshooting.',
      ),
    ownerId: z.string().optional().describe('Salesforce User ID of the contact owner.'),
    lastName: z.string().optional().describe("Contact's last name, up to 80 characters."),
    level__c: z
      .string()
      .optional()
      .describe(
        "Custom field 'Level__c': Categorizes contact importance/engagement (e.g., Primary).",
      ),
    photoUrl: z
      .string()
      .optional()
      .describe(
        'Relative path to profile photo (read-only). Combine with instance URL for full path. Empty if Social Accounts/Contacts is disabled.',
      ),
    accountId: z
      .string()
      .optional()
      .describe(
        'Parent Account ID. When changing accounts for portal-enabled contacts, update up to 50 contacts at once, preferably after business hours.',
      ),
    birthdate: z
      .string()
      .optional()
      .describe('Birthdate (YYYY-MM-DD). Year is ignored in report/SOQL filters.'),
    firstName: z.string().optional().describe("Contact's first name, up to 40 characters."),
    homePhone: z.string().optional().describe('Home telephone number.'),
    isDeleted: z
      .boolean()
      .optional()
      .describe("Indicates if the contact is in the Recycle Bin. Label: 'Deleted'."),
    otherCity: z.string().optional().describe('Alternative address: city.'),
    department: z.string().optional().describe('Department.'),
    leadSource: z.string().optional().describe('Lead source (e.g., Web, Partner Referral).'),
    otherPhone: z.string().optional().describe('Alternative address: phone number.'),
    otherState: z.string().optional().describe('Alternative address: state/province.'),
    salutation: z.string().optional().describe('Honorific for greetings (e.g., Mr., Ms., Dr.).'),
    cleanStatus: z
      .string()
      .optional()
      .describe("Data quality status compared to Data.com (e.g., 'Matched', 'Pending')."),
    createdById: z
      .string()
      .optional()
      .describe('ID of the user who created the contact (read-only).'),
    createdDate: z.string().optional().describe('Creation date/time (read-only).'),
    description: z
      .string()
      .optional()
      .describe("Description (up to 32KB). Label: 'Contact Description'."),
    mailingCity: z.string().optional().describe('Mailing address: city.'),
    mobilePhone: z.string().optional().describe('Mobile phone number.'),
    otherStreet: z.string().optional().describe('Alternative address: street.'),
    reportsToId: z
      .string()
      .optional()
      .describe("Manager's Contact ID. Not available if IsPersonAccount is true."),
    individualId: z
      .string()
      .optional()
      .describe(
        'Associated data privacy record ID. Available if Data Protection and Privacy is enabled.',
      ),
    languages__c: z
      .string()
      .optional()
      .describe(
        "Custom field 'Languages__c': Languages spoken by the contact (e.g., English;Spanish).",
      ),
    mailingState: z.string().optional().describe('Mailing address: state/province.'),
    otherCountry: z.string().optional().describe('Alternative address: country.'),
    assistantName: z.string().optional().describe("Assistant's name."),
    contactSource: z
      .string()
      .optional()
      .describe('Source of contact information (e.g., external system).'),
    mailingStreet: z.string().optional().describe('Mailing address: street.'),
    otherLatitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Alternative address: latitude (–90 to 90, up to 15 decimal places). Use with OtherLongitude.',
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    assistantPhone: z.string().optional().describe("Assistant's telephone number."),
    isEmailBounced: z
      .boolean()
      .optional()
      .describe(
        'Indicates if an email to the contact has bounced, if bounce management is active.',
      ),
    lastViewedDate: z
      .string()
      .optional()
      .describe(
        'Timestamp of when current user last viewed this contact; null if only referenced (read-only).',
      ),
    mailingCountry: z.string().optional().describe('Mailing address: country.'),
    masterRecordId: z
      .string()
      .optional()
      .describe('ID of the master record if this contact was merged and deleted; null otherwise.'),
    otherLongitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Alternative address: longitude (–180 to 180, up to 15 decimal places). Use with OtherLatitude.',
      ),
    systemModstamp: z
      .string()
      .optional()
      .describe('Last system modification date/time (read-only).'),
    jigsawContactId: z
      .string()
      .optional()
      .describe('Data.com contact ID (read-only). Used for internal sync; do not modify.'),
    mailingLatitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Mailing address: latitude (–90 to 90, up to 15 decimal places). Use with MailingLongitude.',
      ),
    otherPostalCode: z.string().optional().describe('Alternative address: postal code.'),
    attributes__url: z
      .string()
      .optional()
      .describe('Relative API URL for this SObject. Typically read-only, not for update requests.'),
    emailBouncedDate: z
      .string()
      .optional()
      .describe('Date/time of email bounce, if bounce management is active.'),
    isPriorityRecord: z.boolean().optional().describe('Indicates if this is a priority contact.'),
    lastActivityDate: z
      .string()
      .optional()
      .describe('Date of the most recent activity or closed task (read-only).'),
    lastCUUpdateDate: z
      .string()
      .optional()
      .describe('Timestamp of the last contact update for data privacy (read-only).'),
    lastModifiedById: z
      .string()
      .optional()
      .describe('ID of the user who last modified the contact (read-only).'),
    lastModifiedDate: z.string().optional().describe('Last modification date/time (read-only).'),
    mailingLongitude: z
      .number()
      .int()
      .optional()
      .describe(
        'Mailing address: longitude (–180 to 180, up to 15 decimal places). Use with MailingLatitude.',
      ),
    attributes__type: z
      .string()
      .optional()
      .describe(
        "Salesforce SObject type (e.g., 'Contact'). Typically read-only, not for update requests.",
      ),
    lastCURequestDate: z
      .string()
      .optional()
      .describe('Timestamp of the last contact update request for data privacy (read-only).'),
    mailingPostalCode: z.string().optional().describe('Mailing address: postal code.'),
    emailBouncedReason: z
      .string()
      .optional()
      .describe('Reason for email bounce, if bounce management is active.'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        'Timestamp of when current user last accessed this contact or related records (read-only).',
      ),
    otherGeocodeAccuracy: z.string().optional().describe('Alternative address: geocode accuracy.'),
    mailingGeocodeAccuracy: z.string().optional().describe('Mailing address: geocode accuracy.'),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    fax,
    name,
    email,
    phone,
    title,
    jigsaw,
    ownerId,
    lastName,
    level__c,
    photoUrl,
    accountId,
    birthdate,
    firstName,
    homePhone,
    isDeleted,
    otherCity,
    department,
    leadSource,
    otherPhone,
    otherState,
    salutation,
    cleanStatus,
    createdById,
    createdDate,
    description,
    mailingCity,
    mobilePhone,
    otherStreet,
    reportsToId,
    individualId,
    languages__c,
    mailingState,
    otherCountry,
    assistantName,
    contactSource,
    mailingStreet,
    otherLatitude,
    customFields,
    assistantPhone,
    isEmailBounced,
    lastViewedDate,
    mailingCountry,
    masterRecordId,
    otherLongitude,
    systemModstamp,
    jigsawContactId,
    mailingLatitude,
    otherPostalCode,
    attributes__url,
    emailBouncedDate,
    isPriorityRecord,
    lastActivityDate,
    lastCUUpdateDate,
    lastModifiedById,
    lastModifiedDate,
    mailingLongitude,
    attributes__type,
    lastCURequestDate,
    mailingPostalCode,
    emailBouncedReason,
    lastReferencedDate,
    otherGeocodeAccuracy,
    mailingGeocodeAccuracy,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Contact/${id}`, {
      body: {
        Fax: fax,
        Name: name,
        Email: email,
        Phone: phone,
        Title: title,
        Jigsaw: jigsaw,
        OwnerId: ownerId,
        LastName: lastName,
        Level__c: level__c,
        PhotoUrl: photoUrl,
        AccountId: accountId,
        Birthdate: birthdate,
        FirstName: firstName,
        HomePhone: homePhone,
        IsDeleted: isDeleted,
        OtherCity: otherCity,
        Department: department,
        LeadSource: leadSource,
        OtherPhone: otherPhone,
        OtherState: otherState,
        Salutation: salutation,
        CleanStatus: cleanStatus,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        MailingCity: mailingCity,
        MobilePhone: mobilePhone,
        OtherStreet: otherStreet,
        ReportsToId: reportsToId,
        IndividualId: individualId,
        Languages__c: languages__c,
        MailingState: mailingState,
        OtherCountry: otherCountry,
        AssistantName: assistantName,
        ContactSource: contactSource,
        MailingStreet: mailingStreet,
        OtherLatitude: otherLatitude,
        ...customSpread,
        AssistantPhone: assistantPhone,
        IsEmailBounced: isEmailBounced,
        LastViewedDate: lastViewedDate,
        MailingCountry: mailingCountry,
        MasterRecordId: masterRecordId,
        OtherLongitude: otherLongitude,
        SystemModstamp: systemModstamp,
        JigsawContactId: jigsawContactId,
        MailingLatitude: mailingLatitude,
        OtherPostalCode: otherPostalCode,
        attributes__url: attributes__url,
        EmailBouncedDate: emailBouncedDate,
        IsPriorityRecord: isPriorityRecord,
        LastActivityDate: lastActivityDate,
        LastCUUpdateDate: lastCUUpdateDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        MailingLongitude: mailingLongitude,
        attributes__type: attributes__type,
        LastCURequestDate: lastCURequestDate,
        MailingPostalCode: mailingPostalCode,
        EmailBouncedReason: emailBouncedReason,
        LastReferencedDate: lastReferencedDate,
        OtherGeocodeAccuracy: otherGeocodeAccuracy,
        MailingGeocodeAccuracy: mailingGeocodeAccuracy,
      },
    });
  },
});
