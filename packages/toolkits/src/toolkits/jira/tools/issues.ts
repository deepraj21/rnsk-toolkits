// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jira, mdToAdf, resolveAssignee, getTransitionId } from './client.js';
import { createOneIssue, buildEditBody } from './issue-fields.js';
import { uploadAttachment } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const jiraAddAttachment = tool({
    description: "This action allows users to upload a file and attach it to a specific Jira issue. It supports various file formats and ensures that the attachment is associated with the correct issue key.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issueKey: z.string().describe("Issue key or ID to attach the file to, e.g. 'PROJ-123'."),
        fileName: z.string().describe('Filename for the attachment, e.g. "screenshot.png".'),
        fileContent: z.string().describe('Base64-encoded file content to upload.'),
        mimeType: z.string().optional().describe('MIME type of the file, e.g. "image/png".'),
    }),
    execute: async ({ jiraToken, jiraCloudId, issueKey }) => {
        return uploadAttachment(jiraToken, jiraCloudId, issueKey, { fileName, fileContent, mimeType });
    },
});

export const jiraAddComment = tool({
    description: "This action adds a rich comment to a specific Jira issue, allowing Markdown formatting.      Users can specify visibility restrictions for the comment if needed.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        comment: z.string().describe("The comment text. Supports Markdown formatting including **bold**, *italic*, 'code', links [text](url), lists, and @mentions. To mention users, use @username for single-word names or @\"Display Name\" for names with spaces. Plain URLs are not hyperlinked; use '[text](url)' format for clickable links."),
        issueIdOrKey: z.string().describe("The ID or key of the issue to add the comment to."),
        visibilityType: z.string().optional().describe("Specifies the type of visibility restriction for the comment. Valid values are 'group' or 'role'. If this field is used, 'visibility_value' must also be provided. IMPORTANT: 'group' visibility requires group-level visibility to be enabled in the Jira instance settings by an administrator. For 'role' visibility, use JIRA_GET_PROJECT_ROLES action to discover valid role names for the project."),
        visibilityValue: z.string().optional().describe("Name of the group or role that can view the comment (required if visibility_type is set). IMPORTANT: These values are instance-specific and vary by Jira configuration. For role visibility: Use JIRA_GET_PROJECT_ROLES with your project key to discover valid role names (e.g., 'Administrator', 'Member', 'Viewer'). For group visibility: Use JIRA_GET_ALL_GROUPS to list available groups. Common roles include 'Administrator', 'Member', 'Viewer' but actual names depend on your project configuration."),
        additionalProperties: z.record(z.any()).optional().describe("Additional properties to include in the comment request body. This can be used to pass extra fields supported by the Jira API that are not explicitly defined, such as 'properties' for EntityProperty objects. Format: {'properties': [{'key': 'myKey', 'value': {'myValue': 123}}]}."),
    }),
    execute: async ({ jiraToken, jiraCloudId, comment, issueIdOrKey, visibilityType, visibilityValue, additionalProperties }) => {
        const body = { body: mdToAdf(comment) };
        if (visibilityType && visibilityValue) body.visibility = { type: visibilityType, value: visibilityValue };
        if (additionalProperties && typeof additionalProperties === "object") Object.assign(body, additionalProperties);
        return jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}/comment`, method: 'POST', body });
    },
});

export const jiraAddWatcherToIssue = tool({
    description: "This action adds a specified user as a watcher to a Jira issue.     A watcher receives notifications about updates to the issue.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        accountId: z.string().describe("The Atlassian Account ID (accountId) of the user to be added as a watcher. Important: Usernames cannot be used due to Jira API privacy changes; the accountId is required. Resolve the accountId first using JIRA_GET_CURRENT_USER (for the calling user) or JIRA_FIND_USERS (for other users) before calling this tool."),
        issueIdOrKey: z.string().describe("The ID (a numerical identifier, e.g., '10000') or key (a project-prefixed string, e.g., 'PROJ-123') of the Jira issue to which the watcher will be added."),
    }),
    execute: async ({ jiraToken, jiraCloudId, accountId, issueIdOrKey }) => {
        return jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}/watchers`, method: 'POST', body: JSON.stringify(accountId) });
    },
});

export const jiraAddWorklog = tool({
    description: "Add a worklog entry to a Jira issue to track time spent. You can specify the time worked, when it started, an optional comment, and visibility restrictions.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information about the worklog in the response. Accepts 'properties'."),
        comment: z.record(z.any()).optional().describe("Atlassian Document Format comment structure."),
        started: z.string().optional().describe("The datetime when the work was started in ISO 8601 format (e.g., '2024-01-15T09:00:00.000+0000'). If not provided, the current time is used."),
        reduceBy: z.string().optional().describe("Amount to reduce the remaining estimate if adjust_estimate is 'manual' (e.g., '1h 30m', '2d')."),
        timeSpent: z.string().optional().describe("The time spent as a Jira duration string (e.g., '2h 30m', '1d', '45m'). Either this or time_spent_seconds must be provided."),
        visibility: z.record(z.any()).optional().describe("Details about the visibility restriction of a worklog."),
        newEstimate: z.string().optional().describe("The new remaining estimate if adjust_estimate is 'new' (e.g., '2h', '3d 4h')."),
        notifyUsers: z.boolean().optional().describe("Whether to notify users watching the issue about this worklog."),
        adjustEstimate: z.enum(["new", "leave", "manual", "auto"]).optional().describe("Options for adjusting the issue's remaining estimate when adding a worklog."),
        issueIdOrKey: z.string().describe("The ID or key of the Jira issue to add the worklog to."),
        timeSpentSeconds: z.number().int().optional().describe("The time in seconds spent working on the issue. Either this or time_spent must be provided."),
        overrideEditableFlag: z.boolean().optional().describe("Whether to add the worklog even if the issue is not editable (e.g., closed). Requires admin permissions."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, comment, started, reduceBy, timeSpent, visibility, newEstimate, notifyUsers, adjustEstimate, issueIdOrKey, timeSpentSeconds, overrideEditableFlag }) => {
        const queryParams = { adjustEstimate: adjustEstimate, expand: expand, notifyUsers: notifyUsers, newEstimate: newEstimate, reduceBy: reduceBy, increaseBy: increaseBy, overrideEditableFlag: overrideEditableFlag };
        const body = { timeSpent: timeSpent, timeSpentSeconds: timeSpentSeconds, started: started, comment: comment, visibility: visibility };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/worklog`, method: 'POST', query: queryParams, body });
    },
});

export const jiraAssignIssue = tool({
    description: "This action assigns a specified Jira issue to the designated user      or the project's default assignee. It also allows for unassigning the issue by not providing      an account ID and supports lookup by username or email.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        accountId: z.string().optional().describe("The Atlassian Account ID of the user to assign the issue to. Use ''-1'' (as a string) to assign to the project's default assignee. Provide 'None' (Python null, which translates to JSON null) or omit this field to unassign the issue. Takes precedence over assignee_name if provided. JIRA_FIND_USERS may return multiple matches or omit emails due to privacy restrictions; verify the correct account_id before assigning."),
        assigneeName: z.string().optional().describe("Name of the user to assign the issue to. Can be either an email address (e.g., 'john@company.com') or display name (e.g., 'John Doe'). The system will auto-detect the type and search accordingly. Ignored if account_id is also provided. On Jira Cloud, privacy settings may cause lookup failures; prefer resolving 'account_id' via JIRA_FIND_USERS first and passing it directly."),
        issueIdOrKey: z.string().describe("The ID or key of the issue to be assigned."),
    }),
    execute: async ({ jiraToken, jiraCloudId, accountId, assigneeName, issueIdOrKey }) => {
        const acc = await resolveAssignee(jiraToken, jiraCloudId, accountId, assigneeName);
        return jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}/assignee`, method: 'PUT', body: { accountId: acc ?? null } });
    },
});

