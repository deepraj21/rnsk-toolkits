// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

const MIME_BY_FORMAT: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', pdf: 'application/pdf' };

export const downloadFigmaImages = tool({
    description:
        'Renders nodes and downloads the bytes (base64) in PNG/SVG/JPG/PDF. Find node IDs via getFileJson or node-id in URLs. Render URLs expire fast — bytes are fetched immediately.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File key from the file URL'),
        images: z.array(z.object({
            nodeId: z.string().describe("Node ID, e.g. '1:2'"),
            fileName: z.string().describe("Output filename, e.g. 'logo.png'"),
            format: z.string().optional().describe("png (default), svg, jpg, or pdf"),
        })).min(1),
        scale: z.number().optional().describe('PNG/JPG scale 0.01-4 (default 2)'),
        svgIncludeId: z.boolean().optional(),
        svgOutlineText: z.boolean().optional(),
        svgSimplifyStroke: z.boolean().optional(),
    }),
    execute: async ({ figmaToken, fileKey, images, scale, svgIncludeId, svgOutlineText, svgSimplifyStroke }) => {
        try {
            const byFormat = new Map<string, typeof images>();
            for (const img of images) {
                const fmt = (img.format ?? 'png').toLowerCase();
                const list = byFormat.get(fmt) ?? [];
                list.push(img);
                byFormat.set(fmt, list);
            }
            const downloaded: Array<Record<string, unknown>> = [];
            for (const [format, group] of byFormat) {
                const render = await figmaRequest(figmaToken, `/v1/files/${fileKey}/images`, {
                    query: {
                        ids: group.map((g) => g.nodeId).join(','),
                        format,
                        scale: format === 'svg' || format === 'pdf' ? undefined : (scale ?? 2),
                        svg_include_id: svgIncludeId,
                        svg_outline_text: svgOutlineText,
                        svg_simplify_stroke: svgSimplifyStroke,
                    },
                });
                if (!render.ok) {
                    for (const g of group) {
                        downloaded.push({ node_id: g.nodeId, file_name: g.fileName, success: false, error: JSON.stringify(render.error) });
                    }
                    continue;
                }
                const urlMap = (render.data as { images?: Record<string, string | null> }).images ?? {};
                for (const g of group) {
                    const url = urlMap[g.nodeId];
                    if (!url) {
                        downloaded.push({ node_id: g.nodeId, file_name: g.fileName, success: false, error: 'Render returned null for node' });
                        continue;
                    }
                    try {
                        const bytes = await fetch(url).then((r) => {
                            if (!r.ok) throw new Error(`HTTP ${r.status}`);
                            return r.arrayBuffer();
                        });
                        downloaded.push({
                            node_id: g.nodeId,
                            file_name: g.fileName,
                            success: true,
                            mimetype: MIME_BY_FORMAT[format] ?? 'application/octet-stream',
                            content_base64: Buffer.from(bytes).toString('base64'),
                            source_url: url,
                        });
                    } catch (fetchError) {
                        downloaded.push({ node_id: g.nodeId, file_name: g.fileName, success: false, error: fetchError instanceof Error ? fetchError.message : 'Download failed', source_url: url });
                    }
                }
            }
            const successfulCount = downloaded.filter((d) => d.success).length;
            return { downloaded_images: downloaded, successful_count: successfulCount, failed_count: downloaded.length - successfulCount };
        } catch (error) {
            return {
                error: 'Error downloading Figma images',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
