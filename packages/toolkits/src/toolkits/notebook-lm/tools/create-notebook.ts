// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildParent, getEndpoint, parseResponseError } from './utils.js';

export const createNotebook = tool({
    description:
        'Create a NotebookLM Enterprise notebook in a licensed Google Cloud project and location. Creates a new notebook with the given title.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token (Bearer). Inject via manifest tokenField notebookLmToken.'),
        title: z.string().min(1).describe('Human-readable notebook title.'),
        location: z.string().optional().describe('Geographic location, e.g. global, us, eu. Defaults to global.'),
        endpointLocation: z.string().optional().describe('Multi-region for endpoint: us, eu, global. Defaults to global.'),
        projectNumber: z.string().optional().describe('GCP project number. Defaults to - (token project). Use projects/PROJECT_NUMBER/locations/LOCATION parent.'),
    }),
    execute: async ({ notebookLmToken, title, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const parent = buildParent(projectNumber, location);
            const url = `${endpoint}/${parent}/notebooks`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${notebookLmToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to create notebook', details: err.details };
            }
            const data = await response.json();
            return {
                notebookId: data.notebookId || data.name?.split('/').pop(),
                name: data.name,
                title: data.title,
                emoji: data.emoji,
                metadata: data.metadata,
                sources: data.sources,
                raw: data,
            };
        } catch (error) {
            return { error: 'Error creating notebook', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
