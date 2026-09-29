// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupAddTagsToTimeEntries = tool({
  description:
    'Associates a list of specified tags with one or more time entries within a given Team (Workspace).',
  inputSchema: z.object({
    clickupToken: tokenField,
    tags: z
      .array(z.record(z.any()))
      .describe(
        "A list of tag objects to add to the time entries. Each object should define the tag, typically including a 'name', and optionally 'tag_fg' (foreground color hex code) and 'tag_bg' (background color hex code).",
      ),
    teamId: z
      .number()
      .int()
      .describe('The ID of the Team (Workspace) where the time entries are located.'),
    timeEntryIds: z
      .array(z.string())
      .describe(
        'A list of unique string identifiers for the time entries to which the tags will be added.',
      ),
  }),
  execute: async ({ clickupToken, tags, teamId, timeEntryIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/team/${teamId}/time_entries/tags`, {
      body: nest({ tags: tags, time_entry_ids: timeEntryIds }),
    });
  },
});

export const clickupCreateATimeEntry = tool({
  description: 'Creates a new time entry for a specified team.',
  inputSchema: z.object({
    clickupToken: tokenField,
    end: z
      .number()
      .int()
      .optional()
      .describe(
        "Alias for `stop`. The end time of the time entry, as a Unix timestamp in milliseconds. If both `start` and `end` are provided, the API will use these to determine the entry's actual duration, potentially overriding the `duration` field sent",
      ),
    tid: z
      .string()
      .optional()
      .describe(
        'The ID of the task to associate this time entry with. If `custom_task_ids` is `true`, this should be the custom task ID.',
      ),
    stop: z
      .number()
      .int()
      .optional()
      .describe(
        "The stop time of the time entry, as a Unix timestamp in milliseconds. If both `start` and `stop` are provided, the API will use these to determine the entry's actual duration, potentially overriding the `duration` field sent in the request.",
      ),
    tags: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "An array of Tag objects to apply to the time entry. Each Tag object should define 'name' (string), 'tag_fg' (hex color string for foreground), and 'tag_bg' (hex color string for background). This feature is available for users on the ClickU",
      ),
    start: z
      .number()
      .int()
      .describe('The start time of the time entry, as a Unix timestamp in milliseconds.'),
    teamIdAlt: z
      .string()
      .describe(
        'The Workspace ID (also called Team ID in ClickUp API) where the time entry will be added. This goes in the URL path.',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the Team, required only if `custom_task_ids` is set to `true`. This specifies the team context for the custom task ID. Example: `custom_task_ids=true&team_id=123`.',
      ),
    assignee: z
      .number()
      .int()
      .optional()
      .describe(
        'The user ID of the person to assign this time entry to. Workspace owners and admins can assign to any user ID. Workspace members can only assign to their own user ID.',
      ),
    billable: z
      .boolean()
      .optional()
      .describe(
        'Indicates whether the time entry is billable. Set to `true` if billable, `false` or omit if not.',
      ),
    duration: z
      .number()
      .int()
      .describe(
        "The duration of the time entry in milliseconds. Note: If `start` and `end` (or `stop`) times are also provided in the request, the ClickUp API will calculate the duration based on `start` and `end`/`stop`, and this `duration` field's value ",
      ),
    description: z.string().optional().describe('An optional description for the time entry.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If `true`, the `tid` parameter will be interpreted as a custom task ID. If this is `true`, the `team_id` query parameter must also be provided to specify the team context for the custom task ID.',
      ),
  }),
  execute: async ({
    clickupToken,
    end,
    tid,
    stop,
    tags,
    start,
    teamIdAlt,
    teamId,
    assignee,
    billable,
    duration,
    description,
    customTaskIds,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    const teamIdPath = teamIdAlt !== undefined ? teamIdAlt : teamId;
    return cuPost(clickupToken, V2, `/team/${teamIdPath}/time_entries`, {
      body: nest({
        end: end,
        tid: tid,
        stop: stop,
        tags: tags,
        start: start,
        assignee: assignee,
        billable: billable,
        duration: duration,
        description: description,
      }),
      query: { custom_task_ids: customTaskIds },
    });
  },
});

export const clickupDeleteTimeEntry = tool({
  description:
    'Deletes an existing time entry, specified by `timer_id`, from a Workspace identified by `team_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .describe('Unique identifier of the Workspace from which the time entry will be deleted.'),
    timerId: z.string().describe('Unique identifier of the time entry to be deleted.'),
  }),
  execute: async ({ clickupToken, teamId, timerId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/team/${teamId}/time_entries/${timerId}`);
  },
});

export const clickupDeleteTimeTracked = tool({
  description:
    'Deletes a time-tracked interval from a task; use this legacy endpoint for older time tracking systems.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe('Task ID; can be standard or custom if `custom_task_ids` is set to true.'),
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the team. This is required only if `custom_task_ids` is set to `true` to correctly identify the task using its custom ID. For example: `custom_task_ids=true&team_id=123`.',
      ),
    intervalId: z.string().describe('ID of the time tracking interval (entry) to be deleted.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` if `task_id` refers to a custom task ID. If `true`, `team_id` must also be provided. If omitted or `false`, `task_id` is treated as a standard ID.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, intervalId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/task/${taskId}/time/${intervalId}`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupGetAllTagsFromTimeEntries = tool({
  description:
    'Retrieves all unique tags applied to time entries within a specified ClickUp Team (Workspace).',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .describe(
        'The unique numerical identifier of the ClickUp Team (Workspace) for which to retrieve time entry tags.',
      ),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/time_entries/tags`);
  },
});

