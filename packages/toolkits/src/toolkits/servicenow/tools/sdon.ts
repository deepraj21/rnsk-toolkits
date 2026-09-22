// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const createSdwanTicket = tool({
    description: "Creates a new trouble ticket in ServiceNow using the Service Operations Workspace Trouble Ticket Open API. Use this action when you need to create a new SD-WAN or network-related trouble ticket for tracking and resolution. This action sends a POST request to the sn_ind_tsm_sdwan trouble ticket API, creating a record in the Case or other configured ticket table. After creation, the ticket will have a unique sys_id and number that can be used to retrieve, update, or close it in subsequent operations. This action is specifically for the Service Operations Workspace / Service Management SD-WAN integration's trouble ticket creation functionality.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        category: z.string().optional().describe("Category or classification of the trouble ticket. Example categories: 'Network', 'Hardware', 'Software', 'Security'. The exact categories depend on your ServiceNow configuration."),
        priority: z.string().optional().describe("Priority level of the trouble ticket. Typical values: 1 = Critical (service down), 2 = High (major impact), 3 = Medium (moderate impact), 4 = Low (minor impact). The exact priority values depend on your ServiceNow configuration."),
        callerId: z.string().optional().describe("Sys_id of the user who reported or initiated the trouble ticket. This is the 32-character hexadecimal string that identifies the user. Example: 'usr123abc456def789ghi012jkl345'"),
        workNotes: z.string().optional().describe("Internal work notes about the trouble ticket. These notes are only visible to users with appropriate roles and are not visible to end users or customers. Use this for technical details and updates. Example: 'Investigated the issue and identified root cause as faulty switch'"),
        assignedTo: z.string().optional().describe("Sys_id of the user assigned to handle the trouble ticket. This is the 32-character hexadecimal string that identifies the user. Example: 'usr789xyz012abc345def678ghi901'"),
        description: z.string().optional().describe("Full detailed description of the trouble ticket, including symptoms, impact, and any relevant background information. Example: 'Users unable to access the corporate network since 9 AM'"),
        subcategory: z.string().optional().describe("Subcategory of the trouble ticket for more specific classification. Example subcategories: 'Firewall', 'Router', 'Switch', 'VPN'. The exact subcategories depend on your ServiceNow configuration."),
        ticketType: z.string().describe("The type of trouble ticket to create. Common values include 'case', 'incident', or other ticket types supported by your ServiceNow Service Operations Workspace SD-WAN configuration. Example: 'case'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid fields are ignored. If not specified, all fields are returned. Example: 'number,short_description,state,assigned_to'"),
        assignmentGroup: z.string().optional().describe("Sys_id of the group assigned to handle the trouble ticket. This is the 32-character hexadecimal string that identifies the group. Example: 'grp456def789ghi012jkl345mno678'"),
        shortDescription: z.string().optional().describe("Brief summary or title of the trouble ticket. This describes the issue or request in a concise manner. Example: 'Network connectivity issue in DC1'"),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values (e.g., user names) instead of sys_ids in record_data for reference fields. When false (default), reference fields must contain sys_ids."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response. Use this to reduce response size when reference links are not needed."),
    }),
    execute: async ({ servicenowCredentials, category, priority, callerId, workNotes, assignedTo, description, subcategory, ticketType, sysparmFields, assignmentGroup, shortDescription, sysparmDisplayValue, sysparmInputDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/sn_ind_tsm_sdwan/ticket/troubleTicket', {
            method: 'POST',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_input_display_value: sysparmInputDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
            body: toServerKeys({ ticketType, shortDescription, description, category, subcategory, priority, callerId, assignedTo, assignmentGroup, workNotes }),
        });
    },
});

