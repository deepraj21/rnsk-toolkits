// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateChatViewComment = tool({
  description:
    "Posts a new comment to a specified ClickUp Chat view; the 'view_id' must correspond to an existing and accessible Chat view.",
  inputSchema: z.object({
    clickupToken: tokenField,
    viewId: z
      .string()
      .describe('The unique identifier of the Chat view where the comment will be posted.'),
    notifyAll: z
      .boolean()
      .describe(
        'If `True`, notifications for this comment will be sent to all members of the Chat view, including the comment creator. If `False`, notifications will follow standard ClickUp behavior.',
      ),
    commentText: z.string().describe('The text content of the comment to be added.'),
  }),
  execute: async ({ clickupToken, viewId, notifyAll, commentText }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/view/${viewId}/comment`, {
      body: nest({ notify_all: notifyAll, comment_text: commentText }),
    });
  },
});

export const clickupCreateListComment = tool({
  description:
    'Adds a new comment with specific text to an existing and accessible ClickUp List, assigns it to a user, and sets notification preferences for all list members.',
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z
      .string()
      .describe('Unique identifier of the ClickUp list where the comment will be posted.'),
    assignee: z
      .number()
      .int()
      .optional()
      .describe(
        'User ID to assign this comment to, converting it into an actionable item. If omitted, creates an unassigned comment.',
      ),
    notifyAll: z
      .boolean()
      .optional()
      .describe(
        'If true, notifications are sent to everyone including the creator. If false or omitted, default notification rules apply.',
      ),
    commentText: z
      .string()
      .describe('Text content of the comment. Supports ClickUp formatting (mentions, markdown).'),
  }),
  execute: async ({ clickupToken, listId, assignee, notifyAll, commentText }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/list/${listId}/comment`, {
      body: nest({ assignee: assignee, notify_all: notifyAll, comment_text: commentText }),
    });
  },
});

export const clickupCreateTaskComment = tool({
  description:
    'Adds a comment to a ClickUp task; `team_id` is required if `custom_task_ids` is true.',
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z
      .string()
      .describe(
        'Unique task identifier for the comment. Can be standard or custom if `custom_task_ids` is true.',
      ),
    teamId: z
      .string()
      .optional()
      .describe(
        'Team ID, required if `custom_task_ids` is true to locate the task by its custom ID.',
      ),
    assignee: z
      .number()
      .int()
      .describe(
        'The user ID of the person to whom this specific comment should be assigned or mentioned. This assigns the comment, not the task.',
      ),
    notifyAll: z
      .boolean()
      .describe(
        "If `true`, notifications for this comment will be sent to all users watching the task, including the comment's creator. If `false`, notifications will be sent according to standard ClickUp notification rules (e.g., to mentioned users, comme",
      ),
    commentText: z
      .string()
      .describe(
        "The text content for the comment. Supports ClickUp's comment formatting (e.g., mentions, markdown).",
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to indicate that the `task_id` provided is a custom task ID. If `true`, the `team_id` must also be provided.',
      ),
  }),
  execute: async ({
    clickupToken,
    taskId,
    teamId,
    assignee,
    notifyAll,
    commentText,
    customTaskIds,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/task/${taskId}/comment`, {
      body: nest({ assignee: assignee, notify_all: notifyAll, comment_text: commentText }),
      query: { team_id: teamId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupCreateThreadedComment = tool({
  description:
    'Tool to create a threaded reply to a comment in ClickUp. Use when you need to respond to an existing comment with context.',
  inputSchema: z.object({
    clickupToken: tokenField,
    assignee: z
      .number()
      .int()
      .optional()
      .describe('The user ID of the person to assign this reply to.'),
    commentId: z.string().describe('The ID of the parent comment to reply to.'),
    notifyAll: z
      .boolean()
      .describe(
        'If true, notifications for this reply will be sent to all users watching the parent comment or task. If false, notifications will be sent according to standard ClickUp notification rules.',
      ),
    commentText: z
      .string()
      .describe(
        "The text content of the reply. Supports ClickUp's comment formatting (e.g., mentions, markdown).",
      ),
    groupAssignee: z.string().optional().describe('The group ID to assign this reply to.'),
  }),
  execute: async ({ clickupToken, assignee, commentId, notifyAll, commentText, groupAssignee }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/comment/${commentId}/reply`, {
      body: nest({
        assignee: assignee,
        notify_all: notifyAll,
        comment_text: commentText,
        group_assignee: groupAssignee,
      }),
    });
  },
});

