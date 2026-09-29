// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateFolderView = tool({
  description:
    'Creates a new, highly customizable view within a specific ClickUp folder using its `folder_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('Name for the new view.'),
    type: z
      .string()
      .describe(
        'The type of view to create. Options include: `list`, `board`, `calendar`, `table`, `timeline`, `workload`, `activity`, `map`, `conversation`, or `gantt`. ',
      ),
    folderId: z.string().describe('Numeric ID of the folder where the new view will be created.'),
    divideDir: z
      .any()
      .optional()
      .describe(
        'This field must be `null` (None). It is intended for specifying sort direction within divided sections, but its configuration is not fully detailed.',
      ),
    filtersOp: z
      .string()
      .optional()
      .describe(
        'Operator for combining filters. The available operator (`op`) values are `AND` and `OR`. Required when any filter parameter is provided.',
      ),
    divideField: z
      .any()
      .optional()
      .describe(
        'This field must be `null` (None). It is intended for view division features (e.g., swimlanes) whose specific configuration via this parameter is not fully detailed.',
      ),
    groupingDir: z
      .number()
      .int()
      .optional()
      .describe(
        'Set a group sort order. Use `1` for ascending (e.g., urgent priority at top of the view, and tasks with no priority at the bottom) or `-1` to reverse the order (e.g., tasks with no priority at the top). Required when any grouping parameter ',
      ),
    columnsFields: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Array of field objects to display as columns in the view. Each element must be an object. Custom Fields require the `_cf` prefix followed by the Custom Field ID (e.g., `_cf_xxxxxxxx`).',
      ),
    filtersFields: z
      .array(z.string())
      .optional()
      .describe(
        "Fields to filter by. Each element represents a filter condition. View the list of available fields in ClickUp's API documentation. Required when any filter parameter is provided.",
      ),
    filtersSearch: z
      .string()
      .optional()
      .describe(
        'Text string to search for within tasks, comments, and subtasks in the view. Required when any filter parameter is provided.',
      ),
    groupingField: z
      .string()
      .optional()
      .describe(
        'Field to group tasks by. Options include: `none`, `status`, `priority`, `assignee`, `tag`, or `dueDate`. When any grouping parameter is provided, `grouping__field`, `grouping__dir`, `grouping__collapsed`, and `grouping__ignore` are all requ',
      ),
    sortingFields: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Fields to sort tasks by. Each element must be an object with 'field' and 'dir' properties. 'dir' should be 1 for ascending or -1 for descending. Refer to ClickUp API for the exact structure.",
      ),
    groupingIgnore: z
      .boolean()
      .optional()
      .describe(
        "If `true`, tasks with no value for the `grouping__field` will not be grouped and will appear in a separate 'Ungrouped' section. Required when any grouping parameter is provided.",
      ),
    divideCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'Array of identifiers for divided sections to collapse by default, or null if no sections should be collapsed.',
      ),
    groupingCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        "An array of group identifiers (e.g., status names like 'Open', assignee IDs as strings like '123') that should be initially collapsed in the view. These identifiers depend on the `grouping__field` used. Required when any grouping parameter ",
      ),
    filtersShowClosed: z
      .boolean()
      .optional()
      .describe('If `true`, tasks with a closed status are included in the view.'),
    settingsMeComments: z
      .boolean()
      .optional()
      .describe(
        "In 'Me Mode', if `true`, show only comments where the current user is mentioned or assigned.",
      ),
    settingsMeSubtasks: z
      .boolean()
      .optional()
      .describe("In 'Me Mode', if `true`, show only subtasks assigned to the current user."),
    settingsShowImages: z
      .boolean()
      .optional()
      .describe('If `true`, display task cover images or image attachments.'),
    settingsMeChecklists: z
      .boolean()
      .optional()
      .describe("In 'Me Mode', if `true`, show only checklists assigned to the current user."),
    settingsShowSubtasks: z
      .number()
      .int()
      .optional()
      .describe(
        'Controls subtask visibility. Acceptable integer values are `1` (show subtasks as separate tasks), `2` (expand subtasks under parent tasks), or `3` (collapse subtasks under parent tasks). ',
      ),
    teamSidebarAssignees: z
      .array(z.string())
      .optional()
      .describe(
        "List of user IDs (as strings). Tasks assigned to these users will appear in the 'Assignees' section of the team sidebar.",
      ),
    settingsShowAssignees: z.boolean().optional().describe('If `true`, display task assignees.'),
    settingsShowTaskLocations: z
      .boolean()
      .optional()
      .describe(
        'If `true`, display the List, Folder, and Space location for tasks. When any settings parameter is provided, a complete settings object with all settings keys is required.',
      ),
    settingsShowClosedSubtasks: z
      .boolean()
      .optional()
      .describe('If `true`, include closed subtasks in the view.'),
    teamSidebarUnassignedTasks: z
      .boolean()
      .optional()
      .describe('If `true`, unassigned tasks will be shown in the team sidebar.'),
    teamSidebarAssignedComments: z
      .boolean()
      .optional()
      .describe('If `true`, comments assigned to users will be shown in the team sidebar.'),
    settingsCollapseEmptyColumns: z
      .string()
      .optional()
      .describe(
        "Specifies whether to collapse columns with no tasks (e.g., in Board view). Common string values are 'true' or 'false'.",
      ),
    settingsShowSubtaskParentNames: z
      .boolean()
      .optional()
      .describe('If `true`, display parent task names for subtasks.'),
  }),
  execute: async ({
    clickupToken,
    name,
    type,
    folderId,
    divideDir,
    filtersOp,
    divideField,
    groupingDir,
    columnsFields,
    filtersFields,
    filtersSearch,
    groupingField,
    sortingFields,
    groupingIgnore,
    divideCollapsed,
    groupingCollapsed,
    filtersShowClosed,
    settingsMeComments,
    settingsMeSubtasks,
    settingsShowImages,
    settingsMeChecklists,
    settingsShowSubtasks,
    teamSidebarAssignees,
    settingsShowAssignees,
    settingsShowTaskLocations,
    settingsShowClosedSubtasks,
    teamSidebarUnassignedTasks,
    teamSidebarAssignedComments,
    settingsCollapseEmptyColumns,
    settingsShowSubtaskParentNames,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/folder/${folderId}/view`, {
      body: nest({
        name: name,
        type: type,
        divide__dir: divideDir,
        filters__op: filtersOp,
        divide__field: divideField,
        grouping__dir: groupingDir,
        columns__fields: columnsFields,
        filters__fields: filtersFields,
        filters__search: filtersSearch,
        grouping__field: groupingField,
        sorting__fields: sortingFields,
        grouping__ignore: groupingIgnore,
        divide__collapsed: divideCollapsed,
        grouping__collapsed: groupingCollapsed,
        filters__show__closed: filtersShowClosed,
        settings__me__comments: settingsMeComments,
        settings__me__subtasks: settingsMeSubtasks,
        settings__show__images: settingsShowImages,
        settings__me__checklists: settingsMeChecklists,
        settings__show__subtasks: settingsShowSubtasks,
        team__sidebar__assignees: teamSidebarAssignees,
        settings__show__assignees: settingsShowAssignees,
        settings__show__task__locations: settingsShowTaskLocations,
        settings__show__closed__subtasks: settingsShowClosedSubtasks,
        team__sidebar__unassigned__tasks: teamSidebarUnassignedTasks,
        team__sidebar__assigned__comments: teamSidebarAssignedComments,
        settings__collapse__empty__columns: settingsCollapseEmptyColumns,
        settings__show__subtask__parent__names: settingsShowSubtaskParentNames,
      }),
    });
  },
});

export const clickupCreateListView = tool({
  description:
    'Creates a new, customizable view (e.g., list, board, calendar) within a specified ClickUp List, requiring an existing list_id accessible by the user.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('Name for the new view.'),
    type: z
      .string()
      .describe(
        'View type (e.g., `list`, `board`, `calendar`, `table`, `timeline`, `workload`, `activity`, `map`, `conversation`, `gantt`).',
      ),
    listId: z.string().describe('Numeric ID of the List where the new view will be created.'),
    divideDir: z
      .number()
      .int()
      .optional()
      .describe('Direction for secondary grouping: `1` for ascending, `-1` for descending.'),
    filtersOp: z
      .string()
      .optional()
      .describe(
        'Logical operator for combining filters: `AND` for all conditions, `OR` for any condition.',
      ),
    divideField: z
      .string()
      .optional()
      .describe('Field for secondary grouping (dividing tasks within primary groups).'),
    groupingDir: z
      .number()
      .int()
      .optional()
      .describe(
        'Group sort order: `1` for ascending (e.g., urgent priority top), `-1` for descending (e.g., no priority top).',
      ),
    columnsFields: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Array of column field objects. Each object must have 'field' (e.g., 'name', 'status', 'assignee', 'dueDate', or '_cf_FIELD_ID' for Custom Fields).",
      ),
    filtersFields: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Array of filter field objects. Each object must have 'field' (e.g., 'assignee', 'status', 'priority', 'tags'), 'op' (e.g., 'EQ', 'NOT', 'IN', 'ANY'), and 'values' (array of filter values). Required when any filter parameter is provided.",
      ),
    filtersSearch: z
      .string()
      .optional()
      .describe('Search string to filter tasks by name or content.'),
    groupingField: z
      .string()
      .optional()
      .describe(
        'Field for grouping tasks (e.g., `none`, `status`, `priority`, `assignee`, `tag`, `dueDate`).',
      ),
    sortingFields: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "Array of sort field objects. Each object must have 'field' (e.g., 'dateCreated', 'name', 'dueDate', 'priority') and optionally 'dir' (1 for ascending, -1 for descending).",
      ),
    groupingIgnore: z
      .boolean()
      .optional()
      .describe('If `true`, hides tasks not falling into any specified group.'),
    divideCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'Array of identifiers for divided sections to collapse by default, or null if no sections should be collapsed.',
      ),
    groupingCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'List of group identifiers (e.g., status names, assignee IDs) to collapse by default.',
      ),
    filtersShowClosed: z
      .boolean()
      .optional()
      .describe('If `true`, includes closed tasks in the view.'),
    settingsMeComments: z
      .boolean()
      .optional()
      .describe(
        "If `true`, enables 'Me Mode' for comments, filtering to tasks where the current user is involved in comments.",
      ),
    settingsMeSubtasks: z
      .boolean()
      .optional()
      .describe(
        "If `true`, enables 'Me Mode' for subtasks, filtering to subtasks assigned to the current user.",
      ),
    settingsShowImages: z
      .boolean()
      .optional()
      .describe('If `true`, displays cover images or image attachments for tasks.'),
    settingsMeChecklists: z
      .boolean()
      .optional()
      .describe(
        "If `true`, enables 'Me Mode' for checklists, filtering to tasks with checklists assigned to the current user.",
      ),
    settingsShowSubtasks: z
      .number()
      .int()
      .optional()
      .describe(
        'Subtask visibility: `1` (separate tasks), `2` (expanded under parent), `3` (collapsed under parent).',
      ),
    teamSidebarAssignees: z
      .array(z.string())
      .optional()
      .describe('List of user IDs for quick assignee filtering in the team sidebar.'),
    settingsShowAssignees: z
      .boolean()
      .optional()
      .describe("If `true`, shows assignees' avatars or names on tasks."),
    settingsShowTaskLocations: z
      .boolean()
      .optional()
      .describe("If `true`, displays task's location (e.g., List, Folder, Space) in the view."),
    settingsShowClosedSubtasks: z
      .boolean()
      .optional()
      .describe('If `true`, displays closed subtasks in the view.'),
    teamSidebarUnassignedTasks: z
      .boolean()
      .optional()
      .describe('If `true`, team sidebar includes filter for unassigned tasks.'),
    teamSidebarAssignedComments: z
      .boolean()
      .optional()
      .describe('If `true`, team sidebar includes filter for tasks with assigned comments.'),
    settingsCollapseEmptyColumns: z
      .string()
      .optional()
      .describe(
        "Controls collapsing of empty columns. Values like 'true', 'false', or specific keywords (see ClickUp API).",
      ),
    settingsShowSubtaskParentNames: z
      .boolean()
      .optional()
      .describe('If `true`, displays parent task names alongside subtasks.'),
  }),
  execute: async ({
    clickupToken,
    name,
    type,
    listId,
    divideDir,
    filtersOp,
    divideField,
    groupingDir,
    columnsFields,
    filtersFields,
    filtersSearch,
    groupingField,
    sortingFields,
    groupingIgnore,
    divideCollapsed,
    groupingCollapsed,
    filtersShowClosed,
    settingsMeComments,
    settingsMeSubtasks,
    settingsShowImages,
    settingsMeChecklists,
    settingsShowSubtasks,
    teamSidebarAssignees,
    settingsShowAssignees,
    settingsShowTaskLocations,
    settingsShowClosedSubtasks,
    teamSidebarUnassignedTasks,
    teamSidebarAssignedComments,
    settingsCollapseEmptyColumns,
    settingsShowSubtaskParentNames,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/list/${listId}/view`, {
      body: nest({
        name: name,
        type: type,
        divide__dir: divideDir,
        filters__op: filtersOp,
        divide__field: divideField,
        grouping__dir: groupingDir,
        columns__fields: columnsFields,
        filters__fields: filtersFields,
        filters__search: filtersSearch,
        grouping__field: groupingField,
        sorting__fields: sortingFields,
        grouping__ignore: groupingIgnore,
        divide__collapsed: divideCollapsed,
        grouping__collapsed: groupingCollapsed,
        filters__show__closed: filtersShowClosed,
        settings__me__comments: settingsMeComments,
        settings__me__subtasks: settingsMeSubtasks,
        settings__show__images: settingsShowImages,
        settings__me__checklists: settingsMeChecklists,
        settings__show__subtasks: settingsShowSubtasks,
        team__sidebar__assignees: teamSidebarAssignees,
        settings__show__assignees: settingsShowAssignees,
        settings__show__task__locations: settingsShowTaskLocations,
        settings__show__closed__subtasks: settingsShowClosedSubtasks,
        team__sidebar__unassigned__tasks: teamSidebarUnassignedTasks,
        team__sidebar__assigned__comments: teamSidebarAssignedComments,
        settings__collapse__empty__columns: settingsCollapseEmptyColumns,
        settings__show__subtask__parent__names: settingsShowSubtaskParentNames,
      }),
    });
  },
});

