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

export const hubspotCreateEngagement = tool({
  description:
    'Create a legacy EMAIL, CALL, MEETING, TASK, or NOTE engagement with optional CRM associations, attachments, and type-specific metadata. Legacy engagements API: type-specific fields go in metadata using HubSpot exact keys.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    active: z.boolean().optional().describe('Optional active state for the engagement.'),
    dealIds: z
      .array(z.string())
      .optional()
      .describe('Deal IDs as digit strings to associate with the engagement.'),
    metadata: z
      .record(z.any())
      .optional()
      .describe(
        "Type-specific metadata using HubSpot's exact keys for the selected EMAIL, CALL, MEETING, TASK, or NOTE engagement type. For NOTE, body is the note text and is limited to 65,536 characters.",
      ),
    ownerId: z.string().optional().describe('HubSpot owner ID as a digit string.'),
    ticketIds: z
      .array(z.string())
      .optional()
      .describe('Ticket IDs as digit strings to associate with the engagement.'),
    companyIds: z
      .array(z.string())
      .optional()
      .describe('Company IDs as digit strings to associate with the engagement.'),
    contactIds: z
      .array(z.string())
      .optional()
      .describe('Contact IDs as digit strings to associate with the engagement.'),
    timestampMs: z
      .number()
      .int()
      .optional()
      .describe('Engagement occurrence time as Unix milliseconds.'),
    attachmentIds: z
      .array(z.string())
      .optional()
      .describe(
        'HubSpot file IDs as digit strings; each is sent as an object with an integer id field.',
      ),
    engagementType: z
      .enum(['EMAIL', 'CALL', 'MEETING', 'TASK', 'NOTE'])
      .describe('Legacy engagement kind; metadata requirements vary by this value.'),
    associationOwnerIds: z
      .array(z.string())
      .optional()
      .describe('Owner IDs as digit strings to include in the associations object.'),
  }),
  execute: async ({
    hubspotToken,
    engagementType,
    metadata,
    contactIds,
    companyIds,
    dealIds,
    ticketIds,
    ownerId,
    attachmentIds,
    active,
    timestampMs,
    associationOwnerIds,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    const ownerIds = [...(ownerId ? [ownerId] : []), ...(associationOwnerIds ?? []).map(String)];
    return hubPost(hubspotToken, '/engagements/v1/engagements', {
      body: {
        engagement: pickDefined({ type: engagementType, timestamp: timestampMs, active }),
        associations: pickDefined({
          contactIds,
          companyIds,
          dealIds,
          ticketIds,
          ownerIds: ownerIds.length ? ownerIds : undefined,
        }),
        attachments: (attachmentIds ?? []).map((id) => ({ id: Number(id) })),
        metadata: metadata ?? {},
      },
    });
  },
});

