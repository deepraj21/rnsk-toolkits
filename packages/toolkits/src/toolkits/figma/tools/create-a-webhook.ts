// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

const eventType = z.enum(['FILE_COMMENT', 'FILE_DELETE', 'FILE_UPDATE', 'FILE_VERSION_UPDATE', 'LIBRARY_PUBLISH']);

export const createAWebhook = tool({
    description:
        'Creates a team/project/file webhook. Figma PINGs the endpoint on creation unless PAUSED. Extract team/project/file IDs from Figma URLs or discoverFigmaResources.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        eventType: eventType.describe('Event that triggers the webhook'),
        endpoint: z.string().describe('Public HTTPS URL receiving Figma POSTs (max 2048 chars)'),
        passcode: z.string().describe('Secret for verifying Figma requests (max 100 chars)'),
        context: z.enum(['team', 'project', 'file']).optional().describe('Scope; use with contextId'),
        contextId: z.string().optional().describe('Team, project, or file ID to monitor'),
        teamId: z.string().optional().describe('DEPRECATED: use context=team with contextId'),
        status: z.enum(['ACTIVE', 'PAUSED']).optional().describe('Initial status (default ACTIVE)'),
        description: z.string().optional().describe('Human-readable purpose (max 150 chars)'),
    }),
    execute: async ({ figmaToken, eventType, endpoint, passcode, context, contextId, teamId, status, description }) => {
        try {
            const body: Record<string, unknown> = { event_type: eventType, endpoint, passcode };
            if (context) body.context = context;
            if (contextId) body.context_id = contextId;
            if (teamId) body.team_id = teamId;
            if (status) body.status = status;
            if (description) body.description = description;
            const result = await figmaRequest(figmaToken, '/v2/webhooks', { method: 'POST', body });
            if (!result.ok) return { error: 'Failed to create webhook', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error creating webhook',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