export const jiraBulkCreateIssue = tool({
    description: "This action creates multiple Jira issues in a single API call. It allows for bulk creation of issues with various attributes, such as assignee and priority, streamlining the issue management process.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issues: z.array(z.object({ projectKey: z.string(), summary: z.string() }).catchall(z.any())).min(1).max(50).describe('Issues to create (1-50). Each needs projectKey and summary; other create-issue fields allowed.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const created = [];
        const errors = [];
        for (let idx = 0; idx < issues.length; idx++) {
            try {
                const res = await createOneIssue(jiraToken, jiraCloudId, issues[idx]);
                if (res?.error) errors.push({ issueIndex: idx, errorMessages: [JSON.stringify(res.error)] });
                else created.push({ id: res.id, key: res.key, self: res.self });
            } catch (e) { errors.push({ issueIndex: idx, errorMessages: [e instanceof Error ? e.message : "Unknown error"] }); }
        }
        return { issues: created, errors, totalRequested: issues.length, totalCreated: created.length, totalFailed: errors.length };
    },
});

export const jiraCreateIssue = tool({
    description: "Creates a new issue in a specified Jira project. This includes setting parameters such as the issue type, summary, and assignee details. Note: Some projects may have custom required fields - use JIRA_GET_CREATE_METADATA_ISSUE_TYPE_FIELDS (requires projectIdOrKey and issueTypeId) to discover them if needed.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        labels: z.array(z.string()).optional().describe("List of labels to categorize the issue; new labels are created if they don't exist."),
        parent: z.string().optional().describe("Parent issue key (e.g., 'PROJ-123') or issue ID. IMPORTANT: This field should ONLY be used when creating sub-task issue types (e.g., 'Sub-task', 'Subtask'). It is required for sub-tasks. Jira enforces strict hierarchy rules: standard issue types (Task, Story, Bug) can ONLY have Sub-tasks as children, not other standard issues. Epics can have Stories/Tasks/Bugs as children. Attempting to set a parent on a non-sub-task issue type or using an incompatible parent-child combination will result in a hierarchy error. The parent must be an existing issue in the same project. NOTE: Alternative field names 'parent_key' and 'parent_id' are also accepted and will be automatically mapped to this field."),
        summary: z.string().describe("REQUIRED. Brief, descriptive title for the issue. This is the main headline that will appear in Jira (e.g., 'Fix login button not working', 'Add user profile page')."),
        assignee: z.string().optional().describe("Account ID of the user to assign the issue to. Must be a valid Jira account ID in one of these formats: (1) Cloud format with tenant ID and UUID: '712020:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', or (2) Legacy 24-character hex string: '5b10a2844c20165700ede21g'. IMPORTANT: Do NOT pass email addresses here - use assignee_name field for emails. The account ID is validated to ensure the user exists and can be assigned to issues in the target project. Use JIRA_FIND_USERS to get valid account IDs. Takes precedence over assignee_name if both are provided. NOTE: Some Jira projects (especially Jira Service Management/Service Desk projects) may not allow setting the assignee at issue creation time because the field isn't on the project's create screen. If this occurs, the issue will be created successfully without the assignee, and you'll need to set the assignee separately using JIRA_ASSIGN_ISSUE after creation."),
        dueDate: z.string().optional().describe("Expected resolution date in YYYY-MM-DD format."),
        priority: z.string().optional().describe("Priority level for the issue. Can be either a priority name or a valid priority ID from the Jira instance. IMPORTANT: Priority names are completely instance-specific and vary by Jira configuration (e.g., some instances use 'Highest'/'High'/'Medium'/'Low'/'Lowest', while others use 'P0'/'P1'/'P2'/'P3'/'P4', or custom names). It is strongly recommended to either: (1) check available priorities for your instance first using JIRA_GET_ISSUE_EDIT_META or by inspecting existing issues, or (2) omit this field if unsure. When the global priority endpoint is available, the value is validated against available priorities. If validation is unavailable (404), the value is passed through to Jira for validation."),
        reporter: z.string().optional().describe("Account ID of the user reporting the issue. Defaults to the API request user if unspecified."),
        versions: z.array(z.string()).optional().describe("List of IDs for versions affected by this issue; versions must exist in the project."),
        sprintId: z.number().int().optional().describe("ID of the sprint to assign this issue to. The issue will be added to the specified sprint if provided."),
        components: z.array(z.string()).optional().describe("List of component IDs (e.g., '10000'); components must already exist in the project."),
        issueType: z.string().describe("REQUIRED. Type of the issue - must be valid for the target project as available types vary by project configuration. CRITICAL: Always use JIRA_GET_ISSUE_TYPES to check valid types for your project BEFORE creating issues. Can be either a type name (e.g., 'Task', 'Story', 'Epic') or type ID (e.g., '10001'). Common types include Task, Story, Epic, and Bug, but NOT ALL projects support all types. Issue type names are localized based on your Jira instance's language settings (e.g., 'Task' in English, 'Задача' in Russian, 'Tâche' in French). Using the issue type ID is language-independent and more reliable."),
        description: z.record(z.any()).optional().describe("Detailed description of the issue. Accepts either: (1) A plain text or Markdown string (converted to ADF internally), or (2) A pre-formatted Atlassian Document Format (ADF) dict with keys 'type'='doc', 'version'=1, and 'content' array. When passing ADF directly, formatting is preserved as-is."),
        environment: z.record(z.any()).optional().describe("Environment details. Accepts either: (1) A plain text or Markdown string (converted to ADF internally), or (2) A pre-formatted Atlassian Document Format (ADF) dict with keys 'type'='doc', 'version'=1, and 'content' array. When passing ADF directly, formatting is preserved as-is."),
        projectKey: z.string().describe("REQUIRED. Key of the Jira project where the issue will be created (e.g., 'KAN', 'DEV', 'PROJ'). This is the short uppercase code that appears in issue keys like 'PROJ-123'. Must be an existing project key in your Jira instance. Use JIRA_GET_ALL_PROJECTS to list available projects if you don't know the key."),
        fixVersions: z.array(z.string()).optional().describe("List of IDs for versions where the issue is/will be fixed; versions must exist in the project."),
        assigneeName: z.string().optional().describe("Name or email of the user to assign the issue to. Can be either an email address (e.g., 'john@company.com') or display name (e.g., 'John Doe'). The system will auto-detect the type and search accordingly. Ignored if assignee (account ID) is also provided. NOTE: Slack user IDs (e.g., 'U02QWF25EQ6') are not supported - use the Jira user's email, display name, or account ID instead. NOTE: Some Jira projects (especially Jira Service Management/Service Desk projects) may not allow setting the assignee at issue creation time because the field isn't on the project's create screen. If this occurs, the issue will be created successfully without the assignee, and you'll need to set the assignee separately using JIRA_ASSIGN_ISSUE after creation."),
        additionalProperties: z.string().optional().describe("JSON string of additional fields to set on the issue. Use this for custom fields or any fields not covered by the standard parameters (e.g., Story Points, custom text fields, etc.). Format: '{\"customfield_10104\": 5, \"customfield_10200\": \"value\"}'. Rich text custom fields (textarea type) accept plain text or Markdown - they are automatically converted to Atlassian Document Format (ADF). You can also pass ADF directly as a JSON object. Use JIRA_GET_CREATE_METADATA_ISSUE_TYPE_FIELDS (requires projectIdOrKey and issueTypeId parameters) to discover available custom fields and their IDs - this is the recommended tool for creation-specific metadata. NOTE: The 'resolution' field cannot be set at issue creation - it can only be set during workflow transitions (e.g., when moving an issue to Done/Closed status). If 'resolution' is included, it will be automatically filtered out. IMPORTANT: Keys must use numeric IDs (e.g., 'customfield_10104'), NOT display names — using display names causes 400 Unknown field errors."),
    }),
    execute: async ({ jiraToken, jiraCloudId, labels, parent, summary, assignee, dueDate, priority, reporter, versions, sprintId, components, issueType, description, environment, projectKey, fixVersions, assigneeName, additionalProperties }) => {
        return createOneIssue(jiraToken, jiraCloudId, { projectKey, summary, issueType, description, environment, assignee, assigneeName, priority, reporter, labels, components, versions, fixVersions, dueDate, parent, parentKey, parentId, sprintId, additionalProperties });
    },
});

