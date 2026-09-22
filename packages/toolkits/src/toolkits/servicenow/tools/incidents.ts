// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const createIncident = tool({
    description: "Creates a new incident record in ServiceNow with the provided field values. Use this action when you need to log or report a new incident in ServiceNow IT Service Management. The created incident is returned with its sys_id and auto-generated incident number. This action specifically targets the incident table and includes incident-specific fields like urgency, impact, severity, incident_state, and caller_id for proper incident management workflows.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        state: z.enum(['1', '2', '3', '4', '5', '6', '7', '8']).optional().describe("ServiceNow incident state values"),
        active: z.boolean().optional().describe("Whether the incident is active. Defaults to true for new incidents."),
        impact: z.enum(['1', '2', '3', '4']).optional().describe("ServiceNow impact levels - measures of business criticality"),
        cmdbCi: z.string().optional().describe("Configuration Item (CI) in the CMDB that is affected."),
        urgency: z.enum(['1', '2', '3', '4']).optional().describe("ServiceNow urgency levels - measure of business criticality"),
        category: z.string().optional().describe("Category classification of the incident (e.g., 'Network', 'Hardware', 'Software', 'Database')."),
        comments: z.string().optional().describe("Additional comments about the incident, visible to end users."),
        location: z.string().optional().describe("Location of the caller or affected service."),
        priority: z.enum(['1', '2', '3', '4', '5']).optional().describe("ServiceNow priority levels"),
        callerId: z.string().optional().describe("Person who reported or is affected by the incident. Can be a user sys_id or display value depending on sysparm_input_display_value setting."),
        workNotes: z.string().optional().describe("Internal work notes about the incident, not visible to end users."),
        assignedTo: z.string().optional().describe("Person primarily responsible for working this incident. Can be a user sys_id or display value."),
        description: z.string().optional().describe("Detailed description of the incident, including symptoms, steps to reproduce, and any relevant context."),
        subcategory: z.string().optional().describe("Subcategory within the main category (e.g., 'Firewall' under 'Network')."),
        contactType: z.string().optional().describe("Method of contact used to report the incident (e.g., 'Phone', 'Email', 'Self-service', 'Chat')."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'number,sys_id,short_description,state'). Invalid fields are ignored. If not specified, all fields are returned."),
        assignmentGroup: z.string().optional().describe("Group assigned to handle the incident. Can be a group sys_id or display value."),
        businessService: z.string().optional().describe("Business service affected by the incident."),
        shortDescription: z.string().describe("Brief summary of the incident. This field is required for most incident records."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values (e.g., user names, group names) instead of sys_ids in caller_id, assigned_to, assignment_group, or other reference fields. When false (default), reference fields must contain sys_ids."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response. This is recommended for cleaner responses."),
        company: z.string().optional().describe("Sys_id of the company associated with this incident."),
        watchList: z.string().optional().describe("Comma-separated list of user sys_ids who should receive notifications about this incident."),
    }),
    execute: async ({ servicenowCredentials, state, active, impact, cmdbCi, urgency, category, comments, location, priority, callerId, workNotes, assignedTo, description, subcategory, contactType, sysparmFields, assignmentGroup, businessService, shortDescription, sysparmDisplayValue, sysparmInputDisplayValue, sysparmExcludeReferenceLink, company, watchList }) => {
        return snRequest(servicenowCredentials, '/api/now/table/incident', {
            method: 'POST',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_input_display_value: sysparmInputDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
            body: toServerKeys({
                state,
                active,
                impact,
                cmdbCi,
                urgency,
                category,
                comments,
                location,
                priority,
                callerId,
                workNotes,
                assignedTo,
                description,
                subcategory,
                contactType,
                assignmentGroup,
                businessService,
                shortDescription,
                company,
                watchList,
            }),
        });
    },
});

export const getIncidentList = tool({
    description: "Retrieves incidents from the ServiceNow incident table using the Table API. Use this action when you need to query and fetch incidents with optional filtering via sysparm_query, pagination via sysparm_limit and sysparm_offset, and field selection via sysparm_fields.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of incident records to return. Use pagination for larger result sets."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter incidents. Syntax: <col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: state=2^priority=1 (active critical incidents)"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,number,state,priority,short_description'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.boolean().optional().describe("Determines if system references should be returned as actual values (false) or display values (true)."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Determines whether to exclude reference links from the response. Set to true to simplify the response."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/table/incident', {
            method: 'GET',
            query: {
                sysparm_limit: sysparmLimit,
                sysparm_query: sysparmQuery,
                sysparm_fields: sysparmFields,
                sysparm_offset: sysparmOffset,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
        });
    },
});

