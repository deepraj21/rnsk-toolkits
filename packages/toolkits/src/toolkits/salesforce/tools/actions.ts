// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceExecuteGlobalQuickAction = tool({
  description:
    "Execute a global (non-object-specific) quick action (POST /quickActions/{actionName}). The 'Get quick actions' action lists the available global quick actions, but only object-scoped quick actions could be executed before — this runs the global ones. Distinct from the sObject-scoped execute (POST /sobjects/{type}/quickActions/{name}).",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    record: z
      .record(z.any())
      .describe(
        "Object containing the field values for the record the quick action creates/updates. Field names depend on the quick action's target and layout.",
      ),
    contextId: z
      .string()
      .optional()
      .describe('The ID of the context record for the action, when applicable.'),
    actionName: z
      .string()
      .describe(
        "The API name of the global (non-object-specific) quick action to execute, as listed by the 'Get quick actions' action (e.g., 'LogACall', 'NewContact').",
      ),
  }),
  execute: async ({ salesforceCredentials, record, contextId, actionName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/quickActions/${actionName}`, {
      body: { record: record, contextId: contextId },
    });
  },
});

export const salesforceExecuteInvocableAction = tool({
  description:
    "Invoke any standard or custom invocable action by name (POST /actions/standard/{name} or /actions/custom/{name}). The 'Get standard/custom invocable actions' actions enumerate the available actions (including Flows and Apex invocable methods), but previously only emailSimple and invocableApplyLeadAssignmentRules could actually be run — this executes any of them generically. Returns one result per ",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    inputs: z
      .array(z.record(z.any()))
      .describe(
        "Array of input maps, one per invocation. Each map's keys are the action's input parameter names. The action runs once per element and returns one result per element.",
      ),
    actionName: z
      .string()
      .describe(
        "The API name of the invocable action to run (e.g., 'chatterPost' for a standard action, or the API name of a custom Flow/Apex action).",
      ),
    actionType: z
      .enum(['standard', 'custom'])
      .describe(
        "Whether the invocable action is a Salesforce standard action or a custom action (custom includes Flows and Apex invocable methods). 'Get standard invocable actions' / 'Get custom invocable actions' list the available names.",
      ),
  }),
  execute: async ({ salesforceCredentials, inputs, actionName, actionType }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/actions/${actionType}/${actionName}`, {
      body: { inputs: inputs },
    });
  },
});

export const salesforceExecuteSobjectQuickAction = tool({
  description:
    'Tool to execute a specific quick action on an sObject to create records with pre-configured defaults. Use when you need to leverage Salesforce Quick Actions to streamline record creation with field mappings and default values.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    record: z
      .record(z.any())
      .describe(
        'Object containing field data for the record to be created. Field names and types depend on the target sObject and quick action configuration. Common fields include: Subject, Description, Status, Priority, etc.',
      ),
    sobject: z
      .string()
      .describe(
        "The API name of the sObject type (e.g., 'Account', 'Contact', 'Task', 'Lead', 'Case').",
      ),
    contextId: z
      .string()
      .optional()
      .describe(
        'The ID of the context record. For object-specific actions, this provides the parent/related record context for the action execution.',
      ),
    actionName: z
      .string()
      .describe(
        "The API name of the quick action to execute (e.g., 'LogACall', 'NewTask', 'NewChildCase').",
      ),
  }),
  execute: async ({ salesforceCredentials, record, sobject, contextId, actionName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/sobjects/${sobject}/quickActions/${actionName}`, {
      body: { record: record, contextId: contextId },
    });
  },
});

export const salesforceGetQuickActions = tool({
  description:
    'Tool to retrieve global and object-specific quick actions from Salesforce. Use when you need to list all available quick actions in the organization.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/quickActions`);
  },
});

export const salesforceGetSObjectQuickActionDefaultValues = tool({
  description:
    'Retrieves default field values for a quick action in a specific record context. Use when you need to pre-populate fields when creating related records through quick actions.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobject: z
      .string()
      .describe('The API name of the sObject type (e.g., Account, Contact, Case, Opportunity).'),
    contextId: z
      .string()
      .describe(
        'The ID of the parent/context record that the action is related to. Used to calculate context-specific default values based on the parent record.',
      ),
    actionName: z
      .string()
      .describe(
        'The API name of the quick action (e.g., LogACall, NewContact, _LightningRelatedContact).',
      ),
  }),
  execute: async ({ salesforceCredentials, sobject, contextId, actionName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(
      salesforceCredentials,
      `/sobjects/${sobject}/quickActions/${actionName}/defaultValues/${contextId}`,
    );
  },
});