export const jiraCreateIssueLink = tool({
    description: "This action links two Jira issues based on the specified relationship type.      It allows users to track dependencies and relationships between issues within their projects.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        comment: z.string().optional().describe("An optional textual comment to add to the created issue link, providing additional context."),
        linkType: z.string().optional().describe("The name of the issue link type to create (e.g., 'Blocks', 'Relates', 'Duplicate', 'Cloners'). Provide either link_type or link_type_id. Use the JIRA_GET_ISSUE_LINK_TYPES action to retrieve valid link type names for your Jira instance."),
        linkTypeId: z.string().optional().describe("The ID of the issue link type to create (preferred over link_type when known, as it is unambiguous). Provide either link_type or link_type_id. Use JIRA_GET_ISSUE_LINK_TYPES to retrieve valid link type IDs."),
        inwardIssueKey: z.string().describe("The key of the issue that initiates the link relationship (the 'source' issue). For example, if creating a 'Blocks' link from Issue A to Issue B, Issue A is the inward issue."),
        outwardIssueKey: z.string().describe("The key of the issue that is the target of the link relationship (the 'destination' issue). For example, if creating a 'Blocks' link from Issue A to Issue B, Issue B is the outward issue."),
    }),
    execute: async ({ jiraToken, jiraCloudId, comment, linkType, linkTypeId, inwardIssueKey, outwardIssueKey }) => {
        const type = linkTypeId ? { id: linkTypeId } : linkType ? { name: linkType } : null;
        if (!type) return { error: "Provide linkType or linkTypeId." };
        const body = { type, inwardIssue: { key: inwardIssueKey }, outwardIssue: { key: outwardIssueKey } };
        if (comment) body.comment = { body: comment };
        const res = await jira(jiraToken, { cloudId: jiraCloudId, path: '/issueLink', method: 'POST', body });
        if (res?.error) return res;
        return { success: true, inwardIssueKey, outwardIssueKey, linkType, linkTypeId };
    },
});

export const jiraDeleteAttachment = tool({
    description: "This action permanently deletes a specified attachment from Jira.     It requires the attachment ID to perform the delete operation.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        attachmentId: z.string().describe("The unique identifier of the attachment to delete."),
    }),
    execute: async ({ jiraToken, jiraCloudId, attachmentId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/attachment/${encodeURIComponent(attachmentId)}`, method: 'DELETE', query: queryParams });
    },
});

export const jiraDeleteComment = tool({
    description: "This action deletes a specified comment from a Jira issue.      It requires the issue ID or key along with the comment ID to perform the delete operation.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        id: z.string().describe("The unique identifier of the comment to be deleted (e.g., '10001')."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJ-123') of the Jira issue from which the comment will be deleted."),
    }),
    execute: async ({ jiraToken, jiraCloudId, id, issueIdOrKey }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/comment/${encodeURIComponent(id)}`, method: 'DELETE', query: queryParams });
    },
});

