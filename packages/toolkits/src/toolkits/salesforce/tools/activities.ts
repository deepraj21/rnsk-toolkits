// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceCreateNote = tool({
  description:
    'Creates a new note attached to a Salesforce record with the specified title and content. Does not deduplicate — identical calls create duplicate notes. High-volume creation can trigger REQUEST_LIMIT_EXCEEDED; apply exponential backoff on retries.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    body: z
      .string()
      .optional()
      .describe('Body/content of the note. Can contain detailed text information.'),
    title: z.string().describe('Title of the note (required field in Salesforce).'),
    ownerId: z
      .string()
      .optional()
      .describe(
        'ID of the user who will own the note. Defaults to the current user if not specified.',
      ),
    parentId: z
      .string()
      .describe(
        'ID of the record to attach the note to (required field in Salesforce). Can be any record that supports notes like Account, Contact, Lead, Opportunity, etc.',
      ),
    isPrivate: z
      .boolean()
      .optional()
      .describe(
        'Whether the note should be private (only visible to owner and users with Modify All Data permission).',
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Priority__c', 'Category__c'). Use this to set any custom fields defined on the Note object in your Salesforce org.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    body,
    title,
    ownerId,
    parentId,
    isPrivate,
    customFields,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Note`, {
      body: {
        Body: body,
        Title: title,
        OwnerId: ownerId,
        ParentId: parentId,
        IsPrivate: isPrivate,
        ...customSpread,
      },
    });
  },
});

export const salesforceCreateNoteRecordWithContentTypeHeader = tool({
  description:
    'DEPRECATED: Creates a new Note record in Salesforce, associated with an existing Salesforce object via `ParentId`, automatically including a `Content-Type: application/json` header.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .optional()
      .describe(
        'Unique identifier for the Note object, typically auto-generated and not provided in the request.',
      ),
    body: z.string().describe('Content or body of the note.'),
    title: z.string().describe('Title of the note.'),
    ownerId: z
      .string()
      .optional()
      .describe('ID of the Salesforce User who will own the note; defaults to the API user.'),
    parentId: z
      .string()
      .describe(
        'ID of the parent Salesforce record (e.g., Account, Contact) to which this note is related; must reference an existing record.',
      ),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Indicates if the object is in the Recycle Bin. Label is Deleted.'),
    isPrivate: z
      .boolean()
      .optional()
      .describe(
        "If true, restricts note visibility to the owner or users with 'Modify All Data' permission. Label is Private.",
      ),
    createdById: z
      .string()
      .optional()
      .describe('ID of the user who created the note (system-generated, read-only on create).'),
    createdDate: z
      .string()
      .optional()
      .describe('Timestamp of note creation (system-generated, read-only on create).'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    systemModstamp: z
      .string()
      .optional()
      .describe('Timestamp of last system change (system-generated).'),
    attributes__url: z
      .string()
      .optional()
      .describe(
        'API URL for the SObject. Corresponds to `attributes.url` in the JSON body (typically read-only).',
      ),
    lastModifiedById: z
      .string()
      .optional()
      .describe('ID of the user who last modified the note (system-generated).'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Timestamp of last modification (system-generated).'),
    attributes__type: z
      .string()
      .optional()
      .describe(
        "SObject type, should be 'Note' if provided. Corresponds to `attributes.type` in the JSON body.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    body,
    title,
    ownerId,
    parentId,
    isDeleted,
    isPrivate,
    createdById,
    createdDate,
    customFields,
    systemModstamp,
    attributes__url,
    lastModifiedById,
    lastModifiedDate,
    attributes__type,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Note`, {
      body: {
        Id: id,
        Body: body,
        Title: title,
        OwnerId: ownerId,
        ParentId: parentId,
        IsDeleted: isDeleted,
        IsPrivate: isPrivate,
        CreatedById: createdById,
        CreatedDate: createdDate,
        ...customSpread,
        SystemModstamp: systemModstamp,
        attributes__url: attributes__url,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        attributes__type: attributes__type,
      },
    });
  },
});