export const salesforceGetSobjectQuickActionDefaultValues = tool({
  description:
    'Retrieves default field values for a specific quick action on an sObject. Use when you need to understand what fields will be automatically populated when executing the quick action.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobject: z
      .string()
      .describe("The API name of the sObject type (e.g., 'Account', 'Contact', 'Task')."),
    actionName: z
      .string()
      .describe(
        "The API name of the quick action (e.g., '_LightningRelatedContact', 'LogACall', 'NewTask').",
      ),
  }),
  execute: async ({ salesforceCredentials, sobject, actionName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(
      salesforceCredentials,
      `/sobjects/${sobject}/quickActions/${actionName}/defaultValues`,
    );
  },
});

export const salesforceHeadActionsCustom = tool({
  description:
    'Tool to return HTTP headers for custom invocable actions without response body. Use when you need to check resource availability and metadata before executing full requests or to validate resource state conditionally.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ifUnmodifiedSince: z
      .string()
      .optional()
      .describe(
        "Conditional header that returns data only if the resource hasn't been modified since the specified date. Uses HTTP date format (RFC 7231). Example: 'Wed, 21 Oct 2015 07:28:00 GMT'.",
      ),
  }),
  execute: async ({ salesforceCredentials, ifUnmodifiedSince }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/actions/custom`);
  },
});

export const salesforceHeadActionsStandard = tool({
  description:
    'Tool to return HTTP headers for standard invocable actions metadata without response body. Use when you need to perform efficient cache validation, check for metadata changes, or reduce bandwidth usage before retrieving full action metadata.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ifModifiedSince: z
      .string()
      .optional()
      .describe(
        "Conditional header that returns data only if the resource has been modified since the specified date. Uses HTTP date format (RFC 2822/7232). Example: 'Thu, 05 Jul 2012 15:31:30 GMT'. If not modified, returns 304 status code.",
      ),
    ifUnmodifiedSince: z
      .string()
      .optional()
      .describe(
        "Conditional header that returns data only if the resource hasn't been modified since the specified date. Uses HTTP date format (RFC 2822/7232). Example: 'Tue, 10 Aug 2015 00:00:00 GMT'. If modified, returns 412 status code.",
      ),
  }),
  execute: async ({ salesforceCredentials, ifModifiedSince, ifUnmodifiedSince }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/actions/standard`);
  },
});

export const salesforceHeadAppmenuSalesforce1 = tool({
  description:
    'Tool to return HTTP headers for AppMenu Salesforce1 mobile navigation items without response body. Use when you need to check resource metadata, validate cache (via ETag or Last-Modified), or test endpoint availability without data transfer overhead.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ifNoneMatch: z
      .string()
      .optional()
      .describe(
        'Entity tag (ETag) for conditional request. If the resource matches this ETag, returns 304 Not Modified.',
      ),
    ifModifiedSince: z
      .string()
      .optional()
      .describe(
        "Timestamp for conditional request. Request succeeds only if data changed since specified date/time, otherwise returns 304 Not Modified. Format: RFC 2822 date-time (e.g., 'Mon, 15 Jan 2024 12:00:00 GMT').",
      ),
  }),
  execute: async ({ salesforceCredentials, ifNoneMatch, ifModifiedSince }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/appMenu/Salesforce1`);
  },
});

export const salesforceHeadProcessRulesSObject = tool({
  description:
    'Tool to return HTTP headers for process rules of an sObject without retrieving the response body. Use when you need to check if process rules exist for an sObject or retrieve metadata like ETag and Last-Modified headers.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobject: z
      .string()
      .describe('The Salesforce object name (sObject) to retrieve process rules headers for.'),
  }),
  execute: async ({ salesforceCredentials, sobject }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/process/rules/${sobject}`);
  },
});

export const salesforceHeadQuickActions = tool({
  description:
    'Tool to return HTTP headers for Quick Actions resource without response body. Use when you need to inspect metadata before retrieving full Quick Actions content or to validate resource availability.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/quickActions`);
  },
});

