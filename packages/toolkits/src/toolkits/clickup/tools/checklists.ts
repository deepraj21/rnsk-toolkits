// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateChecklist = tool({
  description: "Creates a new checklist with a specified name within an existing task, which can be identified by its standard ID or a custom task ID (if `custom_task_ids` is true, `team_id` is also required).",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("Name for the new checklist."),
    taskId: z.string().describe("Unique identifier of the task for the new checklist; can be a standard or custom task ID (if `custom_task_ids` is true)."),
    teamId: z.string().optional().describe("Team's unique identifier; required only if `custom_task_ids` is true."),
    customTaskIds: z.boolean().optional().describe("If true, `task_id` is treated as a custom task ID, requiring `team_id`."),
  }),
  execute: async ({ clickupToken, name, taskId, teamId, customTaskIds }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/task/${taskId}/checklist`, { body: nest({ name: name }), query: { team_id: teamId, custom_task_ids: customTaskIds } });
  },
});

export const clickupCreateChecklistItem = tool({
  description: "Creates a new checklist item within a specified, existing checklist, optionally setting the item's name and assigning it to a user.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("Name for the new checklist item."),
    assignee: z.number().int().optional().describe("User ID of the ClickUp user to whom this item will be assigned. If omitted, the item will be unassigned."),
    checklistId: z.string().describe("UUID of the parent checklist where the new item will be created; this checklist must already exist."),
  }),
  execute: async ({ clickupToken, name, assignee, checklistId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/checklist/${checklistId}/checklist_item`, { body: nest({ name: name, assignee: assignee }) });
  },
});

export const clickupDeleteChecklist = tool({
  description: "Permanently deletes an existing checklist identified by its `checklist_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    checklistId: z.string().describe("The unique identifier (UUID) of the checklist to be deleted."),
  }),
  execute: async ({ clickupToken, checklistId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/checklist/${checklistId}`);
  },
});

export const clickupDeleteChecklistItem = tool({
  description: "Permanently deletes an existing item, identified by `checklist_item_id`, from an existing checklist, identified by `checklist_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    checklistId: z.string().describe("Unique identifier (UUID) of the checklist containing the item to be deleted."),
    checklistItemId: z.string().describe("Unique identifier (UUID) of the specific checklist item to be deleted."),
  }),
  execute: async ({ clickupToken, checklistId, checklistItemId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/checklist/${checklistId}/checklist_item/${checklistItemId}`);
  },
});

export const clickupUpdateChecklist = tool({
  description: "Updates an existing checklist's name or position, identified by its `checklist_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().optional().describe("New name for the checklist."),
    position: z.number().int().optional().describe("New 0-indexed display order for the checklist on a task (e.g., 0 for top)."),
    checklistId: z.string().describe("The unique identifier (UUID) of the checklist to be edited."),
  }),
  execute: async ({ clickupToken, name, position, checklistId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/checklist/${checklistId}`, { body: nest({ name: name, position: position }) });
  },
});

export const clickupUpdateChecklistItem = tool({
  description: "Updates an existing checklist item, allowing modification of its name, assignee, resolution status, or parent item for nesting.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().optional().describe("The new name for the checklist item."),
    parent: z.string().optional().describe("The `checklist_item_id` of an existing item within the same checklist to nest this item under."),
    assignee: z.string().optional().describe("The integer user ID to assign to this checklist item. To unassign, consult ClickUp API documentation for the appropriate value (e.g., 0 or null)."),
    resolved: z.boolean().optional().describe("Set to `true` to mark the item as resolved, or `false` to mark it as unresolved."),
    checklistId: z.string().describe("The unique identifier (UUID) of the checklist containing the item to be edited."),
    checklistItemId: z.string().describe("The unique identifier (UUID) of the checklist item to be edited."),
  }),
  execute: async ({ clickupToken, name, parent, assignee, resolved, checklistId, checklistItemId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/checklist/${checklistId}/checklist_item/${checklistItemId}`, { body: nest({ name: name, parent: parent, assignee: assignee, resolved: resolved }) });
  },
});

