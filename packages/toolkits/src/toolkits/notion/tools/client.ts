// @ts-nocheck
const BASE = 'https://api.notion.com/v1';
export const NOTION_VERSION_CLASSIC = '2022-06-28';
export const NOTION_VERSION_VIEWS = '2025-09-03';

export async function notionRequest(
    notionToken: string,
    path: string,
    options?: {
        method?: string;
        body?: unknown;
        query?: Record<string, string | number | undefined>;
        version?: string;
        formData?: FormData;
    },
) {
    const url = new URL(`${BASE}${path}`);
    if (options?.query) {
        for (const [k, v] of Object.entries(options.query)) {
            if (v !== undefined) url.searchParams.set(k, String(v));
        }
    }
    const headers: Record<string, string> = {
        Authorization: `Bearer ${notionToken}`,
        'Notion-Version': options?.version ?? NOTION_VERSION_CLASSIC,
    };
    let body: BodyInit | undefined;
    if (options?.formData) {
        body = options.formData;
    } else if (options?.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(options.body);
    }
    const response = await fetch(url.toString(), {
        method: options?.method ?? 'GET',
        headers,
        body,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        return { error: 'Notion request failed', status: response.status, details: data };
    }
    return data;
}

export function toNotionError(error: unknown, label: string) {
    if ((error as any)?.details !== undefined) return error;
    return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

export function normalizeId(id: string): string {
    return id.replace(/-/g, '').replace(/.*([0-9a-f]{32})$/i, '$1').replace(
        /(.{8})(.{4})(.{4})(.{4})(.{12})/,
        '$1-$2-$3-$4-$5',
    );
}

export function extractIdFromUrl(pageUrl: string): string {
    const m = pageUrl.match(/([0-9a-f]{32})(?:[?#]|$)/i);
    if (!m) throw new Error('Could not extract a page ID from the URL');
    return normalizeId(m[1]);
}

export function richText(content: string): Array<{ type: 'text'; text: { content: string } }> {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += 2000) chunks.push(content.slice(i, i + 2000));
    if (chunks.length === 0) chunks.push('');
    return chunks.map((c) => ({ type: 'text', text: { content: c } }));
}

/** Minimal markdown -> Notion blocks converter (headings, lists, todos, quotes, dividers, code fences, paragraphs). */
export function markdownToBlocks(markdown: string): any[] {
    const blocks: any[] = [];
    const lines = markdown.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith('```')) {
            const language = line.slice(3).trim() || 'plain text';
            const code: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                code.push(lines[i]);
                i++;
            }
            i++;
            blocks.push({ type: 'code', code: { language, rich_text: richText(code.join('\n')) } });
            continue;
        }
        const h = line.match(/^(#{1,3})\s+(.*)/);
        if (h) {
            const level = h[1].length;
            const key = `heading_${level}` as 'heading_1' | 'heading_2' | 'heading_3';
            blocks.push({ type: key, [key]: { rich_text: richText(h[2]) } });
            i++;
            continue;
        }
        const todo = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
        if (todo) {
            blocks.push({ type: 'to_do', to_do: { rich_text: richText(todo[2]), checked: todo[1].toLowerCase() === 'x' } });
            i++;
            continue;
        }
        const bullet = line.match(/^[-*]\s+(.*)/);
        if (bullet) {
            blocks.push({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(bullet[1]) } });
            i++;
            continue;
        }
        const numbered = line.match(/^\d+[.)]\s+(.*)/);
        if (numbered) {
            blocks.push({ type: 'numbered_list_item', numbered_list_item: { rich_text: richText(numbered[1]) } });
            i++;
            continue;
        }
        const quote = line.match(/^>\s?(.*)/);
        if (quote) {
            blocks.push({ type: 'quote', quote: { rich_text: richText(quote[1]) } });
            i++;
            continue;
        }
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
            blocks.push({ type: 'divider', divider: {} });
            i++;
            continue;
        }
        if (line.trim() === '') {
            i++;
            continue;
        }
        const para: string[] = [line];
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3}\s|[-*]\s|\d+[.)]\s|>\s?|```)/.test(lines[i])) {
            para.push(lines[i]);
            i++;
        }
        blocks.push({ type: 'paragraph', paragraph: { rich_text: richText(para.join('\n')) } });
    }
    return blocks;
}

function plainText(rt: any[] | undefined): string {
    if (!Array.isArray(rt)) return '';
    return rt.map((t) => t?.plain_text ?? t?.text?.content ?? '').join('');
}

function blockBody(block: any): any {
    const t = block?.type;
    return t ? block[t] : undefined;
}

/** Render Notion blocks to Notion-flavored markdown. */
export function blocksToMarkdown(blocks: any[], depth = 0): string {
    const out: string[] = [];
    const indent = '  '.repeat(depth);
    for (const b of blocks) {
        const t = b?.type;
        const body = blockBody(b) ?? {};
        const text = plainText(body.rich_text);
        switch (t) {
            case 'heading_1': out.push(`# ${text}`); break;
            case 'heading_2': out.push(`## ${text}`); break;
            case 'heading_3': out.push(`### ${text}`); break;
            case 'paragraph': out.push(text); break;
            case 'bulleted_list_item': out.push(`${indent}- ${text}`); break;
            case 'numbered_list_item': out.push(`${indent}1. ${text}`); break;
            case 'to_do': out.push(`${indent}- [${body.checked ? 'x' : ' '}] ${text}`); break;
            case 'toggle': out.push(`${indent}- ${text}`); break;
            case 'quote': out.push(text.split('\n').map((l: string) => `> ${l}`).join('\n')); break;
            case 'callout': out.push(`${body.icon?.emoji ? body.icon.emoji + ' ' : ''}${text}`); break;
            case 'code': out.push(`\`\`\`${body.language ?? ''}\n${text}\n\`\`\``); break;
            case 'equation': out.push(`$$${body.expression ?? ''}$$`); break;
            case 'divider': out.push('---'); break;
            case 'bookmark':
            case 'embed':
            case 'link_preview': out.push(`[${body.url ?? text}](${body.url ?? ''})`); break;
            case 'image':
            case 'video':
            case 'file':
            case 'pdf':
            case 'audio': {
                const src = body.external?.url ?? body.file?.url ?? '';
                const cap = plainText(body.caption);
                out.push(t === 'image' ? `![${cap}](${src})` : `[${cap || t}](${src})`);
                break;
            }
            case 'table': {
                const rows: string[][] = (b.table_rows ?? []).map((r: any) =>
                    (r.table_row?.cells ?? []).map((c: any) => plainText(c).replace(/\|/g, '\\|')),
                );
                if (rows.length > 0) {
                    out.push(`| ${rows[0].join(' | ')} |`);
                    out.push(`| ${rows[0].map(() => '---').join(' | ')} |`);
                    for (const r of rows.slice(1)) out.push(`| ${r.join(' | ')} |`);
                }
                break;
            }
            case 'table_row': {
                const cells = (body.cells ?? []).map((c: any) => plainText(c));
                out.push(`| ${cells.join(' | ')} |`);
                break;
            }
            case 'child_page': out.push(`# ${b.child_page?.title ?? 'Untitled'}`); break;
            case 'child_database': out.push(`# ${b.child_database?.title ?? 'Database'}`); break;
            case 'column_list':
            case 'column':
            case 'synced_block': break;
            default: if (text) out.push(text);
        }
        if (Array.isArray((b as any).children) && (b as any).children.length > 0) {
            out.push(blocksToMarkdown((b as any).children, t === 'column' ? depth : depth + 1));
        }
    }
    return out.filter((s) => s !== '').join('\n\n');
}

