// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const serviceNowCancelChangeConflictCheck = tool({
    description: "Cancels the running conflict checking process for a specified ServiceNow change request. Use this action when a conflict check is taking too long or needs to be aborted, and you want to stop the process without waiting for it to complete naturally. This is commonly used when automated change management workflows need to be expedited or when conflict checks are blocking other operations. Note: this action is NOT idempotent. Calling it on a change request with no active conflict check running returns a 400 error (\"Conflict for change request could not be cancelled\"), not a success response. If the change request doesn't exist, a 404 error is returned instead.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request whose conflict checking process should be cancelled. This is a 32-character hexadecimal string that uniquely identifies the change request record. Example: '1766f1de47410200e90d87e8dee490f6'. The change request must exist and have an active conflict checking process running."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}/conflict`, { method: 'DELETE' });
    },
});

export const serviceNowCreateSnChgRestChange = tool({
    description: "Creates a new change request in ServiceNow using the Change Management REST API. Use this action when you need to create and submit a new change request for approval and implementation. The action supports specifying change details such as short description, description, category, type, priority, risk, and impact. After creation, the change request will have a unique sys_id and number that can be used to retrieve, update, or delete it in subsequent operations.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        risk: z.string().optional().describe("Risk level of the change request (e.g., 'low', 'medium', 'high', 'critical')."),
        type: z.string().optional().describe("Type of change request (e.g., 'normal', 'standard', 'emergency')."),
        phase: z.string().optional().describe("Current phase of the change request workflow (e.g., 'Planning', 'Assessment', 'Implementation')."),
        impact: z.string().optional().describe("Impact level of the change request (typically 1-3, where 1 is highest)."),
        vendor: z.string().optional().describe("Vendor associated with the change request."),
        cmdbCi: z.string().optional().describe("Sys_id of the Configuration Item associated with the change."),
        company: z.string().optional().describe("Sys_id of the company associated with the change request."),
        category: z.string().optional().describe("Category classification of the change request (e.g., 'Network', 'Hardware', 'Software', 'Communication')."),
        comments: z.string().optional().describe("Comments visible to end users."),
        contract: z.string().optional().describe("Contract reference or identifier associated with the change."),
        location: z.string().optional().describe("Sys_id of the location associated with the change request."),
        priority: z.string().optional().describe("Priority level of the change request (typically 1-5, where 1 is highest)."),
        testPlan: z.string().optional().describe("Plan for testing the change after implementation."),
        department: z.string().optional().describe("Sys_id of the department associated with the change request."),
        workNotes: z.string().optional().describe("Internal work notes (not visible to end users)."),
        assignedTo: z.string().optional().describe("Sys_id of the user to assign the change request to."),
        closeNotes: z.string().optional().describe("Notes to be added when closing the change request."),
        description: z.string().optional().describe("Detailed description explaining what the change involves, its purpose, and expected outcomes."),
        subcategory: z.string().optional().describe("Subcategory classification within the main category."),
        backoutPlan: z.string().optional().describe("Plan for rolling back the change if issues occur."),
        expectedEnd: z.string().optional().describe("Expected end date and time for the change (ISO 8601 format recommended)."),
        requestedBy: z.string().optional().describe("Sys_id of the user who requested the change."),
        justification: z.string().optional().describe("Business justification explaining why this change is needed."),
        expectedStart: z.string().optional().describe("Expected start date and time for the change (ISO 8601 format recommended)."),
        onHoldReason: z.string().optional().describe("Reason for placing the change request on hold."),
        assignmentGroup: z.string().optional().describe("Sys_id of the group to assign the change request to."),
        plannedEndDate: z.string().optional().describe("Planned end date and time for the change (format: YYYY-MM-DD HH:MM:SS or ISO 8601)."),
        serviceOffering: z.string().optional().describe("Sys_id of the service offering related to the change."),
        requestedByDate: z.string().optional().describe("Date by which the change is requested (format: YYYY-MM-DD HH:MM:SS or ISO 8601)."),
        shortDescription: z.string().optional().describe("Brief summary or title of the change request (recommended, displayed in lists)."),
        plannedStartDate: z.string().optional().describe("Planned start date and time for the change (format: YYYY-MM-DD HH:MM:SS or ISO 8601)."),
        implementationPlan: z.string().optional().describe("Detailed plan for implementing the change."),
    }),
    execute: async ({ servicenowCredentials, risk, type, phase, impact, vendor, cmdbCi, company, category, comments, contract, location, priority, testPlan, department, workNotes, assignedTo, closeNotes, description, subcategory, backoutPlan, expectedEnd, requestedBy, justification, expectedStart, onHoldReason, assignmentGroup, plannedEndDate, serviceOffering, requestedByDate, shortDescription, plannedStartDate, implementationPlan }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change`, { method: 'POST', body: toServerKeys({ risk, type, phase, impact, vendor, cmdbCi, company, category, comments, contract, location, priority, testPlan, department, workNotes, assignedTo, closeNotes, description, subcategory, backoutPlan, expectedEnd, requestedBy, justification, expectedStart, onHoldReason, assignmentGroup, plannedEndDate, serviceOffering, requestedByDate, shortDescription, plannedStartDate, implementationPlan }) });
    },
});

export const serviceNowCreateSnChgRestChangeCi = tool({
    description: "Creates an association between a change request and one or more configuration items (CIs) in ServiceNow. Use this action when you need to link CIs (servers, databases, applications, etc.) to a change request in ServiceNow's Change Management module. This is commonly used to: - Define which infrastructure components are affected by a change - Include specific CIs in the scope of a change request - Track and manage CI relationships for change planning The action requires the change request sys_id and a list of CI sys_ids to associate.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request. This is a 32-character hexadecimal string that uniquely identifies the change request record. Example: '46e9b4afa9fe198101026e122b85f442'"),
        cmdbCiSysIds: z.array(z.any()).describe("List of sys_ids of the Configuration Items (CIs) to associate with the change request. Each sys_id is a 32-character hexadecimal string that uniquely identifies a CI record in the CMDB. Example: ['00a96c0d3790200044e0bfc8bcbe5db4']"),
        associationType: z.enum(["affected", "requested", "requested_and_affected"]).optional().describe("Type of CI association with the change request. 'affected': The CI is affected by the change request. 'requested': The CI is requested to be included in the change request. 'requested_and_affected': The CI is both requested and affected."),
    }),
    execute: async ({ servicenowCredentials, sysId, cmdbCiSysIds, associationType }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}/ci`, { method: 'POST', body: toServerKeys({ cmdbCiSysIds, associationType }) });
    },
});

export const serviceNowCreateSnChgRestChangeConflict = tool({
    description: "Starts the conflict checking process for a ServiceNow change request, identifying scheduling conflicts with other changes or blackout windows. Use this action when you need to initiate a conflict check for a change request. This is typically used to verify that a change request doesn't conflict with other scheduled changes or fall within a blackout window. This is commonly used before approving or implementing a change to ensure proper scheduling and avoid resource conflicts. Note: This action starts the conflict check process asynchronously. Use the GetChangeConflict action to retrieve the results of the conflict check once it completes.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request to start conflict checking for. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}/conflict`, { method: 'POST' });
    },
});

