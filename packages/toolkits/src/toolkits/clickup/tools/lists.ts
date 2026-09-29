// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateFolderlessList = tool({
  description: "Creates a new folderless list (a list not part of any Folder) directly within a specified ClickUp Space.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("Name for the new folderless list."),
    status: z.string().optional().describe("List color (e.g., 'red', 'blue_blended'), distinct from task statuses within the list. Null for no color."),
    content: z.string().optional().describe("Description for the list (plain text or markdown)."),
    assignee: z.number().int().optional().describe("`user_id` of the list owner. Null for no specific owner."),
    dueDate: z.number().int().optional().describe("Due date for the list (POSIX timestamp in milliseconds)."),
    priority: z.number().int().optional().describe("Priority level: `1` (Urgent), `2` (High), `3` (Normal), `4` (Low). Null to remove priority."),
    spaceId: z.string().describe("Identifier of the Space for the new folderless list."),
    dueDateTime: z.boolean().optional().describe("Indicates if `due_date` includes time (`true`) or is all-day (`false`). Required if `due_date` is set."),
  }),
  execute: async ({ clickupToken, name, status, content, assignee, dueDate, priority, spaceId, dueDateTime }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/space/${spaceId}/list`, { body: nest({ name: name, status: status, content: content, assignee: assignee, due_date: dueDate, priority: priority, due_date_time: dueDateTime }) });
  },
});

export const clickupCreateList = tool({
  description: "Creates a new list in ClickUp within an existing folder. This action requires a folder_id - lists cannot be created directly in a Space using this action. If you need to create a list directly in a Space (without placing it in a folder), use the 'CLICKUP_CREATE_FOLDERLESS_LIST' action with space_id instead.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("The name to be assigned to the new list."),
    status: z.string().optional().describe("Optional. Defines the list's color in the ClickUp UI (e.g., 'red', 'blue'). **Important:** This 'status' refers to the visual color of the list itself, not the workflow statuses (like 'To Do', 'In Progress') of tasks within the list."),
    content: z.string().optional().describe("Optional descriptive content or notes for the list."),
    assignee: z.number().int().optional().describe("Optional. Numerical user ID of the assignee."),
    dueDate: z.number().int().optional().describe("Optional due date for the list, represented as a POSIX timestamp in milliseconds. For example, `1695110307000` for September 19, 2023, 07:58:27 AM GMT."),
    priority: z.number().int().optional().describe("Optional priority level for the list. Integer values map to: 1 (Urgent), 2 (High), 3 (Normal), 4 (Low)."),
    folderId: z.string().describe("The unique numerical identifier of the folder where the new list will be created. Note: This action creates a list within an existing folder. A folder_id is required and space_id cannot be used. If you want to create a list directly in a Sp"),
    dueDateTime: z.boolean().optional().describe("Optional. A boolean flag indicating whether the `due_date` includes a specific time. If `True`, the time component of `due_date` is respected. If `False` or not provided, the list is considered due on the entire day specified by `due_date`."),
  }),
  execute: async ({ clickupToken, name, status, content, assignee, dueDate, priority, folderId, dueDateTime }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/folder/${folderId}/list`, { body: nest({ name: name, status: status, content: content, assignee: assignee, due_date: dueDate, priority: priority, due_date_time: dueDateTime }) });
  },
});

export const clickupCreateListFromTemplate = tool({
  description: "Creates a new list from a template in a specified ClickUp folder. Use this when you need to instantiate a list based on an existing template within a folder structure.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("Name for the new list created from the template."),
    folderId: z.number().int().describe("The ID of the folder where the list will be created."),
    templateId: z.string().describe("The ID of the template to use for creating the list."),
  }),
  execute: async ({ clickupToken, name, folderId, templateId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/folder/${folderId}/list_template/${templateId}/list`, { body: nest({ name: name }) });
  },
});

export const clickupDeleteList = tool({
  description: "Permanently deletes an existing List and all its contents; this action is destructive and irreversible via the API.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z.string().describe("The unique numerical identifier of the List to be deleted. This ID can be found by navigating to the List in ClickUp; the ID is often present in the URL."),
  }),
  execute: async ({ clickupToken, listId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/list/${listId}`);
  },
});

export const clickupGetFolderlessLists = tool({
  description: "Retrieves all Lists within a specified Space that are not located in any Folder.",
  inputSchema: z.object({
    clickupToken: tokenField,
    archived: z.boolean().optional().describe("Filter by archived status. Set to `true` to retrieve archived Lists, `false` or omit to retrieve unarchived Lists."),
    spaceId: z.string().describe("The ID of the Space from which to retrieve folderless Lists."),
  }),
  execute: async ({ clickupToken, archived, spaceId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/space/${spaceId}/list`, { query: { archived: archived } });
  },
});

export const clickupGetList = tool({
  description: "Retrieves detailed information for an existing List in ClickUp, identified by its unique `list_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z.string().describe("The unique identifier for the List to retrieve. This ID can be found by right-clicking a List in the ClickUp sidebar, selecting 'Copy link', and the ID is the last part of the URL after '/l/' or '/li/'."),
  }),
  execute: async ({ clickupToken, listId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/list/${listId}`);
  },
});

export const clickupGetListMembers = tool({
  description: "Retrieves all members of a specific, existing ClickUp List by its ID.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z.string().describe("Unique identifier of the ClickUp List. Found by extracting the numerical ID from the List's URL in ClickUp."),
  }),
  execute: async ({ clickupToken, listId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/list/${listId}/member`);
  },
});

export const clickupGetLists = tool({
  description: "Retrieves all lists within a specified, existing ClickUp folder, optionally filtering by archived status.",
  inputSchema: z.object({
    clickupToken: tokenField,
    archived: z.boolean().optional().describe("Filter lists by archived status. If `true`, returns archived lists; if `false` or omitted, returns unarchived lists."),
    folderId: z.string().describe("The unique identifier of the Folder from which to retrieve lists."),
  }),
  execute: async ({ clickupToken, archived, folderId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/folder/${folderId}/list`, { query: { archived: archived } });
  },
});

export const clickupUpdateList = tool({
  description: "Updates attributes of an existing ClickUp list, such as its name, content, due date, priority, assignee, or color status, identified by its `list_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().optional().describe("New name for the list."),
    status: z.string().optional().describe("Color for the list (e.g., 'red' or '#FF0000'), visually representing its status (not task status)."),
    content: z.string().optional().describe("New description or informational content for the list."),
    listId: z.string().describe("ID of the list to be updated."),
    assignee: z.string().optional().describe("User ID to be set as the assignee for the list, replacing any existing assignee."),
    dueDate: z.number().int().optional().describe("New due date for the list, as a Unix timestamp in milliseconds (e.g., `1672531199000` for Dec 31, 2022, 11:59:59 PM UTC)."),
    priority: z.number().int().optional().describe("Priority level: `1` (Urgent), `2` (High), `3` (Normal), `4` (Low), or `0` to unset."),
    unsetStatus: z.boolean().optional().describe("Set to `true` to remove the list's color, overriding `status`; if `false`, `status` updates or maintains current color."),
    dueDateTime: z.boolean().optional().describe("Indicates if `due_date` includes a specific time; if `false`, it's an all-day event."),
  }),
  execute: async ({ clickupToken, name, status, content, listId, assignee, dueDate, priority, unsetStatus, dueDateTime }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/list/${listId}`, { body: nest({ name: name, status: status, content: content, assignee: assignee, due_date: dueDate, priority: priority, unset_status: unsetStatus, due_date_time: dueDateTime }) });
  },
});

