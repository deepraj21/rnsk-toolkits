// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, onenoteBase, failedResult, toOneNoteError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const ownerField = z
  .string()
  .optional()
  .describe('Notebook owner user ID or UPN (default signed-in user)');

export const onenoteListNotebooks = tool({
  description:
    'List OneNote notebooks with names, links, and default flags. Use to discover notebook IDs.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    expand: z.string().optional().describe('Expand sections and/or sectionGroups inline'),
    top: z.number().int().min(1).optional().describe('Notebooks per page'),
  }),
  execute: async ({ onenoteToken, owner, expand, top }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/notebooks`, {
        query: { $expand: expand, $top: top },
      });
      if (!result.ok) return failedResult('Failed to list notebooks', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing notebooks');
    }
  },
});

export const onenoteGetNotebook = tool({
  description: 'Get one notebook with metadata and links.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Notebook ID'),
  }),
  execute: async ({ onenoteToken, owner, notebookId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}`,
      );
      if (!result.ok) return failedResult('Failed to get notebook', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting notebook');
    }
  },
});

export const onenoteCreateNotebook = tool({
  description: 'Create a notebook with a display name.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    displayName: z.string().describe('Notebook display name'),
  }),
  execute: async ({ onenoteToken, owner, displayName }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/notebooks`, {
        method: 'POST',
        body: { displayName },
      });
      if (!result.ok) return failedResult('Failed to create notebook', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error creating notebook');
    }
  },
});

export const onenoteUpdateNotebook = tool({
  description: 'Rename a notebook.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Notebook ID'),
    displayName: z.string().describe('New display name'),
  }),
  execute: async ({ onenoteToken, owner, notebookId, displayName }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}`,
        { method: 'PATCH', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to update notebook', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error updating notebook');
    }
  },
});

export const onenoteListNotebookSections = tool({
  description: 'List sections directly under a notebook.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Notebook ID'),
  }),
  execute: async ({ onenoteToken, owner, notebookId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}/sections`,
      );
      if (!result.ok) return failedResult('Failed to list notebook sections', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing notebook sections');
    }
  },
});

export const onenoteListNotebookSectionGroups = tool({
  description: 'List section groups directly under a notebook.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Notebook ID'),
  }),
  execute: async ({ onenoteToken, owner, notebookId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}/sectionGroups`,
      );
      if (!result.ok) return failedResult('Failed to list notebook section groups', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing notebook section groups');
    }
  },
});

export const onenoteCopyNotebook = tool({
  description:
    'Copy a notebook to another group (or rename in place). Long-running: poll the operation URL when returned.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Notebook ID'),
    groupId: z.string().optional().describe('Destination group ID (omit to copy in place)'),
    renameAs: z.string().optional().describe('New name for the copy'),
  }),
  execute: async ({ onenoteToken, owner, notebookId, groupId, renameAs }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}/copyNotebook`,
        {
          method: 'POST',
          body: {
            ...(groupId !== undefined ? { groupId } : {}),
            ...(renameAs !== undefined ? { renameAs } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to copy notebook', result);
      return result.data ?? { copied: true };
    } catch (error) {
      return toOneNoteError(error, 'Error copying notebook');
    }
  },
});

export const onenoteListSectionGroups = tool({
  description: 'List all section groups across notebooks, including nested ones.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
  }),
  execute: async ({ onenoteToken, owner }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/sectionGroups`);
      if (!result.ok) return failedResult('Failed to list section groups', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing section groups');
    }
  },
});

export const onenoteGetSectionGroup = tool({
  description: 'Get one section group with parent notebook/group links.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionGroupId: z.string().describe('Section group ID'),
  }),
  execute: async ({ onenoteToken, owner, sectionGroupId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sectionGroups/${sectionGroupId}`,
      );
      if (!result.ok) return failedResult('Failed to get section group', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting section group');
    }
  },
});

export const onenoteCreateSectionGroup = tool({
  description: 'Create a section group directly under a notebook.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Parent notebook ID'),
    displayName: z.string().describe('Section group display name'),
  }),
  execute: async ({ onenoteToken, owner, notebookId, displayName }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}/sectionGroups`,
        { method: 'POST', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to create section group', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error creating section group');
    }
  },
});

export const onenoteUpdateSectionGroup = tool({
  description: 'Rename a section group.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionGroupId: z.string().describe('Section group ID'),
    displayName: z.string().describe('New display name'),
  }),
  execute: async ({ onenoteToken, owner, sectionGroupId, displayName }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sectionGroups/${sectionGroupId}`,
        { method: 'PATCH', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to update section group', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error updating section group');
    }
  },
});

export const onenoteDeleteSectionGroup = tool({
  description: 'Delete a section group and its sections/pages.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionGroupId: z.string().describe('Section group ID'),
  }),
  execute: async ({ onenoteToken, owner, sectionGroupId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sectionGroups/${sectionGroupId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete section group', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOneNoteError(error, 'Error deleting section group');
    }
  },
});

export const onenoteListSectionGroupSections = tool({
  description: 'List sections directly under a section group.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionGroupId: z.string().describe('Section group ID'),
  }),
  execute: async ({ onenoteToken, owner, sectionGroupId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sectionGroups/${sectionGroupId}/sections`,
      );
      if (!result.ok) return failedResult('Failed to list section group sections', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing section group sections');
    }
  },
});

export const onenoteCreateSectionInGroup = tool({
  description: 'Create a section inside a section group.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionGroupId: z.string().describe('Parent section group ID'),
    displayName: z.string().describe('Section display name'),
  }),
  execute: async ({ onenoteToken, owner, sectionGroupId, displayName }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sectionGroups/${sectionGroupId}/sections`,
        { method: 'POST', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to create section in group', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error creating section in group');
    }
  },
});

export const onenoteGetOperation = tool({
  description:
    'Get the status of a long-running OneNote operation (e.g. notebook copy) by operation ID.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    operationId: z.string().describe('Operation ID from the copy response'),
  }),
  execute: async ({ onenoteToken, owner, operationId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/operations/${operationId}`,
      );
      if (!result.ok) return failedResult('Failed to get operation', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting operation');
    }
  },
});
