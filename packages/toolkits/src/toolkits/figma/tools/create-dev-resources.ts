// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const createDevResources = tool({
    description:
        'Attaches uniquely-URLed dev resources (Jira, GitHub, docs) to file nodes, up to 10 per node. Grouped per file automatically.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        devResources: z.array(z.object({
            name: z.string().describe('Visible name in Figma'),
            url: z.string().describe('Resource URL'),
            fileKey: z.string().describe('File key for attachment'),
            nodeId: z.string().describe("Node ID for attachment, e.g. '123:456'"),
        })).min(1).describe('Dev resources to create'),
    }),
    execute: async ({ figmaToken, devResources }) => {
        try {
            const byFile = new Map<string, Array<Record<string, unknown>>>();
            for (const r of devResources) {
                const list = byFile.get(r.fileKey) ?? [];
                list.push({ name: r.name, url: r.url, file_key: r.fileKey, node_id: r.nodeId });
                byFile.set(r.fileKey, list);
            }
            const linksCreated: Array<unknown> = [];
            const errors: Array<unknown> = [];
            for (const [fileKey, items] of byFile) {
                const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/dev_resources`, {
                    method: 'POST',
                    body: { dev_resources: items },
                });
                if (!result.ok) {
                    errors.push({ fileKey, error: result.error });
                    continue;
                }
                const data = result.data as { links_created?: unknown[]; errors?: unknown[] };
                linksCreated.push(...(data.links_created ?? []));
                if (data.errors) errors.push(...data.errors);
            }
            if (linksCreated.length === 0 && errors.length > 0) {
                return { error: 'Failed to create dev resources', details: errors };
            }
            return { links_created: linksCreated, errors };
        } catch (error) {
            return {
                error: 'Error creating dev resources',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
