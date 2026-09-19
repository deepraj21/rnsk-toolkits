// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

function sanitizeName(name: string, prefix: string): string {
    return `${prefix}${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/^-+|-+$/g, '') || `${prefix}token`;
}

function rgbaToCss(color: unknown): string {
    if (typeof color === 'string') return color;
    const c = (color ?? {}) as { r?: number; g?: number; b?: number; a?: number };
    const to255 = (v: number | undefined) => Math.round((v ?? 0) * 255);
    const a = c.a ?? 1;
    if (a >= 1) {
        const hex = [to255(c.r), to255(c.g), to255(c.b)].map((v) => v.toString(16).padStart(2, '0')).join('');
        return `#${hex}`;
    }
    return `rgba(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)}, ${a})`;
}

function shadowToCss(shadow: Record<string, unknown>): string {
    const color = rgbaToCss(shadow.color);
    const offset = (shadow.offset ?? {}) as { x?: number; y?: number };
    const x = offset.x ?? (shadow as { x?: number }).x ?? 0;
    const y = offset.y ?? (shadow as { y?: number }).y ?? 0;
    const blur = (shadow.radius ?? (shadow as { blur?: number }).blur ?? 0) as number;
    const inset = shadow.type === 'INNER_SHADOW' ? 'inset ' : '';
    return `${inset}${x}px ${y}px ${blur}px ${color}`;
}

export const designTokensToTailwind = tool({
    description:
        'Converts extracted design tokens (from extractDesignTokens) into a tailwind.config (ts/js) with theme extensions plus optional globals.css font imports. Pure computation — no auth needed.',
    inputSchema: z.object({
        tokens: z.record(z.any()).describe('DesignTokens object from extractDesignTokens'),
        prefix: z.string().optional().describe("Prefix for token names, e.g. 'brand-'"),
        configFormat: z.string().optional().describe("Output format 'ts' (default) or 'js'"),
        includeFontImports: z.boolean().optional().describe('Add Google Fonts @imports (default true)'),
    }),
    execute: async ({ tokens, prefix, configFormat, includeFontImports }) => {
        try {
            const p = prefix ?? '';
            const format = configFormat === 'js' ? 'js' : 'ts';
            const withFonts = includeFontImports !== false;
            const colors: Record<string, string> = {};
            for (const c of ((tokens.colors ?? []) as Array<Record<string, unknown>>)) {
                colors[sanitizeName(String(c.name ?? 'color'), p)] = rgbaToCss(c.value);
                if (typeof c.opacity === 'number' && c.opacity < 1 && typeof c.value === 'string') {
                    colors[sanitizeName(String(c.name ?? 'color'), p)] = c.value;
                }
            }
            const fontFamily: Record<string, string[]> = {};
            const fontSize: Record<string, string> = {};
            const fontWeight: Record<string, number> = {};
            const lineHeight: Record<string, string> = {};
            const letterSpacing: Record<string, string> = {};
            const googleFonts = new Set<string>();
            for (const t of ((tokens.typography ?? []) as Array<Record<string, unknown>>)) {
                const base = sanitizeName(String(t.name ?? 'text'), p);
                if (t.font_family) {
                    const family = String(t.font_family);
                    fontFamily[base] = [family, 'sans-serif'];
                    googleFonts.add(family);
                }
                if (typeof t.font_size === 'number') fontSize[base] = `${t.font_size}px`;
                if (typeof t.font_weight === 'number') fontWeight[base] = t.font_weight as number;
                if (typeof t.line_height === 'number') lineHeight[base] = `${t.line_height}px`;
                if (typeof t.letter_spacing === 'number') letterSpacing[base] = `${t.letter_spacing}px`;
            }
            const spacing: Record<string, string> = {};
            for (const s of ((tokens.spacing ?? []) as Array<Record<string, unknown>>)) {
                if (typeof s.value === 'number') spacing[sanitizeName(String(s.name ?? 'space'), p)] = `${s.value}px`;
            }
            const borderRadius: Record<string, string> = {};
            for (const b of ((tokens.border_radius ?? []) as Array<Record<string, unknown>>)) {
                const v = b.value;
                borderRadius[sanitizeName(String(b.name ?? 'radius'), p)] =
                    typeof v === 'number' ? `${v}px` : JSON.stringify(v);
            }
            const boxShadow: Record<string, string> = {};
            for (const s of ((tokens.shadows ?? []) as Array<Record<string, unknown>>)) {
                const parts = ((s.shadows ?? []) as Array<Record<string, unknown>>).map(shadowToCss);
                if (parts.length > 0) boxShadow[sanitizeName(String(s.name ?? 'shadow'), p)] = parts.join(', ');
            }
            const theme = { colors, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, spacing, borderRadius, boxShadow };
            const exportKw = format === 'ts' ? 'export default' : 'module.exports =';
            const typeAnn = format === 'ts' ? ': import("tailwindcss").Config' : '';
            const configContent = `${exportKw} {\n  theme: {\n    extend: ${JSON.stringify(theme, null, 2)}\n  }\n}${typeAnn};\n`;
            let globalsCss: string | undefined;
            if (withFonts && googleFonts.size > 0) {
                globalsCss = [...googleFonts]
                    .map((f) => `@import url('https://fonts.googleapis.com/css2?family=${f.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap');`)
                    .join('\n');
            }
            const tokenSummary = {
                colors: Object.keys(colors).length,
                fontFamilies: Object.keys(fontFamily).length,
                spacing: Object.keys(spacing).length,
                borderRadius: Object.keys(borderRadius).length,
                boxShadow: Object.keys(boxShadow).length,
                total:
                    Object.keys(colors).length +
                    Object.keys(fontFamily).length +
                    Object.keys(spacing).length +
                    Object.keys(borderRadius).length +
                    Object.keys(boxShadow).length,
            };
            return { config_content: configContent, globals_css: globalsCss, token_summary: tokenSummary };
        } catch (error) {
            return {
                error: 'Error converting tokens to Tailwind',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