export const hubspotCreateMeeting = tool({
  description:
    'Creates a new meeting engagement in HubSpot CRM. Use this action when you need to log a meeting that occurred or schedule a future meeting with contacts, companies, or other CRM records. The meeting will appear on the timeline of associated records and can include details like title, time, location, notes, and outcome.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    associations: z
      .array(
        z.object({ to: z.record(z.any()), types: z.array(z.record(z.any())) }).catchall(z.any()),
      )
      .optional()
      .describe(
        'List of associations to link this meeting with other CRM objects like contacts, companies, or deals.',
      ),
    hsTimestamp: z
      .string()
      .describe(
        'The date and time when the meeting occurred, in Unix timestamp (milliseconds) or ISO 8601 format. This is the only required field and defaults to hs_meeting_start_time if that is provided.',
      ),
    hsMeetingBody: z
      .string()
      .optional()
      .describe('Description or notes about the meeting content and agenda.'),
    hsActivityType: z
      .string()
      .optional()
      .describe('Meeting classification or activity type based on your HubSpot account settings.'),
    hsMeetingTitle: z.string().optional().describe('The title or name of the meeting.'),
    hubspotOwnerId: z
      .string()
      .optional()
      .describe('The ID of the HubSpot user who owns or created this meeting.'),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        "Additional custom properties as key-value pairs using the property's internal name as the key.",
      ),
    hsAttachmentIds: z
      .string()
      .optional()
      .describe('Semicolon-separated list of attachment IDs to associate with the meeting.'),
    hsMeetingOutcome: z
      .enum(['SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'NO_SHOW', 'CANCELED'])
      .optional()
      .describe('Outcome status for a meeting engagement.'),
    hsMeetingEndTime: z
      .string()
      .optional()
      .describe(
        'The scheduled end time of the meeting, in Unix timestamp (milliseconds) or ISO 8601 format.',
      ),
    hsMeetingLocation: z
      .string()
      .optional()
      .describe(
        'The location of the meeting (physical address, conference room, video link, or phone number).',
      ),
    hsMeetingStartTime: z
      .string()
      .optional()
      .describe(
        'The scheduled start time of the meeting, in Unix timestamp (milliseconds) or ISO 8601 format. Should match hs_timestamp.',
      ),
    hsMeetingExternalUrl: z
      .string()
      .optional()
      .describe('External URL to the calendar event (Google Calendar, Outlook, etc.).'),
    hsInternalMeetingNotes: z
      .string()
      .optional()
      .describe(
        'Internal notes for your team about the meeting, not visible to external attendees.',
      ),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/meetings`, {
      body: flatProps(input, {
        hsTimestamp: 'hs_timestamp',
        hsMeetingBody: 'hs_meeting_body',
        hsActivityType: 'hs_activity_type',
        hsMeetingTitle: 'hs_meeting_title',
        hubspotOwnerId: 'hubspot_owner_id',
        hsAttachmentIds: 'hs_attachment_ids',
        hsMeetingOutcome: 'hs_meeting_outcome',
        hsMeetingEndTime: 'hs_meeting_end_time',
        hsMeetingLocation: 'hs_meeting_location',
        hsMeetingStartTime: 'hs_meeting_start_time',
        hsMeetingExternalUrl: 'hs_meeting_external_url',
        hsInternalMeetingNotes: 'hs_internal_meeting_notes',
      }),
    });
  },
});

export const hubspotCreateNote = tool({
  description:
    'Creates a new HubSpot CRM note. Use when you need to add a timestamped note with optional attachments and associations to contacts, companies, deals, or tickets.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    associations: z
      .array(z.record(z.any()))
      .optional()
      .describe('List of associations to link with the note (e.g., contacts, deals, companies).'),
    hsNoteBody: z
      .string()
      .optional()
      .describe('Text content of the note (up to 65,536 characters).'),
    hsTimestamp: z
      .union([z.string(), z.number().int()])
      .describe(
        "Creation time of the note. Either an ISO-8601 UTC timestamp (e.g., '2021-11-12T15:48:22Z') or Unix milliseconds since epoch.",
      ),
    hubspotOwnerId: z
      .string()
      .optional()
      .describe('HubSpot user ID to assign as the creator/owner of this note.'),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        "A dictionary of custom properties. Boolean-type fields accept 'Yes'/'No', 'true'/'false', 'on'/'off', 'y'/'n' and Python booleans, which are auto-converted to string values ('true'/'false') for HubSpot API compatibility. Numeric strings ('0', '1', '2', etc.) are preserved as-is for number fields.",
      ),
    hsAttachmentIds: z
      .string()
      .optional()
      .describe('Semicolon-separated list of file attachment IDs.'),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/notes`, {
      body: flatProps(input, {
        hsNoteBody: 'hs_note_body',
        hsTimestamp: 'hs_timestamp',
        hubspotOwnerId: 'hubspot_owner_id',
        hsAttachmentIds: 'hs_attachment_ids',
      }),
    });
  },
});

export const hubspotCreateTask = tool({
  description:
    'Creates a new CRM task record. Use when adding a task with properties and optional associations.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    associations: z
      .array(z.object({ types: z.array(z.record(z.any())), to__id: z.string() }).catchall(z.any()))
      .optional()
      .describe('Optional list of associations to link this task with existing CRM records.'),
    hsTaskBody: z.string().optional().describe('Notes or body text of the task.'),
    hsTaskType: z
      .enum(['CALL', 'EMAIL', 'TODO'])
      .optional()
      .describe('Type of the task. Defaults to TODO if not specified.'),
    hsTimestamp: z
      .union([z.string(), z.number().int()])
      .describe('Task due date in ISO 8601 format or Unix milliseconds; required.'),
    hsTaskStatus: z
      .enum(['NOT_STARTED', 'COMPLETED'])
      .optional()
      .describe('Current status of the task. Defaults to NOT_STARTED if not specified.'),
    hsTaskSubject: z.string().optional().describe('Title or subject line of the task.'),
    hsTaskPriority: z
      .enum(['LOW', 'MEDIUM', 'HIGH', 'NONE'])
      .optional()
      .describe('Priority level of the task. Defaults to NONE if not specified.'),
    hubspotOwnerId: z
      .string()
      .optional()
      .describe(
        "ID of the HubSpot owner to assign this task to. This is a numeric string (typically 6-9 digits, e.g., '85424051') that uniquely identifies a user in your HubSpot account. To obtain valid owner IDs, use the HUBSPOT_RETRIEVE_OWNERS action. If omitted, the task will be unassigned.",
      ),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        "A dictionary of custom properties. Boolean-type fields accept 'Yes'/'No', 'true'/'false', 'on'/'off', 'y'/'n' and Python booleans, which are auto-converted to string values ('true'/'false') for HubSpot API compatibility. Numeric strings ('0', '1', '2', etc.) are preserved as-is for number fields.",
      ),
    hsTaskReminders: z
      .number()
      .int()
      .optional()
      .describe('Reminder time for the task in Unix milliseconds.'),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/tasks`, {
      body: flatProps(input, {
        hsTaskBody: 'hs_task_body',
        hsTaskType: 'hs_task_type',
        hsTimestamp: 'hs_timestamp',
        hsTaskStatus: 'hs_task_status',
        hsTaskSubject: 'hs_task_subject',
        hsTaskPriority: 'hs_task_priority',
        hubspotOwnerId: 'hubspot_owner_id',
        hsTaskReminders: 'hs_task_reminders',
      }),
    });
  },
});

export const hubspotDeleteCall = tool({
  description:
    'Permanently deletes a HubSpot call record by its ID. This action removes a call engagement from the CRM. Use this action when you need to remove a specific call record that is no longer needed or was created in error. This action is irreversible - the call record cannot be recovered once deleted.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    callId: z
      .string()
      .describe(
        'The unique identifier of the HubSpot call record to be deleted. This is a numeric ID that identifies the specific call engagement in the CRM.',
      ),
  }),
  execute: async ({ hubspotToken, callId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/calls/${encodeURIComponent(String(callId))}`);
  },
});

