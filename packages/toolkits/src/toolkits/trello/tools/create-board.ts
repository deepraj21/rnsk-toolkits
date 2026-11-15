// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloCreateBoard = tool({
  description:
    'Creates a new Trello board. Provide a name, optional description, and optionally a workspace (idOrganization) to create it inside. defaultLists adds the standard To Do / Doing / Done lists (default true).',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    name: z.string().describe('Board name'),
    desc: z.string().optional().describe('Board description / short bio'),
    idOrganization: z
      .string()
      .optional()
      .describe('Workspace id to create the board in (omit for a personal board)'),
    defaultLists: z
      .boolean()
      .optional()
      .describe('Create the default To Do / Doing / Done lists (default true)'),
    permissionLevel: z
      .enum(['private', 'org', 'public'])
      .optional()
      .describe('Board visibility (default "private")'),
    prefsBackground: z
      .string()
      .optional()
      .describe('Background color id or preset, e.g. "blue", "green", "lime"'),
  }),
  execute: async ({
    trelloCredentials,
    name,
    desc,
    idOrganization,
    defaultLists,
    permissionLevel,
    prefsBackground,
  }) => {
    if (!name) return { error: 'name is required.' };

    const result = await trelloRequest(trelloCredentials, '/boards', {
      method: 'POST',
      query: {
        name,
        desc,
        idOrganization,
        defaultLists,
        permissionLevel,
        prefs_background: prefsBackground,
      },
    });
    if (result.error) return result;

    return result.data;
  },
});