export const salesforceCreateTask = tool({
  description:
    'Creates a new task in Salesforce to track activities, to-dos, and follow-ups related to contacts, leads, or other records. Ensure who_id, what_id, and owner_id reference existing records before calling; invalid IDs cause silent linkage failures or validation errors.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    status: z
      .string()
      .optional()
      .describe(
        'Status of the task. Must be a valid picklist value; arbitrary strings trigger validation errors.',
      ),
    whoId: z
      .string()
      .optional()
      .describe(
        "ID of the Contact or Lead this task is associated with. Only accepts Contact IDs (prefix '003') or Lead IDs (prefix '00Q'). Do NOT use Account/Opportunity/Case IDs here; use what_id for those. Swapping who_id and what_id creates orphaned ta",
      ),
    subject: z.string().describe('Subject/title of the task.'),
    whatId: z
      .string()
      .optional()
      .describe(
        "ID of the related record (Account, Opportunity, Case, etc.) this task is associated with. Accepts Account IDs (prefix '001'), Opportunity IDs (prefix '006'), Case IDs (prefix '500'), and other business object IDs.",
      ),
    ownerId: z
      .string()
      .optional()
      .describe('ID of the user who owns the task. Defaults to current user if not specified.'),
    priority: z.string().optional().describe('Priority level of the task.'),
    description: z.string().optional().describe('Detailed description or notes for the task.'),
    activityDate: z
      .string()
      .optional()
      .describe(
        "Due date for the task in YYYY-MM-DD format. Do not use full datetimes or natural-language strings like 'yesterday'; only YYYY-MM-DD is accepted.",
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Priority_Level__c': 'Critical').",
      ),
    isReminderSet: z.boolean().optional().describe('Whether to set a reminder for this task.'),
    reminderDateTime: z
      .string()
      .optional()
      .describe(
        'Date and time for the reminder in ISO format (YYYY-MM-DDTHH:MM:SS). Required if is_reminder_set is true. Interpreted according to org/user timezone, not UTC.',
      ),
    composioExecutionMessage: z
      .string()
      .optional()
      .describe('Internal field used to communicate processing details.'),
  }),
  execute: async ({
    salesforceCredentials,
    status,
    whoId,
    subject,
    whatId,
    ownerId,
    priority,
    description,
    activityDate,
    customFields,
    isReminderSet,
    reminderDateTime,
    composioExecutionMessage,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Task`, {
      body: {
        status: status,
        WhoId: whoId,
        subject: subject,
        WhatId: whatId,
        OwnerId: ownerId,
        priority: priority,
        description: description,
        ActivityDate: activityDate,
        ...customSpread,
        IsReminderSet: isReminderSet,
        ReminderDateTime: reminderDateTime,
        ComposioExecutionMessage: composioExecutionMessage,
      },
    });
  },
});

export const salesforceDeleteNote = tool({
  description: 'Permanently deletes a note from Salesforce. This action cannot be undone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    noteId: z.string().describe('The Salesforce ID of the note to delete.'),
  }),
  execute: async ({ salesforceCredentials, noteId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Note/${noteId}`);
  },
});

export const salesforceGetNote = tool({
  description:
    'Retrieves a specific note by ID from Salesforce, returning all available fields. Notes with IsPrivate=true require the integration user to have sufficient permissions; inaccessible private notes will not be returned.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    noteId: z.string().describe('The Salesforce ID of the note to retrieve.'),
  }),
  execute: async ({ salesforceCredentials, noteId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Note/${noteId}`);
  },
});

export const salesforceGetNoteByIdWithFields = tool({
  description:
    'DEPRECATED: Retrieves a Salesforce Note object by its ID, optionally specifying which fields to return; the Note ID must exist.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('Unique identifier (ID) of the Note object to retrieve.'),
    fields: z
      .string()
      .optional()
      .describe(
        "Comma-delimited API names of fields for the Note object (e.g., 'Title,Body'). If omitted, all accessible fields are retrieved.",
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Note/${id}`, { query: { fields: fields } });
  },
});