export const salesforceHeadSobjectQuickActionDefaultValues = tool({
  description:
    'Tool to return HTTP headers for sObject quick action default values by context ID without response body. Use when you need to check resource availability, verify cache validation headers (ETag, Last-Modified), or optimize API calls by avoiding unnecessary data transfer.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    contextId: z
      .string()
      .describe(
        'The record ID that provides context for retrieving the default values. This is typically the ID of an existing record (Account, Contact, Lead, Opportunity, etc.) that the quick action is being invoked from.',
      ),
    actionName: z
      .string()
      .describe(
        "The API name of the quick action (e.g., 'LogACall', 'NewTask', 'NewContact', 'SendEmail'). This is the specific action you want to get headers for.",
      ),
    sobjectType: z
      .string()
      .describe(
        "The sObject type (e.g., 'Account', 'Contact', 'Lead', 'Opportunity'). This specifies which sObject the quick action belongs to.",
      ),
    ifNoneMatch: z
      .string()
      .optional()
      .describe(
        "ETag value for conditional requests. Returns 304 Not Modified if content hasn't changed since the specified ETag.",
      ),
    ifModifiedSince: z
      .string()
      .optional()
      .describe(
        'Date format: EEE, dd MMM yyyy HH:mm:ss z. Returns 304 Not Modified if the action metadata has not changed since the specified date.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    contextId,
    actionName,
    sobjectType,
    ifNoneMatch,
    ifModifiedSince,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(
      salesforceCredentials,
      `/sobjects/${sobjectType}/quickActions/${actionName}/defaultValues/${contextId}`,
    );
  },
});

export const salesforceHeadSobjectsGlobalDescribeLayouts = tool({
  description:
    'Tool to return HTTP headers for all global publisher layouts without response body. Use when implementing cache validation strategies, efficient resource polling, or checking if layouts have been modified without transferring layout data.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ifNoneMatch: z
      .string()
      .optional()
      .describe(
        "ETag value for strong validation. Request succeeds only if the resource's ETag doesn't match the provided value(s). Multiple ETags can be specified as comma-separated values.",
      ),
    ifModifiedSince: z
      .string()
      .optional()
      .describe(
        'Timestamp for weak validation. Request succeeds only if the resource has been modified since the specified date and time. Format: HTTP date (RFC 7231).',
      ),
  }),
  execute: async ({ salesforceCredentials, ifNoneMatch, ifModifiedSince }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/sobjects/Global/describe/layouts`);
  },
});

export const salesforceHeadSobjectsQuickAction = tool({
  description:
    'Tool to return HTTP headers for a specific sObject quick action without response body. Use when you need to check ETag or Last-Modified headers before fetching full content or to validate quick action availability.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    actionName: z
      .string()
      .describe(
        'The specific quick action name for which to retrieve headers (e.g., NewCase, LogACall, SendEmail).',
      ),
    sobjectType: z
      .string()
      .describe(
        'The sObject type for which to retrieve quick action headers (e.g., Account, Contact, Case, Lead).',
      ),
    ifNoneMatch: z
      .string()
      .optional()
      .describe(
        "ETag value for conditional requests. Returns 304 Not Modified if content hasn't changed since the specified ETag.",
      ),
    ifModifiedSince: z
      .string()
      .optional()
      .describe(
        "Time-based conditional header that returns data only if the resource has been modified since the specified date. Uses HTTP date format (RFC 7231). Example: 'Wed, 21 Oct 2015 07:28:00 GMT'.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    actionName,
    sobjectType,
    ifNoneMatch,
    ifModifiedSince,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/sobjects/${sobjectType}/quickActions/${actionName}`);
  },
});

export const salesforceListCustomInvocableActions = tool({
  description:
    'Retrieves the list of custom actions including Flow actions, Apex actions, and invocable processes. Use when you need to discover available custom invocable actions in your Salesforce organization.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/actions/custom`);
  },
});

export const salesforceListStandardInvocableActions = tool({
  description:
    'Retrieves the list of standard actions that can be statically invoked. Use when you need to discover available standard invocable actions like posting to Chatter, sending email, or sending custom notifications.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/actions/standard`);
  },
});
