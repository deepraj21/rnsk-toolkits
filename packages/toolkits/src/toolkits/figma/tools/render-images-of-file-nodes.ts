// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const renderImagesOfFileNodes = tool({
    description:
        'Renders nodes as PNG/JPG/SVG/PDF and returns temporary (30-day) image URLs keyed by node ID. Null means that node failed (bad ID, invisible, 0% opacity). Capped at 32MP — lower scale for large nodes.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        ids: z.string().describe("Comma-separated node IDs, e.g. '1:2,1:3'"),
        format: z.enum(['jpg', 'pdf', 'png', 'svg']).optional().describe('Output format (default png)'),
        scale: z.number().min(0.01).max(4).optional().describe('PNG/JPG scale 0.01-4 (ignored for SVG/PDF)'),
        version: z.string().optional().describe('Version ID; omit for current'),
        contentsOnly: z.boolean().optional().describe('Exclude overlapping content (default true)'),
        useAbsoluteBounds: z.boolean().optional().describe('Full node dimensions, avoids text cropping'),
        svgIncludeId: z.boolean().optional(),
        svgOutlineText: z.boolean().optional(),
        svgIncludeNodeId: z.boolean().optional(),
        svgSimplifyStroke: z.boolean().optional(),
    }),
    execute: async ({ figmaToken, fileKey, ids, format, scale, version, contentsOnly, useAbsoluteBounds, svgIncludeId, svgOutlineText, svgIncludeNodeId, svgSimplifyStroke }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/images`, {
                query: {
                    ids,
                    format,
                    scale,
                    version,
                    contents_only: contentsOnly,
                    use_absolute_bounds: useAbsoluteBounds,
                    svg_include_id: svgIncludeId,
                    svg_outline_text: svgOutlineText,
                    svg_include_node_id: svgIncludeNodeId,
                    svg_simplify_stroke: svgSimplifyStroke,
                },
            });
            if (!result.ok) return { error: 'Failed to render node images', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error rendering node images',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