export const salesforceListNotes = tool({
  description:
    'Lists notes from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Designed specifically for Note and ContentNote objects.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        "SOQL query to fetch notes. Use standard SOQL syntax to filter, sort, and limit results. This action is specifically designed for Note and ContentNote objects. For other objects like EmailMessage (which uses 'Subject' instead of 'Title'), us",
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, Title, Body, IsPrivate, ParentId, OwnerId, CreatedDate, LastModifiedDate FROM Note';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceLogCall = tool({
  description:
    'Logs a completed phone call as a task in Salesforce with call-specific details like duration, type, and disposition.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    whoId: z
      .string()
      .optional()
      .describe(
        'ID of the Contact or Lead associated with the call. Invalid or non-existent IDs create orphaned or mislinked activity records.',
      ),
    subject: z.string().optional().describe("Subject line for the call log. Defaults to 'Call'."),
    whatId: z
      .string()
      .optional()
      .describe(
        'ID of the related record (Account, Opportunity, Case, etc.) associated with the call.',
      ),
    comments: z
      .string()
      .optional()
      .describe('Detailed notes or description of what was discussed during the call.'),
    callDate: z
      .string()
      .optional()
      .describe('Date of the call in YYYY-MM-DD format. Defaults to today if not specified.'),
    callType: z
      .enum(['Inbound', 'Outbound', 'Internal'])
      .optional()
      .describe('Standard Salesforce Task CallType values. This is a restricted picklist.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Call_Outcome__c').",
      ),
    callDisposition: z
      .string()
      .optional()
      .describe(
        'Outcome or result of the call. Restricted picklist — only org-configured values are accepted; unlisted values cause validation errors.',
      ),
    callDurationSeconds: z.number().int().optional().describe('Duration of the call in seconds.'),
  }),
  execute: async ({
    salesforceCredentials,
    whoId,
    subject,
    whatId,
    comments,
    callDate,
    callType,
    customFields,
    callDisposition,
    callDurationSeconds,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (subject === undefined) subject = 'Call';
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Task`, {
      body: {
        WhoId: whoId,
        Subject: subject,
        WhatId: whatId,
        Description: comments,
        ActivityDate: callDate,
        CallType: callType,
        ...customSpread,
        CallDisposition: callDisposition,
        CallDurationInSeconds: callDurationSeconds,
        TaskSubtype: 'Call',
        Status: 'Completed',
      },
    });
  },
});

export const salesforceLogEmailActivity = tool({
  description:
    'Creates an EmailMessage record to log email activity in Salesforce, associating it with related records. Requires EmailMessage insert permissions enabled at the org level; some orgs block this entirely.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    status: z
      .string()
      .optional()
      .describe('Status of the email. 0=New, 1=Read, 2=Replied, 3=Sent, 4=Forwarded, 5=Draft'),
    subject: z.string().describe('Subject line of the email.'),
    htmlBody: z
      .string()
      .optional()
      .describe(
        'HTML body of the email. If provided, takes precedence over text_body for display.',
      ),
    parentId: z
      .string()
      .optional()
      .describe('ID of the parent record, typically a Case for case-related emails.'),
    textBody: z.string().optional().describe('Plain text body of the email.'),
    ccAddress: z.string().optional().describe('CC email addresses (comma-separated if multiple).'),
    toAddress: z
      .string()
      .describe('Email addresses of the recipients (comma-separated if multiple).'),
    bccAddress: z
      .string()
      .optional()
      .describe('BCC email addresses (comma-separated if multiple).'),
    isIncoming: z
      .boolean()
      .optional()
      .describe('Whether this is an incoming email (true) or outgoing email (false).'),
    fromAddress: z.string().describe('Email address of the sender.'),
    messageDate: z
      .string()
      .optional()
      .describe(
        "Date/time the email was sent in ISO format. Defaults to current time if not provided. Must be an explicit ISO datetime string; relative expressions like 'yesterday' cause validation errors.",
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Email_Category__c').",
      ),
    relatedToId: z
      .string()
      .describe(
        'ID of the record to associate this email with (Account, Opportunity, Case, etc.). Must reference a supported object type (Account, Opportunity, Case, Contact, Lead, etc.); unsupported object types cause validation errors or create standalon',
      ),
    isClientManaged: z
      .boolean()
      .optional()
      .describe('Whether the email is client-managed (not sent through Salesforce).'),
    isExternallyVisible: z
      .boolean()
      .optional()
      .describe('Whether the email is visible in customer portals/communities.'),
  }),
  execute: async ({
    salesforceCredentials,
    status,
    subject,
    htmlBody,
    parentId,
    textBody,
    ccAddress,
    toAddress,
    bccAddress,
    isIncoming,
    fromAddress,
    messageDate,
    customFields,
    relatedToId,
    isClientManaged,
    isExternallyVisible,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/EmailMessage`, {
      body: {
        Status: status,
        Subject: subject,
        HtmlBody: htmlBody,
        ParentId: parentId,
        TextBody: textBody,
        CcAddress: ccAddress,
        ToAddress: toAddress,
        BccAddress: bccAddress,
        IsIncoming: isIncoming,
        FromAddress: fromAddress,
        MessageDate: messageDate,
        ...customSpread,
        RelatedToId: relatedToId,
        IsClientManaged: isClientManaged,
        IsExternallyVisible: isExternallyVisible,
      },
    });
  },
});