export const serviceNowCreateSnChgRestChangeEmergency = tool({
    description: "Creates an emergency change request in ServiceNow using the Change Management API. Use this action when you need to create an expedited change request that requires urgent approval and implementation due to critical business requirements or emergency situations. Emergency changes bypass standard approval workflows to enable rapid response to urgent needs. This action creates a new emergency change request record and returns the generated sys_id and change request number for future reference.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        reason: z.string().optional().describe("Reason for the emergency change request explaining the urgency"),
        cmdbCi: z.string().optional().describe("Sys_id of the affected Configuration Item (CI) in CMDB"),
        description: z.string().optional().describe("Full description of the emergency change request providing detailed context"),
        shortDescription: z.string().describe("Short description of the emergency change request"),
    }),
    execute: async ({ servicenowCredentials, reason, cmdbCi, description, shortDescription }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/emergency`, { method: 'POST', body: toServerKeys({ shortDescription, description, reason, cmdbCi }) });
    },
});

export const serviceNowCreateSnChgRestChangeNormal = tool({
    description: "Creates a normal change request in ServiceNow using the Change Management REST API. Use when you need to create a standard change request that follows the normal approval workflow. Normal changes are subject to standard CAB (Change Advisory Board) review and approval processes before implementation. This action is appropriate for planned changes that can follow the normal change lifecycle. This action creates a new normal change request record and returns the generated sys_id and change request number for future reference and tracking.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        cmdbCi: z.string().optional().describe("Sys_id of the affected Configuration Item (CI) in CMDB"),
        description: z.string().optional().describe("Full description of the normal change request providing detailed context"),
        assignmentGroup: z.string().optional().describe("Sys_id of the assignment group responsible for implementing the change"),
        shortDescription: z.string().describe("Short description of the normal change request"),
    }),
    execute: async ({ servicenowCredentials, cmdbCi, description, assignmentGroup, shortDescription }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/normal`, { method: 'POST', body: toServerKeys({ shortDescription, description, cmdbCi, assignmentGroup }) });
    },
});

export const serviceNowCreateSnChgRestChangeStandard = tool({
    description: "Creates a new standard change request in ServiceNow using a pre-approved standard change template. Use this action when you need to create a standard change request based on a predefined template from the std_change_record_producer table. Standard changes follow a pre-approved workflow and are typically lower-risk changes that follow standardized procedures defined by the organization. The template_id parameter should be the sys_id of an active standard change template. This action creates a new change request record populated with the fields defined in the template.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        templateId: z.string().describe("The sys_id of the standard change template to use for creating the change request. This is a 32-character hexadecimal string that uniquely identifies the template in the std_change_record_producer table. Example: '1234567890abcdef1234567890abcdef'"),
    }),
    execute: async ({ servicenowCredentials, templateId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard/${encodeURIComponent(templateId)}`, { method: 'POST' });
    },
});

export const serviceNowCreateSnChgRestChangeTask = tool({
    description: "Creates a new task for a ServiceNow change request using the Change Management REST API. Use this action when you need to add a new task or subtask to an existing change request, such as breaking down a change into smaller work items, assigning specific work to team members, or tracking additional work needed as part of the change process. The task will be automatically linked to the specified change request. After creation, use the returned sys_id to update or retrieve the task as needed.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        state: z.string().optional().describe("Initial state of the task. Common values: -5=Cancelled, -4=On hold, -3=Rejected, -2=Pending, -1=Draft, 1=Open, 2=Work In Progress, 3=Pending, 4=Complete. If not specified, defaults to the task type's default state."),
        category: z.string().optional().describe("Category or type of the task"),
        comments: z.string().optional().describe("Public comments on the task (visible to end users)"),
        priority: z.string().optional().describe("Priority level of the task (e.g., '1' for critical, '2' for high, '3' for moderate, '4' for low, '5' for planning)"),
        workNotes: z.string().optional().describe("Internal work notes for the task (visible to IT staff only)"),
        assignedTo: z.string().optional().describe("sys_id of the user assigned to the task"),
        description: z.string().optional().describe("Full description of the task"),
        expectedEnd: z.string().optional().describe("Expected end date and time of the task (ISO 8601 format)"),
        changeSysId: z.string().describe("The unique system ID (sys_id) of the change request to create a task for. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'. The change request must exist, or a 404 error will be returned."),
        expectedStart: z.string().optional().describe("Expected start date and time of the task (ISO 8601 format)"),
        onHoldReason: z.string().optional().describe("Reason the task is on hold (use with state=-4)"),
        assignmentGroup: z.string().optional().describe("sys_id of the group assigned to the task"),
        shortDescription: z.string().describe("Brief summary or title of the task"),
    }),
    execute: async ({ servicenowCredentials, state, category, comments, priority, workNotes, assignedTo, description, expectedEnd, changeSysId, expectedStart, onHoldReason, assignmentGroup, shortDescription }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/task`, { method: 'POST', body: toServerKeys({ shortDescription, description, state, category, comments, priority, workNotes, assignedTo, expectedStart, expectedEnd, onHoldReason, assignmentGroup }) });
    },
});

export const serviceNowDeleteChangeTask = tool({
    description: "Permanently deletes a specific task from a ServiceNow change request using its sys_id. This is a destructive, irreversible operation. The task will be permanently removed from the change request and cannot be recovered once deleted. Use this action with caution. Requires the user to have appropriate permissions to delete tasks from change requests. If the change request or task doesn't exist, or if the user lacks permissions, an error will be returned. Use this action when you need to clean up obsolete or incorrect tasks from change requests.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        taskSysId: z.string().describe("The unique system ID (sys_id) of the task to delete from the change request. This is a 32-character hexadecimal string that uniquely identifies the task. Example: 'd262847a833bf210dd2dc2dfeeaad353'. The task must exist within the specified change request, or a 404 error will be returned."),
        changeSysId: z.string().describe("The unique system ID (sys_id) of the change request that contains the task. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'. The change request must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, taskSysId, changeSysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/task/${encodeURIComponent(taskSysId)}`, { method: 'DELETE' });
    },
});

export const serviceNowDeleteEmergencyChangeRequest = tool({
    description: "Permanently deletes a specific emergency change request from ServiceNow using its sys_id. This is a destructive operation that cannot be undone. The emergency change request will be permanently removed from the system. Use this action when an emergency change request is no longer needed or was created in error. Use this action when you need to remove an emergency change request from ServiceNow. This action is irreversible — the emergency change request cannot be recovered once deleted. Requires the user to have delete permissions for change requests. If the record doesn't exist, is not an emergency change request, or the user lacks permissions, an error will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the emergency change request to delete. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '45b188f6833bf210dd2dc2dfeeaad324'. The record must exist and be an emergency change request, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/emergency/${encodeURIComponent(sysId)}`, { method: 'DELETE' });
    },
});

export const serviceNowDeleteSnChgRestChange = tool({
    description: "Permanently deletes a specific change request using its sys_id via the Change Management REST API. Use this action when you need to remove a change request from ServiceNow that is no longer needed. This action is irreversible — the change request cannot be recovered once deleted. Requires the user to have appropriate permissions for the change management module.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request to delete. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '1766f1de47410200e90d87e8dee490f6'. The change request must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}`, { method: 'DELETE' });
    },
});

export const serviceNowDeleteSnChgRestChangeNormal = tool({
    description: "Permanently deletes a normal change request identified by its sys_id using the ServiceNow Change Management REST API. This is a destructive operation that cannot be undone. The normal change request will be permanently removed from the system. Use when you need to remove an unwanted or obsolete normal change request from ServiceNow. This action is irreversible — the change request cannot be recovered once deleted.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the normal change request to delete. This is a 32-character hexadecimal string that uniquely identifies the change request record. Example: '2071a5d037310200f212cc028e41f107'. The change request must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/normal/${encodeURIComponent(sysId)}`, { method: 'DELETE' });
    },
});

