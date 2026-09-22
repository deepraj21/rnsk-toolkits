// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const createInteraction = tool({
    description: "Creates a new interaction record in ServiceNow that can be linked to records in other tables (e.g., incidents, problems, cases). Use this action when you need to log or create an interaction between a customer and service desk, such as recording a phone call, chat session, email exchange, or API-initiated interaction that should be tracked and associated with a specific table record. The interaction is created in the 'interaction' table (com.glide.interaction) and linked to the specified table_name record. If no table_name record exists yet, the interaction can still be created standalone.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        state: z.string().optional().describe("Current state of the interaction (e.g., 'open', 'in_progress', 'closed', 'pending')."),
        channel: z.enum(['api', 'phone', 'email', 'chat', 'portal', 'mobile', 'self_service']).optional().describe("The channel through which the interaction was initiated. Defaults to 'api' if not specified."),
        message: z.string().describe("The main message or content of the interaction. This is a required field."),
        priority: z.string().optional().describe("Priority level of the interaction (e.g., '1' for critical, '2' for high, '3' for normal, '4' for low)."),
        callerId: z.string().optional().describe("sys_id of the user who initiated the interaction. If not provided, the interaction will be created with the authenticated user's information."),
        tableName: z.string().describe("The name of the table to link the interaction to (e.g., 'incident', 'problem', 'task', 'sn_customerservice_case'). This determines what record type the interaction is associated with."),
        assignedTo: z.string().optional().describe("sys_id of the user to assign the interaction to."),
        assignmentGroup: z.string().optional().describe("sys_id of the group to assign the interaction to."),
        shortDescription: z.string().describe("A brief summary or title describing the interaction. This is a required field."),
    }),
    execute: async ({ servicenowCredentials, state, channel, message, priority, callerId, tableName, assignedTo, assignmentGroup, shortDescription }) => {
        return snRequest(servicenowCredentials, '/api/now/interaction', {
            method: 'POST',
            body: toServerKeys({ state, channel, message, priority, callerId, contextTable: tableName, assignedTo, assignmentGroup, shortDescription }),
        });
    },
});

export const closeInteraction = tool({
    description: "Closes an existing interaction record in ServiceNow by changing its state to closed. Use this action when you need to close or finalize an interaction that has been completed or resolved. This action changes the state of the interaction record to indicate that it is no longer active. Note: The interaction must be in a state that allows closing (e.g., not already closed). This action is typically used after an interaction has been handled and resolved. The body of the POST request can optionally include fields like 'state', 'opened_for', 'resolution_code', and 'resolution_notes' to provide additional context about the closure.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        state: z.string().optional().describe("The state to set for the interaction when closing. Typically this would be a closed state value (e.g., 'closed', 'resolved'). If not provided, the default closed state from the system will be used."),
        openedFor: z.string().optional().describe("The sys_id of the user or entity for whom the interaction was originally opened. This field is used to track and attribute the interaction. Example: '681ccaf9c0a8016400b98fa0d0232157'"),
        interactionId: z.string().describe("The unique system ID (sys_id) of the interaction record to close. This is a 32-character hexadecimal string that uniquely identifies the interaction record. Example: '87e3c4fa837bf210dd2dc2dfeeaad397'"),
        resolutionCode: z.string().optional().describe("Code indicating how the interaction was resolved. Common values include: 'resolved', 'escalated', 'transferred', 'cancelled'. This helps categorize the closure reason."),
        resolutionNotes: z.string().optional().describe("Notes documenting the resolution of the interaction. This field is used to provide details about how the interaction was handled and closed."),
    }),
    execute: async ({ servicenowCredentials, state, openedFor, interactionId, resolutionCode, resolutionNotes }) => {
        return snRequest(servicenowCredentials, `/api/now/interaction/${encodeURIComponent(interactionId)}`, {
            method: 'POST',
            body: toServerKeys({ state, openedFor, resolutionCode, resolutionNotes }),
        });
    },
});