export const salesforceRemoveNoteObjectById = tool({
  description:
    'DEPRECATED: Permanently deletes an existing Salesforce Note object identified by its unique ID.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'The unique 15-character or 18-character Salesforce ID of the Note object to be deleted.',
      ),
  }),
  execute: async ({ salesforceCredentials, id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Note/${id}`);
  },
});

export const salesforceUpdateNote = tool({
  description:
    'Updates an existing note in Salesforce with the specified changes. Only provided fields will be updated.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    body: z
      .string()
      .optional()
      .describe('Updated body/content of the note. Leave empty to keep unchanged.'),
    title: z
      .string()
      .optional()
      .describe('Updated title of the note. Leave empty to keep unchanged.'),
    noteId: z.string().describe('The Salesforce ID of the note to update.'),
    ownerId: z.string().optional().describe('Updated owner ID. Leave empty to keep unchanged.'),
    isPrivate: z
      .boolean()
      .optional()
      .describe('Updated privacy setting. Leave empty to keep unchanged.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Custom fields to update on the note. Keys should be the API names of custom fields (e.g., 'Custom_Field__c'). Values can be strings, numbers, booleans, or null.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    body,
    title,
    noteId,
    ownerId,
    isPrivate,
    customFields,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      Body: body,
      Title: title,
      OwnerId: ownerId,
      IsPrivate: isPrivate,
      ...customSpread,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Note/${noteId}`, { body: sfBody });
  },
});