export const serviceNowDeleteSnChgRestChangeStandard = tool({
    description: "Permanently deletes a standard change request from ServiceNow using its sys_id. Use this action when you need to remove a specific standard change request that is no longer needed. This is a destructive operation that cannot be undone — the standard change request cannot be recovered once deleted. Requires appropriate permissions to delete change requests in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the standard change request to delete. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '2de5121347c12200e0ef563dbb9a71eb'. The change request must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard/${encodeURIComponent(sysId)}`, { method: 'DELETE' });
    },
});

export const serviceNowGetChangeCiSchedule = tool({
    description: "Retrieves available time slots for scheduling changes against a specific Configuration Item (CI). Use this action when you need to find available change windows for a given CI in ServiceNow's Change Management module. The endpoint queries the CMDB with the specified CI sys_id and returns available schedule slots. Optionally filter by duration_in_seconds to find slots that can accommodate a specific change window length.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        cmdbCiSysId: z.string().describe("The sys_id of the Configuration Item (CI) in the CMDB for which to retrieve available change schedule time slots. This is a 32-character unique identifier for the CI record."),
        durationInSeconds: z.number().describe("The requested duration of the change window in seconds. The API returns only schedule slots that can accommodate a change of this duration. For example, 3600 seconds = 1 hour, 7200 seconds = 2 hours."),
    }),
    execute: async ({ servicenowCredentials, cmdbCiSysId, durationInSeconds }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/ci/${encodeURIComponent(cmdbCiSysId)}/schedule`, { method: 'GET', query: { duration_in_seconds: durationInSeconds } });
    },
});

export const serviceNowGetChangeConflict = tool({
    description: "Retrieves the conflict status for a ServiceNow change request, identifying scheduling conflicts with other changes or blackout windows. Use this action when you need to check if a change request has any scheduling conflicts with other changes or if it falls within a blackout window. This is typically used before approving or implementing a change to ensure proper scheduling and avoid resource conflicts.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request to retrieve conflict status for. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}/conflict`, { method: 'GET' });
    },
});

export const serviceNowGetChangeNextstates = tool({
    description: "Retrieves a list of available next states for a specified change request based on the current state and workflow. Use this action when you need to determine what state transitions are valid for a particular change request, such as when deciding which state to move a change to or when validating workflow transitions.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        changeSysId: z.string().describe("The sys_id of the change request for which to retrieve available next states."),
    }),
    execute: async ({ servicenowCredentials, changeSysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/nextstates`, { method: 'GET' });
    },
});

export const serviceNowGetChangeRequestCi = tool({
    description: "Retrieves configuration items (CIs) associated with a specific change request in ServiceNow. Use this action when you need to fetch the list of configuration items (servers, databases, applications, etc.) that are linked to a change request. This is commonly used to: - Review affected infrastructure before approving a change - Understand the scope of impact for a change request - Verify that all required CIs are included in the change The association_type parameter determines which CIs to retrieve based on their relationship to the change request.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request. This is a 32-character hexadecimal string that uniquely identifies the change request record. Example: '46e9b4afa9fe198101026e122b85f442'"),
        associationType: z.enum(["affected", "requested", "requested_and_affected"]).optional().describe("Type of CI association to retrieve for the change request. 'affected': Retrieves CIs that are affected by the change request. 'requested': Retrieves CIs that are requested to be included in the change request. 'requested_and_affected': Retrieves both requested and affected CIs."),
    }),
    execute: async ({ servicenowCredentials, sysId, associationType }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}/ci`, { method: 'GET', query: { association_type: associationType } });
    },
});

export const serviceNowGetChangeSchedule = tool({
    description: "Retrieves available time slots for scheduling a ServiceNow change request. Use this action when you need to find available scheduling windows for a change request that has been created but not yet scheduled. This helps identify appropriate times to schedule the change work based on the configured calendar and availability. The response includes schedule windows with start/end times, duration, and availability status. Note: The change request must exist and the user must have permission to view the schedule.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        changeSysId: z.string().describe("The unique system ID (sys_id) of the change request. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'. You can obtain this from the sys_id field of a change request record."),
    }),
    execute: async ({ servicenowCredentials, changeSysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/schedule`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeById = tool({
    description: "Retrieves a specific change request from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular change request, including its state, type, and description. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request to retrieve. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '8866498dc37a3610eb10d8477d013161'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeEmergencyById = tool({
    description: "Retrieves a specific emergency change request from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular emergency change request, including its state, risk level, priority, implementation details, approval status, and schedule. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the emergency change request to retrieve. This is a 32-character hexadecimal string that uniquely identifies the emergency change request. Example: 'd53e72ec73d423002728660c4cf6a78d'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/emergency/${encodeURIComponent(sysId)}`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeEmergencyList = tool({
    description: "Retrieves one or more emergency change requests from ServiceNow using the Change Management API. Use this action when you need to query emergency change requests. Emergency changes are a type of change request that requires expedited approval and implementation due to urgent business needs. Supports filtering via sysparm_query, field selection, pagination, and display value options. Common use cases: Retrieving active emergency changes for approval, listing recently submitted emergency changes, monitoring emergency change status, or finding emergency changes by assignee.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmView: z.string().optional().describe("UI view for which to render the data. Determines the fields returned in the response. Valid values: desktop, mobile, both."),
        sysparmLimit: z.number().optional().describe("Maximum number of emergency change records to return. For requests that exceed this number of records, use pagination via sysparm_offset. Note: Unusually large sysparm_limit values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query used to filter the result set. Syntax: sysparm_query=<col_name><operator><value>. Supports operators: =, !=, ^ (AND), ^OR, LIKE, STARTSWITH, ENDSWITH. Example: sysparm_query=state!=4^priority=1 Can also use ORDERBY/ORDERBYDESC for sorting. Example: sysparm_query=ORDERBYDESCopened_at"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'number,short_description,state,priority'). Invalid fields are ignored. If not specified, all fields are returned."),
        sysparmOffset: z.number().optional().describe("Starting record index for which to begin retrieving records. Use this value to paginate record retrieval. For example, if sysparm_limit is 25, use sysparm_offset=25 to get the next 25 records."),
        sysparmDisplayValue: z.enum(["true", "false", "all"]).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields."),
    }),
    execute: async ({ servicenowCredentials, sysparmView, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/emergency`, { method: 'GET', query: { sysparm_view: sysparmView, sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_fields: sysparmFields, sysparm_offset: sysparmOffset, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink } });
    },
});

export const serviceNowGetSnChgRestChangeList = tool({
    description: "Retrieves one or more change requests from ServiceNow based on specified filter criteria. Use when you need to query change management records, monitor pending changes, find changes by state or type, or list all changes assigned to a specific user or group. Supports filtering via encoded queries, pagination via limit/offset, and returns rich change request details including state, priority, dates, assignments, and approvals.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of change request records to return. Use sysparm_offset for pagination to retrieve additional records. Note: Unusually large values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter change requests. Syntax: <col_name><operator><value>. Supports operators: = (exact match), != (not equal), ^ (AND), ^OR (OR), LIKE (contains string), STARTSWITH, ENDSWITH. Example: sysparm_query=state!=7^active=true You can also use ORDERBY and ORDERBYDESC to sort results, e.g., ORDERBYDESCopened_at to sort by most recently opened."),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Use sysparm_offset + sysparm_limit to page through large result sets. For example, first call with offset=0, next call with offset=sysparm_limit."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmOffset }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change`, { method: 'GET', query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset } });
    },
});

