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

export const hubspotAddTokenToEventTemplate = tool({
  description:
    'Adds a new custom data token to an existing event template for a specified HubSpot application, optionally populating a CRM object property if objectPropertyName is provided.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .describe(
        'The internal name of the token, used for referencing it within templates. Must be unique for this event template. Allowed characters: alphanumeric, periods (.), dashes (-), or underscores (_).',
      ),
    type: z
      .enum(['date', 'enumeration', 'number', 'string'])
      .describe(
        "The data type of the token. Determines how the token's value is stored and validated.",
      ),
    appId: z
      .number()
      .int()
      .describe(
        'Numeric identifier of the target application associated with the event template. Provided in the URL path.',
      ),
    label: z
      .string()
      .describe(
        'The user-facing label for the token. This label is used for list segmentation and in reporting.',
      ),
    options: z
      .array(z.object({ label: z.string(), value: z.string() }).catchall(z.any()))
      .optional()
      .describe(
        "A list of options for the token, required and applicable only if the token `type` is 'enumeration'. Each option must have a 'label' and a 'value'.",
      ),
    eventTemplateId: z
      .string()
      .describe('Unique identifier of the event template. Provided in the URL path.'),
    objectPropertyName: z
      .string()
      .optional()
      .describe(
        "The name of an existing CRM object property (e.g., 'dealstage', 'lifecyclestage'). If provided, this token will populate the specified CRM object property associated with the event. This allows for building or updating CRM objects through the Timeline API.",
      ),
  }),
  execute: async ({
    hubspotToken,
    name,
    type,
    appId,
    label,
    options,
    eventTemplateId,
    objectPropertyName,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}/tokens`,
      {
        body: pickDefined({
          name: name,
          type: type,
          label: label,
          options: options,
          objectPropertyName: objectPropertyName,
        }),
      },
    );
  },
});

export const hubspotCreateEventTemplateForApp = tool({
  description:
    'Creates a new event template for a HubSpot app, defining structure, custom properties (tokens), and appearance (Markdown with Handlebars) of custom timeline events for CRM objects; this template must exist before logging corresponding events.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .describe('The name of the event template, unique for the app and object type.'),
    appId: z.number().int().describe('The unique identifier of the target HubSpot app.'),
    tokens: z
      .array(
        z
          .object({
            name: z.string(),
            type: z.enum(['date', 'enumeration', 'number', 'string']),
            label: z.string(),
            options: z.array(z.record(z.any())).optional(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
            objectPropertyName: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        "Defines custom properties (tokens) for the event, which can populate CRM object properties if a token's `objectPropertyName` is set.",
      ),
    objectType: z
      .string()
      .describe(
        "The CRM object type this event template is associated with (e.g., 'contacts', 'companies').",
      ),
    detailTemplate: z
      .string()
      .optional()
      .describe(
        'Optional Markdown string with Handlebars templating for rendering HTML for expanded event details on the CRM timeline, using tokens for event-specific data.',
      ),
    headerTemplate: z
      .string()
      .optional()
      .describe(
        'Optional Markdown string with Handlebars templating for rendering HTML for the event header on the CRM timeline, using tokens for event-specific data.',
      ),
  }),
  execute: async ({
    hubspotToken,
    name,
    appId,
    tokens,
    objectType,
    detailTemplate,
    headerTemplate,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates`,
      {
        body: pickDefined({
          name: name,
          tokens: tokens,
          objectType: objectType,
          detailTemplate: detailTemplate,
          headerTemplate: headerTemplate,
        }),
      },
    );
  },
});

