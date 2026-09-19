// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

function walk(node: Record<string, unknown>, visit: (n: Record<string, unknown>) => void): void {
    visit(node);
    for (const child of ((node.children ?? []) as Array<Record<string, unknown>>)) walk(child, visit);
}

export const extractPrototypeInteractions = tool({
    description:
        'Extracts prototype flows, node interactions (triggers, actions, transitions), and component variant states from a file.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File key from the file URL'),
        analyzeComponents: z.boolean().optional().describe('Extract component variant states (default true)'),
        includeAnimations: z.boolean().optional().describe('Include transition animation data (default true)'),
    }),
    execute: async ({ figmaToken, fileKey, analyzeComponents, includeAnimations }) => {
        try {
            const withAnims = includeAnimations !== false;
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}`, { query: { depth: 6 } });
            if (!result.ok) return { error: 'Failed to fetch file for prototype extraction', details: result.error };
            const data = result.data as {
                document?: Record<string, unknown>;
                prototypeStartingPoints?: Array<{ nodeId?: string; name?: string }>;
                components?: Record<string, Record<string, unknown>>;
                componentSets?: Record<string, Record<string, unknown>>;
            };
            const interactions: Array<Record<string, unknown>> = [];
            const animationTypes = new Set<string>();
            if (data.document) {
                walk(data.document, (n) => {
                    const nodeInteractions = (n.interactions ?? n.prototypeInteractions) as Array<Record<string, unknown>> | undefined;
                    if (!Array.isArray(nodeInteractions) || nodeInteractions.length === 0) return;
                    const actions = nodeInteractions.flatMap((i) =>
                        ((i.actions ?? []) as Array<Record<string, unknown>>).map((a) => {
                            const transition = (a.transition ?? a as Record<string, unknown>).transition as Record<string, unknown> | undefined;
                            const t = (transition ?? a) as Record<string, unknown>;
                            if (withAnims && typeof t.type === 'string') animationTypes.add(t.type);
                            return {
                                type: a.type,
                                navigation: a.navigation,
                                destination_id: a.destinationId,
                                url: a.url,
                                transition: withAnims ? (transition ?? undefined) : undefined,
                            };
                        }),
                    );
                    interactions.push({
                        node_id: n.id,
                        node_name: n.name,
                        trigger: nodeInteractions.map((i) => i.trigger),
                        actions,
                    });
                });
            }
            const componentStates: Array<Record<string, unknown>> = [];
            if (analyzeComponents !== false) {
                for (const [id, set] of Object.entries(data.componentSets ?? {})) {
                    componentStates.push({ component_id: id, name: set.name, variants: [], default_variant: undefined });
                }
            }
            const prototypeFlows = (data.prototypeStartingPoints ?? []).map((p) => ({
                name: p.name ?? '',
                starting_node_id: p.nodeId ?? '',
                nodes_in_flow: [] as string[],
            }));
            return {
                interactions,
                component_states: componentStates,
                prototype_flows: prototypeFlows,
                total_interactions: interactions.length,
                animation_types_used: [...animationTypes],
            };
        } catch (error) {
            return {
                error: 'Error extracting prototype interactions',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