export const hubspotDeleteMeeting = tool({
  description:
    "Permanently deletes (archives) a HubSpot meeting by its ID, moving it to the recycling bin where it can be restored within 90 days. Use this action when you need to remove a meeting engagement from HubSpot's CRM. This action is irreversible via the API \u2014 the meeting cannot be recovered programmatically once deleted.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    meetingId: z
      .string()
      .describe('The unique HubSpot identifier for the meeting to be archived/deleted.'),
  }),
  execute: async ({ hubspotToken, meetingId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/meetings/${encodeURIComponent(String(meetingId))}`,
    );
  },
});

export const hubspotDeleteNote = tool({
  description:
    'Archives a HubSpot note by its ID, removing it from active view. The note is archived rather than permanently deleted and can be restored within 90 days. Use this action when you need to remove a note from the CRM without permanently deleting it. This action is irreversible through the API - archived notes cannot be restored programmatically.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    noteId: z
      .string()
      .describe(
        'The unique numeric ID of the note to delete/archive. This is the HubSpot note record ID.',
      ),
  }),
  execute: async ({ hubspotToken, noteId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/notes/${encodeURIComponent(String(noteId))}`);
  },
});

export const hubspotDeleteTask = tool({
  description:
    'Archives a HubSpot task by its ID, removing it from active task lists. Use this action when you need to delete or remove a task from HubSpot CRM. The task is archived rather than permanently deleted and may be recoverable. This action is irreversible from the API perspective \u2014 the task cannot be directly unarchived via this action.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    taskId: z
      .string()
      .describe(
        "The unique identifier of the task to delete. Must be a numeric string (e.g., '12345678901').",
      ),
  }),
  execute: async ({ hubspotToken, taskId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/tasks/${encodeURIComponent(String(taskId))}`);
  },
});

export const hubspotGetEngagement = tool({
  description: 'Retrieve one legacy aggregate engagement by its engagement ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    engagementId: z.string().describe('The unique legacy aggregate engagement ID to retrieve.'),
  }),
  execute: async ({ hubspotToken, engagementId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/engagements/v1/engagements/${encodeURIComponent(String(engagementId))}`,
    );
  },
});