export const updateOpenframeVoiceInteraction = tool({
    description: "Updates an existing voice interaction record in ServiceNow OpenFrame. Use this action when you need to modify an existing voice interaction record, such as updating its status, changing assignment, adding notes, or resolving the interaction. This action sends a PATCH request to the OpenFrame voice-interaction API, allowing partial updates of the record fields. Note: Only include the fields you want to update in the request. Fields not included will retain their current values.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        notes: z.string().optional().describe("Internal notes or comments about the voice interaction."),
        state: z.string().optional().describe("Current state or status of the voice interaction (e.g., 'open', 'in_progress', 'closed')."),
        priority: z.string().optional().describe("Priority level of the voice interaction (e.g., '1' for critical, '2' for high, '3' for normal, '4' for low)."),
        callerId: z.string().optional().describe("sys_id of the user who initiated the voice interaction."),
        assignedTo: z.string().optional().describe("sys_id of the user assigned to handle the voice interaction."),
        description: z.string().optional().describe("Detailed description of the voice interaction."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'number,short_description,state')."),
        resolutionCode: z.string().optional().describe("Code indicating how the interaction was resolved (e.g., 'resolved', 'escalated', 'transferred')."),
        assignmentGroup: z.string().optional().describe("sys_id of the group assigned to handle the voice interaction."),
        resolutionNotes: z.string().optional().describe("Notes documenting the resolution of the voice interaction."),
        shortDescription: z.string().optional().describe("A brief summary or title describing the voice interaction."),
        interactionSysId: z.string().describe("The unique system ID (sys_id) of the voice interaction record to update. This is a path parameter."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values instead of sys_ids for reference fields."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, notes, state, priority, callerId, assignedTo, description, sysparmFields, resolutionCode, assignmentGroup, resolutionNotes, shortDescription, interactionSysId, sysparmDisplayValue, sysparmInputDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/openframe/voice-interaction/${encodeURIComponent(interactionSysId)}`, {
            method: 'PUT',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_input_display_value: sysparmInputDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
            body: { interaction: toServerKeys({ state, notes, priority, callerId, assignedTo, description, resolutionCode, assignmentGroup, resolutionNotes, shortDescription }) },
        });
    },
});

export const dropConversationMember = tool({
    description: "Drops an agent from a conversation in ServiceNow using the Conversation Member API. Use this action when you need to remove an agent or user from an active conversation. This operation requires the wa_integration_user role. The member will be immediately removed from the conversation and will no longer receive messages or events for it. This action is irreversible — once a member is dropped from a conversation, they cannot be automatically restored through this API and would need to be re-added manually.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        userId: z.string().describe("The unique identifier of the user/agent to drop from the conversation. This is a path parameter that identifies the conversation member to remove. The user must be currently assigned to a conversation for this operation to succeed."),
        conversationId: z.string().optional().describe("The sys_id of the conversation to drop the member from. If not provided, the API will attempt to drop the member from the default conversation. This is recommended if the user is a member of multiple conversations."),
    }),
    execute: async ({ servicenowCredentials, userId, conversationId }) => {
        return snRequest(servicenowCredentials, `/api/now/conversation/member/${encodeURIComponent(userId)}/drop`, {
            method: 'PUT',
            body: { interaction_id: conversationId },
        });
    },
});