export const getIncident = tool({
    description: "Retrieves a specific incident from ServiceNow by its sys_id. Use this action when you need to fetch detailed information about a particular incident, including its state, priority, caller, assignment details, and resolution information. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the incident to retrieve. This is a 32-character hexadecimal string that uniquely identifies the incident record. Example: '46b66a40a9fe198101f243dfbc79033d'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. If not specified, all fields are returned."),
        sysparmDisplayValue: z.boolean().optional().describe("Determines whether to return actual database values (false) or display values (true) for reference fields."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Determines whether reference links should be excluded from the response. Set to true to exclude reference links."),
        sysparmView: z.enum(['desktop', 'mobile', 'both']).optional().describe("UI view for which to render the data. Determines the fields returned in the response."),
        sysparmQueryCategory: z.string().optional().describe("Name of the category to use for queries."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmFields, sysparmDisplayValue, sysparmExcludeReferenceLink, sysparmView, sysparmQueryCategory }) => {
        return snRequest(servicenowCredentials, `/api/now/table/incident/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
                sysparm_view: sysparmView,
                sysparm_query_category: sysparmQueryCategory,
            },
        });
    },
});

export const updateIncident = tool({
    description: "Updates an existing incident in ServiceNow identified by its sys_id using the Table API. Use this action when you need to modify an existing incident, such as updating its state, changing assignments, adding notes, updating priority, or resolving/closing the incident. Only the fields provided in the request will be updated; all other fields retain their current values. Note: This action performs a PUT (replace) operation. Only include the fields you want to update. This is a destructive operation in that it modifies data, but the changes can be reverted by calling this action again with corrected values.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        state: z.string().optional().describe("Current state of the incident. Common values: '1'=New, '2'=In Progress, '3'=On Hold, '4'=Resolved, '5'=Closed, '6'=Cancelled. Use the numeric string value corresponding to the desired state."),
        active: z.string().optional().describe("Boolean indicating whether the incident is active. Set to 'true' to activate or 'false' to deactivate."),
        impact: z.string().optional().describe("Impact level of the incident (business criticality). Typical values: '1'=High, '2'=Medium, '3'=Low. Use the numeric string value corresponding to the impact level."),
        sysId: z.string().describe("The unique system ID (sys_id) of the incident to update. This is a 32-character hexadecimal string that uniquely identifies the incident. Example: '1c832706732023002728660c4cf6a7b9'"),
        cmdbCi: z.string().optional().describe("The sys_id of the Configuration Item (CI) associated with the incident. Reference to cmdb_ci table. Example: 'f9e9c33dc61122760072455df62663d2'"),
        urgency: z.string().optional().describe("Urgency level of the incident (business criticality based on business needs). Typical values: '1'=High, '2'=Medium, '3'=Low. Use the numeric string value corresponding to the urgency level."),
        category: z.string().optional().describe("Category or classification of the incident. Examples: 'network', 'hardware', 'software', 'database'. Values must match valid categories defined in your ServiceNow instance."),
        comments: z.string().optional().describe("Additional comments or notes on the incident (visible to end users). Example: 'Updated user on status of the incident'"),
        dueDate: z.string().optional().describe("Expected resolution date/time from assigned user. Format: ISO 8601 datetime string or YYYY-MM-DD HH:MM:SS. Example: '2024-12-01 17:00:00'"),
        location: z.string().optional().describe("The sys_id of the location where the caller or service is located. Reference to cmn_location table. Example: 'abcdef1234567890abcdef1234567890'"),
        madeSla: z.string().optional().describe("Boolean indicating whether the SLA was met (true/false as string). Example: 'true'"),
        priority: z.string().optional().describe("Priority level of the incident. Typical values: '1'=Critical, '2'=High, '3'=Medium, '4'=Low, '5'=Planning. Use the numeric string value corresponding to the priority."),
        callerId: z.string().optional().describe("The sys_id of the person who reported the incident. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        closedAt: z.string().optional().describe("Timestamp when the incident was closed. Format: ISO 8601 datetime string or YYYY-MM-DD HH:MM:SS. Example: '2024-12-01 15:00:00'"),
        closedBy: z.string().optional().describe("The sys_id of the user who closed the incident. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        knowledge: z.string().optional().describe("Boolean indicating whether the incident is linked to a knowledge base article (true/false as string). Example: 'false'"),
        closeCode: z.string().optional().describe("Resolution code when closing the incident. Stock examples: 'Duplicate', 'Resolved by change', 'Workaround provided', 'Solution provided'. Values must match valid close codes defined in your ServiceNow instance."),
        escalation: z.string().optional().describe("Escalation status of the incident. Typical values: 'normal', 'escalated'. Values must match valid escalation values defined in your ServiceNow instance."),
        problemId: z.string().optional().describe("Sys_id of the related problem record, if one exists. Reference to problem table. Example: 'c9e9c33dc61122760072455df62663d2'"),
        workNotes: z.string().optional().describe("Internal work notes on the incident (not visible to end users). Example: 'Checked logs and found service restart resolved the issue'"),
        assignedTo: z.string().optional().describe("The sys_id of the user assigned to work on the incident. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        closeNotes: z.string().optional().describe("Notes added when closing the incident. Example: 'Issue resolved by restarting the email service'"),
        description: z.string().optional().describe("Detailed description of the incident. Example: 'User unable to access email after password reset'"),
        holdReason: z.string().optional().describe("Reason the incident is on hold. Example: 'Waiting for user feedback'"),
        resolvedAt: z.string().optional().describe("Timestamp when the incident was resolved. Format: ISO 8601 datetime string or YYYY-MM-DD HH:MM:SS. Example: '2024-12-01 14:30:00'"),
        resolvedBy: z.string().optional().describe("The sys_id of the user who resolved the incident. Reference to sys_user table. Example: '681ccaf9c0a8016400b98a4e52c54f82'"),
        subcategory: z.string().optional().describe("Subcategory of the incident. Must correspond to a valid subcategory for the selected category. Example: 'email' under 'software'"),
        uponReject: z.string().optional().describe("Action to take upon rejection. Example: 'cancel'"),
        contactType: z.string().optional().describe("Method by which the incident was reported. Examples: 'phone', 'email', 'self-service', 'walk-in'. Values must match valid contact types defined in your ServiceNow instance."),
        uponApproval: z.string().optional().describe("Action to take upon approval. Example: 'proceed'"),
        correlationId: z.string().optional().describe("Correlation ID for linking related incidents or external references. Example: 'EXT-12345'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'number,short_description,state'). Invalid fields are ignored. If not specified, all fields are returned."),
        parentIncident: z.string().optional().describe("Sys_id of the parent incident (can be used to collect incidents for the same root issue). Reference to incident table. Example: 'a9e9c33dc61122760072455df62663d2'"),
        assignmentGroup: z.string().optional().describe("The sys_id of the group assigned to the incident. Reference to sys_user_group table. Example: '287e8906c61122730024e53cf3104b26'"),
        businessService: z.string().optional().describe("The sys_id of the business service affected by the incident. Reference to service_offering or business service table. Example: 'b1e9c33dc61122760072455df62663d2'"),
        shortDescription: z.string().optional().describe("Brief summary or title of the incident. Example: 'Cannot access email system'"),
        correlationDisplay: z.string().optional().describe("Display text for the correlation ID. Example: 'External Ticket #12345'"),
        sysparmDisplayValue: z.boolean().optional().describe("Determines the type of data returned in the response. false: Returns actual database values (sys_ids for references, numeric values for choices). true: Returns display values (names for references, text labels for choices). all: Returns both display and actual values."),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values (e.g., user names) instead of sys_ids in request fields. When false (default), reference fields must contain sys_ids."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response. Recommended to set to true to reduce response size."),
        sysparmView: z.enum(['desktop', 'mobile', 'both']).optional().describe("UI view options for ServiceNow API"),
    }),
    execute: async ({ servicenowCredentials, state, active, impact, sysId, cmdbCi, urgency, category, comments, dueDate, location, madeSla, priority, callerId, closedAt, closedBy, knowledge, closeCode, escalation, problemId, workNotes, assignedTo, closeNotes, description, holdReason, resolvedAt, resolvedBy, subcategory, uponReject, contactType, uponApproval, correlationId, sysparmFields, parentIncident, assignmentGroup, businessService, shortDescription, correlationDisplay, sysparmDisplayValue, sysparmInputDisplayValue, sysparmExcludeReferenceLink, sysparmView }) => {
        const body = toServerKeys({
            state,
            active,
            impact,
            cmdbCi,
            urgency,
            category,
            comments,
            dueDate,
            location,
            madeSla,
            priority,
            callerId,
            closedAt,
            closedBy,
            knowledge,
            closeCode,
            escalation,
            problemId,
            workNotes,
            assignedTo,
            closeNotes,
            description,
            holdReason,
            resolvedAt,
            resolvedBy,
            subcategory,
            uponReject,
            contactType,
            uponApproval,
            correlationId,
            parentIncident,
            assignmentGroup,
            businessService,
            shortDescription,
            correlationDisplay,
        });
        return snRequest(servicenowCredentials, `/api/now/table/incident/${encodeURIComponent(sysId)}`, {
            method: 'PUT',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_input_display_value: sysparmInputDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
                sysparm_view: sysparmView,
            },
            ...(Object.keys(body).length > 0 ? { body } : {}),
        });
    },
});

export const deleteIncident = tool({
    description: "Permanently deletes a specific incident from ServiceNow using its sys_id. This is a destructive, irreversible operation — the incident cannot be recovered once deleted. Requires the user to have delete permissions for the incident table. If the incident doesn't exist or the user lacks permissions, an error will be returned. Use this action when you need to remove a specific incident record and know its sys_id.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the incident to delete. This is a 32-character hexadecimal string that uniquely identifies the incident record. Example: '46b66a40a9fe198101f243dfbc79033d'. The incident must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/table/incident/${encodeURIComponent(sysId)}`, {
            method: 'DELETE',
        });
    },
});