export const hubspotListCallDispositions = tool({
  description:
    'Return HubSpot call disposition IDs and labels. Best-effort mapping; HubSpot documents call outcomes per call rather than a dispositions list.',
  inputSchema: z.object({
    hubspotToken: tokenField,
  }),
  execute: async ({ hubspotToken }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/calls/dispositions`);
  },
});

export const hubspotListCompanyActivities = tool({
  description:
    'List all activity/engagement associations from a company to a specified activity type (calls, emails, meetings, notes, or tasks). Returns the IDs of associated engagement records. Use this action when you need to retrieve all activities of a specific type for a company to build a timeline or activity history.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Paging cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of activity associations to return per page. Default is 25.'),
    companyId: z
      .string()
      .describe('The unique ID of the company whose activities you want to retrieve.'),
    activityType: z
      .string()
      .describe(
        "Type of activity/engagement to retrieve (e.g., 'calls', 'emails', 'meetings', 'notes', 'tasks'). Specify the plural form of the engagement object type.",
      ),
  }),
  execute: async ({ hubspotToken, after, limit, companyId, activityType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/companies/${encodeURIComponent(String(companyId))}/associations/${encodeURIComponent(String(activityType))}`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotListCompanyCalls = tool({
  description:
    'Lists all calls associated with a specific HubSpot company. Returns call IDs and their association types with the company. Use this action when you need to retrieve all call activity records linked to a company without fetching full call details. For full call properties, use the returned call IDs with a call read action.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Paging cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of call associations to return per page. Default is 25.'),
    companyId: z
      .string()
      .describe('The unique ID of the company whose associated calls you want to retrieve.'),
  }),
  execute: async ({ hubspotToken, after, limit, companyId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/companies/${encodeURIComponent(String(companyId))}/associations/calls`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotListCompanyMeetings = tool({
  description:
    'List all meetings associated with a specific company in HubSpot. Returns meeting IDs and association metadata for meetings linked to the company record. Use this action when you need to retrieve all meetings scheduled with or related to a particular company.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Pagination cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of meeting associations to return per page. Default is 25.'),
    companyId: z
      .string()
      .describe(
        'The unique ID of the company record whose associated meetings you want to retrieve.',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, companyId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/companies/${encodeURIComponent(String(companyId))}/associations/meetings`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotListContactNotes = tool({
  description:
    'List all notes associated with a specific HubSpot contact. Returns note IDs and association metadata. Use this action when you need to retrieve all notes linked to a contact record. To get full note details (body, timestamp, etc.), use the note IDs with a batch read action.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Paging cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of note associations to return per page. Default is 25, maximum is 500.',
      ),
    contactId: z
      .string()
      .describe('The unique ID of the contact whose notes you want to retrieve.'),
  }),
  execute: async ({ hubspotToken, after, limit, contactId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/contacts/${encodeURIComponent(String(contactId))}/associations/notes`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotListContactTasks = tool({
  description:
    'List all tasks associated with a specific contact. Returns task IDs and association metadata for tasks linked to the given contact. Use this action when you need to retrieve all tasks related to a contact, such as viewing pending action items or following up on contact-related to-dos.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Paging cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of task associations to return per page. Default is 25.'),
    contactId: z
      .string()
      .describe('The unique ID of the contact whose associated tasks you want to retrieve.'),
  }),
  execute: async ({ hubspotToken, after, limit, contactId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/contacts/${encodeURIComponent(String(contactId))}/associations/tasks`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotListDealActivities = tool({
  description:
    'Retrieves activities (notes, calls, emails, meetings, tasks) associated with a specific HubSpot deal. Use this action when you need to view the complete activity timeline for a deal, including all engagement types. This provides a comprehensive view of interactions and communications related to the deal, which is useful for understanding deal history and next steps.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of activities to return. Default is 25.'),
    dealId: z
      .string()
      .describe('Unique HubSpot identifier for the deal whose activities you want to retrieve.'),
  }),
  execute: async ({ hubspotToken, limit, dealId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/engagements/v1/engagements/associated/deal/${encodeURIComponent(String(dealId))}/paged`,
      {
        query: pickDefined({ limit: limit }),
      },
    );
  },
});

export const hubspotListDealMeetings = tool({
  description:
    'List all meetings associated with a specific deal in HubSpot. Returns meeting IDs and association metadata. Use this action when you need to retrieve meetings linked to a deal without fetching full meeting details. This is useful for understanding deal activity, tracking customer interactions, or building reports of engagement touchpoints.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Paging cursor token from a previous response to fetch the next page of results. Leave empty to start from the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of meeting associations to return per page. Default is 25.'),
    dealId: z
      .string()
      .describe('The unique ID of the deal whose associated meetings you want to retrieve.'),
  }),
  execute: async ({ hubspotToken, after, limit, dealId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v4/objects/deals/${encodeURIComponent(String(dealId))}/associations/meetings`,
      {
        query: pickDefined({ after: after, limit: limit }),
      },
    );
  },
});

export const hubspotListRecentlyModifiedEngagements = tool({
  description:
    "Lists one page of engagements from HubSpot's last-30-days or 10,000-most-recently-updated feed.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    count: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of recently modified engagements to return, from 1 to 100.'),
    since: z
      .number()
      .int()
      .optional()
      .describe(
        'Return only engagements modified after this Unix epoch timestamp in milliseconds.',
      ),
    offset: z
      .number()
      .int()
      .optional()
      .describe('Pagination offset returned by a previous response. Omit for the first page.'),
  }),
  execute: async ({ hubspotToken, count, since, offset }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/engagements/v1/engagements/recent/modified`, {
      query: pickDefined({ count: count, since: since, offset: offset }),
    });
  },
});