export const serviceNowGetSnChgRestChangeModelById = tool({
    description: "Retrieves a specific change model from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular change model, including its name, description, type, category, workflow, and other configuration settings. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change model to retrieve. This is a 32-character hexadecimal string that uniquely identifies the change model. Example: '7840d2515323101034d1ddeeff7b12a6'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/model/${encodeURIComponent(sysId)}`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeModelList = tool({
    description: "Retrieves one or more change models from ServiceNow's Change Management API. Use this action when you need to fetch change model definitions that define the structure and workflow for change requests. Change models determine the type of change (normal, standard, emergency), associated workflows, and other configuration. This is a read-only operation that does not modify any data in ServiceNow. You can retrieve a specific change model by sys_id, or list all change models with optional filtering and pagination.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().optional().describe("The unique system ID (sys_id) of a specific change model to retrieve. If specified, returns only the change model with this sys_id. If not specified, returns all change models (with optional filtering). Example: '8766498dc37a3610eb10d8477d013161'"),
        sysparmLimit: z.number().optional().describe("Maximum number of change models to return in the response. Defaults to 25 if not specified. Use this with sysparm_offset for pagination. Note: Unusually large limit values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query string to filter change models. Uses ServiceNow query syntax. Example: 'active=true' or 'nameLIKEstandard'. Supports operators: =, !=, ^ (AND), ^OR, LIKE, STARTSWITH, ENDSWITH. Example: 'active=true^nameLIKEemergency'"),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Use this to paginate through results. For example, set sysparm_offset to 25 to retrieve the second page of results when combined with sysparm_limit=25."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmLimit, sysparmQuery, sysparmOffset }) => {
        if (sysId !== undefined) {
            return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/model/${encodeURIComponent(sysId)}`, { method: 'GET' });
        }
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/model`, { method: 'GET', query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset } });
    },
});

export const serviceNowGetSnChgRestChangeNormalById = tool({
    description: "Retrieves a specific normal change request from ServiceNow using its sys_id via the Change Management REST API. Use when you need to fetch detailed information about a particular normal change request, including its state, type, priority, dates, assignments, and approvals. This is a read-only operation that does not modify any data in ServiceNow. The action specifically targets change requests of type 'normal' — if the provided sys_id does not correspond to a normal change request, a 404 error will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the normal change request to retrieve. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: 'a9e9c33dc61122760072455df62663d2'. The change request must exist and be of type 'normal', or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/normal/${encodeURIComponent(sysId)}`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeNormalList = tool({
    description: "Retrieves one or more normal change requests from ServiceNow's Change Management API. Use this action when you need to query normal change management records, monitor pending normal changes, find normal changes by state or type, or list all normal changes assigned to a specific user or group. Supports filtering via encoded queries, pagination via limit/offset, and returns rich normal change request details including state, priority, dates, assignments, and approvals. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of normal change request records to return. Use sysparm_offset for pagination to retrieve additional records. Note: Unusually large values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter normal change requests. Syntax: <col_name><operator><value>. Supports operators: = (exact match), != (not equal), ^ (AND), ^OR (OR), LIKE (contains string), STARTSWITH, ENDSWITH. Example: sysparm_query=state!=7^active=true You can also use ORDERBY and ORDERBYDESC to sort results, e.g., ORDERBYDESCopened_at to sort by most recently opened."),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Use sysparm_offset + sysparm_limit to page through large result sets. For example, first call with offset=0, next call with offset=sysparm_limit."),
        sysparmDisplayValue: z.enum(["true", "false", "all"]).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmOffset, sysparmDisplayValue }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/normal`, { method: 'GET', query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset, sysparm_display_value: sysparmDisplayValue } });
    },
});

export const serviceNowGetSnChgRestChangeStandardById = tool({
    description: "Retrieves a specific standard change request from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular standard change request, including its state, phase, description, assignments, and schedule. This is a read-only operation that does not modify any data in ServiceNow. Standard changes are pre-approved changes following a standardized process defined by the organization.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the standard change request to retrieve. This is a 32-character hexadecimal string that uniquely identifies the standard change request. Example: 'eaf5d21347c12200e0ef563dbb9a7109'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard/${encodeURIComponent(sysId)}`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeStandardList = tool({
    description: "Retrieves one or more standard change requests from ServiceNow using the Change Management API. Use this action when you need to query standard change requests. Standard changes are a type of change request that follows a pre-approved template and workflow, typically for routine or recurring changes that have been assessed and authorized in advance. Supports filtering via sysparm_query, field selection, pagination, and display value options. Common use cases: Retrieving active standard changes for approval, listing recently submitted standard changes, monitoring standard change status, or finding standard changes by assignee.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmView: z.string().optional().describe("UI view for which to render the data. Determines the fields returned in the response. Valid values: desktop, mobile, both."),
        sysparmLimit: z.number().optional().describe("Maximum number of standard change records to return. For requests that exceed this number of records, use pagination via sysparm_offset. Note: Unusually large sysparm_limit values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query used to filter the result set. Syntax: sysparm_query=<col_name><operator><value>. Supports operators: =, !=, ^ (AND), ^OR, LIKE, STARTSWITH, ENDSWITH. Example: sysparm_query=state!=4^priority=1 Can also use ORDERBY/ORDERBYDESC for sorting. Example: sysparm_query=ORDERBYDESCopened_at"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'number,short_description,state,priority'). Invalid fields are ignored. If not specified, all fields are returned."),
        sysparmOffset: z.number().optional().describe("Starting record index for which to begin retrieving records. Use this value to paginate record retrieval. For example, if sysparm_limit is 25, use sysparm_offset=25 to get the next 25 records."),
        sysparmDisplayValue: z.enum(["true", "false", "all"]).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields."),
    }),
    execute: async ({ servicenowCredentials, sysparmView, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard`, { method: 'GET', query: { sysparm_view: sysparmView, sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_fields: sysparmFields, sysparm_offset: sysparmOffset, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink } });
    },
});

export const serviceNowGetSnChgRestChangeStandardTemplateById = tool({
    description: "Retrieves a specific standard change template from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular standard change template, including its name, description, category, implementation plan, test plan, risk assessment, and other predefined fields. This is a read-only operation that does not modify any data in ServiceNow. This action complements the list action — use the list action to discover template sys_ids, then use this action to retrieve full details of a specific template by its sys_id.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the standard change template to retrieve. This is a 32-character hexadecimal string that uniquely identifies the template. Example: '508e02ec47410200e90d87e8dee49058'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard/template/${encodeURIComponent(sysId)}`, { method: 'GET' });
    },
});

export const serviceNowGetSnChgRestChangeStandardTemplateList = tool({
    description: "Retrieves one or more standard change templates from ServiceNow's Change Management API. Use this action when you need to query standard change templates that provide pre-defined structures for creating standard change requests. Standard change templates help ensure consistency in change implementation by providing predefined fields such as category, implementation plan, test plan, and risk assessment. This is a read-only operation that does not modify any data in ServiceNow. Common use cases: Listing available templates for a change request, filtering templates by category or active status, or retrieving templates for display in a user interface.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of standard change template records to return. Defaults to 25 if not specified. Use sysparm_offset for pagination to retrieve additional records. Note: Unusually large limit values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter standard change templates. Uses ServiceNow query syntax to filter results. Example: 'active=true' to only return active templates, or 'category=software' to filter by category. Supports operators: = (exact match), != (not equal), ^ (AND), ^OR (OR), LIKE (contains string), STARTSWITH, ENDSWITH. Can also use ORDERBY/ORDERBYDESC for sorting, e.g., ORDERBYDESCname."),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Use sysparm_offset + sysparm_limit to page through large result sets. For example, first call with offset=0, next call with offset=sysparm_limit."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmOffset }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard/template`, { method: 'GET', query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset } });
    },
});

