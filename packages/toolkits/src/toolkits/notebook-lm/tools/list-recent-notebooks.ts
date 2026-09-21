// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildParent, getEndpoint, parseResponseError } from './utils.js';

export const listRecentNotebooks = tool({
    description:
        'List up to 500 NotebookLM Enterprise notebooks ordered by when the connected user last viewed them. Google currently omits continuation tokens, so accounts with more than 500 notebooks may not expose older results.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        location: z.string().optional().describe('Location, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region us/eu/global, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
        pageSize: z.number().optional().describe('Optional page size for pagination, when supported.'),
    }),
    execute: async ({ notebookLmToken, location, endpointLocation, projectNumber, pageSize }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const parent = buildParent(projectNumber, location);
            const params = new URLSearchParams();
            if (pageSize) params.set('pageSize', String(pageSize));
            const query = params.toString() ? `?${params.toString()}` : '';
            const url = `${endpoint}/${parent}/notebooks:listRecentlyViewed${query}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to list recent notebooks', details: err.details };
            }
            const data = await response.json();
            return { notebooks: data.notebooks || [], raw: data };
        } catch (error) {
            return { error: 'Error listing notebooks', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