export const registerPushInstallation = tool({
    description: "Registers or updates a device token for receiving push notifications through ServiceNow. Use this action when you need to register a mobile device token with ServiceNow's push notification system, enabling the device to receive push notifications from ServiceNow mobile apps. The action creates a new push installation or updates an existing one if the same token already exists for the specified push application. Common use cases: - Registering iOS devices for APNS push notifications - Registering Android devices for FCM push notifications - Updating existing device tokens when they change (token refresh) - Linking devices to specific ServiceNow users This action modifies the ServiceNow push notification registry — registered devices will be eligible to receive push notifications from ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        token: z.string().describe("The device token obtained from Apple Push Notification Service (APNS) for iOS devices or Firebase Cloud Messaging (FCM) for Android devices. This token identifies the device to receive push notifications."),
        userId: z.string().optional().describe("The sys_id of the ServiceNow user associated with this device token. This links the device to a specific user for user-specific push notifications."),
        platform: z.enum(['Apple', 'Android']).describe("The mobile platform for the device token. Use 'Apple' for iOS devices (APNS) or 'Android' for Android devices (FCM)."),
        deviceType: z.string().optional().describe("The type of the mobile device (e.g., 'phone', 'tablet'). This field is optional and helps categorize devices for targeted notifications."),
        subscriptionId: z.string().optional().describe("A unique identifier for the subscription. If not provided, a new subscription will be created or an existing one with the same token will be updated."),
        pushApplicationName: z.string().describe("The name of the push application in ServiceNow (e.g., 'SkyNowPushApp'). This corresponds to the push application record configured in ServiceNow for handling push notifications to mobile devices."),
    }),
    execute: async ({ servicenowCredentials, token, userId, platform, deviceType, subscriptionId, pushApplicationName }) => {
        return snRequest(servicenowCredentials, `/api/now/push/${encodeURIComponent(pushApplicationName)}/installation`, {
            method: 'POST',
            body: toServerKeys({ platform, token, userId, deviceType, subscriptionId }),
        });
    },
});

export const removePushInstallation = tool({
    description: "Deactivates a mobile device installation from receiving push notifications using the ServiceNow Push Installation API. Use this action when you need to remove a mobile device's ability to receive push notifications from a ServiceNow push application. This effectively deactivates the device token that enables communication between ServiceNow and the mobile app on the specified device. This is commonly used when: - A user uninstalls the mobile app from their device - A device needs to be unregistered from push notifications - Managing device registrations for push notification campaigns Note: This action only deactivates the device token - it does not delete any data from ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        token: z.string().describe("The unique device token that identifies the mobile device installation to remove. This token is assigned to a device when it registers with ServiceNow for push notifications. Deactivating this token will prevent the device from receiving push notifications from this application. Example: 'fcm_token_abc123' or 'apns_token_xyz789'"),
        platform: z.enum(['Apple', 'Android']).describe("The mobile platform for the device token. Use 'Apple' for iOS devices (APNS) or 'Android' for Android devices (FCM)."),
        pushApplicationName: z.string().describe("The name of the push application whose device installation should be removed/deactivated. This is a path parameter in the URL, not a body parameter. The push application name identifies the mobile app configuration in ServiceNow. Example: 'ServiceNowPushApp' or 'snc_mobile_app'."),
    }),
    execute: async ({ servicenowCredentials, token, platform, pushApplicationName }) => {
        return snRequest(servicenowCredentials, `/api/now/push/${encodeURIComponent(pushApplicationName)}/removeInstallation`, {
            method: 'POST',
            body: toServerKeys({ platform, token }),
        });
    },
});

export const getActivitySubActivities = tool({
    description: "Retrieves activity records from the ServiceNow ActivitySubscription API. Use this action when you need to fetch activity/change history records from ServiceNow subscriptions. This API returns activities such as record creations, updates, comments, and other events from subscribed tables. The default stream returns all available activity records. Results can be paginated using the sysparm_limit and sysparm_offset parameters.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        stream: z.string().optional().describe("The type of activity stream to retrieve. Default value is 'activities' which returns all activity records. Other values may include specific activity types supported by the subscription API."),
        sysparmLimit: z.number().optional().describe("Maximum number of activity records to return. Use pagination parameters to retrieve additional records if the limit is exceeded."),
        sysparmOffset: z.number().optional().describe("Starting record index for which to begin retrieving activities. Use this value to paginate through activity records by incrementing by the limit value."),
    }),
    execute: async ({ servicenowCredentials, stream, sysparmLimit, sysparmOffset }) => {
        return snRequest(servicenowCredentials, '/api/now/actsub/activities', {
            method: 'GET',
            query: { stream, sysparm_limit: sysparmLimit, sysparm_offset: sysparmOffset },
        });
    },
});

