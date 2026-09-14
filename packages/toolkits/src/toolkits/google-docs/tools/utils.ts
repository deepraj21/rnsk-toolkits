// @ts-nocheck

export function extractPlainText(document: {
    body?: { content?: Array<Record<string, unknown>> };
    title?: string;
}): string {
    const parts: string[] = [];
    const content = document.body?.content ?? [];

    for (const element of content) {
        if (element.paragraph) {
            const paragraph = element.paragraph as { elements?: Array<Record<string, unknown>> };
            for (const el of paragraph.elements ?? []) {
                if (el.textRun) {
                    const textRun = el.textRun as { content?: string };
                    if (textRun.content) parts.push(textRun.content);
                }
            }
        } else if (element.table) {
            const table = element.table as { tableRows?: Array<Record<string, unknown>> };
            for (const row of table.tableRows ?? []) {
                const tableRow = row as { tableCells?: Array<Record<string, unknown>> };
                for (const cell of tableRow.tableCells ?? []) {
                    const tableCell = cell as { content?: Array<Record<string, unknown>> };
                    for (const cellEl of tableCell.content ?? []) {
                        if (cellEl.paragraph) {
                            const paragraph = cellEl.paragraph as { elements?: Array<Record<string, unknown>> };
                            for (const el of paragraph.elements ?? []) {
                                if (el.textRun) {
                                    const textRun = el.textRun as { content?: string };
                                    if (textRun.content) parts.push(textRun.content);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return parts.join('');
}

export function getDocumentEndIndex(document: {
    body?: { content?: Array<Record<string, unknown>> };
}): number {
    const content = document.body?.content ?? [];
    if (content.length === 0) return 1;

    const last = content[content.length - 1];
    const endIndex = (last as { endIndex?: number }).endIndex;
    return typeof endIndex === 'number' ? endIndex - 1 : 1;
}