export const jiraDeleteIssue = tool({
    description: "This action deletes a specified Jira issue. It can also delete any associated subtasks if requested.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        deleteSubtasks: z.boolean().optional().describe("If true, the issue's subtasks are also deleted. If false and the issue has subtasks, the deletion will fail."),
        issueIdOrKey: z.string().describe("The ID or key of the issue to delete."),
    }),
    execute: async ({ jiraToken, jiraCloudId, deleteSubtasks, issueIdOrKey }) => {
        const queryParams = { deleteSubtasks: deleteSubtasks };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}`, method: 'DELETE', query: queryParams });
    },
});

export const jiraDeleteWorklog = tool({
    description: "This action deletes a specific worklog entry from a Jira issue. It provides options to notify users and adjust the issue's remaining estimate as needed.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        worklogId: z.string().describe("The ID of the specific worklog entry to be deleted from the issue."),
        increaseBy: z.string().optional().describe("Amount to increase the remaining estimate if 'adjust_estimate' is 'manual' (e.g., '1h 30m', '5d')."),
        newEstimate: z.string().optional().describe("Value for the new remaining estimate if 'adjust_estimate' is 'new' (e.g., '2h', '3d 4h')."),
        notifyUsers: z.boolean().optional().describe("If users watching the issue should be notified by email about the worklog deletion."),
        adjustEstimate: z.enum(["new", "leave", "manual", "auto"]).optional().describe("Options for adjusting the issue's remaining estimate after deleting a worklog."),
        issueIdOrKey: z.string().describe("The ID or key of the Jira issue from which the worklog will be deleted."),
        overrideEditableFlag: z.boolean().optional().describe("If true, allows deletion of the worklog even if the issue is in a closed status, potentially bypassing workflow restrictions."),
    }),
    execute: async ({ jiraToken, jiraCloudId, worklogId, increaseBy, newEstimate, notifyUsers, adjustEstimate, issueIdOrKey, overrideEditableFlag }) => {
        const queryParams = { notifyUsers: notifyUsers, adjustEstimate: adjustEstimate, newEstimate: newEstimate, increaseBy: increaseBy, overrideEditableFlag: overrideEditableFlag };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/worklog/${encodeURIComponent(worklogId)}`, method: 'DELETE', query: queryParams });
    },
});

export const jiraEditIssue = tool({
    description: "Updates a specified Jira issue by changing its fields or adding new information.      This action allows users to modify attributes such as the summary, description, and assignee of the issue.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        fields: z.string().optional().describe("JSON string of fields for direct updates (e.g., summary, description). When including assignee in this object, you may provide either: (a) an accountId object '{\"assignee\": {\"accountId\": \"<id>\"}}', (b) a string email/display name '{\"assignee\": \"user@example.com\"}' or '{\"assignee\": \"Full Name\"}', or (c) null to unassign. String values are resolved to accountId automatically. See Jira's 'edit issue metadata' for available fields. Use 'update' for more complex operations like list modifications. IMPORTANT: The 'status' field cannot be updated via this action - use JIRA_TRANSITION_ISSUE action instead to change issue status. Rich text fields (description, environment, and custom textarea fields) support plain text or Markdown - they are automatically converted to Atlassian Document Format (ADF). You can also pass ADF directly as a JSON object."),
        labels: z.array(z.string()).optional().describe("List of labels to set for the issue (replaces existing labels). New labels are created if they don't exist."),
        update: z.string().optional().describe("JSON string for granular field operations (e.g., adding/removing labels, modifying list items). See Jira documentation for operation structure."),
        summary: z.string().optional().describe("Brief, descriptive title for the issue."),
        assignee: z.string().optional().describe("User to assign the issue to. Can be either an account ID (e.g., '5b10a2844c20165700ede21g') or name/email (e.g., 'john@company.com', 'John Doe'). When user email visibility is restricted, account ID is required. The system will auto-detect the type and search accordingly. Provide null or an empty string to unassign. Prefer using account ID when available to avoid visibility restrictions."),
        dueDate: z.string().optional().describe("Expected resolution date in YYYY-MM-DD format. Use null to remove due date."),
        description: z.string().optional().describe("Detailed description of the issue. Supports Markdown formatting including **bold**, *italic*, 'code', links [text](url), and lists. Note: Jira enforces size limits on the description field (typically ~32,767 characters, varies by instance). For very large content, consider splitting across comments or using attachments."),
        notifyUsers: z.boolean().optional().describe("If true, sends notification email to watchers. Setting to 'False' requires admin or project admin permissions."),
        returnIssue: z.boolean().optional().describe("If true, response includes full updated issue details; if false, response is minimal."),
        issueIdOrKey: z.string().describe("ID or key of the Jira issue to be edited."),
        sprintIdOrName: z.string().optional().describe("Sprint to assign this issue to. Can be either a sprint ID (e.g., '123', '456') or sprint name (e.g., 'Sprint 1', 'Release Sprint'). The sprint must exist and be accessible. Use JIRA_LIST_SPRINTS to find available sprints."),
        priorityIdOrName: z.string().optional().describe("Priority level for the issue. Can be either a priority ID (e.g., '1', '2') or priority name (e.g., 'High', 'Medium', 'Low')."),
        additionalProperties: z.record(z.any()).optional().describe("Additional properties to include in the request body. This can be used to pass extra fields supported by the Jira API that are not explicitly defined, such as custom fields or other issue properties. These are merged into the 'fields' object in the request. Format: {'customfield_12345': 'value', 'components': [{'name': 'Backend'}]}."),
        overrideEditableFlag: z.boolean().optional().describe("If true, bypasses editable flag restrictions. Requires admin permissions."),
        overrideScreenSecurity: z.boolean().optional().describe("If true, bypasses screen security restrictions. Requires admin permissions."),
    }),
    execute: async ({ jiraToken, jiraCloudId, fields, labels, update, summary, assignee, dueDate, description, notifyUsers, returnIssue, issueIdOrKey, sprintIdOrName, priorityIdOrName, additionalProperties, overrideEditableFlag, overrideScreenSecurity }) => {
        const { fields: editFields, update: editUpdate } = await buildEditBody(jiraToken, jiraCloudId, { summary, description, assignee, labels, dueDate, priorityIdOrName, fields, update, additionalProperties });
        const body = { fields: editFields };
        if (editUpdate) body.update = editUpdate;
        const res = await jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}`, method: 'PUT', query: { notifyUsers, overrideEditableFlag, overrideScreenSecurity }, body });
        if (res?.error) return res;
        if (sprintIdOrName && /^\d+$/.test(String(sprintIdOrName))) {
            await jira(jiraToken, { cloudId: jiraCloudId, api: "agile/1.0", path: `/sprint/${sprintIdOrName}/issue`, method: "POST", body: { issues: [issueIdOrKey] } });
        }
        if (returnIssue) {
            const full = await jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}` });
            return { success: true, issueKey: issueIdOrKey, issueData: full };
        }
        return { success: true, issueKey: issueIdOrKey };
    },
});