export const clickupCreateSpaceView = tool({
  description:
    'Creates a customizable view (e.g., List, Board, Gantt) within a specified ClickUp Space, allowing configuration of grouping, sorting, filtering, and display settings.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The name for the new view.'),
    type: z
      .string()
      .describe(
        'The type of view to create. Valid options include: `list`, `board`, `calendar`, `table`, `timeline`, `workload`, `activity`, `map`, `conversation`, or `gantt`.',
      ),
    spaceId: z
      .string()
      .describe('The unique identifier of the Space where the new view will be created.'),
    divideDir: z
      .any()
      .optional()
      .describe(
        'Sort order for divided sections. Must be `None` if included, as sort direction for divisions may not be applicable here.',
      ),
    filtersOp: z
      .string()
      .optional()
      .describe(
        "Logical operator (`AND` or `OR`) for combining filters. When ANY filter parameter is provided, ALL filter fields (op, fields, search, show_closed) are required. Defaults to 'AND' if not specified when other filter fields are present.",
      ),
    divideField: z
      .any()
      .optional()
      .describe(
        'Field to divide tasks by. Must be `None` if included, as division by field may not be applicable for Space views via this action.',
      ),
    groupingDir: z
      .number()
      .int()
      .optional()
      .describe(
        'Group sort order: `1` for ascending, `-1` for descending. Required when any grouping parameter is provided.',
      ),
    columnsFields: z
      .array(z.string())
      .optional()
      .describe(
        "Field identifiers for columns. Use standard field names (e.g., 'status') or Custom Field IDs with `_cf` prefix (e.g., 'ID_cf').",
      ),
    filtersFields: z
      .array(z.string())
      .optional()
      .describe(
        'Fields to apply filters on. When ANY filter parameter is provided, ALL filter fields (op, fields, search, show_closed) are required. Defaults to empty array if not specified when other filter fields are present. Refer to ClickUp API documen',
      ),
    filtersSearch: z
      .string()
      .optional()
      .describe(
        'A search string to filter tasks by keywords or specific criteria within the view. When ANY filter parameter is provided, ALL filter fields (op, fields, search, show_closed) are required. Defaults to empty string if not specified when other ',
      ),
    groupingField: z
      .string()
      .optional()
      .describe(
        'The field to group tasks by. Options include: `none`, `status`, `priority`, `assignee`, `tag`, or `dueDate`. When any grouping parameter is provided, `grouping__field`, `grouping__dir`, `grouping__collapsed`, and `grouping__ignore` are all ',
      ),
    sortingFields: z
      .array(z.string())
      .optional()
      .describe(
        'Fields to sort tasks by (e.g., `dueDate`, `priority`). Refer to ClickUp API documentation for a complete list of sortable fields.',
      ),
    groupingIgnore: z
      .boolean()
      .optional()
      .describe(
        'If `True`, tasks not matching grouping criteria are hidden; otherwise, they are shown in a default group. Required when any grouping parameter is provided.',
      ),
    divideCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'Array of identifiers for divided sections to collapse by default, or null if no sections should be collapsed.',
      ),
    groupingCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        "A list of string identifiers for groups that should be collapsed by default (e.g., status names like 'Closed', or assignee user IDs if grouping by assignee). Required when any grouping parameter is provided.",
      ),
    filtersShowClosed: z
      .boolean()
      .optional()
      .describe(
        'If `True`, closed tasks are included in the view. When ANY filter parameter is provided, ALL filter fields (op, fields, search, show_closed) are required. Defaults to false if not specified when other filter fields are present.',
      ),
    settingsMeComments: z
      .boolean()
      .optional()
      .describe(
        "If `True`, in 'Me Mode', this setting filters for or highlights tasks where the current user has made comments. When ANY settings parameter is provided, ALL settings fields are required. Defaults to false if not specified when other setting",
      ),
    settingsMeSubtasks: z
      .boolean()
      .optional()
      .describe(
        "If `True`, in 'Me Mode', this setting filters for or highlights subtasks assigned to the current user. When ANY settings parameter is provided, ALL settings fields are required. Defaults to false if not specified when other settings fields ",
      ),
    settingsShowImages: z
      .boolean()
      .optional()
      .describe(
        'If `True`, displays cover images or image attachments directly on task cards in the view. When ANY settings parameter is provided, ALL settings fields are required. Defaults to true if not specified when other settings fields are present.',
      ),
    settingsMeChecklists: z
      .boolean()
      .optional()
      .describe(
        "If `True`, in 'Me Mode', this setting filters for or highlights tasks with checklist items assigned to the current user. When ANY settings parameter is provided, ALL settings fields are required. Defaults to false if not specified when othe",
      ),
    settingsShowSubtasks: z
      .number()
      .int()
      .optional()
      .describe(
        'How subtasks are displayed: `1` (show as separate tasks), `2` (show expanded under parent task), or `3` (show collapsed under parent task). When ANY settings parameter is provided, ALL settings fields are required. Defaults to 1 if not spec',
      ),
    teamSidebarAssignees: z
      .array(z.string())
      .optional()
      .describe('A list of user IDs (as strings) to filter by in the team sidebar.'),
    settingsShowAssignees: z
      .boolean()
      .optional()
      .describe(
        'If `True`, displays task assignees in the view (e.g., on task cards). When ANY settings parameter is provided, ALL settings fields are required. Defaults to true if not specified when other settings fields are present.',
      ),
    settingsShowTaskLocations: z
      .boolean()
      .optional()
      .describe(
        "If `True`, displays the task's location (List, Folder, Space). When ANY settings parameter is provided, ALL settings fields are required. Defaults to false if not specified when other settings fields are present.",
      ),
    settingsShowClosedSubtasks: z
      .boolean()
      .optional()
      .describe(
        'If `True`, includes closed subtasks in the view according to other filter criteria. When ANY settings parameter is provided, ALL settings fields are required. Defaults to false if not specified when other settings fields are present.',
      ),
    teamSidebarUnassignedTasks: z
      .boolean()
      .optional()
      .describe('If `True`, shows unassigned tasks in the team sidebar.'),
    teamSidebarAssignedComments: z
      .boolean()
      .optional()
      .describe(
        'If `True`, shows tasks with comments assigned to the current user in the team sidebar.',
      ),
    settingsCollapseEmptyColumns: z
      .string()
      .optional()
      .describe(
        "If 'true', collapses empty columns (e.g., status columns with no tasks). Use string 'true' or 'false'. When ANY settings parameter is provided, ALL settings fields are required. Defaults to 'false' if not specified when other settings field",
      ),
    settingsShowSubtaskParentNames: z
      .boolean()
      .optional()
      .describe(
        'If `True`, displays the parent task name next to subtasks for clarity. When ANY settings parameter is provided, ALL settings fields are required. Defaults to false if not specified when other settings fields are present.',
      ),
  }),
  execute: async ({
    clickupToken,
    name,
    type,
    spaceId,
    divideDir,
    filtersOp,
    divideField,
    groupingDir,
    columnsFields,
    filtersFields,
    filtersSearch,
    groupingField,
    sortingFields,
    groupingIgnore,
    divideCollapsed,
    groupingCollapsed,
    filtersShowClosed,
    settingsMeComments,
    settingsMeSubtasks,
    settingsShowImages,
    settingsMeChecklists,
    settingsShowSubtasks,
    teamSidebarAssignees,
    settingsShowAssignees,
    settingsShowTaskLocations,
    settingsShowClosedSubtasks,
    teamSidebarUnassignedTasks,
    teamSidebarAssignedComments,
    settingsCollapseEmptyColumns,
    settingsShowSubtaskParentNames,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/space/${spaceId}/view`, {
      body: nest({
        name: name,
        type: type,
        divide__dir: divideDir,
        filters__op: filtersOp,
        divide__field: divideField,
        grouping__dir: groupingDir,
        columns__fields: columnsFields,
        filters__fields: filtersFields,
        filters__search: filtersSearch,
        grouping__field: groupingField,
        sorting__fields: sortingFields,
        grouping__ignore: groupingIgnore,
        divide__collapsed: divideCollapsed,
        grouping__collapsed: groupingCollapsed,
        filters__show__closed: filtersShowClosed,
        settings__me__comments: settingsMeComments,
        settings__me__subtasks: settingsMeSubtasks,
        settings__show__images: settingsShowImages,
        settings__me__checklists: settingsMeChecklists,
        settings__show__subtasks: settingsShowSubtasks,
        team__sidebar__assignees: teamSidebarAssignees,
        settings__show__assignees: settingsShowAssignees,
        settings__show__task__locations: settingsShowTaskLocations,
        settings__show__closed__subtasks: settingsShowClosedSubtasks,
        team__sidebar__unassigned__tasks: teamSidebarUnassignedTasks,
        team__sidebar__assigned__comments: teamSidebarAssignedComments,
        settings__collapse__empty__columns: settingsCollapseEmptyColumns,
        settings__show__subtask__parent__names: settingsShowSubtaskParentNames,
      }),
    });
  },
});

export const clickupCreateWorkspaceEverythingLevelView = tool({
  description:
    "Creates a new, customizable view (e.g., List, Board) at the 'Everything' level for a specified Team (Workspace ID), encompassing all tasks within that Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('Name for the new view.'),
    type: z.string().describe('Type of view to create (e.g., list, board, calendar).'),
    teamId: z
      .string()
      .describe("Team (Workspace) ID where the 'Everything' level view will be created."),
    divideDir: z
      .any()
      .optional()
      .describe('Sort direction for divided sections: `1` for ascending, `-1` for descending.'),
    filtersOp: z
      .string()
      .optional()
      .describe('Logical operator for combining filters (`AND` or `OR`).'),
    divideField: z
      .any()
      .optional()
      .describe(
        "Field to divide the view by, creating separate sections (e.g., 'priority', 'status').",
      ),
    groupingDir: z
      .number()
      .int()
      .optional()
      .describe('Sort order for grouped tasks: `1` for ascending, `-1` for descending.'),
    columnsFields: z
      .array(z.string())
      .optional()
      .describe(
        'Columns to display and their order. Prefix Custom Fields with `_cf`. For specific configurations, use a JSON object string.',
      ),
    filtersFields: z
      .array(z.string())
      .optional()
      .describe('Fields to apply filters on. See ClickUp API docs for filterable fields.'),
    filtersSearch: z
      .string()
      .optional()
      .describe('Search term to filter tasks by name, description, etc.'),
    groupingField: z
      .string()
      .optional()
      .describe('Field to group tasks by (e.g., status, priority).'),
    sortingFields: z
      .array(z.string())
      .optional()
      .describe('Fields to sort tasks by. See ClickUp API docs for sortable fields.'),
    groupingIgnore: z
      .boolean()
      .optional()
      .describe('If true, tasks in closed statuses are excluded from grouping.'),
    divideCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'List of division identifiers to be collapsed by default. Must be an array (e.g., []) or null, not a boolean.',
      ),
    groupingCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'List of group identifiers (e.g., status names, assignee IDs) to be collapsed by default.',
      ),
    filtersShowClosed: z
      .boolean()
      .optional()
      .describe("If true, include tasks with 'Closed' status in the view."),
    settingsMeComments: z
      .boolean()
      .optional()
      .describe("If true, 'Me Mode' filters for tasks commented on by the current user."),
    settingsMeSubtasks: z
      .boolean()
      .optional()
      .describe("If true, 'Me Mode' filters for subtasks assigned to the current user."),
    settingsShowImages: z
      .boolean()
      .optional()
      .describe('If true, show task cover images or attachment previews.'),
    settingsMeChecklists: z
      .boolean()
      .optional()
      .describe(
        "If true, 'Me Mode' filters for tasks where current user is assigned to checklist items.",
      ),
    settingsShowSubtasks: z
      .number()
      .int()
      .optional()
      .describe('Subtask display mode: `1` (separate), `2` (expand), `3` (collapse).'),
    teamSidebarAssignees: z
      .array(z.string())
      .optional()
      .describe('List of user IDs to filter tasks by in the team sidebar.'),
    settingsShowAssignees: z.boolean().optional().describe('If true, display task assignees.'),
    settingsShowTaskLocations: z
      .boolean()
      .optional()
      .describe('If true, display breadcrumb path (Space > Folder > List) for each task.'),
    settingsShowClosedSubtasks: z
      .boolean()
      .optional()
      .describe('If true, show closed subtasks according to `settings_show_subtasks`.'),
    teamSidebarUnassignedTasks: z
      .boolean()
      .optional()
      .describe('If true, team sidebar includes filter for unassigned tasks.'),
    teamSidebarAssignedComments: z
      .boolean()
      .optional()
      .describe('If true, team sidebar includes filter for tasks with assigned comments.'),
    settingsCollapseEmptyColumns: z
      .string()
      .optional()
      .describe('If true, collapse or hide empty columns.'),
    settingsShowSubtaskParentNames: z
      .boolean()
      .optional()
      .describe('If true, display parent task name next to subtasks.'),
  }),
  execute: async ({
    clickupToken,
    name,
    type,
    teamId,
    divideDir,
    filtersOp,
    divideField,
    groupingDir,
    columnsFields,
    filtersFields,
    filtersSearch,
    groupingField,
    sortingFields,
    groupingIgnore,
    divideCollapsed,
    groupingCollapsed,
    filtersShowClosed,
    settingsMeComments,
    settingsMeSubtasks,
    settingsShowImages,
    settingsMeChecklists,
    settingsShowSubtasks,
    teamSidebarAssignees,
    settingsShowAssignees,
    settingsShowTaskLocations,
    settingsShowClosedSubtasks,
    teamSidebarUnassignedTasks,
    teamSidebarAssignedComments,
    settingsCollapseEmptyColumns,
    settingsShowSubtaskParentNames,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/team/${teamId}/view`, {
      body: nest({
        name: name,
        type: type,
        divide__dir: divideDir,
        filters__op: filtersOp,
        divide__field: divideField,
        grouping__dir: groupingDir,
        columns__fields: columnsFields,
        filters__fields: filtersFields,
        filters__search: filtersSearch,
        grouping__field: groupingField,
        sorting__fields: sortingFields,
        grouping__ignore: groupingIgnore,
        divide__collapsed: divideCollapsed,
        grouping__collapsed: groupingCollapsed,
        filters__show__closed: filtersShowClosed,
        settings__me__comments: settingsMeComments,
        settings__me__subtasks: settingsMeSubtasks,
        settings__show__images: settingsShowImages,
        settings__me__checklists: settingsMeChecklists,
        settings__show__subtasks: settingsShowSubtasks,
        team__sidebar__assignees: teamSidebarAssignees,
        settings__show__assignees: settingsShowAssignees,
        settings__show__task__locations: settingsShowTaskLocations,
        settings__show__closed__subtasks: settingsShowClosedSubtasks,
        team__sidebar__unassigned__tasks: teamSidebarUnassignedTasks,
        team__sidebar__assigned__comments: teamSidebarAssignedComments,
        settings__collapse__empty__columns: settingsCollapseEmptyColumns,
        settings__show__subtask__parent__names: settingsShowSubtaskParentNames,
      }),
    });
  },
});

