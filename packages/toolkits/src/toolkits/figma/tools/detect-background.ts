// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

interface Bounds { x: number; y: number; width: number; height: number }

function contains(outer: Bounds, inner: Bounds): boolean {
    return (
        outer.x <= inner.x &&
        outer.y <= inner.y &&
        outer.x + outer.width >= inner.x + inner.width &&
        outer.y + outer.height >= inner.y + inner.height
    );
}

function overlaps(a: Bounds, b: Bounds): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

interface FlatNode { id: string; name: string; type: string; bounds?: Bounds; fills?: unknown[]; index: number; depth: number; parentId?: string }

function flatten(node: Record<string, unknown>, depth: number, parentId: string | undefined, out: FlatNode[], counter: { n: number }): void {
    const entry: FlatNode = {
        id: String(node.id ?? ''),
        name: String(node.name ?? ''),
        type: String(node.type ?? ''),
        index: counter.n++,
        depth,
        parentId,
    };
    const box = node.absoluteBoundingBox as Bounds | undefined;
    if (box && typeof box.x === 'number') entry.bounds = box;
    if (Array.isArray(node.fills)) entry.fills = node.fills as unknown[];
    out.push(entry);
    for (const child of ((node.children ?? []) as Array<Record<string, unknown>>)) {
        flatten(child, depth + 1, entry.id, out, counter);
    }
}

export const detectBackground = tool({
    description:
        'Finds background candidates behind target nodes using geometry (containment/overlap), z-order, fills, and naming. Returns candidates with 0-1 confidence and reasons.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Design file key (FigJam/Slides not supported)'),
        targetNodeIds: z.array(z.string()).min(1).describe("Node IDs to find backgrounds for, e.g. ['1:2']"),
        searchDepth: z.number().min(1).max(10).optional().describe('Ancestor levels to search (default 3)'),
    }),
    execute: async ({ figmaToken, fileKey, targetNodeIds, searchDepth }) => {
        try {
            const depth = searchDepth ?? 3;
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}`, { query: { depth: depth + 2 } });
            if (!result.ok) return { error: 'Failed to fetch file for background detection', details: result.error };
            const doc = (result.data as { document?: Record<string, unknown> }).document;
            if (!doc) return { error: 'No document in file response' };
            const flat: FlatNode[] = [];
            flatten(doc, 0, undefined, flat, { n: 0 });
            const byId = new Map(flat.map((n) => [n.id, n]));
            const backgrounds: Record<string, Array<Record<string, unknown>>> = {};
            for (const targetId of targetNodeIds) {
                const target = byId.get(targetId);
                if (!target?.bounds) {
                    backgrounds[targetId] = [];
                    continue;
                }
                const ancestors = new Set<string>();
                let current: FlatNode | undefined = target;
                for (let i = 0; i < depth && current?.parentId; i++) {
                    const parent = byId.get(current.parentId);
                    if (!parent) break;
                    ancestors.add(parent.id);
                    current = parent;
                }
                const candidates: Array<Record<string, unknown>> = [];
                for (const node of flat) {
                    if (node.id === targetId || !node.bounds) continue;
                    if (!ancestors.has(node.id) && node.parentId !== target.parentId) continue;
                    if (node.index > target.index) continue; // painted after target → in front
                    let confidence = 0;
                    const reasons: string[] = [];
                    if (contains(node.bounds, target.bounds)) {
                        confidence += 0.45;
                        reasons.push('contains target bounds');
                    } else if (overlaps(node.bounds, target.bounds)) {
                        confidence += 0.2;
                        reasons.push('overlaps target bounds');
                    } else {
                        continue;
                    }
                    if (node.fills && node.fills.length > 0) {
                        confidence += 0.2;
                        reasons.push('has fills');
                    }
                    if (/background|^bg\b/i.test(node.name)) {
                        confidence += 0.25;
                        reasons.push('background-like name');
                    }
                    if (['RECTANGLE', 'FRAME'].includes(node.type)) {
                        confidence += 0.1;
                        reasons.push(`type ${node.type}`);
                    }
                    candidates.push({
                        node_id: node.id,
                        name: node.name,
                        type: node.type,
                        confidence: Math.min(1, Math.round(confidence * 100) / 100),
                        reason: reasons.join('; '),
                        bounds: node.bounds,
                    });
                }
                candidates.sort((a, b) => (b.confidence as number) - (a.confidence as number));
                backgrounds[targetId] = candidates;
            }
            return { backgrounds };
        } catch (error) {
            return {
                error: 'Error detecting backgrounds',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