export const clickupGetRunningTimeEntry = tool({
  description:
    "Retrieves the currently active time entry for a user in a Workspace; a negative 'duration' in its data indicates it's running, and the response may be empty if no entry is active.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.number().int().describe('Unique identifier for the Workspace (Team).'),
    assignee: z
      .number()
      .int()
      .optional()
      .describe(
        'Identifier of the user for the time entry; defaults to the authenticated user if not provided.',
      ),
  }),
  execute: async ({ clickupToken, teamId, assignee }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/time_entries/current`, {
      query: { assignee: assignee },
    });
  },
});

export const clickupGetTimeEntriesInDateRange = tool({
  description:
    'Retrieves time entries for a specified Team (Workspace ID) within a date range (defaults to the last 30 days for the authenticated user if dates are omitted); active timers are indicated by negative durations in the response.',
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z
      .string()
      .optional()
      .describe(
        'Filter time entries to include only those associated with tasks in a specific List ID.',
      ),
    taskId: z
      .string()
      .optional()
      .describe(
        'Filter time entries to include only those associated with a specific task ID. Use with `custom_task_ids` if referring to a custom ID.',
      ),
    teamIdAlt: z
      .string()
      .describe(
        'The Workspace ID (also called Team ID in ClickUp API) for which to retrieve time entries. This goes in the URL path.',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the Team (Workspace) to use for context when `custom_task_ids` is `true`. This helps resolve custom task IDs. Example: `custom_task_ids=true&team_id=123`.',
      ),
    assignee: z
      .string()
      .optional()
      .describe(
        "Filter time entries by user ID(s). For multiple assignees, provide a comma-separated string of user IDs. Example: `1234,9876`. Note: Access to other users' time entries typically requires Workspace Owner/Admin privileges.",
      ),
    endDate: z
      .number()
      .int()
      .optional()
      .describe(
        'The end date of the date range for filtering time entries, specified as a Unix timestamp in milliseconds. If omitted, defaults to the current date.',
      ),
    spaceId: z
      .string()
      .optional()
      .describe(
        'Filter time entries to include only those associated with tasks in a specific Space ID.',
      ),
    folderId: z
      .string()
      .optional()
      .describe(
        'Filter time entries to include only those associated with tasks in a specific Folder ID.',
      ),
    startDate: z
      .number()
      .int()
      .optional()
      .describe(
        'The start date of the date range for filtering time entries, specified as a Unix timestamp in milliseconds. If omitted, defaults to 30 days prior to the current date.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` if the `task_id` parameter refers to a custom task ID. If `true`, the `team_id` query parameter must also be provided for context.',
      ),
    includeTaskTags: z
      .boolean()
      .optional()
      .describe(
        'If true, includes task tags in the response for time entries associated with tasks.',
      ),
    includeLocationNames: z
      .boolean()
      .optional()
      .describe(
        'If true, includes the names of the List, Folder, and Space in the response, along with their respective IDs (`list_id`, `folder_id`, `space_id`).',
      ),
  }),
  execute: async ({
    clickupToken,
    listId,
    taskId,
    teamIdAlt,
    teamId,
    assignee,
    endDate,
    spaceId,
    folderId,
    startDate,
    customTaskIds,
    includeTaskTags,
    includeLocationNames,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    const teamIdPath = teamIdAlt !== undefined ? teamIdAlt : teamId;
    return cuGet(clickupToken, V2, `/team/${teamIdPath}/time_entries`, {
      query: {
        list_id: listId,
        task_id: taskId,
        assignee: assignee,
        end_date: endDate,
        space_id: spaceId,
        folder_id: folderId,
        start_date: startDate,
        custom_task_ids: customTaskIds,
        include_task_tags: includeTaskTags,
        include_location_names: includeLocationNames,
      },
    });
  },
});