export const hubspotCreateTimelineEvent = tool({
  description:
    "Creates an immutable custom timeline event on a CRM object's record using a specified, existing event template (identified by `eventTemplateId`), optionally updating CRM object properties if defined in the template; requires `email`, `utk`, or `objectId` for association.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    id: z
      .string()
      .optional()
      .describe(
        'Optional unique event identifier; HubSpot auto-generates if omitted. Use `{{uuid}}` for uniqueness if providing an ID.',
      ),
    utk: z
      .string()
      .optional()
      .describe(
        "HubSpot user token (e.g., from `hubspotutk` cookie) to associate event with a contact; use if contact's email is unknown.",
      ),
    email: z
      .string()
      .optional()
      .describe(
        'Email for contact-specific events; identifies existing contact, creates new, or changes email (if `objectId` provided).',
      ),
    domain: z
      .string()
      .optional()
      .describe(
        'Domain associated with the event, often paired with `utk` for contact event context.',
      ),
    tokens: z
      .record(z.any())
      .describe(
        'Key-value pairs for populating dynamic content in the event template; keys are token names from the template.',
      ),
    objectId: z
      .string()
      .optional()
      .describe(
        'Unique identifier of the CRM object (e.g., company, deal) for event association; required for non-contact objects.',
      ),
    timestamp: z
      .string()
      .optional()
      .describe(
        'ISO 8601 UTC timestamp of event occurrence; defaults to current time. Determines timeline placement.',
      ),
    eventTemplateId: z
      .string()
      .describe('The unique identifier of the event template, which must exist in HubSpot.'),
    timelineIFrameUrl: z.string().optional().describe('URL of content to display in the iframe.'),
    timelineIFrameWidth: z
      .number()
      .int()
      .optional()
      .describe('Width of the iframe modal window (pixels).'),
    timelineIFrameHeight: z
      .number()
      .int()
      .optional()
      .describe('Height of the iframe modal window (pixels).'),
    timelineIFrameLinkLabel: z
      .string()
      .optional()
      .describe('Text for the link that opens the iframe modal with more details.'),
    timelineIFrameHeaderLabel: z
      .string()
      .optional()
      .describe('Title/header for the modal window displaying iframe content.'),
  }),
  execute: async ({
    hubspotToken,
    id,
    utk,
    email,
    domain,
    tokens,
    objectId,
    timestamp,
    eventTemplateId,
    timelineIFrameUrl,
    timelineIFrameWidth,
    timelineIFrameHeight,
    timelineIFrameLinkLabel,
    timelineIFrameHeaderLabel,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/timeline/events`, {
      body: pickDefined({
        id: id,
        utk: utk,
        email: email,
        domain: domain,
        tokens: tokens,
        objectId: objectId,
        timestamp: timestamp,
        eventTemplateId: eventTemplateId,
        timelineIFrame__url: timelineIFrameUrl,
        timelineIFrame__width: timelineIFrameWidth,
        timelineIFrame__height: timelineIFrameHeight,
        timelineIFrame__linkLabel: timelineIFrameLinkLabel,
        timelineIFrame__headerLabel: timelineIFrameHeaderLabel,
      }),
    });
  },
});

export const hubspotCreateTimelineEventsBatch = tool({
  description:
    'Creates multiple immutable timeline events in a batch, ideal for bulk data imports or real-time synchronizations, using a valid event template; may update CRM properties if the template is so configured.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            id: z.string().optional(),
            utk: z.string().optional(),
            email: z.string().optional(),
            domain: z.string().optional(),
            tokens: z.record(z.any()),
            objectId: z.string().optional(),
            timestamp: z.string().optional(),
            eventTemplateId: z.string(),
            timelineIFrame__url: z.string().optional(),
            timelineIFrame__width: z.number().int().optional(),
            timelineIFrame__height: z.number().int().optional(),
            timelineIFrame__linkLabel: z.string().optional(),
            timelineIFrame__headerLabel: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        'A list of event objects to be created. Each object in the list must conform to the InputsRequest schema and define a single timeline event.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/timeline/events/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotDeleteTimelineEventTemplate = tool({
  description:
    'Permanently and irreversibly deletes a specific timeline event template, identified by its `eventTemplateId`, from the application `appId`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'The numeric identifier (positive integer) for the target application within which the event template exists. The template specified by `eventTemplateId` must be part of this application.',
      ),
    eventTemplateId: z
      .string()
      .describe(
        'The unique identifier for the event template to be deleted. This ID must correspond to an existing template within the specified application. Typically a UUID or a system-generated string.',
      ),
  }),
  execute: async ({ hubspotToken, appId, eventTemplateId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}`,
    );
  },
});