export const getActivitySubFacets = tool({
    description: "Retrieves facets configured for an activity context in ServiceNow. Use this action when you need to discover available filterable attributes or metadata for activity subscriptions. Facets represent the different dimensions along which activity data can be filtered or grouped. This is a read-only operation that queries the Activity Subscriptions API to return facet configuration information for the specified context.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        activityContext: z.string().describe("The type of activity context for which to retrieve facets. Common values include 'table' for table-level subscriptions, 'record' for specific record subscriptions, or other activity context types defined in the ServiceNow instance."),
        contextInstance: z.string().describe("The specific instance identifier for the activity context. For 'table' context, this would be the table name (e.g., 'incident', 'task'). For 'record' context, this would be the sys_id of the specific record."),
    }),
    execute: async ({ servicenowCredentials, activityContext, contextInstance }) => {
        return snRequest(servicenowCredentials, `/api/now/actsub/facets/${encodeURIComponent(activityContext)}/${encodeURIComponent(contextInstance)}`, {
            method: 'GET',
        });
    },
});

export const predictSolution = tool({
    description: "Predicts an output field value using a trained Agent Intelligence solution model. Use this action when you need to invoke a deployed Predictive Intelligence solution to predict an output field value based on input field data. This is typically used after the Predictive Intelligence plugin is activated and solutions have been trained and deployed — for example, to predict incident assignment, priority, urgency, category, or any other custom trained output field. The action requires the name of an existing, deployed solution and optionally accepts input field values that the model uses to generate the prediction. The response includes the predicted value along with a confidence score indicating the model's certainty.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        inputFields: z.record(z.any()).optional().describe("A dictionary of input field names and their values to pass to the prediction model. The required fields depend on the solution's trained model — typically these are the input features the model was trained on (e.g., for an incident predictor: {'urgency': 'high', 'impact': 'medium', 'category': 'software'}). Leave empty or omit if the solution does not require input field values. Values can be strings, integers, floats, or booleans."),
        solutionName: z.string().describe("The name of the Agent Intelligence solution to use for prediction. This is a required path parameter identifying the trained predictive model. Example: 'incident_assignment_predictor' or 'task_priority_model'."),
    }),
    execute: async ({ servicenowCredentials, inputFields, solutionName }) => {
        return snRequest(servicenowCredentials, `/api/now/agent_intelligence/solution/${encodeURIComponent(solutionName)}/prediction`, {
            method: 'GET',
            query: { ...(inputFields ?? {}) },
        });
    },
});

export const listSolutionPredictions = tool({
    description: "Retrieves a list of solution predictions from ServiceNow's Agent Intelligence engine. Use this action when you need to fetch predicted solutions for multiple records, such as retrieving AI-recommended solutions for incidents, problems, or change requests. The predictions include confidence scores, solution details, and relevance metrics to help resolve issues more efficiently. Supports filtering, pagination, and confidence thresholds. This action is useful for implementing AI-powered resolution suggestions, analyzing prediction patterns, or integrating Agent Intelligence insights into custom workflows.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of solution predictions to return. Use pagination parameters to retrieve additional results if needed. Note: Large values may impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter solution predictions. Syntax: <col_name><operator><value>. Supports operators: = (exact match), != (not equal), ^ (AND), ^OR (OR), LIKE (contains string), STARTSWITH, ENDSWITH. Example: category=password^confidence_score>=0.8"),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Use sysparm_offset + sysparm_limit to page through results. For example, first call with offset=0, next call with offset=sysparm_limit."),
        predictionType: z.string().optional().describe("Type of predictions to retrieve. Common values: 'incident', 'problem', 'change', 'task'. If not specified, returns all prediction types."),
        includeMetadata: z.boolean().optional().describe("Flag to include additional metadata in the response. Set to true to include extended prediction metadata."),
        confidenceThreshold: z.number().optional().describe("Minimum confidence score threshold for returned predictions. Only predictions with confidence_score >= this value will be returned. Example: 0.8 returns only high-confidence predictions."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmOffset, predictionType, includeMetadata, confidenceThreshold }) => {
        return snRequest(servicenowCredentials, '/api/now/agent_intelligence/solution/prediction', {
            method: 'GET',
            query: {
                prediction_type: predictionType,
                confidence_threshold: confidenceThreshold,
                include_metadata: includeMetadata,
                sysparm_query: sysparmQuery,
                sysparm_limit: sysparmLimit,
                sysparm_offset: sysparmOffset,
            },
        });
    },
});