export const clickupDeleteComment = tool({
  description: 'Deletes an existing comment from a task using its `comment_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    commentId: z.string().describe('The unique identifier of the comment to be deleted.'),
  }),
  execute: async ({ clickupToken, commentId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/comment/${commentId}`);
  },
});

export const clickupGetChatViewComments = tool({
  description:
    'Retrieves comments from a specified Chat view in ClickUp, supporting pagination via `start` and `start_id` to fetch comments older than the default 25 most recent.',
  inputSchema: z.object({
    clickupToken: tokenField,
    start: z
      .number()
      .int()
      .optional()
      .describe(
        'Unix timestamp (milliseconds) to filter comments created at or after this time. For pagination, typically used with `start_id`.',
      ),
    viewId: z
      .string()
      .describe('Unique identifier of the Chat view from which to retrieve comments.'),
    startId: z
      .string()
      .optional()
      .describe(
        'Comment ID to act as a cursor for pagination, used with `start` to retrieve comments after this ID that also meet the `start` time condition.',
      ),
  }),
  execute: async ({ clickupToken, start, viewId, startId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/view/${viewId}/comment`, {
      query: { start: start, start_id: startId },
    });
  },
});

export const clickupGetListComments = tool({
  description:
    'Retrieves comments for a specific ClickUp List, supporting pagination using `start` (timestamp) and `start_id` (comment ID) to fetch earlier comments; omits them for the latest 25.',
  inputSchema: z.object({
    clickupToken: tokenField,
    start: z
      .number()
      .int()
      .optional()
      .describe("Unix timestamp (milliseconds) of a comment's creation date."),
    listId: z
      .string()
      .describe('The unique identifier for the list from which to retrieve comments.'),
    startId: z.string().optional().describe('ID of a specific comment.'),
  }),
  execute: async ({ clickupToken, start, listId, startId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/list/${listId}/comment`, {
      query: { start: start, start_id: startId },
    });
  },
});

export const clickupGetTaskComments = tool({
  description:
    'Retrieves up to 25 comments for a specified task, supporting pagination using `start` and `start_id` to fetch older comments.',
  inputSchema: z.object({
    clickupToken: tokenField,
    start: z
      .number()
      .int()
      .optional()
      .describe(
        'Unix timestamp (in milliseconds) of the oldest visible comment, used with `start_id` for paginating older comments.',
      ),
    taskId: z
      .string()
      .describe(
        'Unique identifier of the task. Can be a standard or custom task ID (if `custom_task_ids` is true).',
      ),
    teamId: z.string().optional().describe('Team ID, required if `custom_task_ids` is true.'),
    startId: z
      .string()
      .optional()
      .describe(
        'ID of the oldest visible comment, used with `start` for paginating older comments.',
      ),
    customTaskIds: z
      .boolean()
      .optional()
      .describe('Indicates if `task_id` is a custom task ID; if true, `team_id` is required.'),
  }),
  execute: async ({ clickupToken, start, taskId, teamId, startId, customTaskIds }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/task/${taskId}/comment`, {
      query: { start: start, team_id: teamId, start_id: startId, custom_task_ids: customTaskIds },
    });
  },
});

export const clickupGetThreadedComments = tool({
  description:
    'Retrieves threaded replies to a parent comment. Use when you need to fetch conversation threads under a specific comment.',
  inputSchema: z.object({
    clickupToken: tokenField,
    commentId: z
      .string()
      .describe('Unique identifier of the parent comment to retrieve replies for.'),
  }),
  execute: async ({ clickupToken, commentId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/comment/${commentId}/reply`);
  },
});

export const clickupUpdateComment = tool({
  description:
    "Updates an existing task comment's text, assignee (who must be a valid workspace member), or resolution status, requiring a valid existing comment_id.",
  inputSchema: z.object({
    clickupToken: tokenField,
    assignee: z.number().int().describe('User ID of the assignee for the comment.'),
    resolved: z
      .boolean()
      .describe(
        'Set to `true` to mark the comment as resolved, or `false` to mark it as unresolved.',
      ),
    commentId: z.string().describe('The unique identifier of the comment to be updated.'),
    commentText: z.string().describe('The new text content for the comment.'),
  }),
  execute: async ({ clickupToken, assignee, resolved, commentId, commentText }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/comment/${commentId}`, {
      body: nest({ assignee: assignee, resolved: resolved, comment_text: commentText }),
    });
  },
});
