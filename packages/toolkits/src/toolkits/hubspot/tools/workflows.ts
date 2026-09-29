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

export const hubspotCreateWorkflow = tool({
  description:
    'Creates a new HubSpot workflow to automate processes; ensure `enrollmentCriteria` and `actions` use properties relevant to the specified `objectTypeId`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z.string().describe('The unique name for the workflow.'),
    type: z
      .enum(['CONTACT_FLOW', 'PLATFORM_FLOW'])
      .optional()
      .describe(
        "'CONTACT_FLOW' for contact-based workflows, 'PLATFORM_FLOW' for workflows based on other CRM object types (deals, companies, tickets, custom objects).",
      ),
    actions: z
      .array(z.record(z.any()))
      .describe(
        "Array of workflow action configurations. Each action must include: 'actionId' (unique string ID), 'type' (e.g., 'SINGLE_CONNECTION'), 'actionTypeId' (e.g., '0-1' for delay, '0-4' for email), 'actionTypeVersion' (typically 0), 'connection' (object with 'edgeType' and 'nextActionId'), and 'fields' (action-specific settings). Example: [{'actionId': '1', 'type': 'SINGLE_CONNECTION', 'actionTypeId': '0-1', 'actionTypeVersion': 0, 'connection': {'edgeType': 'STANDARD', 'nextActionId': '2'}, 'fields': {'delayMillis': 3600000}}]",
      ),
    flowType: z
      .enum(['WORKFLOW', 'ACTION_SET', 'UNKNOWN'])
      .optional()
      .describe(
        "Flow category: 'WORKFLOW' for standard workflows, 'ACTION_SET' for reusable action sets that can be called from other workflows.",
      ),
    isEnabled: z
      .boolean()
      .optional()
      .describe(
        'Set to true to activate the workflow immediately upon creation, or false to create it in disabled state for review.',
      ),
    dataSources: z
      .array(z.record(z.any()))
      .optional()
      .describe('Data source configurations for conditions or personalization.'),
    description: z
      .string()
      .optional()
      .describe("Optional explanation of the workflow's purpose and functionality."),
    timeWindows: z
      .array(z.record(z.any()))
      .optional()
      .describe('Configurations for periods when workflow actions can execute.'),
    blockedDates: z
      .array(z.record(z.any()))
      .optional()
      .describe('Configurations for dates when workflow actions should not execute.'),
    objectTypeId: z
      .string()
      .optional()
      .describe(
        "HubSpot internal ID for the CRM object type: '0-1' for Contacts, '0-2' for Companies, '0-3' for Deals, '0-5' for Tickets, or custom object type ID.",
      ),
    startActionId: z
      .string()
      .describe(
        'The unique ID of the first action in the workflow. This must match the actionId of one of the actions in the actions array.',
      ),
    customProperties: z
      .record(z.any())
      .optional()
      .describe('Custom key-value pairs for organization or tracking.'),
    enrollmentCriteria: z
      .record(z.any())
      .describe(
        "Required configuration defining enrollment triggers for the workflow. Must include: 'type' (either 'EVENT_BASED' or 'LIST_BASED'), 'shouldReEnroll' (boolean for allowing re-enrollment), and either 'eventFilterBranches' (for event-based) or 'listFilterBranch' (for list-based enrollment). Example for event-based: {'type': 'EVENT_BASED', 'shouldReEnroll': false, 'eventFilterBranches': [{'filterBranchType': 'OR', 'filterBranchOperator': 'OR', 'filters': [{'filterType': 'PROPERTY', 'property': 'email', 'operator': 'HAS_PROPERTY'}]}]}",
      ),
    suppressionListIds: z
      .array(z.number().int())
      .optional()
      .describe('HubSpot list IDs for contacts to be prevented from enrollment.'),
    unEnrollmentSetting: z
      .record(z.any())
      .optional()
      .describe('Defines if/how objects unenroll from other workflows upon enrolling in this one.'),
    nextAvailableActionId: z
      .string()
      .describe(
        'The next available action ID number for sequencing. This should be one higher than the highest action ID number used in the workflow.',
      ),
    canEnrollFromSalesforce: z
      .boolean()
      .optional()
      .describe('Allow contacts to be enrolled directly from Salesforce.'),
  }),
  execute: async ({
    hubspotToken,
    name,
    type,
    actions,
    flowType,
    isEnabled,
    dataSources,
    description,
    timeWindows,
    blockedDates,
    objectTypeId,
    startActionId,
    customProperties,
    enrollmentCriteria,
    suppressionListIds,
    unEnrollmentSetting,
    nextAvailableActionId,
    canEnrollFromSalesforce,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/automation/v4/flows`, {
      body: pickDefined({
        name: name,
        type: type,
        actions: actions,
        flowType: flowType,
        isEnabled: isEnabled,
        dataSources: dataSources,
        description: description,
        timeWindows: timeWindows,
        blockedDates: blockedDates,
        objectTypeId: objectTypeId,
        startActionId: startActionId,
        customProperties: customProperties,
        enrollmentCriteria: enrollmentCriteria,
        suppressionListIds: suppressionListIds,
        unEnrollmentSetting: unEnrollmentSetting,
        nextAvailableActionId: nextAvailableActionId,
        canEnrollFromSalesforce: canEnrollFromSalesforce,
      }),
    });
  },
});

export const hubspotDeleteWorkflow = tool({
  description:
    'Permanently deletes a HubSpot workflow by its ID; deleted workflows cannot be restored via the API and the ID must exist.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    workflowId: z.string().describe('The unique identifier of the HubSpot workflow to be deleted.'),
  }),
  execute: async ({ hubspotToken, workflowId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/automation/v4/flows/${encodeURIComponent(String(workflowId))}`,
    );
  },
});

