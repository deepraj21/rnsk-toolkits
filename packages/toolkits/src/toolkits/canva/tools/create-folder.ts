// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateFolder = tool({
  description:
    'Creates a new Canva folder and returns it (id, name, created_at). parentFolderId places it: "root" for the top level of Projects, "uploads" for the Uploads folder, or another folder ID to nest it. Rate limited to 20 creates per minute per user.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    name: z.string().min(1).max(255).describe('Folder name (max 255 chars)'),
    parentFolderId: z
      .string()
      .min(1)
      .describe('Parent folder ID: "root" (Projects top level), "uploads", or a folder ID'),
  }),
  execute: async ({ canvaToken, name, parentFolderId }) => {
    if (!name) return { error: 'name is required.' };
    if (!parentFolderId) return { error: 'parentFolderId is required.' };

    const result = await canvaRequest(canvaToken, '/folders', {
      method: 'POST',
      body: compact({ name, parent_folder_id: parentFolderId }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