export const updateSdwanTicket = tool({
    description: "Updates an existing trouble ticket in ServiceNow using the Service Operations Workspace Trouble Ticket Open API. Use this action when you need to modify an existing trouble ticket, such as updating its state, changing assignments, adding notes, or modifying the resolution details. This action sends a PATCH request to the sn_ind_tsm_sdwan trouble ticket API, allowing partial updates of the record fields. Only include the fields you want to update in the request. Fields not included will retain their current values. This modifies the record data, but changes can be reverted by calling this action again with corrected values. This action is specifically for the Service Operations Workspace / Service Management SD-WAN integration's trouble ticket management functionality.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        id: z.string().describe("The unique identifier (sys_id or record ID) of the trouble ticket to update. This is a 32-character hexadecimal string that uniquely identifies the trouble ticket record. Example: '1c741bd70b2322007518478d83673af3'"),
        state: z.string().optional().describe("Current state of the trouble ticket. Common values vary by workflow but typically include: 'Open', 'In Progress', 'On Hold', 'Resolved', 'Closed', 'Cancelled'. The exact state values depend on your ServiceNow configuration."),
        category: z.string().optional().describe("Category or classification of the trouble ticket. Example categories: 'Network', 'Hardware', 'Software', 'Security'. The exact categories depend on your ServiceNow configuration."),
        priority: z.string().optional().describe("Priority level of the trouble ticket. Typical values: 1 = Critical (service down), 2 = High (major impact), 3 = Medium (moderate impact), 4 = Low (minor impact). The exact priority values depend on your ServiceNow configuration."),
        closeCode: z.string().optional().describe("The resolution code for closing the trouble ticket. Common values: 'Resolved', 'Closed/Resolved', 'Closed/Cancelled', 'Not Resolved', 'Escalated'. The exact values depend on your configuration."),
        workNotes: z.string().optional().describe("Internal work notes about the trouble ticket. These notes are only visible to users with appropriate roles and are not visible to end users or customers. Use this for technical details and updates. Example: 'Investigated the issue and identified root cause as faulty switch'"),
        assignedTo: z.string().optional().describe("Sys_id of the user assigned to handle the trouble ticket. This is the 32-character hexadecimal string that identifies the user. Example: 'usr789xyz012abc345def678ghi901'"),
        description: z.string().optional().describe("Full detailed description of the trouble ticket, including symptoms, impact, and any relevant background information. Example: 'Users unable to access the corporate network since 9 AM'"),
        subcategory: z.string().optional().describe("Subcategory of the trouble ticket for more specific classification. Example subcategories: 'Firewall', 'Router', 'Switch', 'VPN'. The exact subcategories depend on your ServiceNow configuration."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid fields are ignored. If not specified, all fields are returned. Example: 'number,short_description,state,assigned_to'"),
        assignmentGroup: z.string().optional().describe("Sys_id of the group assigned to handle the trouble ticket. This is the 32-character hexadecimal string that identifies the group. Example: 'grp456def789ghi012jkl345mno678'"),
        resolutionNotes: z.string().optional().describe("Notes documenting how the trouble ticket was resolved. These are typically added when closing the ticket and describe the solution. Example: 'Replaced faulty switch and connectivity restored'"),
        shortDescription: z.string().optional().describe("Brief summary or title of the trouble ticket. This describes the issue or request in a concise manner. Example: 'Network connectivity issue in DC1'"),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response. Use this to reduce response size when reference links are not needed."),
        impact: z.string().optional().describe("Impact level of the trouble ticket. Typical values: 1=High, 2=Medium, 3=Low. Use the numeric string value corresponding to the impact level."),
        urgency: z.string().optional().describe("Urgency level of the trouble ticket. Typical values: 1=High, 2=Medium, 3=Low. Use the numeric string value corresponding to the urgency level."),
        callerId: z.string().optional().describe("Sys_id of the user who reported the issue"),
        comments: z.string().optional().describe("Comments visible to end users regarding the trouble ticket"),
        escalation: z.string().optional().describe("Escalation status of the trouble ticket"),
        cmdbCi: z.string().optional().describe("Sys_id of the Configuration Item associated with the trouble ticket"),
        closeNotes: z.string().optional().describe("Notes added when closing the trouble ticket"),
        holdReason: z.string().optional().describe("Reason for placing the trouble ticket on hold"),
        resolvedAt: z.string().optional().describe("Timestamp when the trouble ticket was resolved (format: YYYY-MM-DD HH:MM:SS)"),
        resolvedBy: z.string().optional().describe("Sys_id of the user who resolved the trouble ticket"),
        ticketType: z.enum(['Case', 'Incident', 'Problem', 'ChangeRequest']).optional().describe("The type of trouble ticket to update. Valid values: 'Case', 'Incident', 'Problem', 'ChangeRequest'. Example: 'Case'"),
        businessResolution: z.string().optional().describe("Business resolution description"),
    }),
    execute: async ({ servicenowCredentials, id, state, category, priority, closeCode, workNotes, assignedTo, description, subcategory, sysparmFields, assignmentGroup, resolutionNotes, shortDescription, sysparmDisplayValue, sysparmExcludeReferenceLink, impact, urgency, callerId, comments, escalation, cmdbCi, closeNotes, holdReason, resolvedAt, resolvedBy, businessResolution }) => {
        return snRequest(servicenowCredentials, `/api/sn_ind_tsm_sdwan/ticket/troubleTicket/${encodeURIComponent(id)}`, {
            method: 'PUT',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
            body: toServerKeys({ state, category, priority, closeCode, workNotes, assignedTo, description, subcategory, assignmentGroup, resolutionNotes, shortDescription, impact, urgency, callerId, comments, escalation, cmdbCi, closeNotes, holdReason, resolvedAt, resolvedBy, businessResolution }),
        });
    },
});
