// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupAddDependency = tool({
  description:
    "Adds a 'waiting on' or 'blocking' dependency to a task, requiring either `depends_on` (task becomes waiting on) or `dependency_of` (task becomes blocking), but not both; `team_id` is required if `custom_task_ids` is true.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe('Unique identifier of the task to which a dependency relationship will be added.'),
    teamId: z
      .string()
      .optional()
      .describe(
        'Team ID, required if `custom_task_ids` is true to look up tasks by custom IDs (unique per team).',
      ),
    dependsOn: z
      .string()
      .optional()
      .describe(
        "ID of the task that `task_id` will depend on ('waiting on' relationship). Use this or `dependency_of`, not both.",
      ),
    dependencyOf: z
      .string()
      .optional()
      .describe(
        "ID of the task that will depend on `task_id` ('blocking' relationship). Use this or `depends_on`, not both.",
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If true, `task_id` and related task IDs are custom (text-based), requiring `team_id`.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, dependsOn, dependencyOf, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    if ((dependsOn && dependencyOf) || (!dependsOn && !dependencyOf))
      return { error: 'Provide exactly one of depends_on or dependency_of.' };
    const depQuery = {};
    if (teamId !== undefined) depQuery.team_id = teamId;
    if (customTaskIds !== undefined) depQuery.custom_task_ids = customTaskIds;
    if (dependsOn)
      return cuPost(clickupToken, V2, `/task/${taskId}/link/${dependsOn}`, { query: depQuery });
    return cuPost(clickupToken, V2, `/task/${dependencyOf}/link/${taskId}`, { query: depQuery });
  },
});

