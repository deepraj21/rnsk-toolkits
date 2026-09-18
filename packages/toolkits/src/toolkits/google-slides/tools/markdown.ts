// @ts-nocheck

function uniqueId(prefix: string, index: number): string {
  return `${prefix}_${index}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseMarkdownSlides(markdownText: string): string[] {
  let text = markdownText.trim();
  if (/^Theme:\s*/im.test(text)) {
    text = text.replace(/^Theme:\s*\S+\s*\n?/im, '').trim();
  }
  return text
    .split(/\n---\n/)
    .map((slide) => slide.trim())
    .filter(Boolean);
}

function isTableSlide(content: string): boolean {
  const lines = content.split('\n').filter((line) => line.trim());
  return lines.some((line) => line.includes('|')) && lines.length >= 2;
}

function parseMarkdownTable(content: string): { rows: string[][]; headers: string[] } | null {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('|'));

  if (lines.length < 2) return null;

  const parseRow = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2);
  const rows = dataLines.map(parseRow).filter((row) => row.some(Boolean));
  return { headers, rows };
}

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '• ')
    .trim();
}

function buildTextBoxRequests(
  slideObjectId: string,
  shapeObjectId: string,
  text: string,
  options?: { x?: number; y?: number; width?: number; height?: number },
) {
  const x = options?.x ?? 400000;
  const y = options?.y ?? 400000;
  const width = options?.width ?? 8200000;
  const height = options?.height ?? 4300000;

  return [
    {
      createShape: {
        objectId: shapeObjectId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: width, unit: 'EMU' },
            height: { magnitude: height, unit: 'EMU' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: x,
            translateY: y,
            unit: 'EMU',
          },
        },
      },
    },
    {
      insertText: {
        objectId: shapeObjectId,
        insertionIndex: 0,
        text: stripMarkdownFormatting(text),
      },
    },
  ];
}

function buildTableRequests(slideObjectId: string, tableObjectId: string, content: string) {
  const parsed = parseMarkdownTable(content);
  if (!parsed) return buildTextBoxRequests(slideObjectId, `${tableObjectId}_text`, content);

  const rowCount = parsed.rows.length + 1;
  const columnCount = parsed.headers.length;

  const requests: Array<Record<string, unknown>> = [
    {
      createTable: {
        objectId: tableObjectId,
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 8200000, unit: 'EMU' },
            height: { magnitude: 4300000, unit: 'EMU' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 400000,
            translateY: 400000,
            unit: 'EMU',
          },
        },
        rows: rowCount,
        columns: columnCount,
      },
    },
  ];

  parsed.headers.forEach((header, columnIndex) => {
    requests.push({
      insertText: {
        objectId: tableObjectId,
        cellLocation: { rowIndex: 0, columnIndex },
        text: stripMarkdownFormatting(header),
        insertionIndex: 0,
      },
    });
  });

  parsed.rows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (columnIndex >= columnCount) return;
      requests.push({
        insertText: {
          objectId: tableObjectId,
          cellLocation: { rowIndex: rowIndex + 1, columnIndex },
          text: stripMarkdownFormatting(cell),
          insertionIndex: 0,
        },
      });
    });
  });

  return requests;
}

function buildImageRequests(slideObjectId: string, imageObjectId: string, url: string) {
  return [
    {
      createImage: {
        objectId: imageObjectId,
        url,
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 6400000, unit: 'EMU' },
            height: { magnitude: 3600000, unit: 'EMU' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 1200000,
            translateY: 800000,
            unit: 'EMU',
          },
        },
      },
    },
  ];
}

function extractImageUrl(content: string): string | null {
  const match = content.match(/!\[[^\]]*]\(([^)]+)\)/);
  return match?.[1]?.trim() ?? null;
}

export function buildMarkdownSlideRequests(
  markdownText: string,
  options?: { insertionIndex?: number; idPrefix?: string },
): Array<Record<string, unknown>> {
  const slides = parseMarkdownSlides(markdownText);
  const requests: Array<Record<string, unknown>> = [];
  const prefix = options?.idPrefix ?? 'md';

  slides.forEach((slideContent, index) => {
    const slideObjectId = uniqueId(`${prefix}_slide`, index);
    const insertionIndex =
      options?.insertionIndex !== undefined ? options.insertionIndex + index : index + 1;

    requests.push({
      createSlide: {
        objectId: slideObjectId,
        insertionIndex,
        slideLayoutReference: { predefinedLayout: 'BLANK' },
      },
    });

    if (slideContent.includes('|||')) {
      const [left, right] = slideContent.split('|||').map((part) => part.trim());
      requests.push(
        ...buildTextBoxRequests(slideObjectId, uniqueId(`${prefix}_left`, index), left, {
          x: 300000,
          y: 400000,
          width: 4000000,
          height: 4300000,
        }),
        ...buildTextBoxRequests(slideObjectId, uniqueId(`${prefix}_right`, index), right, {
          x: 4500000,
          y: 400000,
          width: 4000000,
          height: 4300000,
        }),
      );
      return;
    }

    const imageUrl = extractImageUrl(slideContent);
    if (imageUrl) {
      requests.push(...buildImageRequests(slideObjectId, uniqueId(`${prefix}_image`, index), imageUrl));
      const caption = slideContent.replace(/!\[[^\]]*]\([^)]+\)/, '').trim();
      if (caption) {
        requests.push(
          ...buildTextBoxRequests(slideObjectId, uniqueId(`${prefix}_caption`, index), caption, {
            y: 4500000,
            height: 800000,
          }),
        );
      }
      return;
    }

    if (isTableSlide(slideContent)) {
      requests.push(...buildTableRequests(slideObjectId, uniqueId(`${prefix}_table`, index), slideContent));
      return;
    }

    const layout = slideContent.startsWith('# ') ? 'TITLE' : 'TITLE_AND_BODY';
    if (layout === 'TITLE') {
      requests.pop();
      requests.push({
        createSlide: {
          objectId: slideObjectId,
          insertionIndex,
          slideLayoutReference: { predefinedLayout: 'TITLE' },
        },
      });
    }

    requests.push(
      ...buildTextBoxRequests(slideObjectId, uniqueId(`${prefix}_body`, index), slideContent),
    );
  });

  return requests;
}
