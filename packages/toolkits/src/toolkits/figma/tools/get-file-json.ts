// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFileJson = tool({
    description:
        'Gets a Design file document tree. Design files only — FigJam/Slides return 400. Use ids for subtrees and depth to bound size; large files without scope can time out.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File key from figma.com/design/FILE_KEY/... or figma.com/file/FILE_KEY/...'),
        ids: z.string().optional().describe('Comma-separated node IDs for subtrees (hyphen URL form must be converted to colons, e.g. 1-2 → 1:2)'),
        depth: z.number().optional().describe('Traversal depth; omit only for small files'),
        version: z.string().optional().describe('Version ID; omit for current'),
        geometry: z.string().optional().describe("Set to 'paths' for vector data"),
        branchData: z.boolean().optional().describe('Include branch metadata'),
        pluginData: z.string().optional().describe('Comma-separated plugin IDs for plugin data'),
        responseDetail: z.enum(['minimal', 'full']).optional().describe('Minimal returns raw API JSON (simplification happens client-side)'),
    }),
    execute: async ({ figmaToken, fileKey, ids, depth, version, geometry, branchData, pluginData }) => {
        try {
            if (ids) {
                const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/nodes`, {
                    query: { ids, depth, version, geometry, plugin_data: pluginData },
                });
                if (!result.ok) return { error: 'Failed to get file nodes', details: result.error };
                return result.data;
            }
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}`, {
                query: {
                    depth,
                    version,
                    geometry,
                    branch_data: branchData,
                    plugin_data: pluginData,
                },
            });
            if (!result.ok) return { error: 'Failed to get file JSON', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file JSON',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