export const jiraFetchBulkIssues = tool({
    description: "Tool to bulk fetch multiple Jira issues by their IDs or keys (max 100 per call). Use when you need to retrieve details for multiple issues efficiently in a single API call.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.array(z.string()).optional().describe("A list of expand options to include additional information about issues. Available options: 'renderedFields' (HTML-rendered field values), 'names' (display name of each field), 'schema' (field type schema), 'transitions' (all possible transitions), 'operations' (all possible operations), 'editmeta' (edit metadata), 'changelog' (recent updates, max 40), 'versionedRepresentations' (versioned field values)."),
        fields: z.array(z.string()).optional().describe("A list of fields to return for each issue. This parameter accepts field names or IDs. Special values: '*all' returns all fields, '*navigable' returns navigable fields (default), prefix with minus to exclude (e.g., '-description' excludes description). Examples: ['summary', 'comment'] returns only summary and comments; ['-description'] returns all navigable fields except description; ['*all', '-comment'] returns all fields except comments."),
        properties: z.array(z.string()).max(5).optional().describe("A list of issue property keys to include in the results. Maximum 5 issue property keys can be specified."),
        fieldsByKeys: z.boolean().optional().describe("If true, reference fields by their key (rather than ID). Default is false."),
        issueIdsOrKeys: z.array(z.string()).min(1).max(100).describe("REQUIRED. An array of issue IDs or issue keys to fetch. You can mix issue IDs and keys in the same query. Minimum 1 issue, maximum 100 issues per request."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, fields, properties, fieldsByKeys, issueIdsOrKeys }) => {
        const queryParams = undefined;
        const body = { issueIdsOrKeys: issueIdsOrKeys, expand: expand, fields: fields, properties: properties, fieldsByKeys: fieldsByKeys };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/bulkfetch`, method: 'POST', query: queryParams, body });
    },
});

export const jiraGetAttachment = tool({
    description: "Retrieves the binary content of a Jira attachment by ID. Use when you need to download a specific file attached to an issue.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        fileName: z.string().describe("Desired filename for the downloaded attachment."),
        attachmentId: z.string().describe("The unique identifier of the attachment to retrieve."),
    }),
    execute: async ({ jiraToken, jiraCloudId, fileName, attachmentId }) => {
        const meta = await jira(jiraToken, { cloudId: jiraCloudId, path: `/attachment/${encodeURIComponent(attachmentId)}` });
        if (meta?.error) return meta;
        return { ...meta, fileName };
    },
});

export const jiraGetComment = tool({
    description: "This action fetches a specific comment from a Jira issue by its ID. You can specify      optional parameters to expand additional information in the response.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Optional. Sections to expand, e.g., 'renderedBody' for HTML. See Jira API docs for other values."),
        commentId: z.string().describe("Unique ID of the comment to retrieve."),
        issueIdOrKey: z.string().describe("ID or key of the Jira issue (e.g., '10000' or 'PROJ-123')."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, commentId, issueIdOrKey }) => {
        const queryParams = { expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/comment/${encodeURIComponent(commentId)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssue = tool({
    description: "This action retrieves a specific Jira issue using its ID or key. Users can customize the fields and additional data included in the response to suit their specific needs.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("A comma-separated list of entities to include with the issue. To retrieve update history, include 'changelog' in this list (e.g., 'changelog'). Other common expansions include 'renderedFields' (HTML content), 'transitions' (available workflows), and 'operations' (available actions)."),
        fields: z.array(z.string()).optional().describe("A list of field names or IDs to return for the issue. If omitted or empty, a default set of fields (often all fields or all navigable fields) is returned. For specific fields, provide a list like '[\"summary\", \"status\"]'."),
        issueKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJ-123') of the Jira issue to retrieve."),
        properties: z.array(z.string()).optional().describe("A list of issue property keys to include in the response. Issue properties are extra key-value data attached to an issue, often by apps. Example: '[\"jira.meta.data\", \"com.example.custom.info\"]'."),
        fieldsByKeys: z.boolean().optional().describe("If true, the strings in the 'fields' parameter are interpreted as field keys (e.g., 'summary') instead of field IDs (e.g., 'customfield_10000'). Default is false (uses field IDs)."),
        updateHistory: z.boolean().optional().describe("Controls whether viewing the issue adds it to the user's 'Recently viewed' list. This does not control inclusion of update history in the response. To include update history, use the 'expand' parameter with 'changelog'."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, fields, issueKey, properties, fieldsByKeys, updateHistory }) => {
        const queryParams = { fields: fields, expand: expand, properties: properties, fieldsByKeys: fieldsByKeys, updateHistory: updateHistory };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueKey)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueEditMetadata = tool({
    description: "Tool to retrieve editable fields for a Jira issue. Use before running an edit action to fetch custom field metadata and required fields.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJ-123') of the Jira issue to inspect."),
        overrideEditableFlag: z.boolean().optional().describe("Skip workflow/step editability checks when true. Intended for apps with Administer Jira permission."),
        overrideScreenSecurity: z.boolean().optional().describe("Skip screen and field-configuration visibility checks when true. Intended for apps with Administer Jira permission."),
    }),
    execute: async ({ jiraToken, jiraCloudId, issueIdOrKey, overrideEditableFlag, overrideScreenSecurity }) => {
        const queryParams = { overrideEditableFlag: overrideEditableFlag, overrideScreenSecurity: overrideScreenSecurity };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/editmeta`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueLinkTypes = tool({
    description: "This action retrieves all issue link types configured in the Jira instance. It provides a comprehensive list of the relationships available for issues in your project.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issueLinkType`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssuePickerSuggestions = tool({
    description: "Retrieves issue picker suggestions from Jira for auto-completion when searching for issues.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        query: z.string().optional().describe("A string to match against text fields in the issue such as title, description, or comments."),
        currentJQL: z.string().optional().describe("A JQL query defining a list of issues to search for the query term. Note that 'username' and 'userkey' cannot be used as search terms for this parameter, due to privacy reasons. Use 'accountId' instead."),
        showSubTasks: z.boolean().optional().describe("Indicate whether to include subtasks in the suggestions list."),
        currentIssueKey: z.string().optional().describe("The key of an issue to exclude from search results. For example, the issue the user is viewing when they perform this query."),
        currentProjectId: z.string().optional().describe("The ID of a project that suggested issues must belong to."),
        showSubTaskParent: z.boolean().optional().describe("When 'currentIssueKey' is a subtask, whether to include the parent issue in the suggestions if it matches the query."),
    }),
    execute: async ({ jiraToken, jiraCloudId, query, currentJQL, showSubTasks, currentIssueKey, currentProjectId, showSubTaskParent }) => {
        const queryParams = { query: query, currentJQL: currentJQL, showSubTasks: showSubTasks, currentIssueKey: currentIssueKey, currentProjectId: currentProjectId, showSubTaskParent: showSubTaskParent };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/picker`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueProperty = tool({
    description: "This action retrieves a specific property associated with a Jira issue using its ID or key. It allows users to access custom information stored in Jira properties.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        propertyKey: z.string().describe("The key of the issue property to retrieve. Property keys are often dot-separated, like 'com.example.property.key'."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'TEST-123') of the Jira issue."),
    }),
    execute: async ({ jiraToken, jiraCloudId, propertyKey, issueIdOrKey }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/properties/${encodeURIComponent(propertyKey)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueWatchers = tool({
    description: "This action retrieves the list of users watching a specific Jira issue. It allows clients to understand who is interested in updates for that issue.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issueIdOrKey: z.string().describe("The ID or key of the Jira issue for which to retrieve watchers. This can be the numerical ID (e.g., '10000') or the human-readable key (e.g., 'PROJ-123')."),
    }),
    execute: async ({ jiraToken, jiraCloudId, issueIdOrKey }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/watchers`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueWorklogs = tool({
    description: "Retrieves all worklogs associated with a specific Jira issue.     This includes filtering options such as start dates and pagination for large sets of worklogs.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        startAt: z.number().int().optional().describe("Index of the first worklog to return (for pagination). Defaults to 0."),
        maxResults: z.number().int().optional().describe("Maximum number of worklogs to return per page. Defaults to a system-defined limit."),
        startedAfter: z.number().int().optional().describe("Filters worklogs to include only those started after this Unix timestamp (milliseconds)."),
        startedBefore: z.number().int().optional().describe("Filters worklogs to include only those started before this Unix timestamp (milliseconds)."),
        issueIdOrKey: z.string().describe("The ID or key of the issue for which worklogs are to be fetched."),
    }),
    execute: async ({ jiraToken, jiraCloudId, startAt, maxResults, startedAfter, startedBefore, issueIdOrKey }) => {
        const queryParams = { startAt: startAt, maxResults: maxResults, startedAfter: startedAfter, startedBefore: startedBefore };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/worklog`, method: 'GET', query: queryParams });
    },
});

export const jiraGetRemoteIssueLinks = tool({
    description: "This action retrieves remote issue links associated with a specified Jira issue.      You can filter the links by providing an optional global ID for a specific link retrieval.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        globalId: z.string().optional().describe("Optional. The global ID of a specific remote issue link to retrieve, provided by the external linking application. If specified, only the remote issue link matching this global ID is returned."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJECT-123') of the Jira issue for which to retrieve remote links."),
    }),
    execute: async ({ jiraToken, jiraCloudId, globalId, issueIdOrKey }) => {
        const queryParams = { globalId: globalId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/remotelink`, method: 'GET', query: queryParams });
    },
});

