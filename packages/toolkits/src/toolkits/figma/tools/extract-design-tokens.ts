// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

function rgbaToHex(color: Record<string, unknown>): string {
    const to255 = (v: unknown) => Math.round(Number(v ?? 0) * 255);
    const hex = [to255(color.r), to255(color.g), to255(color.b)].map((v) => v.toString(16).padStart(2, '0')).join('');
    return `#${hex}`;
}

function walk(node: Record<string, unknown>, visit: (n: Record<string, unknown>) => void): void {
    visit(node);
    for (const child of ((node.children ?? []) as Array<Record<string, unknown>>)) walk(child, visit);
}

export const extractDesignTokens = tool({
    description:
        'Extracts colors, typography, spacing, radii, and shadows from styles, variables (optional), and node properties. Only style/variable-backed values are captured. Feed output into designTokensToTailwind.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File key from the file URL'),
        includeVariables: z.boolean().optional().describe('Include variables (use getLocalVariables for full mode/alias coverage)'),
        includeLocalStyles: z.boolean().optional().describe('Include local styles (default true)'),
        extractFromNodes: z.boolean().optional().describe('Extract from node properties (default true)'),
    }),
    execute: async ({ figmaToken, fileKey, includeVariables, includeLocalStyles, extractFromNodes }) => {
        try {
            const colors = new Map<string, { name: string; value: string; source: string; usage_count: number }>();
            const typography = new Map<string, Record<string, unknown>>();
            const spacing = new Map<string, Record<string, unknown>>();
            const borderRadius = new Map<string, Record<string, unknown>>();
            const shadows = new Map<string, Record<string, unknown>>();
            const sources: Record<string, number> = { style: 0, variable: 0, extracted: 0 };
            const bump = (map: Map<string, { usage_count: number }>, key: string) => {
                const entry = map.get(key);
                if (entry) entry.usage_count += 1;
            };

            if (includeLocalStyles !== false) {
                const res = await figmaRequest(figmaToken, `/v1/files/${fileKey}/styles`);
                if (res.ok) {
                    const styles = ((res.data as { meta?: { styles?: Array<Record<string, unknown>> } }).meta?.styles ?? []) as Array<Record<string, unknown>>;
                    for (const s of styles) {
                        sources.style += 1;
                        const name = String(s.name ?? 'style');
                        if (s.style_type === 'TEXT') {
                            typography.set(name, { name, source: 'style', usage_count: 0 });
                        } else {
                            colors.set(name, { name, value: '#000000', source: 'style', usage_count: 0 });
                        }
                    }
                }
            }

            if (includeVariables === true) {
                const res = await figmaRequest(figmaToken, `/v1/files/${fileKey}/variables/local`);
                if (res.ok) {
                    const meta = (res.data as { meta?: { variables?: Record<string, Record<string, unknown>> } }).meta;
                    for (const v of Object.values(meta?.variables ?? {})) {
                        sources.variable += 1;
                        const name = String(v.name ?? 'variable');
                        if (v.resolvedType === 'COLOR') {
                            const modes = (v.valuesByMode ?? {}) as Record<string, unknown>;
                            const first = Object.values(modes)[0] as Record<string, unknown> | undefined;
                            colors.set(name, { name, value: first && typeof first === 'object' ? rgbaToHex(first) : '#000000', source: 'variable', usage_count: 0 });
                        }
                    }
                }
            }

            if (extractFromNodes !== false) {
                const res = await figmaRequest(figmaToken, `/v1/files/${fileKey}`, { query: { depth: 4 } });
                if (!res.ok) return { error: 'Failed to fetch file for token extraction', details: res.error };
                const doc = (res.data as { document?: Record<string, unknown> }).document;
                if (doc) {
                    walk(doc, (n) => {
                        for (const fill of ((n.fills ?? []) as Array<Record<string, unknown>>)) {
                            if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
                                const hex = rgbaToHex(fill.color as Record<string, unknown>);
                                const existing = colors.get(hex);
                                if (existing) bump(colors, hex);
                                else {
                                    colors.set(hex, { name: hex, value: hex, source: 'extracted', usage_count: 1 });
                                    sources.extracted += 1;
                                }
                            }
                        }
                        if (typeof n.cornerRadius === 'number' && (n.cornerRadius as number) > 0) {
                            const key = `radius-${n.cornerRadius}`;
                            const existing = borderRadius.get(key);
                            if (existing) (existing.usage_count as number) += 1;
                            else {
                                borderRadius.set(key, { name: key, value: n.cornerRadius, source: 'extracted', usage_count: 1 });
                                sources.extracted += 1;
                            }
                        }
                        const style = n.style as Record<string, unknown> | undefined;
                        if (n.type === 'TEXT' && style?.fontFamily) {
                            const key = `${style.fontFamily}-${style.fontSize ?? ''}-${style.fontWeight ?? ''}`;
                            const existing = typography.get(key);
                            if (existing) (existing.usage_count as number) += 1;
                            else {
                                typography.set(key, { name: String(style.fontFamily), source: 'extracted', font_size: style.fontSize, font_family: style.fontFamily, font_weight: style.fontWeight, line_height: style.lineHeight, letter_spacing: style.letterSpacing, usage_count: 1 });
                                sources.extracted += 1;
                            }
                        }
                        for (const effect of ((n.effects ?? []) as Array<Record<string, unknown>>)) {
                            if ((effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') && effect.visible !== false) {
                                const key = `shadow-${(effect.offset as { x?: number; y?: number })?.x ?? 0}-${(effect.offset as { x?: number; y?: number })?.y ?? 0}-${effect.radius ?? 0}`;
                                const existing = shadows.get(key);
                                if (existing) (existing.usage_count as number) += 1;
                                else {
                                    shadows.set(key, { name: key, source: 'extracted', shadows: [{ type: effect.type, color: effect.color, offset: effect.offset, radius: effect.radius, visible: true }], usage_count: 1 });
                                    sources.extracted += 1;
                                }
                            }
                        }
                    });
                }
            }

            const colorList = [...colors.values()];
            const typoList = [...typography.values()];
            const spacingList = [...spacing.values()];
            const radiusList = [...borderRadius.values()];
            const shadowList = [...shadows.values()];
            return {
                colors: colorList,
                typography: typoList,
                spacing: spacingList,
                border_radius: radiusList,
                shadows: shadowList,
                total_tokens: colorList.length + typoList.length + spacingList.length + radiusList.length + shadowList.length,
                sources,
            };
        } catch (error) {
            return {
                error: 'Error extracting design tokens',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