export const hubspotGetEventTemplate = tool({
  description:
    "Retrieves detailed information about a specific event template for a given application in HubSpot's CRM timeline.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'The ID of the target application for which the event template is being retrieved. This parameter is required and ensures the template lookup is specific to an app integration within HubSpot. The appId must be a valid, existing app ID in your HubSpot account.',
      ),
    eventTemplateId: z
      .string()
      .describe(
        'The unique identifier of the event template. This ID is assigned by HubSpot when the template is created. It is required and must be a valid, existing template ID associated with the specified app.',
      ),
  }),
  execute: async ({ hubspotToken, appId, eventTemplateId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}`,
    );
  },
});

export const hubspotListEventTemplates = tool({
  description:
    "Retrieves all event templates associated with a valid `appId` for an existing application in HubSpot's CRM Timeline.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe('The unique integer identifier for the target HubSpot application.'),
  }),
  execute: async ({ hubspotToken, appId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates`,
    );
  },
});

export const hubspotRemoveTokenFromEventTemplate = tool({
  description:
    'Removes a token from a HubSpot event template, preventing its inclusion in new events created from that template.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'The unique identifier of the target application associated with the event template. Must be a valid integer representing the ID of your HubSpot app.',
      ),
    tokenName: z
      .string()
      .describe(
        "The name of the token to be removed from the event template. Must be a string that exactly matches an existing token's name within the specified template (case-sensitive).",
      ),
    eventTemplateId: z
      .string()
      .describe(
        'The unique identifier of the event template from which the token will be removed. Must be a valid string representing an existing event template ID in your HubSpot account.',
      ),
  }),
  execute: async ({ hubspotToken, appId, tokenName, eventTemplateId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}/tokens/${encodeURIComponent(String(tokenName))}`,
    );
  },
});

export const hubspotRenderEventDetailTemplate = tool({
  description:
    'Renders detailed information for a specific HubSpot CRM timeline event using a predefined event template, ignoring `extraData` references in the template not present in event data. Best-effort mapping to the HubSpot template-render endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    eventId: z
      .string()
      .describe('The unique ID for a specific HubSpot CRM timeline event to render.'),
    eventTemplateId: z
      .string()
      .describe('The unique ID for an existing HubSpot event template to use for rendering.'),
  }),
  execute: async ({ hubspotToken, eventId, eventTemplateId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/timeline/event-templates/${encodeURIComponent(String(eventTemplateId))}/render`,
      {
        body: pickDefined({ eventId: eventId }),
      },
    );
  },
});

export const hubspotRenderEventHeaderOrDetailAsHtml = tool({
  description:
    "Renders an event's header or detail template as HTML for a specified event on the HubSpot CRM timeline, using a given event template ID and event ID. Best-effort mapping to the HubSpot template-render endpoint.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    detail: z
      .boolean()
      .optional()
      .describe(
        'If true, renders the detailTemplate; if false or not provided, renders the headerTemplate.',
      ),
    eventId: z
      .string()
      .describe(
        'The unique identifier for an existing event on the HubSpot timeline whose data will be used in the rendering.',
      ),
    eventTemplateId: z
      .string()
      .describe('The unique identifier for an existing event template to be used for rendering.'),
  }),
  execute: async ({ hubspotToken, detail, eventId, eventTemplateId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/timeline/event-templates/${encodeURIComponent(String(eventTemplateId))}/render`,
      {
        body: pickDefined({ detail: detail, eventId: eventId }),
      },
    );
  },
});

export const hubspotRetrieveTimelineEventByIds = tool({
  description:
    'Retrieves a specific HubSpot CRM timeline event by its application ID, event template ID, and event ID, returning event details including timestamp, tokens, and associated object information. Best-effort mapping to the HubSpot timeline event endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    eventId: z
      .string()
      .describe(
        'The unique identifier for the specific timeline event. This ID uniquely identifies the event within the context of its template and must correspond to an existing event in your HubSpot CRM timeline.',
      ),
    applicationId: z
      .string()
      .describe(
        'The HubSpot application ID that created the timeline event. This is the ID of the developer app or integration that generated the timeline events you want to retrieve.',
      ),
    eventTemplateId: z
      .string()
      .describe(
        'The unique identifier for the event template (also called event type ID). This ID is crucial for locating the specific type of event and must correspond to a pre-defined event template in your HubSpot account.',
      ),
  }),
  execute: async ({ hubspotToken, eventId, applicationId, eventTemplateId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(applicationId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}/events/${encodeURIComponent(String(eventId))}`,
    );
  },
});

