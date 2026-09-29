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

export const hubspotArchiveTicket = tool({
  description: 'Archives a HubSpot ticket by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    ticketId: z.string().describe('Unique HubSpot identifier for the ticket to be archived.'),
  }),
  execute: async ({ hubspotToken, ticketId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/tickets/${encodeURIComponent(String(ticketId))}`,
    );
  },
});

export const hubspotArchiveTickets = tool({
  description: 'Archives multiple HubSpot tickets by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of ticket objects to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/tickets/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateTicket = tool({
  description: 'Creates a new HubSpot ticket.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    content: z
      .string()
      .optional()
      .describe(
        'Main body or description of the ticket, detailing the issue or request; typically required.',
      ),
    subject: z
      .string()
      .optional()
      .describe('Subject line or title of the ticket; typically a required field.'),
    createdBy: z.string().optional().describe('ID of the HubSpot user who created the ticket.'),
    createdate: z
      .string()
      .optional()
      .describe(
        "Date and time the ticket was created (ISO 8601 format, e.g., 'YYYY-MM-DDTHH:mm:ssZ'); HubSpot typically sets this automatically if not provided.",
      ),
    hsTagIds: z
      .array(z.string())
      .optional()
      .describe('List of tag IDs associated with the ticket for categorization or filtering.'),
    closedDate: z
      .string()
      .optional()
      .describe(
        "Date and time the ticket was closed (ISO 8601 format, e.g., 'YYYY-MM-DDTHH:mm:ssZ').",
      ),
    hsPipeline: z
      .string()
      .optional()
      .describe('ID of the pipeline this ticket belongs to; often a required field.'),
    sourceType: z
      .string()
      .optional()
      .describe(
        "Source channel through which the ticket was created; must be one of: 'CHAT', 'EMAIL', 'FORM', 'PHONE'.",
      ),
    associations: z
      .array(
        z
          .object({ to: z.string().optional(), types: z.array(z.record(z.any())) })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        'List defining associations between this new ticket and other existing HubSpot objects (e.g., linking to a contact or company). Each item specifies the target object ID (`to`) and the type of association (`types`).',
      ),
    timeToClose: z
      .string()
      .optional()
      .describe(
        "Time taken to close the ticket, often in milliseconds or ISO 8601 duration (e.g. 'PT2H30M').",
      ),
    hsAllTeamIds: z
      .array(z.string())
      .optional()
      .describe('List of all team IDs associated with this ticket; usually managed by HubSpot.'),
    hubspotTeamId: z
      .string()
      .optional()
      .describe('ID of the HubSpot team this ticket is assigned to.'),
    lastReplyDate: z
      .string()
      .optional()
      .describe(
        'Date and time of the last reply (either from agent or contact) on this ticket (ISO 8601 format).',
      ),
    hsAllOwnerIds: z
      .array(z.string())
      .optional()
      .describe(
        'List of all HubSpot owner IDs associated with this ticket; usually managed by HubSpot.',
      ),
    hsLastcontacted: z
      .string()
      .optional()
      .describe('Date and time of the last contact associated with this ticket (ISO 8601 format).'),
    hubspotOwnerId: z.string().optional().describe('ID of the HubSpot user who owns this ticket.'),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        'Dictionary of custom properties for the ticket: keys are internal names (e.g., `my_custom_field_name`), values are the data.',
      ),
    hsPipelineStage: z
      .string()
      .optional()
      .describe(
        'ID of the current stage of the ticket within its pipeline; often required and must belong to the specified `hs_pipeline`.',
      ),
    hsPrimaryCompany: z
      .string()
      .optional()
      .describe('ID of the primary company associated with this ticket.'),
    hsTicketCategory: z
      .string()
      .optional()
      .describe(
        "Category of the ticket; must be one of: 'PRODUCT_ISSUE', 'BILLING_ISSUE', 'FEATURE_REQUEST', 'GENERAL_INQUIRY'.",
      ),
    hsTicketPriority: z
      .string()
      .optional()
      .describe(
        "Priority of the ticket (e.g., 'HIGH', 'MEDIUM', 'LOW'); values might be HubSpot-defined or custom.",
      ),
    notesLastUpdated: z
      .string()
      .optional()
      .describe('Timestamp of when the notes for this ticket were last updated (ISO 8601 format).'),
    hsLastmodifieddate: z
      .string()
      .optional()
      .describe(
        'Date and time this ticket was last modified (ISO 8601 format); HubSpot typically sets this automatically.',
      ),
    hsAssignedTeamIds: z
      .array(z.string())
      .optional()
      .describe('List of team IDs specifically assigned to this ticket.'),
    hsAssignmentMethod: z
      .string()
      .optional()
      .describe("Method used for assigning the ticket (e.g., 'MANUAL', 'AUTOMATIC_ROUND_ROBIN')."),
    lastEngagementDate: z
      .string()
      .optional()
      .describe(
        'Date and time of the last engagement (e.g., email, call) with this ticket (ISO 8601 format).',
      ),
    notesLastContacted: z
      .string()
      .optional()
      .describe(
        'Timestamp of the last contact logged in notes associated with the ticket (ISO 8601 format).',
      ),
    hsCreatedByUserId: z
      .string()
      .optional()
      .describe('HubSpot user ID of the person or system that created this ticket.'),
    firstAgentReplyDate: z
      .string()
      .optional()
      .describe('Date and time of the first agent reply on this ticket (ISO 8601 format).'),
    notesNextActivityDate: z
      .string()
      .optional()
      .describe(
        "Timestamp for the next scheduled activity related to this ticket's notes (ISO 8601 format).",
      ),
    hsAllAccessibleTeamIds: z
      .array(z.string())
      .optional()
      .describe('List of all team IDs with access to this ticket; usually managed by HubSpot.'),
    hsAllConversationMentions: z
      .array(z.string())
      .optional()
      .describe('System-populated list of all mentions in conversations related to this ticket.'),
    hsAllAssociatedContactEmails: z
      .array(z.string())
      .optional()
      .describe(
        'System-populated list of email addresses of contacts associated with this ticket.',
      ),
    hsAllAssociatedContactPhones: z
      .array(z.string())
      .optional()
      .describe('System-populated list of phone numbers of contacts associated with this ticket.'),
    hsAutoGeneratedFromThreadId: z
      .string()
      .optional()
      .describe('If auto-generated from a conversation, the ID of the originating thread.'),
    hsAllAssignedBusinessUnitIds: z
      .array(z.string())
      .optional()
      .describe(
        'List of all business unit IDs assigned to this ticket; usually managed by HubSpot.',
      ),
    hsAllAssociatedContactCompanies: z
      .array(z.string())
      .optional()
      .describe(
        'System-populated list of company names or IDs for contacts linked to this ticket.',
      ),
    hsAllAssociatedContactLastnames: z
      .array(z.string())
      .optional()
      .describe('System-populated list of last names of contacts associated with this ticket.'),
    hsAllAssociatedContactFirstnames: z
      .array(z.string())
      .optional()
      .describe('System-populated list of first names of contacts associated with this ticket.'),
    hsAllAssociatedContactMobilephones: z
      .array(z.string())
      .optional()
      .describe(
        'System-populated list of mobile phone numbers of contacts associated with this ticket.',
      ),
    hsConversationsOriginatingThreadId: z
      .string()
      .optional()
      .describe('ID of the conversation thread from which this ticket originated.'),
    hsConversationsOriginatingMessageId: z
      .string()
      .optional()
      .describe("ID of the first message in the conversation that led to this ticket's creation."),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/tickets`, {
      body: flatProps(input, {
        content: 'content',
        subject: 'subject',
        createdBy: 'created_by',
        createdate: 'createdate',
        hsTagIds: 'hs_tag_ids',
        closedDate: 'closed_date',
        hsPipeline: 'hs_pipeline',
        sourceType: 'source_type',
        timeToClose: 'time_to_close',
        hsAllTeamIds: 'hs_all_team_ids',
        hubspotTeamId: 'hubspot_team_id',
        lastReplyDate: 'last_reply_date',
        hsAllOwnerIds: 'hs_all_owner_ids',
        hsLastcontacted: 'hs_lastcontacted',
        hubspotOwnerId: 'hubspot_owner_id',
        hsPipelineStage: 'hs_pipeline_stage',
        hsPrimaryCompany: 'hs_primary_company',
        hsTicketCategory: 'hs_ticket_category',
        hsTicketPriority: 'hs_ticket_priority',
        notesLastUpdated: 'notes_last_updated',
        hsLastmodifieddate: 'hs_lastmodifieddate',
        hsAssignedTeamIds: 'hs_assigned_team_ids',
        hsAssignmentMethod: 'hs_assignment_method',
        lastEngagementDate: 'last_engagement_date',
        notesLastContacted: 'notes_last_contacted',
        hsCreatedByUserId: 'hs_created_by_user_id',
        firstAgentReplyDate: 'first_agent_reply_date',
        notesNextActivityDate: 'notes_next_activity_date',
        hsAllAccessibleTeamIds: 'hs_all_accessible_team_ids',
        hsAllConversationMentions: 'hs_all_conversation_mentions',
        hsAllAssociatedContactEmails: 'hs_all_associated_contact_emails',
        hsAllAssociatedContactPhones: 'hs_all_associated_contact_phones',
        hsAutoGeneratedFromThreadId: 'hs_auto_generated_from_thread_id',
        hsAllAssignedBusinessUnitIds: 'hs_all_assigned_business_unit_ids',
        hsAllAssociatedContactCompanies: 'hs_all_associated_contact_companies',
        hsAllAssociatedContactLastnames: 'hs_all_associated_contact_lastnames',
        hsAllAssociatedContactFirstnames: 'hs_all_associated_contact_firstnames',
        hsAllAssociatedContactMobilephones: 'hs_all_associated_contact_mobilephones',
        hsConversationsOriginatingThreadId: 'hs_conversations_originating_thread_id',
        hsConversationsOriginatingMessageId: 'hs_conversations_originating_message_id',
      }),
    });
  },
});