export const clickupGetTimeEntry = tool({
  description:
    'Fetches a specific time entry by its ID for a given team; a negative duration in the response indicates an active timer.',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.number().int().describe('Unique identifier for the Team (Workspace).'),
    timerId: z
      .string()
      .describe(
        "Unique identifier of the time entry. Can be obtained from the 'Get Time Entries Within a Date Range' action.",
      ),
    includeTask: z
      .boolean()
      .optional()
      .describe(
        'If true and the time entry is associated with a task, includes task details in the response.',
      ),
    includeLocationNames: z
      .boolean()
      .optional()
      .describe(
        'If true, includes names of the List, Folder, and Space associated with the time entry, alongside their IDs.',
      ),
  }),
  execute: async ({ clickupToken, teamId, timerId, includeTask, includeLocationNames }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/time_entries/${timerId}`, {
      query: { include_task: includeTask, include_location_names: includeLocationNames },
    });
  },
});

export const clickupGetTimeEntryHistory = tool({
  description:
    'Retrieves the modification history for an existing time entry within a specific ClickUp Team (Workspace).',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .describe('Unique identifier for the Team (Workspace) containing the time entry.'),
    timerId: z
      .string()
      .describe('Unique identifier of the time entry for which to retrieve history.'),
  }),
  execute: async ({ clickupToken, teamId, timerId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/time_entries/${timerId}/history`);
  },
});

export const clickupGetTrackedTime = tool({
  description:
    'Retrieves tracked time for a task using a legacy endpoint; prefer newer Time Tracking API endpoints for managing time entries.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'The ID of the task for which to retrieve tracked time. This can be the standard task ID or a custom task ID if `custom_task_ids` is set to `true`.',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the team. This is required and used only when the `custom_task_ids` parameter is set to `true`. For example: `custom_task_ids=true&team_id=123`.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` if the `task_id` provided is a custom task ID. If `true`, the `team_id` must also be provided.',
      ),
  }),
  execute: async ({ clickupToken, taskId, teamId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/task/${taskId}/time/`, {
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupRemoveTagsFromTimeEntries = tool({
  description:
    'Removes tags from specified time entries in a team, without deleting the tags from the workspace.',
  inputSchema: z.object({
    clickupToken: tokenField,
    tags: z
      .array(z.record(z.any()))
      .describe(
        "List of tags to remove, typically identified by name (e.g., `{'name': 'tag_name'}`).",
      ),
    teamId: z
      .string()
      .describe('The unique identifier for the Team (Workspace) that owns the time entries.'),
    timeEntryIds: z.array(z.string()).describe('List of time entry IDs from which to remove tags.'),
  }),
  execute: async ({ clickupToken, tags, teamId, timeEntryIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/team/${teamId}/time_entries/tags`, {
      body: nest({ tags: tags, time_entry_ids: timeEntryIds }),
    });
  },
});

