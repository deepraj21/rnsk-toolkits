// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');

export const confluenceCreateWhiteboard = tool({
    description: 'Start a collaborative whiteboard in a space, optionally nested under a parent page.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceId: z.string().describe('Space numeric ID.'),
        title: z.string().optional().describe('Whiteboard title (renamable later).'),
        parentId: z.string().optional().describe('Parent content ID to nest under.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceId, title, parentId }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/whiteboards',
            method: 'POST',
            body: { spaceId, title, parentId },
        });
    },
});