export const serviceNowGetSnChgRestChangeTask = tool({
    description: "Retrieves one or more tasks associated with a specific ServiceNow change request. Use this action when you need to fetch the tasks or subtasks related to a change request, such as to view task status, track progress, or list all work items assigned to a change. This is a read-only operation that does not modify any data in ServiceNow. The endpoint returns tasks that are linked to the change request via the task_for field or as child records in the change management workflow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        changeSysId: z.string().describe("The unique system ID (sys_id) of the change request whose tasks to retrieve. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'. The change request must exist, or a 404 error will be returned."),
        sysparmLimit: z.number().optional().describe("Maximum number of task records to return. Use sysparm_offset for pagination to retrieve additional records. Note: Unusually large values can impact system performance."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid fields are ignored. If not specified, all fields are returned. Example: 'number,short_description,state,assigned_to'"),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Use sysparm_offset + sysparm_limit to page through large result sets. For example, first call with offset=0, next call with offset=sysparm_limit."),
        sysparmDisplayValue: z.string().optional().describe("Determines the type of data returned. 'true': Returns display values (names for references, text labels for choices). 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'all': Returns both display and actual values."),
    }),
    execute: async ({ servicenowCredentials, changeSysId, sysparmLimit, sysparmFields, sysparmOffset, sysparmDisplayValue }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/task`, { method: 'GET', query: { sysparm_limit: sysparmLimit, sysparm_fields: sysparmFields, sysparm_offset: sysparmOffset, sysparm_display_value: sysparmDisplayValue } });
    },
});

export const serviceNowRefreshImpactedServices = tool({
    description: "Refreshes and repopulates the impacted services/configuration items for a change request in ServiceNow using the Change Management REST API. Use this action when you need to recalculate and update the list of impacted services or configuration items for a change request. This is commonly used when: - The change request's scope has changed - Configuration items need to be re-evaluated for impact - A new CI is added to the change and its impact needs to be computed Note: This action triggers a refresh of the impacted services based on the change request's current configuration items and may modify the associated services.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request for which to refresh impacted services. This is a 32-character hexadecimal string that uniquely identifies the change request record. Example: '46e9b4afa9fe198101026e122b85f442'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}/refresh_impacted_services`, { method: 'POST' });
    },
});

export const serviceNowScheduleChangeFirstAvailable = tool({
    description: "Updates the planned start and end times of a ServiceNow change request to the first available schedule slot. Use this action when you need to automatically schedule a change request at the earliest available time slot based on the configured calendar and availability. This is useful for finding optimal scheduling windows when the specific timing is less important than scheduling as soon as possible. This action sends a PATCH request to the Change Management API endpoint, which automatically calculates and assigns the first available time slot for the change request. Note: The change request must exist and be in a schedulable state (typically 'Open' or 'Approved'). The user must have appropriate permissions to modify the change request schedule.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        changeSysId: z.string().describe("The unique system ID (sys_id) of the change request to schedule. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'. The change request must exist and be in a schedulable state."),
        durationInSeconds: z.number().optional().describe("The expected duration of the change request in seconds. This is used to find the first available time slot that can accommodate the change. Default is 3600 seconds (1 hour). Minimum recommended is 300 seconds (5 minutes)."),
    }),
    execute: async ({ servicenowCredentials, changeSysId, durationInSeconds }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/schedule/first_available`, { method: 'PATCH', body: toServerKeys({ durationInSeconds }) });
    },
});

export const serviceNowUpdateSnChgRestChange = tool({
    description: "Updates an existing change request in ServiceNow using the Change Management REST API. Use this action when you need to modify an existing change request, such as updating its state, changing assignments, adding notes, modifying dates, or updating the implementation plan. This action sends a PATCH request to the Change Management API, allowing partial updates of the record fields. Note: Only include the fields you want to update in the request. Fields not included will retain their current values. This is a destructive operation in that it modifies data, but the changes can be reverted by calling this action again with corrected values.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        risk: z.string().optional().describe("Risk assessment of the change request (e.g., 1=High, 2=Medium, 3=Low)"),
        phase: z.string().optional().describe("Current phase of the change request lifecycle (e.g., planning, assessment, authorization, implementation, closure)"),
        state: z.string().optional().describe("Current state of the change request. Common values: -7=Cancelled, -6=Rejected, -5=Skipped, -4=Closed Incomplete, -3=Closed Complete, -2=Closed Skipped, -1=Closed Cancelled, 0=Pending, 1=In Progress, 2=Open, 3=Approved, 4=Review, 5=Scheduled, 6=Implemented, 7=Evaluated"),
        impact: z.string().optional().describe("Impact level of the change request (e.g., 1=High, 2=Medium, 3=Low)"),
        sysId: z.string().describe("The unique system ID (sys_id) of the change request to update. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'"),
        category: z.string().optional().describe("Category or classification of the change request"),
        priority: z.string().optional().describe("Priority of the change request (e.g., 1=Critical, 2=High, 3=Medium, 4=Low)"),
        testPlan: z.string().optional().describe("Test plan for the change"),
        workNotes: z.string().optional().describe("Internal work notes (not visible to end users)"),
        assignedTo: z.string().optional().describe("Sys_id of the user assigned to implement the change"),
        closeNotes: z.string().optional().describe("Notes added when closing the change request"),
        description: z.string().optional().describe("Full description of the change request"),
        subcategory: z.string().optional().describe("Subcategory of the change request"),
        requestedBy: z.string().optional().describe("Sys_id of the user who requested the change"),
        justification: z.string().optional().describe("Business justification for the change"),
        onHoldReason: z.string().optional().describe("Reason the change is on hold"),
        assignmentGroup: z.string().optional().describe("Sys_id of the group assigned to the change"),
        plannedEndDate: z.string().optional().describe("Planned end date and time of the change (format: YYYY-MM-DD HH:MM:SS)"),
        shortDescription: z.string().optional().describe("Brief summary or title of the change request"),
        plannedStartDate: z.string().optional().describe("Planned start date and time of the change (format: YYYY-MM-DD HH:MM:SS)"),
        implementationPlan: z.string().optional().describe("Implementation plan details"),
    }),
    execute: async ({ servicenowCredentials, risk, phase, state, impact, sysId, category, priority, testPlan, workNotes, assignedTo, closeNotes, description, subcategory, requestedBy, justification, onHoldReason, assignmentGroup, plannedEndDate, shortDescription, plannedStartDate, implementationPlan }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(sysId)}`, { method: 'PATCH', body: toServerKeys({ risk, phase, state, impact, category, priority, testPlan, workNotes, assignedTo, closeNotes, description, subcategory, requestedBy, justification, onHoldReason, assignmentGroup, plannedEndDate, shortDescription, plannedStartDate, implementationPlan }) });
    },
});