export const hubspotCreateTickets = tool({
  description:
    'Creates multiple HubSpot tickets in a batch, each with its own properties and associations; `inputs` list must not be empty, each item needs `properties`, and associations/custom properties must be validly defined using internal names for custom fields and ISO 8601 for dates.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({ properties: z.record(z.any()), associations: z.array(z.record(z.any())) })
          .catchall(z.any()),
      )
      .describe(
        'List of ticket creation requests; each item defines one ticket with its properties and associations.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/tickets/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotGetTicket = tool({
  description: 'Retrieves a HubSpot ticket by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z.boolean().optional().describe('Filter by archived status.'),
    ticketId: z.string().describe('Unique HubSpot identifier for the ticket to retrieve.'),
    properties: z
      .array(z.string())
      .optional()
      .describe('Ticket property names to include in the response.'),
    associations: z
      .array(z.string())
      .optional()
      .describe('Object types for which to retrieve associated IDs.'),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe('Property names for which to include historical values.'),
  }),
  execute: async ({
    hubspotToken,
    archived,
    ticketId,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/tickets/${encodeURIComponent(String(ticketId))}`, {
      query: pickDefined({
        archived: archived,
        properties: properties,
        associations: associations,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotGetTickets = tool({
  description: 'Retrieves multiple HubSpot tickets by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of ticket identifiers to retrieve.'),
    archived: z.boolean().optional().describe('Filter by archived status.'),
    idProperty: z.string().optional().describe('Alternate unique identifier property to use.'),
    properties: z
      .array(z.string())
      .describe(
        'Ticket property names to include in the response. Common properties: subject, content, hs_ticket_priority, hs_ticket_category, hs_pipeline_stage, createdate, hubspot_owner_id.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Ticket property names for which to retrieve historical values. Leave empty if you only need current values.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/tickets/batch/read`, {
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

export const hubspotListTickets = tool({
  description: 'Retrieves a paginated list of HubSpot tickets.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z.string().optional().describe('Pagination token from previous response.'),
    limit: z.number().int().optional().describe('Maximum number of tickets to return per page.'),
    archived: z.boolean().optional().describe('Filter by archived status.'),
    properties: z
      .array(z.string())
      .optional()
      .describe('List of ticket property names to include in the response.'),
    associations: z
      .array(z.string())
      .optional()
      .describe('List of object types for which to retrieve associated IDs.'),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe('List of property names for which to retrieve historical values.'),
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
    return hubGet(hubspotToken, `/crm/v3/objects/tickets`, {
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

export const hubspotMergeTickets = tool({
  description: 'Merges two HubSpot tickets into one.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe('The ID of the ticket that will be merged into the primary ticket.'),
    primaryObjectId: z.string().describe('The ID of the ticket that will remain after the merge.'),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/tickets/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotSearchTickets = tool({
  description: 'Searches for HubSpot tickets using flexible criteria and filters.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe('Cursor token for pagination to get the next page of results.'),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of tickets to return in the response.'),
    query: z
      .string()
      .optional()
      .describe('Text search query to find tickets by content or subject.'),
    sorts: z
      .array(z.string())
      .optional()
      .describe('List of sort criteria for ordering the results.'),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Ticket properties to include in the response. Supports both standard and custom properties.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())).optional() }).catchall(z.any()))
      .optional()
      .describe('Groups of filters to apply to the ticket search.'),
    customProperties: z
      .array(z.string())
      .optional()
      .describe('List of custom property names to include in the response.'),
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
    return hubPost(hubspotToken, `/crm/v3/objects/tickets/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after, customProperties }),
    });
  },
});

export const hubspotUpdateTicket = tool({
  description: 'Updates properties for an existing HubSpot ticket.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    ticketId: z.string().describe('Unique HubSpot identifier for the ticket to be updated.'),
    properties: z
      .record(z.any())
      .describe(
        'Ticket properties to update. Keys are internal HubSpot property names. Values can be strings, numbers, or booleans - they will be automatically converted to strings as required by HubSpot API.',
      ),
  }),
  execute: async ({ hubspotToken, ticketId, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/tickets/${encodeURIComponent(String(ticketId))}`,
      {
        body: { properties: properties ?? {} },
      },
    );
  },
});

export const hubspotUpdateTickets = tool({
  description: 'Updates multiple HubSpot tickets in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z.object({ id: z.string(), properties: z.record(z.any()).optional() }).catchall(z.any()),
      )
      .describe('List of ticket update operations.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/tickets/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});