export const jiraGetTransitions = tool({
    description: "This action retrieves the available workflow transitions for a specified Jira issue. It can return details about the transitions, including their IDs and names, as well as whether they are currently available for use.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("A comma-separated list of properties to expand in the response. Use 'transitions.fields' to include the fields associated with each transition, providing details on what input is expected or allowed."),
        transitionId: z.string().optional().describe("The ID of a specific transition to retrieve. If provided, only details for this transition are returned."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJ-123') of the Jira issue for which to retrieve transitions."),
        skipRemoteOnlyCondition: z.boolean().optional().describe("If true, conditions defined by remote apps that only run remotely will be skipped during evaluation."),
        sortByOpsBarAndStatus: z.boolean().optional().describe("If true, sorts the returned transitions by their order in the operations bar and then by status category."),
        includeUnavailableTransitions: z.boolean().optional().describe("If true, transitions that are not currently available for the issue (e.g., due to unmet conditions) will be included in the response. Use this as a diagnostic step when an expected target status is missing from the default response."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, transitionId, issueIdOrKey, skipRemoteOnlyCondition, sortByOpsBarAndStatus, includeUnavailableTransitions }) => {
        const queryParams = { expand: expand, transitionId: transitionId, skipRemoteOnlyCondition: skipRemoteOnlyCondition, sortByOpsBarAndStatus: sortByOpsBarAndStatus, includeUnavailableTransitions: includeUnavailableTransitions };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/transitions`, method: 'GET', query: queryParams });
    },
});

export const jiraGetVotes = tool({
    description: "This action retrieves the voting information associated with a specific Jira issue.      It provides details such as the total number of votes and whether the user has voted on that issue.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issueIdOrKey: z.string().describe("The ID or key of the Jira issue (e.g., 'PROJ-123' or '10000')."),
    }),
    execute: async ({ jiraToken, jiraCloudId, issueIdOrKey }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/votes`, method: 'GET', query: queryParams });
    },
});