export const hubspotEnrollContactInWorkflow = tool({
  description: 'Enrolls a contact, identified by email, in a HubSpot workflow.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    email: z.string().describe('The email address of the contact to enroll.'),
    workflowId: z
      .string()
      .describe(
        'The positive numeric ID of the HubSpot contact workflow, passed as a string to preserve 64-bit values.',
      ),
  }),
  execute: async ({ hubspotToken, email, workflowId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/automation/v3/workflows/${encodeURIComponent(String(workflowId))}/enrollments/contacts/${encodeURIComponent(String(email))}`,
    );
  },
});

export const hubspotGetWorkflowById = tool({
  description:
    "Retrieves comprehensive details for an existing HubSpot workflow by its unique ID; unsupported actions are designated 'UNSUPPORTED_ACTION' in the response.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    workflowId: z
      .string()
      .describe(
        "The unique identifier of the HubSpot workflow to retrieve. This ID can be found by using the 'Get all workflows' action or from the URL when viewing a workflow in the HubSpot UI.",
      ),
  }),
  execute: async ({ hubspotToken, workflowId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/automation/v4/flows/${encodeURIComponent(String(workflowId))}`);
  },
});

export const hubspotGetWorkflowRevision = tool({
  description: 'Retrieves a specific historical revision of a HubSpot workflow.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    flowId: z.string().describe('Unique ID of the HubSpot workflow whose revision to retrieve.'),
    revisionId: z.string().describe('Unique ID of the historical workflow revision to retrieve.'),
  }),
  execute: async ({ hubspotToken, flowId, revisionId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/automation/v4/flows/${encodeURIComponent(String(flowId))}/revisions/${encodeURIComponent(String(revisionId))}`,
    );
  },
});

export const hubspotGetWorkflows = tool({
  description:
    "Retrieves a list of workflow summaries (ID, name, type, status) from HubSpot, using the 'limit' parameter for pagination.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of workflows to retrieve per API call, used for pagination.'),
  }),
  execute: async ({ hubspotToken, limit }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/automation/v4/flows`, {
      query: pickDefined({ limit: limit }),
    });
  },
});

export const hubspotUpdateWorkflow = tool({
  description: 'Fully replace an existing Automation v4 workflow at its current revision.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    flowId: z.string().describe('ID of the existing HubSpot workflow to replace.'),
    workflow: z
      .record(z.any())
      .describe(
        'Complete ApiFlowPutRequest using exact HubSpot camelCase keys. Both workflow variants require type, actions, blockedDates, customProperties, isEnabled, revisionId, and timeWindows. A CONTACT_FLOW also requires canEnrollFromSalesforce and suppressionListIds. Copy only fields represented by this request schema from a fresh workflow read; response-only fields such as id, createdAt, updatedAt, dataSources, flowType, objectTypeId, and nextAvailableActionId are not accepted by the PUT contract.',
      ),
  }),
  execute: async ({ hubspotToken, flowId, workflow }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(hubspotToken, `/automation/v4/flows/${encodeURIComponent(String(flowId))}`, {
      body: workflow,
    });
  },
});
