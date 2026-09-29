// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateFolder = tool({
  description: "Creates a new ClickUp Folder within the specified Space, which must exist and be accessible.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("The name of the Folder to be created."),
    spaceId: z.string().describe("Numerical ID of the Space in which to create the Folder."),
  }),
  execute: async ({ clickupToken, name, spaceId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/space/${spaceId}/folder`, { body: nest({ name: name }) });
  },
});

export const clickupDeleteFolder = tool({
  description: "Permanently and irreversibly deletes a specified folder and all its contents (Lists, Tasks) if the folder_id exists.",
  inputSchema: z.object({
    clickupToken: tokenField,
    folderId: z.string().describe("The unique numerical identifier of the folder to be deleted."),
  }),
  execute: async ({ clickupToken, folderId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/folder/${folderId}`);
  },
});

export const clickupGetFolder = tool({
  description: "Retrieves detailed information about a specific folder in ClickUp.",
  inputSchema: z.object({
    clickupToken: tokenField,
    folderId: z.string().describe("The unique identifier of the folder."),
  }),
  execute: async ({ clickupToken, folderId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/folder/${folderId}`);
  },
});

export const clickupGetFolders = tool({
  description: "Retrieves Folders within a specified ClickUp Space, ensuring `space_id` is valid, with an option to filter by archived status.",
  inputSchema: z.object({
    clickupToken: tokenField,
    archived: z.boolean().optional().describe("Filter Folders by archived status. `True` for archived, `False` for unarchived. Omit to return both."),
    spaceId: z.string().describe("The unique numeric identifier of the Space from which to retrieve Folders."),
  }),
  execute: async ({ clickupToken, archived, spaceId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/space/${spaceId}/folder`, { query: { archived: archived } });
  },
});

export const clickupUpdateFolder = tool({
  description: "Updates the name of an existing folder in ClickUp.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("New name for the folder."),
    folderId: z.string().describe("Unique identifier of the folder to update."),
  }),
  execute: async ({ clickupToken, name, folderId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/folder/${folderId}`, { body: nest({ name: name }) });
  },
});