export const salesforceUpdateSpecificNoteById = tool({
  description:
    'DEPRECATED: Use `update_specific_note_by_id` instead. Updates specified fields of an existing Salesforce Note SObject identified by its ID; the Note must already exist.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'The 18-character Salesforce ID of the Note SObject to be updated. This is a required path parameter. (Note: actual Note IDs typically start with `002`).',
      ),
    body: z.string().optional().describe('Content or body of the Note. Limited to 32 KB.'),
    title: z.string().optional().describe('Title of the Note.'),
    ownerId: z
      .string()
      .optional()
      .describe(
        'The 18-character Salesforce ID of the User who owns the Note. Updating this changes Note ownership.',
      ),
    parentId: z
      .string()
      .optional()
      .describe(
        'ID of the parent SObject (e.g., Account, Contact, Opportunity) to which this Note is related; can be updated. Salesforce Note objects often require a `ParentId`.',
      ),
    isDeleted: z
      .boolean()
      .optional()
      .describe(
        'Indicates whether the Note has been moved to the Recycle Bin (`true`) or not (`false`). Set to `true` to soft-delete. Label: `Deleted`.',
      ),
    isPrivate: z
      .boolean()
      .optional()
      .describe(
        "Controls Note visibility. If `true`, Note is private (accessible only by owner or users with 'Modify All Data'). If `false` (default), visibility based on sharing rules. Note: users without 'Modify All Data' setting this `true` on a non-own",
      ),
    createdById: z
      .string()
      .optional()
      .describe(
        'Salesforce ID of the User who created the Note (Salesforce field `CreatedById`). System-generated, read-only, and not updatable.',
      ),
    createdDate: z
      .string()
      .optional()
      .describe(
        'Timestamp of Note creation (Salesforce field `CreatedDate`). System-generated, read-only, and not updatable through this action.',
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    systemModstamp: z
      .string()
      .optional()
      .describe(
        "Timestamp of Note record's last modification by user or system (Salesforce field `SystemModstamp`). System-generated, read-only, not updatable.",
      ),
    attributes__url: z
      .string()
      .optional()
      .describe(
        'Relative URL for the SObject record. System-managed metadata, not part of an update request.',
      ),
    lastModifiedById: z
      .string()
      .optional()
      .describe(
        'Salesforce ID of the User who last modified the Note (Salesforce field `LastModifiedById`). System-generated, read-only, and not updatable.',
      ),
    lastModifiedDate: z
      .string()
      .optional()
      .describe(
        "Timestamp of Note's last modification (Salesforce field `LastModifiedDate`). System-generated, read-only, and not updatable.",
      ),
    attributes__type: z
      .string()
      .optional()
      .describe(
        "Type of the SObject, typically 'Note'. System-managed metadata, not part of an update request.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    body,
    title,
    ownerId,
    parentId,
    isDeleted,
    isPrivate,
    createdById,
    createdDate,
    customFields,
    systemModstamp,
    attributes__url,
    lastModifiedById,
    lastModifiedDate,
    attributes__type,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Note/${id}`, {
      body: {
        Body: body,
        Title: title,
        OwnerId: ownerId,
        ParentId: parentId,
        IsDeleted: isDeleted,
        IsPrivate: isPrivate,
        CreatedById: createdById,
        CreatedDate: createdDate,
        ...customSpread,
        SystemModstamp: systemModstamp,
        attributes__url: attributes__url,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        attributes__type: attributes__type,
      },
    });
  },
});

export const salesforceUpdateTask = tool({
  description:
    'Updates an existing task in Salesforce with new information. Only provided fields will be updated.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    status: z.string().optional().describe('Updated status. Leave empty to keep unchanged.'),
    whoId: z
      .string()
      .optional()
      .describe('Updated Contact or Lead ID. Leave empty to keep unchanged.'),
    subject: z
      .string()
      .optional()
      .describe('Updated subject/title of the task. Leave empty to keep unchanged.'),
    taskId: z.string().describe('The Salesforce ID of the task to update.'),
    whatId: z
      .string()
      .optional()
      .describe('Updated related record ID. Leave empty to keep unchanged.'),
    priority: z
      .string()
      .optional()
      .describe('Updated priority level. Leave empty to keep unchanged.'),
    description: z
      .string()
      .optional()
      .describe('Updated description or notes. Leave empty to keep unchanged.'),
    activityDate: z
      .string()
      .optional()
      .describe('Updated due date in YYYY-MM-DD format. Leave empty to keep unchanged.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Priority_Level__c': 'High').",
      ),
    isReminderSet: z
      .boolean()
      .optional()
      .describe('Whether to set/unset a reminder. Leave empty to keep unchanged.'),
    reminderDateTime: z
      .string()
      .optional()
      .describe('Updated reminder date/time in ISO format. Leave empty to keep unchanged.'),
  }),
  execute: async ({
    salesforceCredentials,
    status,
    whoId,
    subject,
    taskId,
    whatId,
    priority,
    description,
    activityDate,
    customFields,
    isReminderSet,
    reminderDateTime,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      status: status,
      WhoId: whoId,
      subject: subject,
      WhatId: whatId,
      priority: priority,
      description: description,
      ActivityDate: activityDate,
      ...customSpread,
      IsReminderSet: isReminderSet,
      ReminderDateTime: reminderDateTime,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Task/${taskId}`, { body: sfBody });
  },
});