export const jiraGetWorklog = tool({
    description: "Retrieves the worklog entries for a specified Jira issue. This action provides detailed information on time spent by users on the issue, allowing for effective tracking and reporting of work activity.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("A comma-separated list of worklog properties to expand in the response. For instance, 'properties' can be used to include custom fields associated with the worklogs. Refer to the Jira API documentation for other possible values."),
        startAt: z.number().int().optional().describe("The 0-based index of the first worklog to return. Used for pagination to retrieve results beyond the initial page. For example, if 'maxResults' is 50, 'startAt=50' retrieves the second page."),
        maxResults: z.number().int().optional().describe("The maximum number of worklogs to return per page. Used for pagination. If not specified, a Jira-defined default is used (e.g., 50)."),
        startedAfter: z.number().int().optional().describe("Filters worklogs to include only those started on or after this specified date and time. Provide as a Unix timestamp in milliseconds (milliseconds since January 1, 1970, 00:00:00 UTC)."),
        startedBefore: z.number().int().optional().describe("Filters worklogs to include only those started on or before this specified date and time. Provide as a Unix timestamp in milliseconds (milliseconds since January 1, 1970, 00:00:00 UTC)."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10001') or key (e.g., 'PROJECT-123') of the Jira issue for which to retrieve worklogs."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, startAt, maxResults, startedAfter, startedBefore, issueIdOrKey }) => {
        const queryParams = { expand: expand, startAt: startAt, maxResults: maxResults, startedAfter: startedAfter, startedBefore: startedBefore };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/worklog`, method: 'GET', query: queryParams });
    },
});

export const jiraListComments = tool({
    description: "Tool to retrieve multiple comments by their IDs in a single request. Use when you need to fetch specific comments efficiently. Supports up to 1000 comment IDs per request with optional expansion for rendered HTML and properties.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        ids: z.array(z.number().int()).min(1).max(1000).describe("The list of comment IDs to retrieve. A maximum of 1000 IDs can be specified."),
        expand: z.string().optional().describe("Use expand to include additional information about comments in the response. This parameter accepts a comma-separated list. Expand options include: 'renderedBody' (returns the comment body rendered in HTML), 'properties' (returns the comment's properties)."),
    }),
    execute: async ({ jiraToken, jiraCloudId, ids, expand }) => {
        const queryParams = undefined;
        const body = { ids: ids, expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/comment/list`, method: 'POST', query: queryParams, body });
    },
});

export const jiraListIssueComments = tool({
    description: "This action fetches paginated comments associated with a specific Jira issue. It allows users to retrieve details such as the comment content and the authorship information.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use 'renderedBody' to include the HTML-rendered version of the comment body in the response."),
        orderBy: z.string().optional().describe("Specifies the field to sort comments by; use 'created' for ascending by creation date (currently the only supported value)."),
        startAt: z.number().int().min(0).optional().describe("The 0-based index of the first comment to return."),
        maxResults: z.number().int().min(1).max(100).optional().describe("The maximum number of comments to return per page. Note: Jira Cloud enforces a maximum of ~100 comments per page for this endpoint, regardless of the requested value."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJ-123') of the Jira issue from which to retrieve comments."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, orderBy, startAt, maxResults, issueIdOrKey }) => {
        const queryParams = { startAt: startAt, maxResults: maxResults, orderBy: orderBy, expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/comment`, method: 'GET', query: queryParams });
    },
});

export const jiraRemoveWatcherFromIssue = tool({
    description: "This action allows you to remove a specified user from the watchers list of a given issue. You need to provide the issue identification and the user's account ID for the operation to succeed.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        accountId: z.string().describe("The account ID of the user to remove from the issue's watchers list. Must be an account ID, not a username; retrieve via JIRA_GET_CURRENT_USER or JIRA_FIND_USERS."),
        issueIdOrKey: z.string().describe("The ID or key of the issue."),
    }),
    execute: async ({ jiraToken, jiraCloudId, accountId, issueIdOrKey }) => {
        const queryParams = { accountId: accountId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/watchers`, method: 'DELETE', query: queryParams });
    },
});