export const clickupStartTimeEntry = tool({
  description:
    'Starts a new time entry (timer) in the specified Team (Workspace), optionally associating it with a task, adding a description, setting billable status, or applying tags (tags feature requires Business Plan or higher).',
  inputSchema: z.object({
    clickupToken: tokenField,
    tid: z
      .string()
      .optional()
      .describe(
        'The ID of the task to associate with this time entry. If `custom_task_ids` is true, this should be the custom task ID.',
      ),
    tags: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Array of tag objects (each with 'name', optionally 'tag_bg', 'tag_fg' for colors) to apply. This feature requires Business Plan or higher. E.g., `[{'name': 'Urgent', 'tag_bg': '#FF0000'}]`.",
      ),
    teamIdAlt: z
      .string()
      .describe(
        'The Workspace ID (also called Team ID in ClickUp API) for this time entry. This goes in the URL path.',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the team for resolving custom task IDs. Required only if `custom_task_ids` is set to `true`. For example: `custom_task_ids=true&team_id=123`.',
      ),
    billable: z.boolean().optional().describe('Specifies if the time entry is billable.'),
    description: z.string().optional().describe('Description for the time entry.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If set to `true`, the `tid` field will be interpreted as a custom task ID. Requires `team_id` query parameter to be set for custom task ID resolution.',
      ),
  }),
  execute: async ({
    clickupToken,
    tid,
    tags,
    teamIdAlt,
    teamId,
    billable,
    description,
    customTaskIds,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    const teamIdPath = teamIdAlt !== undefined ? teamIdAlt : teamId;
    return cuPost(clickupToken, V2, `/team/${teamIdPath}/time_entries/start`, {
      body: nest({ tid: tid, tags: tags, billable: billable, description: description }),
      query: { custom_task_ids: customTaskIds },
    });
  },
});

export const clickupStopTimeEntry = tool({
  description:
    "Stops the authenticated user's currently active time entry in the specified Team (Workspace), which requires an existing time entry to be running.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .describe(
        'The unique numeric identifier of the Team (Workspace) where the time entry is being tracked.',
      ),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/team/${teamId}/time_entries/stop`);
  },
});

export const clickupTrackTime = tool({
  description:
    "Records a time entry for a task using ClickUp's legacy time tracking system; newer endpoints are generally recommended.",
  inputSchema: z.object({
    clickupToken: tokenField,
    end: z
      .number()
      .int()
      .describe('The end time of the time entry, as a Unix timestamp in milliseconds.'),
    time: z
      .number()
      .int()
      .describe(
        'The duration of the time entry, in milliseconds. If `start` and `end` are both provided, this `time` field is ignored. If `time` is passed with `start` but no `end`, then `end` will be calculated. If `time` is passed with `end` but no `star',
      ),
    start: z
      .number()
      .int()
      .describe('The start time of the time entry, as a Unix timestamp in milliseconds.'),
    taskId: z.string().describe('The unique identifier of the task to track time for.'),
    teamId: z
      .string()
      .optional()
      .describe(
        'The ID of the team. Required and used only if `custom_task_ids` is set to `true` to identify the task by its custom ID. For example: `custom_task_ids=true&team_id=123`.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If `true`, the `task_id` is treated as a custom task ID. Requires `team_id` to be provided.',
      ),
  }),
  execute: async ({ clickupToken, end, time, start, taskId, teamId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/task/${taskId}/time/`, {
      body: nest({ end: end, time: time, start: start }),
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupUpdateTimeEntry = tool({
  description:
    'Updates an existing ClickUp time entry. Requires team_id (workspace ID) and timer_id (time entry ID). Optional fields: description, tags, tag_action, start/end times, duration, tid (task ID), billable status. Note: start and end times should be provided together. This is an Advanced Time Tracking feature that may require a Business Plan or higher.',
  inputSchema: z.object({
    clickupToken: tokenField,
    end: z
      .number()
      .int()
      .optional()
      .describe(
        'New end time (Unix timestamp in milliseconds). If provided, `start` must also be provided.',
      ),
    tid: z
      .string()
      .optional()
      .describe(
        'The ID of the task for this time entry; if `custom_task_ids` is `true`, this should be the custom task ID.',
      ),
    tags: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "List of tag objects (e.g., `{'name': 'your-tag'}`) for the time entry. Time tracking labels are for Business Plan and above users.",
      ),
    start: z
      .number()
      .int()
      .optional()
      .describe(
        'New start time (Unix timestamp in milliseconds). If provided, `end` must also be provided.',
      ),
    teamId: z
      .string()
      .describe('The ID of the Team (Workspace) for the time entry. Path parameter.'),
    billable: z.boolean().optional().describe('Indicates whether the time entry is billable.'),
    duration: z
      .number()
      .int()
      .optional()
      .describe(
        'New duration of the time entry in milliseconds; can be an alternative to `start` and `end` times.',
      ),
    timerId: z
      .string()
      .describe('The unique identifier of the time entry to update. Path parameter.'),
    tagAction: z
      .string()
      .optional()
      .describe("Specifies how to handle `tags` (e.g., 'add', 'remove')."),
    description: z.string().optional().describe('A new description for the time entry.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If `true`, `tid` is interpreted as a custom task ID. When true, the team_id path parameter value will also be used as a query parameter.',
      ),
  }),
  execute: async ({
    clickupToken,
    end,
    tid,
    tags,
    start,
    teamId,
    billable,
    duration,
    timerId,
    tagAction,
    description,
    customTaskIds,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/team/${teamId}/time_entries/${timerId}`, {
      body: nest({
        end: end,
        tid: tid,
        tags: tags,
        start: start,
        billable: billable,
        duration: duration,
        tag_action: tagAction,
        description: description,
      }),
      query: { custom_task_ids: customTaskIds },
    });
  },
});

