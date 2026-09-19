// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFileNodes = tool({
    description:
        'Fetches JSON for known node IDs without full-file payloads. Use after shallow fetches or component listings; prefer depth=1 for discovery.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        ids: z.union([z.string(), z.array(z.string())]).describe("Node IDs as '1:5,1:6' or ['1:5','1:6']"),
        depth: z.number().optional().describe('Subtree depth; depth=1 for fast discovery'),
        version: z.string().optional().describe('Version ID; omit for current'),
        geometry: z.string().optional().describe("Set to 'paths' for vector data"),
        pluginData: z.string().optional().describe("Plugin IDs or 'shared' for plugin data"),
    }),
    execute: async ({ figmaToken, fileKey, ids, depth, version, geometry, pluginData }) => {
        try {
            const idsParam = Array.isArray(ids) ? ids.join(',') : ids;
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/nodes`, {
                query: { ids: idsParam, depth, version, geometry, plugin_data: pluginData },
            });
            if (!result.ok) return { error: 'Failed to get file nodes', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file nodes',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