export const clickupDeleteView = tool({
  description:
    'Permanently and irreversibly deletes an existing View in ClickUp, identified by its `view_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    viewId: z.string().describe('The unique identifier of the View to be deleted.'),
  }),
  execute: async ({ clickupToken, viewId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/view/${viewId}`);
  },
});

export const clickupGetFolderViews = tool({
  description:
    'Retrieves all configured views (like List, Board, Calendar) for a specified, existing Folder in ClickUp.',
  inputSchema: z.object({
    clickupToken: tokenField,
    folderId: z.number().int().describe('ID of the Folder.'),
  }),
  execute: async ({ clickupToken, folderId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/folder/${folderId}/view`);
  },
});

export const clickupGetListViews = tool({
  description: 'Retrieves all task and page views for a specified and accessible ClickUp List.',
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z
      .string()
      .describe(
        "The ID of the List for which to retrieve views. This is the numeric ID of the list, often found at the end of the list's URL.",
      ),
  }),
  execute: async ({ clickupToken, listId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/list/${listId}/view`);
  },
});

export const clickupGetSpaceViews = tool({
  description: 'Retrieves all task and page views for a specified Space ID in ClickUp.',
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe('ID of the Space to retrieve views from.'),
  }),
  execute: async ({ clickupToken, spaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/space/${spaceId}/view`);
  },
});