export const clickupAddTagToTask = tool({
  description:
    'Adds an existing tag to a specified task; team_id is required if custom_task_ids is true.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'The ID of the task to which the tag will be added. This can be the standard task ID or a custom task ID if `custom_task_ids` is set to `true`.',
      ),
    teamId: z
      .number()
      .int()
      .optional()
      .describe(
        'The ID of the team (formerly Workspace) to which the task belongs. This is required only if `custom_task_ids` is set to `true`. For example: `custom_task_ids=true&team_id=123`.',
      ),
    tagName: z
      .string()
      .describe(
        'The name of the tag to add to the task. The tag must already exist in the workspace.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'A boolean flag indicating whether the `task_id` provided is a custom task ID. If `true`, the `team_id` must also be provided.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, tagName, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/task/${taskId}/tag/${tagName}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupAddTaskLink = tool({
  description:
    'Links two existing and accessible ClickUp tasks, identified by `task_id` (source) and `links_to` (target).',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z.string().describe('The ID of the source task.'),
    teamId: z
      .number()
      .int()
      .optional()
      .describe(
        'The ID of the team, used when `custom_task_ids` is true to identify tasks by custom IDs. For example: `custom_task_ids=true&team_id=123`.',
      ),
    linksTo: z.string().describe('The ID of the target task.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to indicate that `task_id` and `links_to` are custom task IDs rather than standard numerical IDs. If `true`, `team_id` must also be provided.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, linksTo, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/task/${taskId}/link/${linksTo}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupAddTaskToList = tool({
  description:
    "Adds an existing task to an additional ClickUp List; the 'Tasks in Multiple Lists' ClickApp must be enabled in the Workspace for this.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z
      .number()
      .int()
      .describe('Unique identifier of the List to which the task will be added.'),
    taskId: z
      .string()
      .describe(
        'Unique identifier of the task to add to the List (actual task ID, not Custom Task ID).',
      ),
  }),
  execute: async ({ clickupToken, listId, taskId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/list/${listId}/task/${taskId}`);
  },
});

export const clickupCreateTask = tool({
  description:
    'Creates a new ClickUp task in a specific list, optionally as a subtask if a `parent` task ID (which cannot be a subtask itself and must be in the same list) is provided.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The name of the new task.'),
    tags: z.array(z.string()).optional().describe('Tag names to apply.'),
    parent: z
      .string()
      .optional()
      .describe(
        'ID of an existing task to be the parent (creating a subtask). Parent must not be a subtask and must be in the same list.',
      ),
    status: z
      .string()
      .optional()
      .describe(
        "Status name for the task. IMPORTANT: Each ClickUp list has its own unique status configuration. Common names like 'todo', 'done', or 'in progress' often do NOT exist - you must use the exact status names (case-sensitive) configured in the t",
      ),
    listId: z.string().describe('The ID of the list where the task will be created.'),
    teamId: z
      .string()
      .optional()
      .describe('Team ID, required only if `custom_task_ids` is `true`.'),
    dueDate: z.number().int().optional().describe('Due date as a Unix timestamp in milliseconds.'),
    linksTo: z.string().optional().describe('ID of an existing task to link as a dependency.'),
    priority: z
      .number()
      .int()
      .optional()
      .describe('Priority level: 1 (Urgent), 2 (High), 3 (Normal), 4 (Low).'),
    assignees: z.array(z.number().int()).optional().describe('User IDs to assign to the task.'),
    notifyAll: z
      .boolean()
      .optional()
      .describe('`True` to send notifications to all task watchers, including the creator.'),
    startDate: z
      .number()
      .int()
      .optional()
      .describe('Start date as a Unix timestamp in milliseconds.'),
    description: z.string().optional().describe("Task's detailed description."),
    customFields: z
      .array(z.record(z.any()))
      .optional()
      .describe('Custom fields to apply. See ClickUp API for structure.'),
    dueDateTime: z
      .boolean()
      .optional()
      .describe("`True` if `due_date` includes a specific time, `false` if it's an all-day task."),
    timeEstimate: z
      .number()
      .int()
      .optional()
      .describe('Estimated time to complete, in milliseconds.'),
    customItemId: z
      .number()
      .int()
      .optional()
      .describe(
        'Custom task type ID. Omit or use `null` for standard tasks (recommended). Custom task types including Milestones (ID `1`) are subject to workspace plan quotas. Only specify a custom_item_id if you have confirmed the workspace has available ',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe('Enables referencing tasks by custom task ID; requires `team_id` if `true`.'),
    startDateTime: z
      .boolean()
      .optional()
      .describe(
        "`True` if `start_date` includes a specific time, `false` if it's an all-day task.",
      ),
    checkRequiredCustomFields: z
      .boolean()
      .optional()
      .describe('`True` to enforce filling all required Custom Fields upon creation.'),
  }),
  execute: async ({
    clickupToken,
    name,
    tags,
    parent,
    status,
    listId,
    teamId,
    dueDate,
    linksTo,
    priority,
    assignees,
    notifyAll,
    startDate,
    description,
    customFields,
    dueDateTime,
    timeEstimate,
    customItemId,
    customTaskIds,
    startDateTime,
    checkRequiredCustomFields,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/list/${listId}/task`, {
      body: nest({
        name: name,
        tags: tags,
        parent: parent,
        status: status,
        due_date: dueDate,
        links_to: linksTo,
        priority: priority,
        assignees: assignees,
        notify_all: notifyAll,
        start_date: startDate,
        description: description,
        custom_fields: customFields,
        due_date_time: dueDateTime,
        time_estimate: timeEstimate,
        custom_item_id: customItemId,
        start_date_time: startDateTime,
        check_required_custom_fields: checkRequiredCustomFields,
      }),
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupCreateTaskFromTemplate = tool({
  description:
    'Creates a new task in a specified ClickUp list from a task template, using the provided name for the new task.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('Name for the new task created from the template.'),
    listId: z
      .string()
      .describe("Numeric ID of the ClickUp list for task creation, found in the list's URL."),
    templateId: z.string().describe('Unique string ID of the task template to use.'),
  }),
  execute: async ({ clickupToken, name, listId, templateId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/list/${listId}/task_template/${templateId}/task`, {
      body: nest({ name: name }),
    });
  },
});

export const clickupDeleteDependency = tool({
  description:
    "Removes a dependency relationship for a task. Provide exactly one of: `depends_on` to remove a 'waiting on' dependency (task_id is blocked by another task), or `dependency_of` to remove a 'blocking' dependency (another task is blocked by task_id). `team_id` is required if `custom_task_ids` is true.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe('Identifier of the task from which the dependency relationship will be removed.'),
    teamId: z
      .string()
      .optional()
      .describe(
        'Numeric team ID, required only when `custom_task_ids` is true to scope custom task IDs.',
      ),
    dependsOn: z
      .string()
      .optional()
      .describe(
        "Identifier of the task that `task_id` depends on (i.e., `task_id` is waiting on this task). Provide this to remove a 'waiting on' dependency. Mutually exclusive with `dependency_of` - exactly one must be provided.",
      ),
    dependencyOf: z
      .string()
      .optional()
      .describe(
        "Identifier of the task that depends on `task_id` (i.e., this task is blocked by `task_id`). Provide this to remove a 'blocking' dependency. Mutually exclusive with `depends_on` - exactly one must be provided.",
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If true, interprets `task_id` and the dependency task ID as custom task IDs; `team_id` also required.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, dependsOn, dependencyOf, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    if ((dependsOn && dependencyOf) || (!dependsOn && !dependencyOf))
      return { error: 'Provide exactly one of depends_on or dependency_of.' };
    const depQuery = {};
    if (teamId !== undefined) depQuery.team_id = teamId;
    if (customTaskIds !== undefined) depQuery.custom_task_ids = customTaskIds;
    if (dependsOn)
      return cuDelete(clickupToken, V2, `/task/${taskId}/link/${dependsOn}`, { query: depQuery });
    return cuDelete(clickupToken, V2, `/task/${dependencyOf}/link/${taskId}`, { query: depQuery });
  },
});

export const clickupDeleteTask = tool({
  description:
    'Permanently deletes a task, using its standard ID or a custom task ID (requires `custom_task_ids=true` and `team_id`).',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'Unique ID of the task to delete. Can be a standard ID or a custom task ID (if custom, `custom_task_ids` must be `true`).',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'Team ID. Required only if `custom_task_ids` is `true` to identify the team for the custom task ID.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe('Set to `true` if `task_id` is a custom ID (requires `team_id` if `true`).'),
  }),
  execute: async ({ clickupToken, taskId, teamId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/task/${taskId}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupDeleteTaskLink = tool({
  description:
    'Deletes an existing link, effectively a dependency or relationship, between two ClickUp tasks; set `custom_task_ids=true` and provide `team_id` if using custom task IDs.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'The ID of the first task involved in the link. If `custom_task_ids` is `true`, this should be its custom task ID.',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'The numerical ID of the team. This parameter is required and used only when `custom_task_ids` is set to `true` to correctly scope the custom task IDs. For example: `custom_task_ids=true&team_id=123`.',
      ),
    linksTo: z
      .string()
      .describe(
        'The ID of the second task involved in the link. If `custom_task_ids` is `true`, this should be its custom task ID.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If `task_id` and `links_to` refer to custom task IDs (rather than standard ClickUp task IDs), this parameter must be set to `true`. Setting this to `true` also requires `team_id` to be provided. Defaults to `false` if not specified.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, linksTo, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/task/${taskId}/link/${linksTo}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupGetAccessibleCustomFields = tool({
  description:
    'Retrieves all accessible Custom Field definitions for a specified ClickUp List using its `list_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z.string().describe('Numeric ID of the specific ClickUp List.'),
  }),
  execute: async ({ clickupToken, listId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/list/${listId}/field`);
  },
});

export const clickupGetBulkTasksTimeInStatus = tool({
  description:
    "Retrieves the time spent in each status for multiple tasks; requires the 'Total time in Status' ClickApp to be enabled in the Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the team to which the custom task IDs belong. This field is required and used only when the `custom_task_ids` parameter is set to `true`.',
      ),
    taskIds: z
      .string()
      .describe(
        "A comma-separated string of task IDs (e.g., 'taskID1,taskID2') for which to retrieve time in status data. You can include up to 100 task IDs per request.",
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` if `task_ids` refer to custom task IDs instead of standard task IDs. If `true`, `team_id` must also be provided.',
      ),
  }),
  execute: async ({ clickupToken, teamId, taskIds, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    const taskIdsCsv = Array.isArray(taskIds) ? taskIds.join(',') : taskIds;
    return cuGet(clickupToken, V2, `/task/bulk_time_in_status/task_ids`, {
      query: { team_id: teamId, task_ids: taskIdsCsv, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupGetCustomTaskTypes = tool({
  description: 'Retrieves all custom task types available within a specified Workspace (team_id).',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .describe(
        'Numeric ID of the Workspace (formerly Team) for which to retrieve custom task types.',
      ),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/custom_task_types`);
  },
});

export const clickupGetFilteredTeamTasks = tool({
  description:
    'Retrieves a paginated list of tasks (up to 100 per page) from a specified workspace based on various filter criteria, respecting user access permissions. Unexpectedly missing tasks may indicate permission restrictions rather than filter issues. Task comments are not included; use CLICKUP_GET_TASK_COMMENTS for complete context. No keyword/text search is supported; filter client-side on returned res',
  inputSchema: z.object({
    clickupToken: tokenField,
    page: z
      .number()
      .int()
      .optional()
      .describe(
        "Page to fetch (starts at 0). Increment until the response's `last_page` field is true or the returned tasks list is empty to avoid silently missing tasks.",
      ),
    tags: z.array(z.string()).optional().describe('Filter by tag names.'),
    parent: z.string().optional().describe('Filter by parent task ID to retrieve its subtasks.'),
    reverse: z.boolean().optional().describe('If true, tasks are displayed in reverse order.'),
    teamIdAlt: z
      .string()
      .describe(
        "The Workspace ID (called 'team_id' in ClickUp API v2). This is a numeric string. To find your Workspace ID, use the 'Get Authorized Teams (Workspaces)' endpoint or check Settings > Workspace Settings in the ClickUp UI.",
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'Team ID, required if `custom_task_ids` is true, for custom task ID context. Distinct from the required `team_Id` path parameter (Workspace ID); do not confuse these — this optional numeric string is only used for custom task ID resolution. ',
      ),
    listIds: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by List IDs. Must be numeric IDs (e.g., '123456789'). You can get numeric List IDs from the Get Lists endpoint.",
      ),
    orderBy: z
      .enum(['id', 'created', 'updated', 'due_date'])
      .optional()
      .describe('Order tasks by this field. Default: `created`.'),
    statuses: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by task statuses (e.g., 'to do', 'in progress'). Values must exactly match workspace-configured status strings; mismatches silently return empty results.",
      ),
    subtasks: z.boolean().optional().describe('If true, include subtasks. Excluded by default.'),
    assignees: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by assignee User IDs. Must be numeric IDs (e.g., '123456789'). You can get numeric User IDs from endpoints like Get List Members or Get Task Members.",
      ),
    spaceIds: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by Space IDs. Must be numeric IDs (e.g., '123456789'). You can get numeric Space IDs from the Get Spaces endpoint.",
      ),
    dueDateGt: z
      .number()
      .int()
      .optional()
      .describe('Filter by due date greater than this Unix timestamp (milliseconds).'),
    dueDateLt: z
      .number()
      .int()
      .optional()
      .describe('Filter by due date less than this Unix timestamp (milliseconds).'),
    projectIds: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by Folder (Project) IDs. Must be numeric IDs (e.g., '123456789'). You can get numeric Folder IDs from the Get Folders endpoint.",
      ),
    customItems: z
      .array(z.number().int())
      .optional()
      .describe(
        'Filter by custom item types (e.g., 0 for tasks, 1 for Milestones, other numbers for custom types defined in Workspace).',
      ),
    dateDoneGt: z
      .number()
      .int()
      .optional()
      .describe('Filter by completion date greater than this Unix timestamp (milliseconds).'),
    dateDoneLt: z
      .number()
      .int()
      .optional()
      .describe('Filter by completion date less than this Unix timestamp (milliseconds).'),
    customFields: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by custom fields. Each string in the list is a JSON object defining a single filter condition. Example for one string in the list: '''{'field_id': 'unique_field_id', 'operator': '=', 'value': 'desired_value'}'''. Incorrect `field_id`",
      ),
    includeClosed: z
      .boolean()
      .optional()
      .describe('If true, include closed tasks. Excluded by default.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to true to use custom task IDs in filters instead of global task IDs. Requires `team_id` for context.',
      ),
    dateCreatedGt: z
      .number()
      .int()
      .optional()
      .describe('Filter by creation date greater than this Unix timestamp (milliseconds).'),
    dateCreatedLt: z
      .number()
      .int()
      .optional()
      .describe('Filter by creation date less than this Unix timestamp (milliseconds).'),
    dateUpdatedGt: z
      .number()
      .int()
      .optional()
      .describe('Filter by update date greater than this Unix timestamp (milliseconds).'),
    dateUpdatedLt: z
      .number()
      .int()
      .optional()
      .describe('Filter by update date less than this Unix timestamp (milliseconds).'),
    includeMarkdownDescription: z
      .boolean()
      .optional()
      .describe('If true, return task descriptions in Markdown format.'),
  }),
  execute: async ({
    clickupToken,
    page,
    tags,
    parent,
    reverse,
    teamIdAlt,
    teamId,
    listIds,
    orderBy,
    statuses,
    subtasks,
    assignees,
    spaceIds,
    dueDateGt,
    dueDateLt,
    projectIds,
    customItems,
    dateDoneGt,
    dateDoneLt,
    customFields,
    includeClosed,
    customTaskIds,
    dateCreatedGt,
    dateCreatedLt,
    dateUpdatedGt,
    dateUpdatedLt,
    includeMarkdownDescription,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    const teamIdPath = teamIdAlt !== undefined ? teamIdAlt : teamId;
    return cuGet(clickupToken, V2, `/team/${teamIdPath}/task`, {
      query: {
        page: page,
        tags: tags,
        parent: parent,
        reverse: reverse,
        list_ids: listIds,
        order_by: orderBy,
        statuses: statuses,
        subtasks: subtasks,
        assignees: assignees,
        space_ids: spaceIds,
        due_date_gt: dueDateGt,
        due_date_lt: dueDateLt,
        project_ids: projectIds,
        custom_items: customItems,
        date_done_gt: dateDoneGt,
        date_done_lt: dateDoneLt,
        custom_fields: customFields,
        include_closed: includeClosed,
        custom_task_ids: customTaskIds,
        date_created_gt: dateCreatedGt,
        date_created_lt: dateCreatedLt,
        date_updated_gt: dateUpdatedGt,
        date_updated_lt: dateUpdatedLt,
        include_markdown_description: includeMarkdownDescription,
      },
    });
  },
});

export const clickupGetFolderAvailableFields = tool({
  description:
    'Tool to view custom fields available in a ClickUp folder. Use to discover what custom fields can be used when working with tasks in this folder. Only returns folder-level custom fields, not list-level fields.',
  inputSchema: z.object({
    clickupToken: tokenField,
    folderId: z.string().describe('The ID of the folder to retrieve available custom fields from.'),
  }),
  execute: async ({ clickupToken, folderId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/folder/${folderId}/field`);
  },
});

export const clickupGetSpaceAvailableFields = tool({
  description:
    'Retrieves all custom fields available in a ClickUp Space, identified by space_id. Returns Space-level custom fields only.',
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z
      .number()
      .int()
      .describe(
        'The unique numerical identifier of the Space for which custom fields are to be retrieved.',
      ),
  }),
  execute: async ({ clickupToken, spaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/space/${spaceId}/field`);
  },
});

export const clickupGetTask = tool({
  description:
    'Retrieves comprehensive details for a ClickUp task by its ID, supporting standard or custom task IDs (requires `team_id` for custom IDs).',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'The unique identifier of the task to retrieve. This can be the standard ClickUp task ID or a custom task ID if `custom_task_ids` is set to `true` (in which case `team_id` is also required).',
      ),
    teamId: z
      .number()
      .int()
      .optional()
      .describe(
        'The ID of the team. This parameter is required and used only when `custom_task_ids` is set to `true` to identify the custom task ID within that specific team. For example: `custom_task_ids=true&team_id=123`.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to indicate that the `task_id` provided is a custom task ID. If `true`, `team_id` must also be provided. If omitted or `false` (default), `task_id` is treated as a standard task ID.',
      ),
    includeSubtasks: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to include subtasks in the task details response. If omitted or `false` (default), subtasks are not included.',
      ),
    includeMarkdownDescription: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to return the task description in Markdown format. If omitted or `false` (default), the description is returned in plain text. For example: `?include_markdown_description=true`.',
      ),
  }),
  execute: async ({
    clickupToken,
    taskId,
    teamId,
    customTaskIds,
    includeSubtasks,
    includeMarkdownDescription,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/task/${taskId}`, {
      query: {
        team_id: teamId,
        custom_task_ids: customTaskIds,
        include_subtasks: includeSubtasks,
        include_markdown_description: includeMarkdownDescription,
      },
    });
  },
});

export const clickupGetTaskMembers = tool({
  description:
    'Retrieves users with explicit access (directly assigned or shared) to a specific existing task, excluding users with inherited permissions.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z.string().describe('The unique identifier of the task for which to retrieve members.'),
  }),
  execute: async ({ clickupToken, taskId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/task/${taskId}/member`);
  },
});

export const clickupGetTasks = tool({
  description:
    'Retrieves tasks from a specified ClickUp list; only tasks whose home is the given list_id are returned. Closed and archived tasks are excluded by default. Key task attributes may appear only in the response `custom_fields` array, not top-level fields. Fields like `space`, `folder`, `list`, and `custom_type` may be absent; apply null checks. High-volume paginated calls may return HTTP 429; honor th',
  inputSchema: z.object({
    clickupToken: tokenField,
    page: z
      .number()
      .int()
      .optional()
      .describe(
        'The page number of results to fetch, starting at 0. Each page can contain up to 100 tasks. Iterate pages until the response `last_page` flag is true or the returned tasks list is empty to avoid silently missing tasks.',
      ),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "Filter tasks by a list of tag names. Use URL encoding for tags with spaces (e.g., 'this%20tag').",
      ),
    listId: z
      .string()
      .describe(
        "The ID of the list to retrieve tasks from. To find the list_id, copy the link to the list from the ClickUp UI; the list_id is the number following '/li' in the URL. Pass as a numeric string (e.g., '123456789').",
      ),
    reverse: z
      .boolean()
      .optional()
      .describe("Display tasks in reverse order based on the 'order_by' field."),
    archived: z.boolean().optional().describe('Include or exclude archived tasks.'),
    orderBy: z
      .string()
      .optional()
      .describe(
        "Field to order tasks by. Valid options are: 'id', 'created', 'updated', and 'due_date'.",
      ),
    statuses: z
      .array(z.string())
      .optional()
      .describe(
        "Filter tasks by their status. Pass a list of status strings. Use URL encoding for statuses with spaces (e.g., 'to%20do'). To include closed tasks, use the `include_closed` parameter. Values must match workspace configuration exactly (case-s",
      ),
    subtasks: z.boolean().optional().describe('Include subtasks in the results.'),
    assignees: z
      .array(z.string())
      .optional()
      .describe(
        "Filter tasks by assignee user IDs. Accepts a single ID or a list of IDs. IDs can be numeric (e.g., 212519251) or strings (e.g., '212519251').",
      ),
    dueDateGt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with a due date greater than the provided Unix timestamp in milliseconds.',
      ),
    dueDateLt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with a due date less than the provided Unix timestamp in milliseconds.',
      ),
    customItems: z
      .array(z.number().int())
      .optional()
      .describe(
        'Filter by custom task types. For example: `?custom_items[]=0&custom_items[]=1300`. Including `0` returns tasks. Including `1` returns Milestones. Including any other number returns the custom task type as defined in your Workspace.',
      ),
    dateDoneGt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with a completion date greater than the provided Unix timestamp in milliseconds.',
      ),
    dateDoneLt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with a completion date less than the provided Unix timestamp in milliseconds.',
      ),
    customFields: z
      .array(z.string())
      .optional()
      .describe(
        "Filter tasks by custom field values. Provide a list of JSON strings, each defining a custom field filter. Example for a single filter: '[{'field_id':'field_id_1','operator':'=','value':'field_value_1'}]'. For multiple filters: '[{'field_id'",
      ),
    includeClosed: z
      .boolean()
      .optional()
      .describe(
        'Include tasks with a closed status. Closed tasks are excluded by default; set to true to include them.',
      ),
    dateCreatedGt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with a creation date greater than the provided Unix timestamp in milliseconds.',
      ),
    dateCreatedLt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with a creation date less than the provided Unix timestamp in milliseconds.',
      ),
    dateUpdatedGt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with an update date greater than the provided Unix timestamp in milliseconds.',
      ),
    dateUpdatedLt: z
      .number()
      .int()
      .optional()
      .describe(
        'Filter tasks with an update date less than the provided Unix timestamp in milliseconds.',
      ),
    includeMarkdownDescription: z
      .boolean()
      .optional()
      .describe(
        'Return task descriptions in Markdown format. Use the response `text_content` field instead when plain text is needed.',
      ),
  }),
  execute: async ({
    clickupToken,
    page,
    tags,
    listId,
    reverse,
    archived,
    orderBy,
    statuses,
    subtasks,
    assignees,
    dueDateGt,
    dueDateLt,
    customItems,
    dateDoneGt,
    dateDoneLt,
    customFields,
    includeClosed,
    dateCreatedGt,
    dateCreatedLt,
    dateUpdatedGt,
    dateUpdatedLt,
    includeMarkdownDescription,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/list/${listId}/task`, {
      query: {
        page: page,
        tags: tags,
        reverse: reverse,
        archived: archived,
        order_by: orderBy,
        statuses: statuses,
        subtasks: subtasks,
        assignees: assignees,
        due_date_gt: dueDateGt,
        due_date_lt: dueDateLt,
        custom_items: customItems,
        date_done_gt: dateDoneGt,
        date_done_lt: dateDoneLt,
        custom_fields: customFields,
        include_closed: includeClosed,
        date_created_gt: dateCreatedGt,
        date_created_lt: dateCreatedLt,
        date_updated_gt: dateUpdatedGt,
        date_updated_lt: dateUpdatedLt,
        include_markdown_description: includeMarkdownDescription,
      },
    });
  },
});

export const clickupGetTaskTemplates = tool({
  description:
    'Retrieves task templates for a specified Workspace (Team ID), supporting pagination.',
  inputSchema: z.object({
    clickupToken: tokenField,
    page: z
      .number()
      .int()
      .describe('Page number for paginating through templates (starts from 0).'),
    teamId: z
      .string()
      .describe('Unique identifier of the Workspace (Team) to retrieve task templates from.'),
  }),
  execute: async ({ clickupToken, page, teamId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/task_template`, { query: { page: page } });
  },
});

export const clickupGetTaskTimeInStatus = tool({
  description:
    "Retrieves the duration a task has spent in each status, provided the 'Total time in Status' ClickApp is enabled for the Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'The unique identifier of the task. This can be the standard task ID or a custom task ID if `custom_task_ids` is true.',
      ),
    teamId: z
      .number()
      .int()
      .optional()
      .describe(
        'The ID of the team (Workspace) to which the task belongs. This is required only when `custom_task_ids` is set to `true`. For example: `custom_task_ids=true&team_id=1234567`.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If set to `true`, the `task_id` parameter will be interpreted as a custom task ID. When using custom task IDs, the `team_id` must also be provided.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/task/${taskId}/time_in_status`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupGetTeamAvailableFields = tool({
  description:
    'Retrieves all custom fields available in a ClickUp Workspace (Team), identified by team_id. Returns Workspace-level custom fields only.',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .number()
      .int()
      .describe(
        'The unique numerical identifier of the Workspace (Team) for which custom fields are to be retrieved.',
      ),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/field`);
  },
});

export const clickupMoveTaskToHomeList = tool({
  description:
    "Tool to move a task to a new home List using ClickUp Public API v3. Use when you need to change a task's home list (not just add to additional lists).",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z
      .string()
      .describe(
        "The destination list ID to move the task to. This will become the task's new home list.",
      ),
    taskId: z.string().describe('The task ID to move. Use actual task ID, not custom task ID.'),
    workspaceId: z
      .string()
      .describe('The workspace ID containing the task. Required for v3 endpoint.'),
    statusMappings: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Array of status mapping objects to map the task's status from source list to destination list. Each object should contain 'source_status' and 'destination_status' keys. Required when the task's current status doesn't exist in the new list.",
      ),
    moveCustomFields: z
      .boolean()
      .optional()
      .describe(
        'If true, transfer all custom fields from the current list to the destination list. If false or omitted, custom fields are not moved.',
      ),
    customFieldsToMove: z
      .array(z.string())
      .optional()
      .describe(
        'List of specific custom field IDs to transfer when moving the task. Only applies when move_custom_fields is true. If omitted, all custom fields are moved when move_custom_fields is true.',
      ),
  }),
  execute: async ({
    clickupToken,
    listId,
    taskId,
    workspaceId,
    statusMappings,
    moveCustomFields,
    customFieldsToMove,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/tasks/${taskId}/home_list/${listId}`,
      {
        body: nest({
          status_mappings: statusMappings,
          move_custom_fields: moveCustomFields,
          custom_fields_to_move: customFieldsToMove,
        }),
      },
    );
  },
});

export const clickupRemoveCustomFieldValue = tool({
  description:
    'Removes an existing value from a Custom Field on a specific task; this does not delete the Custom Field definition or its predefined options.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        "Identifier of the task. If `custom_task_ids` is true, this is the custom task ID; otherwise, it's the standard task ID.",
      ),
    teamId: z
      .number()
      .int()
      .optional()
      .describe(
        'Numeric ID of the team, required only if `custom_task_ids` is true to identify the task by its custom ID.',
      ),
    fieldId: z
      .string()
      .describe('UUID of the Custom Field whose value will be removed from the task.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe('If true, `task_id` is a custom task ID, and `team_id` must also be provided.'),
  }),
  execute: async ({ clickupToken, taskId, teamId, fieldId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/task/${taskId}/field/${fieldId}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupRemoveTagFromTask = tool({
  description:
    'Removes a tag from a specified task by disassociating it (does not delete the tag from Workspace), succeeding even if the tag is not on the task.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'The ID of the task from which the tag will be removed. This can be the standard task ID or a custom task ID if `custom_task_ids` is set to `true`.',
      ),
    teamId: z.string().optional().describe('The Workspace (Team) ID associated with the task.'),
    tagName: z
      .string()
      .describe('The name of the tag to remove from the task. Tag names are case-sensitive.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` if you are using a custom task ID (instead of the default task ID) to identify the task. If `true`, the `team_id` must also be provided.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, tagName, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/task/${taskId}/tag/${tagName}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupRemoveTaskFromList = tool({
  description:
    "Removes a task from an extra list (not its home list); the 'Tasks in Multiple Lists' ClickApp must be enabled.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z
      .string()
      .describe(
        'Unique numerical identifier of the list from which the task will be removed. This must be an extra list for the task, not its home list.',
      ),
    taskId: z
      .string()
      .describe('Unique identifier of the task to be removed from the specified list.'),
  }),
  execute: async ({ clickupToken, listId, taskId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/list/${listId}/task/${taskId}`);
  },
});

export const clickupSetCustomFieldValue = tool({
  description:
    "Sets or updates a Custom Field's value for a task; the new value (with type-dependent structure, e.g., `{'value': 'text'}` or `{'value': 123, 'value_options': {'currency_type':'USD'}}`) is provided in the JSON request body.",
  inputSchema: z.object({
    clickupToken: tokenField,
    value: z
      .any()
      .describe(
        "The value to set for the Custom Field. Structure depends on field type: Text/Short Text: string (e.g., 'Hello'). Number/Currency/Emoji(Rating): number (e.g., 42). Checkbox: boolean (true/false). Dropdown: option UUID string from type_config",
      ),
    taskId: z
      .string()
      .describe('Task ID to update. Standard ID, or Custom Task ID if `custom_task_ids` is true.'),
    teamId: z.string().optional().describe('Team ID, required if `custom_task_ids` is true.'),
    fieldId: z
      .string()
      .describe(
        "UUID of the Custom Field to update (must be in standard UUID format with hyphens, e.g., '0f079e26-feef-410d-8e8d-2a21a057ee5e'). Obtainable via 'Get Accessible Custom Fields' or 'Get Task' endpoints.",
      ),
    valueOptions: z
      .record(z.any())
      .optional()
      .describe(
        "Optional settings for certain field types. For Date fields: {'time': true} to display time in ClickUp UI. For Currency fields: {'currency_type': 'USD'} to specify currency.",
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe('If true, `task_id` is treated as a Custom Task ID, and `team_id` is required.'),
  }),
  execute: async ({
    clickupToken,
    value,
    taskId,
    teamId,
    fieldId,
    valueOptions,
    customTaskIds,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/task/${taskId}/field/${fieldId}`, {
      body: nest({ value: value, value_options: valueOptions }),
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupUpdateTask = tool({
  description:
    "Updates attributes of an existing task; `team_id` is required if `custom_task_ids` is true, use a single space (' ') for `description` to clear it, and provide at least one modifiable field.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().optional().describe('New task name.'),
    parent: z
      .string()
      .optional()
      .describe(
        'ID of new parent task to make this a subtask; cannot convert subtask to regular task this way.',
      ),
    status: z
      .string()
      .optional()
      .describe('New task status (case-sensitive, must be valid in Workspace).'),
    taskId: z
      .string()
      .describe('Unique task identifier; use custom task ID if `custom_task_ids` is true.'),
    teamId: z.string().optional().describe('Team ID, required if `custom_task_ids` is true.'),
    archived: z.boolean().optional().describe('True to archive, false to unarchive.'),
    dueDate: z.number().int().optional().describe('New due date (Unix timestamp in milliseconds).'),
    priority: z
      .number()
      .int()
      .optional()
      .describe('Priority: 1 (Urgent), 2 (High), 3 (Normal), 4 (Low). Omit or `None` to remove.'),
    startDate: z
      .number()
      .int()
      .optional()
      .describe('New start date (Unix timestamp in milliseconds).'),
    description: z
      .string()
      .optional()
      .describe("New task description; use a single space (' ') to clear."),
    dueDateTime: z
      .boolean()
      .optional()
      .describe('True if `due_date` includes time, false if all-day.'),
    timeEstimate: z.number().int().optional().describe('New time estimate in milliseconds.'),
    assigneesAdd: z
      .array(z.number().int())
      .optional()
      .describe('List of user IDs to add as assignees.'),
    assigneesRem: z
      .array(z.number().int())
      .optional()
      .describe('List of user IDs to remove as assignees.'),
    customItemId: z
      .number()
      .int()
      .optional()
      .describe(
        "Custom task type ID. Use `1` for Milestone, its ID for custom type. Omit/`None` to make regular task (API's 'null' equivalent).",
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe('If true, `task_id` is a custom ID and `team_id` is required.'),
    startDateTime: z
      .boolean()
      .optional()
      .describe('True if `start_date` includes time, false if all-day.'),
  }),
  execute: async ({
    clickupToken,
    name,
    parent,
    status,
    taskId,
    teamId,
    archived,
    dueDate,
    priority,
    startDate,
    description,
    dueDateTime,
    timeEstimate,
    assigneesAdd,
    assigneesRem,
    customItemId,
    customTaskIds,
    startDateTime,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/task/${taskId}`, {
      body: nest({
        name: name,
        parent: parent,
        status: status,
        archived: archived,
        due_date: dueDate,
        priority: priority,
        start_date: startDate,
        description: description,
        due_date_time: dueDateTime,
        time_estimate: timeEstimate,
        assignees__add: assigneesAdd,
        assignees__rem: assigneesRem,
        custom_item_id: customItemId,
        start_date_time: startDateTime,
      }),
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});