/** Build a Notion page-properties object from simplified {name, type, value} entries. */
export function buildProperties(entries: Array<{ name: string; type: string; value: any }>): Record<string, any> {
    const props: Record<string, any> = {};
    for (const e of entries) {
        const v = e.value;
        switch (e.type) {
            case 'title':
                props[e.name] = { title: richText(String(v ?? '')) };
                break;
            case 'rich_text':
                props[e.name] = { rich_text: richText(String(v ?? '')) };
                break;
            case 'number':
                props[e.name] = { number: v === '' || v == null ? null : Number(v) };
                break;
            case 'select':
                props[e.name] = { select: v ? { name: String(v) } : null };
                break;
            case 'status':
                props[e.name] = { status: v ? { name: String(v) } : null };
                break;
            case 'multi_select':
                props[e.name] = {
                    multi_select: String(v ?? '')
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((name) => ({ name })),
                };
                break;
            case 'date': {
                if (!v) { props[e.name] = { date: null }; break; }
                const parts = String(v).split('..');
                props[e.name] = parts.length > 1
                    ? { date: { start: parts[0].trim(), end: parts[1].trim() } }
                    : { date: { start: String(v).trim() } };
                break;
            }
            case 'people':
                props[e.name] = {
                    people: String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean).map((id) => ({ id })),
                };
                break;
            case 'files': {
                const url = String(v ?? '').trim();
                props[e.name] = url ? { files: [{ name: url.split('/').pop(), external: { url } }] } : { files: [] };
                break;
            }
            case 'checkbox':
                props[e.name] = { checkbox: v === true || v === 'true' || v === '1' };
                break;
            case 'url':
                props[e.name] = { url: v ? String(v) : null };
                break;
            case 'email':
                props[e.name] = { email: v ? String(v) : null };
                break;
            case 'phone_number':
                props[e.name] = { phone_number: v ? String(v) : null };
                break;
            case 'relation':
                props[e.name] = {
                    relation: String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean).map((id) => ({ id })),
                };
                break;
            default:
                break;
        }
    }
    return props;
}