export const getEmail = tool({
    description: "Retrieves a specific email record from ServiceNow's Email [sys_email] table by its sys_id. Use this action when you need to fetch detailed information about a particular email message, including its subject, body content, sender, recipients, status, and timestamps. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the email record to retrieve. This is a 32-character hexadecimal string that uniquely identifies the email in the sys_email table. Example: '1228ed5283333210dd2dc2dfeeaad376'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are ignored."),
        sysparmDisplayValue: z.string().optional().describe("Determines the type of data returned, either 'true' for display values or 'false' for actual values. Display values are manipulated based on user or system settings. Choice fields: Returns descriptive text instead of numeric values. Date fields: Returns formatted date based on user's time zone instead of UTC. Reference fields: Returns display field of referenced record instead of sys_id."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields. Set to true to exclude links."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmFields, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/table/sys_email/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
        });
    },
});

export const getUserRoleInheritance = tool({
    description: "Retrieves the granted and inherited roles for a specified ServiceNow user using the Global User Role Inheritance API. Use this action when you need to audit a user's role assignments in ServiceNow, check what roles a user has (both directly granted and inherited through group membership), troubleshoot access issues, or verify compliance by reviewing role inheritance for a specific user account. The authenticated user must have the appropriate role (such as 'admin' or a role with user_role_inheritance API access) to query other users' role inheritance. If no user is specified, returns the role inheritance for the authenticated user.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().optional().describe("The sys_id of the user whose role inheritance to retrieve. If not provided, returns the role inheritance for the authenticated user making the request. You must have the appropriate role (such as 'admin' or a role with user_role_inheritance API access) to query role inheritance for users other than yourself."),
        userId: z.string().optional().describe("The user ID (user_name) of the user whose role inheritance to retrieve. This is the login name or user ID of the ServiceNow user. Either sys_id or user_id can be used to specify the user, but not both. If neither is provided, returns the role inheritance for the authenticated user."),
        expandGroups: z.boolean().optional().describe("When set to true, returns additional details about the groups through which roles are inherited. When false (default), only role names and basic information are returned."),
    }),
    execute: async ({ servicenowCredentials, sysId, userId, expandGroups }) => {
        return snRequest(servicenowCredentials, '/api/global/user_role_inheritance', {
            method: 'GET',
            query: { user_sysid: sysId ?? userId, expand_groups: expandGroups },
        });
    },
});

export const getPaScorecards = tool({
    description: "Retrieves details about indicators from the Analytics Hub, including scorecard information for performance analytics. Use this action when you need to fetch performance analytics scorecards and their associated indicators, such as when drilling down into specific indicators or retrieving overall analytics hub data. When sysparm_uuid is provided, returns details for a specific indicator; otherwise returns all available scorecards. Supports optional inclusion of score values via sysparm_include_scores.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmUuid: z.string().optional().describe("UUID of the indicator to retrieve. When provided, returns details for a specific indicator."),
        sysparmIncludeScores: z.boolean().optional().describe("Flag that indicates whether to include score values in the response."),
    }),
    execute: async ({ servicenowCredentials, sysparmUuid, sysparmIncludeScores }) => {
        return snRequest(servicenowCredentials, '/api/now/pa/scorecards', {
            method: 'GET',
            query: { sysparm_uuid: sysparmUuid, sysparm_include_scores: sysparmIncludeScores },
        });
    },
});