export const serviceNowUpdateSnChgRestChangeEmergency = tool({
    description: "Updates an existing emergency change request in ServiceNow using the Change Management API. Use this action when you need to modify an existing emergency change request, such as updating its description, changing assignment, modifying priority, updating the implementation plan, or changing any other modifiable field. This is an update (PATCH) operation that performs a partial update of the record. Only fields that are included in the request body will be modified; all other fields retain their current values. Note: This action only works with emergency change requests. For normal or standard changes, use the appropriate change-specific endpoints.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        risk: z.string().optional().describe("Risk level of the emergency change request. Valid values: 'low', 'medium', 'high', 'critical'"),
        phase: z.string().optional().describe("Current phase of the emergency change request workflow."),
        state: z.string().optional().describe("Current state of the emergency change request. Valid values: -5=Cancelled, -4=On hold, -3=Rejected, -2=Pending, -1=Draft, 1=Initiating, 2=Pending, 3=Open, 4=In Progress, 5=Under Review, 6=Scheduled, 7=Implemented, 8=Verified, 9=Closed"),
        impact: z.string().optional().describe("Impact level of the emergency change request. Valid values: 1=High, 2=Medium, 3=Low"),
        reason: z.string().optional().describe("Reason for the emergency change request or its current state."),
        sysId: z.string().describe("The unique system ID (sys_id) of the emergency change request to update. This is a 32-character hexadecimal string that uniquely identifies the emergency change request. Example: 'd53e72ec73d423002728660c4cf6a78d'"),
        cabDate: z.string().optional().describe("Scheduled CAB (Change Advisory Board) date in YYYY-MM-DD format."),
        category: z.string().optional().describe("Category classification of the emergency change request."),
        comments: z.string().optional().describe("Comments visible to end users."),
        priority: z.string().optional().describe("Priority level of the emergency change request. Valid values: 1=Critical, 2=High, 3=Moderate, 4=Low, 5=Planning"),
        testPlan: z.string().optional().describe("Test plan for validating the emergency change implementation."),
        workNotes: z.string().optional().describe("Internal work notes not visible to end users."),
        assignedTo: z.string().optional().describe("sys_id of the user assigned to handle the emergency change request. Reference to sys_user table."),
        closeNotes: z.string().optional().describe("Notes added when closing the emergency change request."),
        description: z.string().optional().describe("Detailed description of the emergency change request. Use this to provide comprehensive details about the change, its purpose, and expected outcomes."),
        subcategory: z.string().optional().describe("Subcategory classification of the emergency change request."),
        expectedEnd: z.string().optional().describe("Expected end date and time of the emergency change. Format: YYYY-MM-DD HH:MM:SS"),
        justification: z.string().optional().describe("Business justification for the emergency change request."),
        rollbackPlan: z.string().optional().describe("Plan for rolling back the change if issues arise."),
        expectedStart: z.string().optional().describe("Expected start date and time of the emergency change. Format: YYYY-MM-DD HH:MM:SS"),
        onHoldReason: z.string().optional().describe("Reason for placing the emergency change request on hold."),
        assignmentGroup: z.string().optional().describe("sys_id of the group assigned to handle the emergency change request. Reference to sys_user_group table."),
        shortDescription: z.string().optional().describe("Brief summary or title of the emergency change request. This field provides a quick overview of what the emergency change is about."),
        cabRecommendation: z.string().optional().describe("CAB recommendation for the emergency change."),
        implementationPlan: z.string().optional().describe("Detailed implementation steps for the emergency change."),
    }),
    execute: async ({ servicenowCredentials, risk, phase, state, impact, reason, sysId, cabDate, category, comments, priority, testPlan, workNotes, assignedTo, closeNotes, description, subcategory, expectedEnd, justification, rollbackPlan, expectedStart, onHoldReason, assignmentGroup, shortDescription, cabRecommendation, implementationPlan }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/emergency/${encodeURIComponent(sysId)}`, { method: 'PATCH', body: toServerKeys({ risk, phase, state, impact, reason, cabDate, category, comments, priority, testPlan, workNotes, assignedTo, closeNotes, description, subcategory, expectedEnd, justification, rollbackPlan, expectedStart, onHoldReason, assignmentGroup, shortDescription, cabRecommendation, implementationPlan }) });
    },
});

export const serviceNowUpdateSnChgRestChangeNormal = tool({
    description: "Updates a normal change request identified by its sys_id using the ServiceNow Change Management REST API. Use this action when you need to modify the details of an existing normal change request, such as updating its description, changing its state or priority, reassigning it to a different user or group, or updating schedule dates. Only the fields provided in the request will be updated; all other fields retain their current values. This is a PATCH operation — it performs a partial update. Only include the fields you want to change.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        risk: z.string().optional().describe("Risk level of the change request. Typical values: 'low', 'medium', 'high', 'critical'. Use lowercase string values as defined in your ServiceNow instance."),
        phase: z.string().optional().describe("Current phase of the change request workflow. Typical values: 'Draft', 'Assessment', 'Authorization', 'Scheduled', 'Implementation', 'Post-Implementation', 'Closed'. Use the exact phase names as defined in your ServiceNow instance."),
        state: z.string().optional().describe("Current state of the change request. Common values: '-5'=Cancelled, '-4'=On hold, '-3'=Rejected, '-2'=Pending, '-1'=Draft, '1'=Initiating, '2'=Pending, '3'=Open, '4'=In Progress, '5'=Under Review, '6'=Scheduled, '7'=Implemented, '8'=Verified, '9'=Closed. Use the numeric string value corresponding to the desired state."),
        active: z.string().optional().describe("Boolean indicating whether the change request is active. Set to 'true' to activate or 'false' to deactivate."),
        impact: z.string().optional().describe("Impact level of the change request. Typical values: '1'=High, '2'=Medium, '3'=Low. Use the numeric string value corresponding to the impact level."),
        reason: z.string().optional().describe("Reason for the change. Example: 'End of life for legacy system component'"),
        sysId: z.string().describe("The unique system ID (sys_id) of the normal change request to update. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: 'a9e9c33dc61122760072455df62663d2'"),
        vendor: z.string().optional().describe("Vendor associated with the change request. Example: 'Acme Corp'"),
        cmdbCi: z.string().optional().describe("The sys_id of the Configuration Item (CI) associated with the change. Reference to cmdb_ci table. Example: 'f9e9c33dc61122760072455df62663d2'"),
        company: z.string().optional().describe("Company associated with the change request. Reference to core_company table via sys_id. Example: '1234567890abcdef1234567890abcdef'"),
        cabDate: z.string().optional().describe("CAB (Change Advisory Board) meeting date. Format: ISO 8601 datetime string. Example: '2024-11-25 10:00:00'"),
        category: z.string().optional().describe("Category or classification of the change request. Examples: 'Network', 'Hardware', 'Software', 'Application'. Values must match valid categories defined in your ServiceNow instance."),
        comments: z.string().optional().describe("Comments visible to end users regarding the change. Example: 'Scheduled maintenance window: 2024-12-01 02:00-04:00 UTC'"),
        contract: z.string().optional().describe("Contract associated with the change request. Example: 'Vendor Support Agreement #12345'"),
        location: z.string().optional().describe("Location associated with the change request. Reference to cmn_location table via sys_id. Example: 'abcdef1234567890abcdef1234567890'"),
        priority: z.string().optional().describe("Priority level of the change request. Typical values: '1'=Critical, '2'=High, '3'=Standard, '4'=Low, '5'=Planning. Use the numeric string value corresponding to the priority."),
        openedBy: z.string().optional().describe("The sys_id of the user who opened the change request. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        testPlan: z.string().optional().describe("Test plan for validating the change. Example: 'Verify service connectivity, check logs for errors'"),
        department: z.string().optional().describe("Department associated with the change request. Reference to cmn_department table via sys_id. Example: 'fedcba0987654321fedcba098765432'"),
        workNotes: z.string().optional().describe("Internal work notes for the change (not visible to end users). Example: 'Contacted vendor support for additional guidance'"),
        approvedBy: z.string().optional().describe("Names or sys_ids of users who approved the change (comma-separated for multiple). Example: 'John Doe, Jane Smith'"),
        assignedTo: z.string().optional().describe("The sys_id of the user assigned to implement the change. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        closeNotes: z.string().optional().describe("Notes added when closing the change request. Example: 'Change completed successfully with no issues'"),
        description: z.string().optional().describe("Detailed description of the change request. Example: 'Requires updating firewall rules to allow traffic on port 443'"),
        phaseState: z.string().optional().describe("State within the current phase. Examples: 'Complete', 'In Progress', 'Pending', 'Skipped'. Use the exact state names as defined in your ServiceNow instance."),
        reviewDate: z.string().optional().describe("Scheduled review date for the change. Format: ISO 8601 datetime string. Example: '2024-11-30 09:00:00'"),
        subcategory: z.string().optional().describe("Subcategory of the change request. Must correspond to a valid subcategory for the selected category. Example: 'Firewall' under 'Network'"),
        requestedBy: z.string().optional().describe("The sys_id of the user who requested the change. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        justification: z.string().optional().describe("Business justification for the change. Example: 'Required for compliance with new security policy'"),
        onHoldReason: z.string().optional().describe("Reason for placing the change request on hold. Example: 'Waiting for approval from security team'"),
        actualEndDate: z.string().optional().describe("Actual end date and time when the change was completed. Format: ISO 8601 datetime string. Example: '2024-12-01 03:45:00'"),
        assignmentGroup: z.string().optional().describe("The sys_id of the group assigned to the change. Reference to sys_user_group table. Example: '287e8906c61122730024e53cf3104b26'"),
        plannedEndDate: z.string().optional().describe("Planned end date and time of the change. Format: ISO 8601 datetime string. Example: '2024-12-01 04:00:00'"),
        serviceOffering: z.string().optional().describe("The sys_id of the service offering related to the change. Reference to service_offering table. Example: 'b1e9c33dc61122760072455df62663d2'"),
        actualStartDate: z.string().optional().describe("Actual start date and time when the change began. Format: ISO 8601 datetime string. Example: '2024-12-01 02:05:00'"),
        businessDuration: z.string().optional().describe("Business duration in seconds (calculated based on business hours). Example: '7200' for 2 hours"),
        calendarDuration: z.string().optional().describe("Calendar duration in seconds (total elapsed time). Example: '14400' for 4 hours"),
        shortDescription: z.string().optional().describe("Brief summary or title of the change request. Example: 'Update network configuration for DC-2'"),
        cabRecommendation: z.string().optional().describe("CAB recommendation for the change. Example: 'Approved with conditions'"),
        plannedStartDate: z.string().optional().describe("Planned start date and time of the change. Format: ISO 8601 datetime string. Example: '2024-12-01 02:00:00'"),
        implementationPlan: z.string().optional().describe("Implementation plan details describing how the change will be executed. Example: 'Step 1: Backup current config. Step 2: Apply new config. Step 3: Verify.'"),
    }),
    execute: async ({ servicenowCredentials, risk, phase, state, active, impact, reason, sysId, vendor, cmdbCi, company, cabDate, category, comments, contract, location, priority, openedBy, testPlan, department, workNotes, approvedBy, assignedTo, closeNotes, description, phaseState, reviewDate, subcategory, requestedBy, justification, onHoldReason, actualEndDate, assignmentGroup, plannedEndDate, serviceOffering, actualStartDate, businessDuration, calendarDuration, shortDescription, cabRecommendation, plannedStartDate, implementationPlan }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/normal/${encodeURIComponent(sysId)}`, { method: 'PATCH', body: toServerKeys({ risk, phase, state, active, impact, reason, vendor, cmdbCi, company, cabDate, category, comments, contract, location, priority, openedBy, testPlan, department, workNotes, approvedBy, assignedTo, closeNotes, description, phaseState, reviewDate, subcategory, requestedBy, justification, onHoldReason, actualEndDate, assignmentGroup, plannedEndDate, serviceOffering, actualStartDate, businessDuration, calendarDuration, shortDescription, cabRecommendation, plannedStartDate, implementationPlan }) });
    },
});

