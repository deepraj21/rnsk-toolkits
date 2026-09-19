// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

function parseFigmaUrl(url: string): { fileKey?: string; nodeId?: string; teamId?: string; projectId?: string } {
    const out: { fileKey?: string; nodeId?: string; teamId?: string; projectId?: string } = {};
    const fileMatch = url.match(/figma\.com\/(?:file|design|board|proto|slides)\/([A-Za-z0-9]+)/);
    if (fileMatch) out.fileKey = fileMatch[1];
    const nodeMatch = url.match(/[?&]node-id=([\d-]+)/);
    if (nodeMatch) out.nodeId = nodeMatch[1].replace(/-/g, ':');
    const teamMatch = url.match(/figma\.com\/files\/team\/(\d+)/);
    if (teamMatch) out.teamId = teamMatch[1];
    const projectMatch = url.match(/[?&]project(?:_|-)id=(\d+)/);
    if (projectMatch) out.projectId = projectMatch[1];
    return out;
}

export interface NodeInfo { id: string; name: string; type: string; path: string }

function collectNodes(node: Record<string, unknown>, path: string, depth: number, maxDepth: number, out: NodeInfo[]): void {
    const name = String(node.name ?? '');
    const current = path ? `${path}/${name}` : name;
    if (node.id) out.push({ id: String(node.id), name, type: String(node.type ?? ''), path: current });
    if (depth >= maxDepth) return;
    for (const child of ((node.children ?? []) as Array<Record<string, unknown>>)) {
        collectNodes(child, current, depth + 1, maxDepth, out);
    }
}

export const discoverFigmaResources = tool({
    description:
        'Extracts file/node/team IDs from any Figma URL and traverses team → projects → files → nodes. Shallow by default (maxDepth 2-3); target FRAME/CANVAS IDs for big files.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        figmaUrl: z.string().optional().describe('Any Figma URL (/file/, /design/, /board/, /proto/, /slides/, team)'),
        teamId: z.string().optional().describe('Team ID to list projects for'),
        projectId: z.string().optional().describe('Project ID to list files for'),
        fileKey: z.string().optional().describe('File key to list nodes for'),
        maxDepth: z.number().optional().describe('Node traversal depth (default 2)'),
    }),
    execute: async ({ figmaToken, figmaUrl, teamId, projectId, fileKey, maxDepth }) => {
        try {
            const errors: string[] = [];
            const instructions: string[] = [];
            const extracted = figmaUrl ? parseFigmaUrl(figmaUrl) : {};
            const effTeamId = teamId ?? extracted.teamId;
            const effProjectId = projectId ?? extracted.projectId;
            const effFileKey = fileKey ?? extracted.fileKey;
            const projects: Array<Record<string, unknown>> = [];
            const files: Array<Record<string, unknown>> = [];
            const nodes: NodeInfo[] = [];

            if (effTeamId && !effProjectId && !effFileKey) {
                const res = await figmaRequest(figmaToken, `/v1/teams/${effTeamId}/projects`);
                if (!res.ok) errors.push(`Failed to list team projects: ${JSON.stringify(res.error)}`);
                else {
                    const data = res.data as { projects?: Array<{ id?: string; name?: string }> };
                    for (const p of data.projects ?? []) projects.push({ id: p.id, name: p.name });
                    instructions.push('Pass a project_id to list its files.');
                }
            }
            if (effProjectId) {
                const res = await figmaRequest(figmaToken, `/v1/projects/${effProjectId}/files`);
                if (!res.ok) errors.push(`Failed to list project files: ${JSON.stringify(res.error)}`);
                else {
                    const data = res.data as { files?: Array<Record<string, unknown>> };
                    for (const f of data.files ?? []) files.push(f);
                    instructions.push('Pass a file_key to list its nodes.');
                }
            }
            if (effFileKey) {
                const res = await figmaRequest(figmaToken, `/v1/files/${effFileKey}`, { query: { depth: maxDepth ?? 2 } });
                if (!res.ok) errors.push(`Failed to fetch file nodes: ${JSON.stringify(res.error)}`);
                else {
                    const doc = (res.data as { document?: Record<string, unknown> }).document;
                    if (doc) collectNodes(doc, '', 0, maxDepth ?? 2, nodes);
                    instructions.push('Use node IDs with getFileNodes, detectBackground, or image rendering.');
                }
            }
            if (!figmaUrl && !teamId && !projectId && !fileKey) {
                instructions.push('Provide figmaUrl, teamId, projectId, or fileKey to start discovery.');
            }
            return { extracted_ids: extracted, projects, files, nodes, errors, instructions };
        } catch (error) {
            return {
                error: 'Error discovering Figma resources',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