export const clickupGetView = tool({
  description:
    'Fetches details for a specific ClickUp view, identified by its `view_id`, which must exist.',
  inputSchema: z.object({
    clickupToken: tokenField,
    viewId: z.string().describe('The unique identifier for the ClickUp view to retrieve.'),
  }),
  execute: async ({ clickupToken, viewId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/view/${viewId}`);
  },
});

export const clickupGetViewTasks = tool({
  description:
    'Retrieves all tasks visible in a specified ClickUp view, respecting its applied filters, sorting, and grouping.',
  inputSchema: z.object({
    clickupToken: tokenField,
    page: z
      .number()
      .int()
      .describe(
        'The page number of the results to retrieve. Used for pagination if the number of tasks exceeds the limit per page. Starts at 0.',
      ),
    viewId: z
      .string()
      .describe(
        'The unique identifier for a task view from which to retrieve tasks. Only task views are supported: list, board, calendar, table, timeline, workload, activity, map, or gantt. Page views (such as Docs, Whiteboards, and Chat) are not supported',
      ),
  }),
  execute: async ({ clickupToken, page, viewId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/view/${viewId}/task`, { query: { page: page } });
  },
});

export const clickupGetWorkspaceEverythingLevelViews = tool({
  description:
    "Retrieves all task and page views at the 'Everything Level' (a comprehensive overview of all tasks across all Spaces) for a specified ClickUp Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .number()
      .int()
      .describe(
        'Numeric ID of the Workspace (often referred to as Team ID) for which to retrieve Everything Level views.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Filter for archived views. Set to true to include only archived views, false to exclude archived views, or omit to include all views.',
      ),
  }),
  execute: async ({ clickupToken, teamId, archived }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/view`, { query: { archived: archived } });
  },
});

export const clickupUpdateView = tool({
  description:
    "Updates an existing ClickUp view's settings such as name, type, grouping, or filters; ensure `parent_id` and `parent_type` define a valid hierarchy, and that specified field names (e.g. for sorting, columns) are valid within the ClickUp workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The new name for the view.'),
    type: z.string().describe('The type of the view.'),
    viewId: z.string().describe('The unique identifier of the view to be updated.'),
    parentId: z
      .string()
      .optional()
      .describe('The ID of the Workspace, Space, Folder, or List where the view is located. '),
    divideDir: z
      .any()
      .optional()
      .describe(
        'The direction for dividing the view. Currently, this field may not be actively used or may be deprecated.',
      ),
    filtersOp: z
      .string()
      .optional()
      .describe('The operator for combining filters. Available values are `AND` and `OR`.'),
    parentType: z
      .number()
      .int()
      .optional()
      .describe(
        'The level of the Hierarchy where the view is created. Options include: Workspace (Everything Level): `7`, Space: `4`, Folder: `5`, List: `6`.',
      ),
    divideField: z
      .any()
      .optional()
      .describe(
        'The field to divide the view by (e.g., to create swimlanes in a board view). Currently, this field may not be actively used or may be deprecated.',
      ),
    groupingDir: z
      .number()
      .int()
      .optional()
      .describe(
        'The sort order for grouping. Use `1` for ascending (e.g., urgent priority at the top) or `-1` for descending (e.g., no priority at the top).',
      ),
    columnsFields: z
      .array(z.string())
      .optional()
      .describe(
        'Fields to display as columns in the view. Custom Fields require the `_cf` prefix and their ID (e.g., `_cf_custom_field_id`).',
      ),
    filtersFields: z
      .array(z.string())
      .optional()
      .describe(
        'Fields to apply filters on; refer to ClickUp API documentation for available fields.',
      ),
    filtersSearch: z
      .string()
      .optional()
      .describe('A search string to filter tasks by name or content.'),
    groupingField: z
      .string()
      .optional()
      .describe(
        'The field to group tasks by. Options include: `none`, `status`, `priority`, `assignee`, `tag`, or `dueDate`.',
      ),
    sortingFields: z
      .array(z.string())
      .optional()
      .describe(
        'Fields to sort tasks by; refer to ClickUp API documentation for available filter fields.',
      ),
    groupingIgnore: z
      .boolean()
      .optional()
      .describe('If true, tasks with no value for the `grouping_field` will not be grouped.'),
    divideCollapsed: z
      .boolean()
      .optional()
      .describe(
        'Indicates if divided sections should be collapsed. Currently, this field may not be actively used or may be deprecated.',
      ),
    groupingCollapsed: z
      .array(z.string())
      .optional()
      .describe(
        'A list of group identifiers (e.g., status names or assignee IDs) that should be collapsed by default in the view.',
      ),
    filtersShowClosed: z
      .boolean()
      .optional()
      .describe('If true, closed tasks will be included in the view.'),
    settingsMeComments: z
      .boolean()
      .optional()
      .describe(
        "If true, in 'Me Mode', only comments where the current user is mentioned or involved will be shown.",
      ),
    settingsMeSubtasks: z
      .boolean()
      .optional()
      .describe("If true, in 'Me Mode', only subtasks assigned to the current user will be shown."),
    settingsShowImages: z
      .boolean()
      .optional()
      .describe(
        'If true, images attached to tasks will be displayed in the view (e.g. cover images in card view).',
      ),
    settingsMeChecklists: z
      .boolean()
      .optional()
      .describe(
        "If true, in 'Me Mode', only checklists assigned to the current user will be shown.",
      ),
    settingsShowSubtasks: z
      .number()
      .int()
      .optional()
      .describe(
        'Controls how subtasks are displayed. Acceptable values are `1` (show subtasks as separate tasks), `2` (show subtasks expanded under parent task), or `3` (show subtasks collapsed under parent task).',
      ),
    teamSidebarAssignees: z
      .array(z.string())
      .optional()
      .describe('A list of assignee user IDs to feature in the team sidebar.'),
    settingsShowAssignees: z
      .boolean()
      .optional()
      .describe('If true, assignees will be displayed on tasks.'),
    settingsShowTaskLocations: z
      .boolean()
      .optional()
      .describe('If true, task locations (List, Folder, Space) will be displayed.'),
    settingsShowClosedSubtasks: z
      .boolean()
      .optional()
      .describe('If true, closed subtasks will be included in the view.'),
    teamSidebarUnassignedTasks: z
      .boolean()
      .optional()
      .describe('If true, unassigned tasks will be shown in the team sidebar.'),
    teamSidebarAssignedComments: z
      .boolean()
      .optional()
      .describe('If true, assigned comments will be shown in the team sidebar.'),
    settingsCollapseEmptyColumns: z
      .string()
      .optional()
      .describe(
        "If true, columns with no tasks will be collapsed (e.g., in Board view). This might accept boolean as a string like 'true' or 'false'.",
      ),
    settingsShowSubtaskParentNames: z
      .boolean()
      .optional()
      .describe('If true, parent task names will be displayed for subtasks.'),
  }),
  execute: async ({
    clickupToken,
    name,
    type,
    viewId,
    parentId,
    divideDir,
    filtersOp,
    parentType,
    divideField,
    groupingDir,
    columnsFields,
    filtersFields,
    filtersSearch,
    groupingField,
    sortingFields,
    groupingIgnore,
    divideCollapsed,
    groupingCollapsed,
    filtersShowClosed,
    settingsMeComments,
    settingsMeSubtasks,
    settingsShowImages,
    settingsMeChecklists,
    settingsShowSubtasks,
    teamSidebarAssignees,
    settingsShowAssignees,
    settingsShowTaskLocations,
    settingsShowClosedSubtasks,
    teamSidebarUnassignedTasks,
    teamSidebarAssignedComments,
    settingsCollapseEmptyColumns,
    settingsShowSubtaskParentNames,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/view/${viewId}`, {
      body: nest({
        name: name,
        type: type,
        parent__id: parentId,
        divide__dir: divideDir,
        filters__op: filtersOp,
        parent__type: parentType,
        divide__field: divideField,
        grouping__dir: groupingDir,
        columns__fields: columnsFields,
        filters__fields: filtersFields,
        filters__search: filtersSearch,
        grouping__field: groupingField,
        sorting__fields: sortingFields,
        grouping__ignore: groupingIgnore,
        divide__collapsed: divideCollapsed,
        grouping__collapsed: groupingCollapsed,
        filters__show__closed: filtersShowClosed,
        settings__me__comments: settingsMeComments,
        settings__me__subtasks: settingsMeSubtasks,
        settings__show__images: settingsShowImages,
        settings__me__checklists: settingsMeChecklists,
        settings__show__subtasks: settingsShowSubtasks,
        team__sidebar__assignees: teamSidebarAssignees,
        settings__show__assignees: settingsShowAssignees,
        settings__show__task__locations: settingsShowTaskLocations,
        settings__show__closed__subtasks: settingsShowClosedSubtasks,
        team__sidebar__unassigned__tasks: teamSidebarUnassignedTasks,
        team__sidebar__assigned__comments: teamSidebarAssignedComments,
        settings__collapse__empty__columns: settingsCollapseEmptyColumns,
        settings__show__subtask__parent__names: settingsShowSubtaskParentNames,
      }),
    });
  },
});