export const serviceNowUpdateSnChgRestChangeStandard = tool({
    description: "Updates a standard change request in ServiceNow using its sys_id. Use this action when you need to modify an existing standard change request, such as updating its description, changing the assigned user or group, modifying dates, updating state or phase, or adding implementation and test plans. This is a PATCH operation that updates only the provided fields while preserving all other existing values on the record. This action uses the PATCH method, which means only fields included in the request will be modified. Fields not provided will retain their current values.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        risk: z.string().optional().describe("Risk level of the standard change request. Valid values: 'low', 'medium', 'high', 'critical'. Example: 'low'"),
        phase: z.string().optional().describe("Current phase of the standard change request workflow. Example: 'Requested', 'Approved', 'Scheduled', 'Implementation', 'Review', 'Closed'"),
        state: z.string().optional().describe("Current state of the standard change request. Common values: -5=Cancelled, -4=On hold, -3=Rejected, -2=Pending, -1=Draft, 1=Initiating, 2=Pending, 3=Open, 4=In Progress, 5=Under Review, 6=Scheduled, 7=Implemented, 8=Verified, 9=Closed. Note: State transitions may require appropriate permissions and workflow conditions."),
        active: z.string().optional().describe("Boolean indicating if the standard change request is active. Use 'true' to activate or 'false' to deactivate. Example: 'true'"),
        impact: z.string().optional().describe("Impact level of the standard change request. Typical values: 1=Critical, 2=High, 3=Medium, 4=Low. Example: '2'"),
        reason: z.string().optional().describe("Reason for the standard change request. Example: 'Performance optimization required'"),
        sysId: z.string().describe("The unique system ID (sys_id) of the standard change request to update. This is a 32-character hexadecimal string that uniquely identifies the standard change request. Example: '543a39de47410200e90d87e8dee4908a'"),
        vendor: z.string().optional().describe("Vendor associated with the standard change request. Example: 'ACME Corporation'"),
        cmdbCi: z.string().optional().describe("The sys_id of the Configuration Item (CI) associated with the standard change request. Reference to cmdb_ci table. Example: 'ci1234567890abcdef1234567890ab'"),
        company: z.string().optional().describe("The sys_id of the company associated with the standard change request. Reference to core_company table. Example: 'com1234567890abcdef1234567890ab'"),
        category: z.string().optional().describe("Category classification of the standard change request. Must be a valid category defined in the change management configuration. Example: 'Software' or 'Hardware'"),
        comments: z.string().optional().describe("Comments visible to end users about the standard change request. Example: 'Maintenance window: 2AM-4AM UTC'"),
        location: z.string().optional().describe("The sys_id of the location associated with the standard change request. Reference to cmn_location table. Example: 'loc1234567890abcdef1234567890ab'"),
        priority: z.string().optional().describe("Priority level of the standard change request. Typical values: 1=Critical, 2=High, 3=Standard, 4=Low, 5=Planning. Example: '2'"),
        workEnd: z.string().optional().describe("Work end date and time for the standard change. Format: YYYY-MM-DD HH:MM:SS or ISO 8601 format. Example: '2024-12-15 04:00:00'"),
        poNumber: z.string().optional().describe("Purchase order number associated with the standard change request. Example: 'PO-2024-12345'"),
        testPlan: z.string().optional().describe("Test plan for the standard change request describing how the change will be tested before and after implementation. Example: 'Verify application starts successfully and database connections work'"),
        actualEnd: z.string().optional().describe("Actual end date and time of the standard change. Format: YYYY-MM-DD HH:MM:SS or ISO 8601 format. Example: '2024-12-15 03:45:00'"),
        department: z.string().optional().describe("The sys_id of the department associated with the standard change request. Reference to cmn_department table. Example: 'dept1234567890abcdef1234567890ab'"),
        workNotes: z.string().optional().describe("Internal work notes for the standard change request (not visible to end users). Use this for technical details and progress updates. Example: 'Applied config changes to all servers'"),
        workStart: z.string().optional().describe("Work start date and time for the standard change. Format: YYYY-MM-DD HH:MM:SS or ISO 8601 format. Example: '2024-12-15 02:00:00'"),
        assignedTo: z.string().optional().describe("The sys_id of the user to assign the standard change request to. Reference to sys_user table. Example: 'usr1234567890abcdef1234567890ab'"),
        changePlan: z.string().optional().describe("Change plan details for the standard change request. Example: 'Update configuration files and restart services'"),
        closeNotes: z.string().optional().describe("Notes to add when closing the standard change request. Include any final comments, lessons learned, or completion status. Example: 'Change completed successfully. No issues encountered.'"),
        description: z.string().optional().describe("Detailed description of the standard change request explaining what needs to be changed and why. Example: 'Update connection pooling settings in production database to improve performance'"),
        phaseState: z.string().optional().describe("State within the current phase of the workflow"),
        subcategory: z.string().optional().describe("Subcategory classification of the standard change request. Must be a valid subcategory within the selected category. Example: 'Operating System' or 'Database'"),
        actualStart: z.string().optional().describe("Actual start date and time of the standard change. Format: YYYY-MM-DD HH:MM:SS or ISO 8601 format. Example: '2024-12-15 02:05:00'"),
        backoutPlan: z.string().optional().describe("Backout plan describing the procedure to back out of the standard change. Example: 'Execute revert script and notify team'"),
        expectedEnd: z.string().optional().describe("Expected end date and time of the standard change. Format: YYYY-MM-DD HH:MM:SS or ISO 8601 format. Example: '2024-12-15 04:00:00'"),
        requestedBy: z.string().optional().describe("The sys_id of the user who requested the standard change. Reference to sys_user table. Example: 'usr987654321fedcba9876543210zyxw'"),
        justification: z.string().optional().describe("Business justification for the standard change request. Example: 'Improve system performance and reduce downtime'"),
        rollbackPlan: z.string().optional().describe("Rollback plan describing how to revert the standard change if issues occur. Example: 'Restore from backup and restart previous version'"),
        expectedStart: z.string().optional().describe("Expected start date and time of the standard change. Format: YYYY-MM-DD HH:MM:SS or ISO 8601 format. Example: '2024-12-15 02:00:00'"),
        onHoldReason: z.string().optional().describe("Reason for placing the standard change request on hold. Example: 'Waiting for vendor approval'"),
        reviewOutcome: z.string().optional().describe("Outcome of the standard change review. Example: 'Success', 'Failed', 'Partial'"),
        reviewComments: z.string().optional().describe("Comments from the standard change review. Example: 'All tests passed successfully'"),
        assignmentGroup: z.string().optional().describe("The sys_id of the group to assign the standard change request to. Reference to sys_user_group table. Example: 'grp1234567890abcdef1234567890ab'"),
        serviceOffering: z.string().optional().describe("The sys_id of the service offering associated with the standard change request. Reference to service_offering table. Example: 'svc1234567890abcdef1234567890ab'"),
        shortDescription: z.string().optional().describe("Brief summary or title of the standard change request. Example: 'Update database configuration for production servers'"),
        cabRecommendation: z.string().optional().describe("CAB recommendation for the standard change. Example: 'Approved', 'Rejected', 'Approved with conditions'"),
        implementationPlan: z.string().optional().describe("Implementation plan describing the steps to implement the standard change. Example: '1. Backup current config, 2. Apply new settings, 3. Restart service'"),
    }),
    execute: async ({ servicenowCredentials, risk, phase, state, active, impact, reason, sysId, vendor, cmdbCi, company, category, comments, location, priority, workEnd, poNumber, testPlan, actualEnd, department, workNotes, workStart, assignedTo, changePlan, closeNotes, description, phaseState, subcategory, actualStart, backoutPlan, expectedEnd, requestedBy, justification, rollbackPlan, expectedStart, onHoldReason, reviewOutcome, reviewComments, assignmentGroup, serviceOffering, shortDescription, cabRecommendation, implementationPlan }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/standard/${encodeURIComponent(sysId)}`, { method: 'PATCH', body: toServerKeys({ risk, phase, state, active, impact, reason, vendor, cmdbCi, company, category, comments, location, priority, workEnd, poNumber, testPlan, actualEnd, department, workNotes, workStart, assignedTo, changePlan, closeNotes, description, phaseState, subcategory, actualStart, backoutPlan, expectedEnd, requestedBy, justification, rollbackPlan, expectedStart, onHoldReason, reviewOutcome, reviewComments, assignmentGroup, serviceOffering, shortDescription, cabRecommendation, implementationPlan }) });
    },
});

export const serviceNowUpdateSnChgRestChangeTask = tool({
    description: "Updates an existing change request task in ServiceNow using the Change Management REST API. Use this action when you need to modify an existing task associated with a change request, such as updating its status, changing assignment, adding work notes, or marking it complete. This action sends a PATCH request to the Change Management API, allowing partial updates of the task fields. Only include the fields you want to update in the request - fields not included will retain their current values. Note: The task must already exist within the specified change request. If the change request or task doesn't exist, a 404 error will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        state: z.string().optional().describe("Current state of the task. Common values: -5=Cancelled, -4=On hold, -3=Rejected, -2=Pending, -1=Draft, 1=Open, 2=Work In Progress, 3=Pending, 4=Complete"),
        comments: z.string().optional().describe("Public comments on the task (visible to end users)"),
        priority: z.string().optional().describe("Priority level of the task (e.g., '1' for critical, '2' for high, '3' for moderate, '4' for low, '5' for planning)"),
        actualEnd: z.string().optional().describe("Actual end date and time when the task was completed (ISO 8601 format)"),
        workNotes: z.string().optional().describe("Internal work notes for the task (visible to IT staff only)"),
        assignedTo: z.string().optional().describe("sys_id of the user assigned to the task"),
        closeNotes: z.string().optional().describe("Notes added when closing the task"),
        description: z.string().optional().describe("Full description of the task"),
        taskSysId: z.string().describe("The unique system ID (sys_id) of the task to update within the change request. This is a 32-character hexadecimal string that uniquely identifies the task. Example: 'cd820c7a833bf210dd2dc2dfeeaad333'. The task must exist within the specified change request, or a 404 error will be returned."),
        actualStart: z.string().optional().describe("Actual start date and time when the task began (ISO 8601 format)"),
        expectedEnd: z.string().optional().describe("Expected end date and time of the task (ISO 8601 format)"),
        changeSysId: z.string().describe("The unique system ID (sys_id) of the change request containing the task to update. This is a 32-character hexadecimal string that uniquely identifies the change request. Example: '46e9b4afa9fe198101026e122b85f442'. The change request must exist, or a 404 error will be returned."),
        expectedStart: z.string().optional().describe("Expected start date and time of the task (ISO 8601 format)"),
        onHoldReason: z.string().optional().describe("Reason the task is on hold"),
        assignmentGroup: z.string().optional().describe("sys_id of the group assigned to the task"),
        shortDescription: z.string().optional().describe("Brief summary or title of the task"),
    }),
    execute: async ({ servicenowCredentials, state, comments, priority, actualEnd, workNotes, assignedTo, closeNotes, description, taskSysId, actualStart, expectedEnd, changeSysId, expectedStart, onHoldReason, assignmentGroup, shortDescription }) => {
        return snRequest(servicenowCredentials, `/api/sn_chg_rest/change/${encodeURIComponent(changeSysId)}/task/${encodeURIComponent(taskSysId)}`, { method: 'PATCH', body: toServerKeys({ state, comments, priority, actualEnd, workNotes, assignedTo, closeNotes, description, actualStart, expectedEnd, expectedStart, onHoldReason, assignmentGroup, shortDescription }) });
    },
});
