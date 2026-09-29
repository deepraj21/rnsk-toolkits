// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateWebhook = tool({
  description: "Creates a ClickUp webhook for a Team (Workspace) to notify a public URL on specified events (at least one, or '*' for all), optionally scoped to a Space, Folder, List, or Task; the endpoint must accept requests from dynamic IPs.",
  inputSchema: z.object({
    clickupToken: tokenField,
    events: z.array(z.string()).describe("Event types to subscribe to; use '*' for all events on the resource. Examples: 'taskCreated', 'taskUpdated'."),
    listId: z.string().optional().describe("Optional. ID of the List to scope the webhook; triggers only for events in this List."),
    taskId: z.string().optional().describe("Optional. ID of the Task to scope the webhook; triggers only for events for this Task."),
    teamId: z.string().describe("ID of the Team (Workspace) for the webhook."),
    endpoint: z.string().describe("Publicly accessible URL for ClickUp to send POST notifications for subscribed events."),
    spaceId: z.string().optional().describe("Optional. ID of the Space to scope the webhook; triggers only for events in this Space."),
    folderId: z.string().optional().describe("Optional. ID of the Folder to scope the webhook; triggers only for events in this Folder."),
  }),
  execute: async ({ clickupToken, events, listId, taskId, teamId, endpoint, spaceId, folderId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/team/${teamId}/webhook`, { body: nest({ events: events, list_id: listId, task_id: taskId, endpoint: endpoint, space_id: spaceId, folder_id: folderId }) });
  },
});

export const clickupDeleteWebhook = tool({
  description: "Permanently removes an existing webhook, specified by its ID, thereby ceasing all its event monitoring and notifications.",
  inputSchema: z.object({
    clickupToken: tokenField,
    webhookId: z.string().describe("The unique identifier (UUID) of the webhook to be deleted."),
  }),
  execute: async ({ clickupToken, webhookId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/webhook/${webhookId}`);
  },
});

export const clickupGetWebhooks = tool({
  description: "Fetches webhooks for a Team (Workspace), returning only those created by the authenticated user via API, for a `team_id` they can access.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("Unique ID of the Team (Workspace) to retrieve webhooks for. Obtain valid workspace IDs using the 'get_authorized_teams_workspaces' action."),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/webhook`);
  },
});

export const clickupUpdateWebhook = tool({
  description: "Updates the endpoint URL, monitored events, and status of an existing webhook, identified by its `webhook_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    events: z.array(z.string()).describe("List of event types to monitor. Use ['*'] to subscribe to all events. Common events include: taskCreated, taskUpdated, taskDeleted, taskStatusUpdated, taskAssigneeUpdated, taskDueDateUpdated, taskTagUpdated, taskMoved, taskCommentPosted, ta"),
    status: z.string().describe("The desired status of the webhook after the update."),
    endpoint: z.string().describe("The new URL where the webhook payloads will be sent."),
    webhookId: z.string().describe("The unique identifier of the webhook to be updated. Example: 'e506-4a29-9d42-26e504e3435e'."),
  }),
  execute: async ({ clickupToken, events, status, endpoint, webhookId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/webhook/${webhookId}`, { body: nest({ events: events, status: status, endpoint: endpoint }) });
  },
});

