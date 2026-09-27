// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pinterestRequest, toPinterestError } from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Pinterest OAuth access token — match manifest tokenField');
const boardIdField = z.string().describe('Numeric Pinterest board ID, e.g. "971159175836869234"');
const pageFields = {
    bookmark: z.string().optional().describe('Opaque bookmark from the previous page. Omit for the first page.'),
    pageSize: z.number().int().min(1).max(250).optional().describe('Max items to return, 1-250 (default 25)'),
};

export const listBoards = tool({
    description:
        'List the connected account boards (public, protected, secret) one page at a time. Start here to discover board IDs.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        privacy: z
            .enum(['ALL', 'PUBLIC', 'PROTECTED', 'SECRET', 'PUBLIC_AND_SECRET'])
            .optional()
            .describe('Privacy filter (default ALL). SECRET needs boards:read_secret.'),
        ...pageFields,
    }),
    execute: async ({ pinterestToken, privacy, bookmark, pageSize }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/boards', {
                query: { privacy, bookmark, page_size: pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Pinterest boards', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error listing Pinterest boards');
        }
    },
});

export const getBoard = tool({
    description: 'Get one board by ID, including secret boards available to the connected account.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
    }),
    execute: async ({ pinterestToken, boardId }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/boards/${encodeURIComponent(boardId)}`);
            if (!result.ok) return failedResult(`Failed to get Pinterest board "${boardId}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error getting Pinterest board "${boardId}"`);
        }
    },
});

export const createBoard = tool({
    description: 'Create a public or secret board. Secret creation needs boards:write_secret scope.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        name: z.string().min(1).max(50).describe('Board name, 1-50 characters, e.g. "Summer recipes"'),
        privacy: z.enum(['PUBLIC', 'SECRET']).optional().describe('Board privacy (default PUBLIC)'),
        description: z.string().optional().describe('Optional board description'),
    }),
    execute: async ({ pinterestToken, name, privacy, description }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/boards', {
                method: 'POST',
                body: { name, privacy, description },
            });
            if (!result.ok) return failedResult('Failed to create Pinterest board', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error creating Pinterest board');
        }
    },
});

export const updateBoard = tool({
    description: 'Update a board name, description, or privacy (PUBLIC/SECRET). Provide at least one update field.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        name: z.string().min(1).max(50).optional().describe('Replacement board name'),
        privacy: z.enum(['PUBLIC', 'SECRET']).optional().describe('Replacement privacy'),
        description: z.string().optional().describe('Replacement board description'),
    }),
    execute: async ({ pinterestToken, boardId, name, privacy, description }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/boards/${encodeURIComponent(boardId)}`, {
                method: 'PATCH',
                body: { name, privacy, description },
            });
            if (!result.ok) return failedResult(`Failed to update Pinterest board "${boardId}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error updating Pinterest board "${boardId}"`);
        }
    },
});

export const deleteBoard = tool({
    description: 'Permanently delete a board by ID, including secret boards when authorized.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
    }),
    execute: async ({ pinterestToken, boardId }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/boards/${encodeURIComponent(boardId)}`, {
                method: 'DELETE',
            });
            if (!result.ok) return failedResult(`Failed to delete Pinterest board "${boardId}"`, result);
            return { success: true, boardId, statusCode: result.status };
        } catch (error) {
            return toPinterestError(error, `Error deleting Pinterest board "${boardId}"`);
        }
    },
});

export const listBoardSections = tool({
    description: 'List sections within a board one page at a time.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        ...pageFields,
    }),
    execute: async ({ pinterestToken, boardId, bookmark, pageSize }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/boards/${encodeURIComponent(boardId)}/sections`,
                { query: { bookmark, page_size: pageSize } },
            );
            if (!result.ok) return failedResult('Failed to list Pinterest board sections', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error listing Pinterest board sections');
        }
    },
});

export const createBoardSection = tool({
    description: 'Create a named section within a board.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        name: z.string().min(1).max(180).describe('Section name, 1-180 characters'),
    }),
    execute: async ({ pinterestToken, boardId, name }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/boards/${encodeURIComponent(boardId)}/sections`,
                { method: 'POST', body: { name } },
            );
            if (!result.ok) return failedResult('Failed to create Pinterest board section', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error creating Pinterest board section');
        }
    },
});

export const updateBoardSection = tool({
    description: 'Rename a section within a board.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        sectionId: z.string().describe('Numeric section ID, e.g. "3741779646141792576"'),
        name: z.string().min(1).max(180).describe('Replacement section name'),
    }),
    execute: async ({ pinterestToken, boardId, sectionId, name }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/boards/${encodeURIComponent(boardId)}/sections/${encodeURIComponent(sectionId)}`,
                { method: 'PATCH', body: { name } },
            );
            if (!result.ok) return failedResult('Failed to update Pinterest board section', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error updating Pinterest board section');
        }
    },
});

export const deleteBoardSection = tool({
    description: 'Permanently delete a section from a board.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        sectionId: z.string().describe('Numeric section ID to delete'),
    }),
    execute: async ({ pinterestToken, boardId, sectionId }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/boards/${encodeURIComponent(boardId)}/sections/${encodeURIComponent(sectionId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok) return failedResult('Failed to delete Pinterest board section', result);
            return { success: true, boardId, sectionId, statusCode: result.status };
        } catch (error) {
            return toPinterestError(error, 'Error deleting Pinterest board section');
        }
    },
});

export const listBoardPins = tool({
    description: 'List Pins on a board, with optional creative-type and metrics. Use section listing for section inventory.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        creativeTypes: z
            .array(z.string())
            .optional()
            .describe('Filter, e.g. ["REGULAR","VIDEO"]. Sent as one comma-separated value.'),
        pinMetrics: z.boolean().optional().describe('Include 90-day and lifetime Pin metrics'),
        ...pageFields,
    }),
    execute: async ({ pinterestToken, boardId, creativeTypes, pinMetrics, bookmark, pageSize }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/boards/${encodeURIComponent(boardId)}/pins`,
                {
                    query: {
                        creative_types: creativeTypes?.join(','),
                        pin_metrics: pinMetrics,
                        bookmark,
                        page_size: pageSize,
                    },
                },
            );
            if (!result.ok) return failedResult('Failed to list Pins on Pinterest board', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error listing Pins on Pinterest board');
        }
    },
});

export const listSectionPins = tool({
    description: 'List Pins in a board section. Metrics are not supported for section listing.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: boardIdField,
        sectionId: z.string().describe('Numeric section ID'),
        ...pageFields,
    }),
    execute: async ({ pinterestToken, boardId, sectionId, bookmark, pageSize }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/boards/${encodeURIComponent(boardId)}/sections/${encodeURIComponent(sectionId)}/pins`,
                { query: { bookmark, page_size: pageSize } },
            );
            if (!result.ok) return failedResult('Failed to list Pins in Pinterest board section', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error listing Pins in Pinterest board section');
        }
    },
});