export const jiraSendNotificationForIssue = tool({
    description: "This action sends a customized email notification related to a specific Jira issue. It includes customizable fields for the subject, message content, and recipients, ensuring tailored communication for issue updates.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        to: z.record(z.any()).describe("A 'NotificationRecipients' object specifying who should receive the notification. At least one recipient category (e.g., reporter, assignee, a user, or a group) within this object must be configured."),
        subject: z.string().describe("The subject line for the email notification."),
        restrict: z.record(z.any()).optional().describe("Optional restrictions defining who can receive the notification. If specified, notifications are sent only to users who meet the criteria in 'groups' (if provided) AND 'permissions' (if provided), AND also have general permission to view the issue."),
        htmlBody: z.string().optional().describe("The HTML content of the email notification. This field is optional unless 'restrict' is used, in which case it becomes mandatory. It is recommended to also provide 'text_body' for email clients that do not support HTML."),
        textBody: z.string().describe("The plain text content of the email notification. This field is always mandatory."),
        issueIdOrKey: z.string().describe("The ID (e.g., '10000') or key (e.g., 'PROJ-123') of the Jira issue for which the notification will be sent."),
    }),
    execute: async ({ jiraToken, jiraCloudId, to, subject, restrict, htmlBody, textBody, issueIdOrKey }) => {
        const queryParams = undefined;
        const body = { subject: subject, textBody: textBody, htmlBody: htmlBody, to: to, restrict: restrict };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/${encodeURIComponent(issueIdOrKey)}/notify`, method: 'POST', query: queryParams, body });
    },
});

export const jiraTransitionIssue = tool({
    description: "This action transitions a specified Jira issue to a different status     based on the selected workflow transition. It supports optional comments and assignee information.     Note: Only fields configured on the transition screen can be set during the transition.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        comment: z.string().optional().describe("Optional comment to add during the transition. Supports Markdown-style formatting that is automatically converted to Atlassian Document Format (ADF). Supported formatting: **bold** (wrap text in double asterisks), *italic* or _italic_ (single asterisks or underscores), 'inline code' (backticks), [link text](https://url) for hyperlinks, bullet lists (lines starting with -, *, or +), and numbered lists (lines starting with 1., 2., etc.). Example: 'Fixed **critical** bug in 'user.login()' method. See [docs](https://example.com) for details.'"),
        assignee: z.string().optional().describe("Account ID of the user to assign the issue to during transition. Takes precedence over assignee_name."),
        resolution: z.string().optional().describe("Resolution to set when CLOSING an issue (e.g., 'Done', 'Fixed', 'Won't Do'). IMPORTANT: Only use this when transitioning to a final status like 'Done', 'Closed', or 'Resolved'. Do NOT set this for intermediate transitions like 'In Progress', 'In Review', or 'To Do' - resolution is only available when completing/closing an issue."),
        assigneeName: z.string().optional().describe("Name of the user to assign the issue to during transition. Can be either an email address (e.g., 'john@company.com') or display name (e.g., 'John Doe'). The system will auto-detect the type and search accordingly. Ignored if assignee (account ID) is provided."),
        issueIdOrKey: z.string().describe("The ID or key of the issue to transition."),
        transitionFields: z.record(z.any()).optional().describe("Fields to include in the transition payload. Use this for fields that appear on the transition screen and may be required by the workflow (e.g., 'timetracking', custom fields). Format: {'timetracking': {'originalEstimate': '2h'}, 'customfield_10001': 'value'}. For time tracking, use format like '1d 2h' (1 day 2 hours), '30m' (30 minutes), or '1w' (1 week). Note: assignee, resolution, and comment are handled by dedicated parameters and don't need to be included here."),
        additionalProperties: z.record(z.any()).optional().describe("Additional properties to include at the top level of the transition request body. This can be used to pass extra fields supported by the Jira API that are not explicitly defined, such as 'historyMetadata' for audit trail customization or 'properties' for entity properties. Format: {'historyMetadata': {'type': 'myplugin:type'}, 'properties': [{'key': 'myKey', 'value': {...}}]}."),
        transitionIdOrName: z.string().describe("The ID or name of the transition to apply. IMPORTANT: Transition names are workflow-specific and vary between Jira projects (e.g., one project may have 'In Progress' while another has 'In Development'). It is strongly recommended to first retrieve available transitions for the issue using JIRA_GET_TRANSITIONS or JIRA_GET_ISSUE (with expand='transitions') to ensure you use a valid transition name for this specific issue's workflow. Available transitions also depend on the issue's *current status*, not just the project — never reuse cached transition IDs across different issues or statuses. When multiple transitions share similar names, prefer the numeric ID to avoid applying the wrong state change."),
    }),
    execute: async ({ jiraToken, jiraCloudId, comment, assignee, resolution, assigneeName, issueIdOrKey, transitionFields, additionalProperties, transitionIdOrName }) => {
        const tid = await getTransitionId(jiraToken, jiraCloudId, issueIdOrKey, transitionIdOrName);
        if (!tid) return { error: `No transition "${transitionIdOrName}" is available for issue ${issueIdOrKey}. Use JiraGetTransitions first.` };
        const fields = { ...(transitionFields ?? {}) };
        const acc = await resolveAssignee(jiraToken, jiraCloudId, assignee, assigneeName);
        if (acc) fields.assignee = { accountId: acc };
        if (resolution) fields.resolution = { name: resolution };
        const body = { transition: { id: tid }, fields };
        if (comment) body.update = { comment: [{ add: { body: mdToAdf(comment) } }] };
        if (additionalProperties && typeof additionalProperties === "object") Object.assign(body, additionalProperties);
        const res = await jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}/transitions`, method: 'POST', body });
        if (res?.error) return res;
        return { success: true, issueKey: issueIdOrKey, transitionName: transitionIdOrName };
    },
});

export const jiraUpdateComment = tool({
    description: "This action updates an existing comment on a Jira issue.      Users can modify the comment text and adjust visibility settings as needed.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        commentId: z.string().describe("The unique ID of the comment to be updated."),
        commentText: z.string().describe("The new text content for the comment. This will replace the existing comment body. Supports plain text and basic formatting like *bold*, _italic_, and @mentions. Mentions support two formats: @username (no spaces) and @\"Display Name\" (quoted to allow spaces). Quoted mentions like @\"John Doe\" are converted to rich mentions where possible."),
        notifyUsers: z.boolean().optional().describe("A boolean flag indicating whether to send notifications to users about the comment update. Defaults to True."),
        issueIdOrKey: z.string().describe("The ID or key of the Jira issue where the comment is located. This can be the numerical ID or the project key followed by the issue number (e.g., 'PROJ-123')."),
        visibilityType: z.string().optional().describe("Optional. The type of visibility restriction to apply to the comment. If provided, 'visibility_value' must also be specified. Valid values are 'group' or 'role'."),
        visibilityValue: z.string().optional().describe("Optional. The name of the group or role to restrict comment visibility to. Required if 'visibility_type' is specified. For 'group' type, provide the group name (e.g., 'jira-administrators'). For 'role' type, provide the project role name (e.g., 'Administrators')."),
        additionalProperties: z.string().optional().describe("JSON string of comment properties as key-value pairs. Values can be any JSON type (strings, numbers, objects, arrays, booleans, null). Note: Primitive values (strings, numbers, booleans, null) and arrays are automatically wrapped in {\"value\": ...} to match Jira's entity property requirements. Object values are passed through as-is. Format: '{\"property_key\": \"string value\"}' or '{\"property_key\": {\"custom\": \"object\"}}'."),
    }),
    execute: async ({ jiraToken, jiraCloudId, commentId, commentText, notifyUsers, issueIdOrKey, visibilityType, visibilityValue, additionalProperties }) => {
        const body = { body: mdToAdf(commentText) };
        if (visibilityType && visibilityValue) body.visibility = { type: visibilityType, value: visibilityValue };
        if (additionalProperties) {
            try {
                const parsed = JSON.parse(additionalProperties);
                const props = Object.entries(parsed).map(([key, value]) => ({ key, value: value !== null && typeof value === "object" && !Array.isArray(value) ? value : { value } }));
                if (props.length > 0) body.properties = props;
            } catch { /* ignore malformed JSON */ }
        }
        return jira(jiraToken, { cloudId: jiraCloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}/comment/${encodeURIComponent(commentId)}`, method: 'PUT', query: { notifyUsers }, body });
    },
});
