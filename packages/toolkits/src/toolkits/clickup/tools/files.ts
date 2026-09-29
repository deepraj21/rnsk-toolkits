// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupAttachmentsUploadFileToTaskAsAttachment = tool({
  description: "DEPRECATED: Use `create_task_attachment` to upload a file to a task; requires `multipart/form-data`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z.string().describe("The unique identifier of the task to which the attachment will be added."),
    teamId: z.string().optional().describe("The ID of the team. This is required and used only if `custom_task_ids` is `true` to help locate the task by its custom ID. For example: `custom_task_ids=true&team_id=123`."),
    attachment: z.record(z.any()).describe("The file to be uploaded as an attachment. Note: Files stored in the cloud (URLs) cannot be used - actual file content must be provided."),
    customTaskIds: z.boolean().optional().describe("If `true`, indicates that `task_id` should be interpreted as a custom task ID instead of the default ClickUp task ID. If this is `true`, `team_id` must also be provided."),
  }),
  execute: async ({ clickupToken, taskId, teamId, attachment, customTaskIds }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuUpload(clickupToken, V2, `/task/${taskId}/attachment`, attachment, { team_id: teamId, custom_task_ids: customTaskIds });
  },
});

export const clickupCreateTaskAttachment = tool({
  description: "Uploads a file as an attachment to a specified ClickUp task using multipart/form-data.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z.string().describe("The unique identifier of the task to which the attachment will be added."),
    teamId: z.string().optional().describe("The ID of the team. This is required and used only if `custom_task_ids` is `true` to help locate the task by its custom ID. For example: `custom_task_ids=true&team_id=123`."),
    attachment: z.record(z.any()).describe("The file to be uploaded as an attachment. Note: Files stored in the cloud (URLs) cannot be used - actual file content must be provided."),
    customTaskIds: z.boolean().optional().describe("If `true`, indicates that `task_id` should be interpreted as a custom task ID instead of the default ClickUp task ID. If this is `true`, `team_id` must also be provided."),
  }),
  execute: async ({ clickupToken, taskId, teamId, attachment, customTaskIds }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuUpload(clickupToken, V2, `/task/${taskId}/attachment`, attachment, { team_id: teamId, custom_task_ids: customTaskIds });
  },
});