export const clickupUpdateTimeEntryTag = tool({
  description:
    'Updates the name, background color, and/or foreground color for an existing time entry tag, identified by its current `name` and `team_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The current name of the time entry tag to be modified.'),
    tagBg: z
      .string()
      .describe('The new background color for the tag, specified as a hexadecimal color code.'),
    tagFg: z
      .string()
      .describe(
        'The new foreground (text) color for the tag, specified as a hexadecimal color code.',
      ),
    teamId: z
      .string()
      .describe('The unique identifier of the Team (Workspace) where the time entry tag exists.'),
    newName: z.string().describe('The new name to be assigned to the time entry tag.'),
  }),
  execute: async ({ clickupToken, name, tagBg, tagFg, teamId, newName }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/team/${teamId}/time_entries/tags`, {
      body: nest({ name: name, tag_bg: tagBg, tag_fg: tagFg, new_name: newName }),
    });
  },
});

export const clickupUpdateTimeTracked = tool({
  description:
    'Edits a legacy time-tracked interval for a task (identified by `task_id` and `interval_id`) to update its start/end times and duration; `team_id` is required if `custom_task_ids` is true.',
  inputSchema: z.object({
    clickupToken: tokenField,
    end: z
      .number()
      .int()
      .describe('New end date and time for the interval as a Unix timestamp in milliseconds.'),
    time: z
      .number()
      .int()
      .describe(
        'New total duration of the time interval in milliseconds; typically the difference between `end` and `start`.',
      ),
    start: z
      .number()
      .int()
      .describe('New start date and time for the interval as a Unix timestamp in milliseconds.'),
    taskId: z
      .string()
      .describe('Unique task identifier; refers to custom task ID if `custom_task_ids` is true.'),
    teamId: z.number().int().optional().describe('Team ID, required if `custom_task_ids` is true.'),
    intervalId: z.string().describe('Unique identifier of the time interval record to edit.'),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'If true, `task_id` is treated as a custom task ID, and `team_id` must be provided.',
      ),
  }),
  execute: async ({
    clickupToken,
    end,
    time,
    start,
    taskId,
    teamId,
    intervalId,
    customTaskIds,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/task/${taskId}/time/${intervalId}`, {
      body: nest({ end: end, time: time, start: start }),
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});
