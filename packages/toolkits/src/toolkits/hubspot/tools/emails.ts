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

export const hubspotArchiveEmail = tool({
  description:
    'Archives the HubSpot email specified by `emailId` by moving it to the recycling bin, making it inaccessible unless restored.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe(
        "Numeric object ID of the email engagement record in HubSpot. This is NOT an email address - it must be a numeric ID (e.g., '1234567890'). The ID can be retrieved from the HubSpot CRM email activity list or from previous API responses.",
      ),
  }),
  execute: async ({ hubspotToken, emailId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/emails/${encodeURIComponent(String(emailId))}`);
  },
});

export const hubspotArchiveEmails = tool({
  description: 'Archives multiple HubSpot emails by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of email objects to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/emails/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateEmail = tool({
  description:
    "Creates a new HubSpot email engagement record. REQUIRED FIELDS in properties dict: - hs_email_subject: Subject line - hs_email_html: HTML content - hs_timestamp: Unix timestamp in milliseconds - hs_email_direction: One of 'EMAIL', 'INCOMING_EMAIL', 'FORWARDED_EMAIL', 'DRAFT_EMAIL' This creates an email engagement/activity record in HubSpot CRM, not a marketing email.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    properties: z
      .record(z.any())
      .describe(
        "Email properties to set. Keys are HubSpot internal property names. REQUIRED fields: 'hs_email_subject' (subject line), 'hs_email_html' (HTML content), 'hs_timestamp' (Unix timestamp in milliseconds), 'hs_email_direction' (one of: 'EMAIL', 'INCOMING_EMAIL', 'FORWARDED_EMAIL', 'DRAFT_EMAIL'). This creates an email engagement/activity record in HubSpot CRM.",
      ),
  }),
  execute: async ({ hubspotToken, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/emails`, {
      body: pickDefined({ properties: properties }),
    });
  },
});

export const hubspotCreateEmails = tool({
  description: 'Creates multiple HubSpot emails in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ properties: z.record(z.any()) }).catchall(z.any()))
      .describe('List of email objects to create.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/emails/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotGetEmails = tool({
  description:
    'Retrieves multiple HubSpot email engagement records by their IDs in a single batch request.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of email identifiers to retrieve.'),
    archived: z.boolean().optional().describe('Filter by archived status.'),
    idProperty: z.string().optional().describe('Alternate unique identifier property to use.'),
    properties: z.array(z.string()).describe('Email property names to include in the response.'),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Email property names for which to retrieve historical values. Leave empty if history is not needed.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/emails/batch/read`, {
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

export const hubspotListEmails = tool({
  description:
    'Retrieves a paginated list of HubSpot emails, allowing selection of specific properties (with or without history), associated object IDs, and filtering by archive status.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Cursor for pagination; use `paging.next.after` from a previous response for the next page.',
      ),
    limit: z.number().int().optional().describe('Maximum number of email records per page.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `True` to retrieve only archived emails, `False` (default) for non-archived emails.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        "List of valid HubSpot email property names to include. If a requested property doesn't exist on a record, it's omitted from that record's response.",
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "List of valid HubSpot CRM object types (e.g., 'contact', 'deal') for which to retrieve associated IDs. If an association type is invalid or doesn't exist for an email, it's ignored for that email.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        "List of valid HubSpot email property names to retrieve with history. If a requested property doesn't exist, it's ignored.",
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
    return hubGet(hubspotToken, `/crm/v3/objects/emails`, {
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

export const hubspotMergeEmails = tool({
  description: 'Merges two HubSpot emails into one.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe('The ID of the email that will be merged into the primary email.'),
    primaryObjectId: z.string().describe('The ID of the email that will remain after the merge.'),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/emails/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotReadEmail = tool({
  description:
    'Call this to retrieve an existing HubSpot email by its `emailId` or an alternative unique `idProperty`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe(
        'The unique identifier (HubSpot ID) of the email object to retrieve, or the value of the `idProperty` if specified.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe('Set to true to retrieve only archived email objects.'),
    idProperty: z
      .string()
      .optional()
      .describe(
        'Name of an alternative unique property to identify the email if not using `emailId`.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe('Specific email properties to include; non-existent properties are ignored.'),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Object types (e.g., 'contact', 'company') for associated IDs; non-existent associations are ignored.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Email properties for which to retrieve historical values; non-existent properties are ignored.',
      ),
  }),
  execute: async ({
    hubspotToken,
    emailId,
    archived,
    idProperty,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/emails/${encodeURIComponent(String(emailId))}`, {
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

export const hubspotSearchEmails = tool({
  description: 'Searches for HubSpot emails using flexible criteria and filters.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z.string().optional().describe('Pagination token from previous response.'),
    limit: z.number().int().optional().describe('Maximum number of emails to return.'),
    query: z
      .string()
      .optional()
      .describe('Text search query to find emails by subject or content.'),
    properties: z
      .array(z.string())
      .optional()
      .describe('Email property names to include in the response.'),
  }),
  execute: async ({ hubspotToken, after, limit, query, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/emails/search`, {
      body: searchBody({ query, properties, limit, after }),
    });
  },
});

export const hubspotUpdateEmail = tool({
  description:
    'Partially updates properties of an existing HubSpot email object, identified by `emailId` (as internal ID or custom unique property value if `idProperty` is given); the object must exist.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe(
        'Identifier of the email object. This is its internal HubSpot ID, or a custom unique property value if `idProperty` is also provided.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        'Name of a unique HubSpot property for emails. If specified, `emailId` must be the value of this unique property, not the internal HubSpot ID.',
      ),
    properties: z
      .record(z.any())
      .describe(
        'Property names and new values for the email. Values overwrite existing ones; an empty string clears a property. Read-only or non-existent properties are ignored.',
      ),
  }),
  execute: async ({ hubspotToken, emailId, idProperty, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(hubspotToken, `/crm/v3/objects/emails/${encodeURIComponent(String(emailId))}`, {
      body: pickDefined({ properties: properties }),
    });
  },
});

export const hubspotUpdateEmails = tool({
  description: 'Updates multiple HubSpot emails in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z.object({ id: z.string(), properties: z.record(z.any()).optional() }).catchall(z.any()),
      )
      .describe('List of email update operations.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/emails/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});