export const createServiceCategory = tool({
    description: "Creates a new service category record in the ServiceNow TMF Service Catalog API. This action calls the POST /api/sn_tmf_api/catalogmanagement/serviceCategory endpoint to create a top-level or nested service category within the ServiceNow Service Catalog. Use this action when you need to organize items in the service catalog into categories, enabling better navigation and grouping of related catalog offerings. Use this action when you need to add a new category to the ServiceNow Service Catalog for organizing catalog items such as requested items, record producers, or other offerings. For root categories, set is_root=true. For subcategories, provide the parent_id of the existing parent category. If the category name already exists within the same parent scope, the API may return a conflict error.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        name: z.string().describe("Name of the service category. This is a required field and should be a descriptive label for the category (e.g., 'Hardware Services', 'Software Requests'). Category names should be unique within the same parent scope."),
        isRoot: z.boolean().optional().describe("Indicates whether this category is a root-level (top-level) category. Set to true to create a top-level category with no parent. Set to false (or omit) to create a subcategory under an existing parent. When true, parent_id should not be provided."),
        parentId: z.string().optional().describe("The unique identifier of the parent service category. Required when creating a subcategory (is_root=false or omitted). Should be omitted or left empty when is_root=true. The parent category must exist, or the API will return an error."),
        description: z.string().optional().describe("Detailed description of the service category explaining its purpose, scope, and what types of items it contains. Use this to provide additional context for users browsing the service catalog."),
    }),
    execute: async ({ servicenowCredentials, name, isRoot, parentId, description }) => {
        return snRequest(servicenowCredentials, '/api/sn_tmf_api/catalogmanagement/serviceCategory', {
            method: 'POST',
            body: toServerKeys({ name, isRoot, parentId, description }),
        });
    },
});

export const getUser = tool({
    description: "Retrieves a specific user record from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular user, such as their contact details, department, location, manager, or account status. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the user record to retrieve. This is a 32-character hexadecimal string that uniquely identifies the user in ServiceNow. Example: '02826bf03710200044e0bfc8bcbe5d3f'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid fields are ignored."),
        sysparmDisplayValue: z.boolean().optional().describe("Determines the type of data returned, either the actual values from the database or the display values of the fields. Display values are manipulated based on the actual value in the database and user or system settings and preferences. If returning display values, the value that is returned is dependent on the field type. Choice fields: The database value may be a number, but the display value will be more descriptive. Date fields: The database value is in UTC format, while the display value is based on the user's time zone. Encrypted text: The database value is encrypted, while the displayed value is unencrypted based on the user's encryption context. Reference fields: The database value is sys_id, but the display value is a display field of the referenced record."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmFields, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/table/sys_user/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
        });
    },
});

export const listUsers = tool({
    description: "Retrieves multiple user records from the ServiceNow sys_user table with optional filtering and pagination. Use this action when you need to query and fetch a list of users from ServiceNow, such as finding active users, users by department, or users matching specific criteria. Supports filtering via sysparm_query, field selection, pagination via sysparm_limit and sysparm_offset, and display value options. This is a read-only operation that does not modify any data.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of user records to return. Use pagination (sysparm_offset) for result sets larger than this limit."),
        sysparmQuery: z.string().optional().describe("Encoded query used to filter the result set. Syntax: sysparm_query=<col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: active=true^emailLIKEsomething.com"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,user_name,first_name,last_name,email,active'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Use with sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references). 'true': Returns display values (names for references). 'all': Returns both display and actual values."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue }) => {
        return snRequest(servicenowCredentials, '/api/now/table/sys_user', {
            method: 'GET',
            query: {
                sysparm_query: sysparmQuery,
                sysparm_fields: sysparmFields,
                sysparm_limit: sysparmLimit,
                sysparm_offset: sysparmOffset,
                sysparm_display_value: sysparmDisplayValue,
            },
        });
    },
});
