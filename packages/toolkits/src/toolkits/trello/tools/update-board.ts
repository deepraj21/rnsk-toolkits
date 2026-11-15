// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloUpdateBoard = tool({
  description:
    'Updates a Trello board: rename it, change the description, move it to a workspace, change visibility, or archive/restore it (closed). Pass only the fields you want to change.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link'),
    name: z.string().optional().describe('New board name'),
    desc: z.string().optional().describe('New board description'),
    closed: z.boolean().optional().describe('Archive (true) or restore (false) the board'),
    idOrganization: z.string().optional().describe('Move the board to this workspace id'),
    permissionLevel: z
      .enum(['private', 'org', 'public'])
      .optional()
      .describe('New visibility: private, workspace (org), or public'),
    starred: z.boolean().optional().describe('Star or unstar the board for the member'),
  }),
  execute: async ({
    trelloCredentials,
    boardId,
    name,
    desc,
    closed,
    idOrganization,
    permissionLevel,
    starred,
  }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}`,
      {
        method: 'PUT',
        query: {
          name,
          desc,
          closed,
          idOrganization,
          // Trello uses prefs_permissionLevel on writes (slash form is the
          // generated-docs spelling; underscore is what the API accepts).
          prefs_permissionLevel: permissionLevel,
          starred,
        },
      },
    );
    if (result.error) return result;

    return result.data;
  },
});