export const hubspotUpdateEventTemplate = tool({
  description:
    "Updates an existing HubSpot event template's name, display templates, and tokens; providing `tokens` replaces the entire existing list, and the `id` in the request body must match `eventTemplateId` in the path.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    id: z
      .string()
      .describe(
        'Unique identifier of the event template; must match `eventTemplateId` in the URL path.',
      ),
    name: z.string().describe('New name for the event template.'),
    appId: z.number().int().describe('ID of the application associated with the event template.'),
    tokens: z
      .array(
        z
          .object({
            name: z.string(),
            type: z.enum(['date', 'enumeration', 'number', 'string']),
            label: z.string(),
            options: z.array(z.record(z.any())).optional(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
            objectPropertyName: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .describe('List of token definitions; replaces all existing tokens for the template.'),
    detailTemplate: z
      .string()
      .optional()
      .describe(
        "Markdown for the event's detailed timeline view, using Handlebars for dynamic data (e.g., `{{token_name}}`).",
      ),
    headerTemplate: z
      .string()
      .optional()
      .describe(
        "Markdown for the event's header on the timeline, using Handlebars for dynamic data (e.g., `{{token_name}}`).",
      ),
    eventTemplateId: z.string().describe('Unique identifier of the event template to update.'),
  }),
  execute: async ({
    hubspotToken,
    id,
    name,
    appId,
    tokens,
    detailTemplate,
    headerTemplate,
    eventTemplateId,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPut(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}`,
      {
        body: pickDefined({
          id: id,
          name: name,
          tokens: tokens,
          detailTemplate: detailTemplate,
          headerTemplate: headerTemplate,
        }),
      },
    );
  },
});

export const hubspotUpdateTokenOnEventTemplate = tool({
  description:
    'Updates the label or options of an existing token within a specified HubSpot CRM event template; token name and data type remain unchanged.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'Unique identifier (ID) of the application associated with the event template and token.',
      ),
    label: z
      .string()
      .describe(
        'New human-readable label for the token, displayed in UIs and used for segmentation/reporting.',
      ),
    options: z
      .array(z.object({ label: z.string(), value: z.string() }).catchall(z.any()))
      .optional()
      .describe(
        "List of option objects defining selectable choices, applicable only if the token's type is 'enumeration'. Required to modify options for an enumeration type token.",
      ),
    tokenName: z
      .string()
      .describe(
        "Name of the token to update within the specified event template; must match an existing token's name.",
      ),
    eventTemplateId: z
      .string()
      .describe('Unique identifier (ID) of the event template containing the token to update.'),
    objectPropertyName: z
      .string()
      .optional()
      .describe(
        'Name of the CRM object property this token populates, linking its value to a CRM object property. If null, no direct mapping.',
      ),
  }),
  execute: async ({
    hubspotToken,
    appId,
    label,
    options,
    tokenName,
    eventTemplateId,
    objectPropertyName,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPut(
      hubspotToken,
      `/crm/v3/timeline/${encodeURIComponent(String(appId))}/event-templates/${encodeURIComponent(String(eventTemplateId))}/tokens/${encodeURIComponent(String(tokenName))}`,
      {
        body: pickDefined({
          label: label,
          options: options,
          objectPropertyName: objectPropertyName,
        }),
      },
    );
  },
});
