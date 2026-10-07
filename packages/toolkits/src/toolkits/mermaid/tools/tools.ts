// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { GUIDES } from './guides.js';

const sectionField = z
  .enum(['all', 'syntax', 'example', 'pitfalls'])
  .optional()
  .describe('Guide section to return (default all)');

function shapeGuide(key: string, section?: string) {
  const guide = GUIDES[key];
  if (!guide) return { error: `Unknown diagram type: ${key}` };
  if (section === 'syntax') {
    return {
      type: guide.keyword,
      title: guide.title,
      whenToUse: guide.whenToUse,
      rules: guide.rules,
    };
  }
  if (section === 'example') {
    return { type: guide.keyword, title: guide.title, example: guide.example };
  }
  if (section === 'pitfalls') {
    return { type: guide.keyword, title: guide.title, pitfalls: guide.pitfalls };
  }
  return guide;
}

function makeGuide(key: string, description: string) {
  return tool({
    description,
    inputSchema: z.object({
      section: sectionField,
    }),
    execute: async ({ section }) => {
      try {
        return shapeGuide(key, section);
      } catch (error) {
        return {
          error: 'Error loading guide',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });
}

export const mermaidFlowchartGuide = makeGuide(
  'flowchart',
  'Flowchart syntax guide: directions, node shapes, edges, subgraphs, styling. Use before writing any flowchart.',
);
export const mermaidSequenceGuide = makeGuide(
  'sequence',
  'Sequence diagram guide: participants, message arrows, notes, loops, alt/par blocks.',
);
export const mermaidClassGuide = makeGuide(
  'class',
  'Class diagram guide: members, visibility, generics, relations, annotations.',
);
export const mermaidStateGuide = makeGuide(
  'state',
  'State diagram guide: states, transitions, composite states, choice/fork, notes.',
);
export const mermaidErGuide = makeGuide(
  'er',
  'Entity-relationship guide: entities, cardinality glyphs, keys, identifying relations.',
);
export const mermaidJourneyGuide = makeGuide(
  'journey',
  'User journey guide: sections, scored tasks, actors.',
);
export const mermaidGanttGuide = makeGuide(
  'gantt',
  'Gantt chart guide: date formats, task states, dependencies, milestones.',
);
export const mermaidPieGuide = makeGuide('pie', 'Pie chart guide: slices, showData, titles.');
export const mermaidQuadrantGuide = makeGuide(
  'quadrant',
  'Quadrant chart guide: axes, quadrant labels, 0-1 coordinates.',
);
export const mermaidRequirementGuide = makeGuide(
  'requirement',
  'Requirement diagram guide: requirement types, elements, traceability relations.',
);
export const mermaidGitGraphGuide = makeGuide(
  'gitgraph',
  'Git graph guide: commits, branches, merges, cherry-picks, tags.',
);
export const mermaidC4Guide = makeGuide(
  'c4',
  'C4 architecture guide: context/container/component/dynamic/deployment diagrams, PlantUML-compatible syntax.',
);
export const mermaidMindmapGuide = makeGuide(
  'mindmap',
  'Mindmap guide: indentation hierarchy, node shapes, icons, classes.',
);
export const mermaidTimelineGuide = makeGuide(
  'timeline',
  'Timeline guide: sections, periods, events.',
);
export const mermaidZenUmlGuide = makeGuide(
  'zenuml',
  'ZenUML guide: code-like sequence syntax, fragments, participants.',
);
export const mermaidSankeyGuide = makeGuide(
  'sankey',
  'Sankey flow guide: source,destination,value lines (beta).',
);
export const mermaidXyChartGuide = makeGuide(
  'xychart',
  'XY chart guide: axes, bar and line series (beta).',
);
export const mermaidBlockGuide = makeGuide(
  'block',
  'Block diagram guide: grid columns, shapes, groups, edges, styling (beta).',
);
export const mermaidPacketGuide = makeGuide(
  'packet',
  'Packet bit-layout guide: ranges, +N shorthand, bit order (beta).',
);
export const mermaidKanbanGuide = makeGuide(
  'kanban',
  'Kanban board guide: columns, tasks, metadata, ticket links.',
);
export const mermaidArchitectureGuide = makeGuide(
  'architecture',
  'Architecture diagram guide: groups, services, icons, directional edges, junctions (beta).',
);
export const mermaidRadarGuide = makeGuide(
  'radar',
  'Radar chart guide: axes, curves, legend and scale options (beta).',
);
export const mermaidTreemapGuide = makeGuide(
  'treemap',
  'Treemap guide: indented hierarchy with values, styling (beta).',
);
export const mermaidVennGuide = makeGuide(
  'venn',
  'Venn diagram guide: sets, unions, sizes, labels (beta).',
);
export const mermaidIshikawaGuide = makeGuide(
  'ishikawa',
  'Ishikawa fishbone guide: effect line plus indented causes (beta).',
);
export const mermaidInfoGuide = makeGuide(
  'info',
  'Info box guide: rendering runtime version metadata.',
);

const TYPE_ALIASES: Record<string, string> = {
  graph: 'flowchart',
  flowchart: 'flowchart',
  sequencediagram: 'sequence',
  classdiagram: 'class',
  statediagram: 'state',
  'statediagram-v2': 'state',
  erdiagram: 'er',
  journey: 'journey',
  userjourney: 'journey',
  gantt: 'gantt',
  pie: 'pie',
  quadrantchart: 'quadrant',
  requirementdiagram: 'requirement',
  gitgraph: 'gitgraph',
  c4context: 'c4',
  c4container: 'c4',
  c4component: 'c4',
  c4dynamic: 'c4',
  c4deployment: 'c4',
  mindmap: 'mindmap',
  timeline: 'timeline',
  zenuml: 'zenuml',
  'sankey-beta': 'sankey',
  sankey: 'sankey',
  'xychart-beta': 'xychart',
  xychart: 'xychart',
  'block-beta': 'block',
  block: 'block',
  'packet-beta': 'packet',
  packet: 'packet',
  kanban: 'kanban',
  'architecture-beta': 'architecture',
  architecture: 'architecture',
  'radar-beta': 'radar',
  radar: 'radar',
  'treemap-beta': 'treemap',
  treemap: 'treemap',
  'venn-beta': 'venn',
  venn: 'venn',
  'ishikawa-beta': 'ishikawa',
  ishikawa: 'ishikawa',
  info: 'info',
};

export const mermaidListDiagramTypes = tool({
  description:
    'List every Mermaid diagram type with keywords and one-line uses. Start here to pick a chart.',
  inputSchema: z.object({
    category: z
      .enum(['all', 'flow', 'structure', 'data', 'planning'])
      .optional()
      .describe('Filter types by family (default all)'),
  }),
  execute: async ({ category }) => {
    try {
      const families: Record<string, string[]> = {
        flow: [
          'flowchart',
          'sequence',
          'state',
          'gitgraph',
          'zenuml',
          'journey',
          'timeline',
          'sankey',
        ],
        structure: [
          'class',
          'er',
          'c4',
          'mindmap',
          'block',
          'architecture',
          'packet',
          'requirement',
        ],
        data: ['pie', 'quadrant', 'xychart', 'radar', 'treemap', 'venn'],
        planning: ['gantt', 'kanban', 'ishikawa', 'info'],
      };
      const keys =
        !category || category === 'all'
          ? Object.keys(GUIDES)
          : (families[category] ?? Object.keys(GUIDES));
      return keys.map((key) => ({
        type: GUIDES[key].keyword,
        title: GUIDES[key].title,
        whenToUse: GUIDES[key].whenToUse,
      }));
    } catch (error) {
      return {
        error: 'Error listing diagram types',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const mermaidDirectivesGuide = tool({
  description:
    'Mermaid config guide: YAML frontmatter, %%{init}%% directives, themes, accessibility titles, comments.',
  inputSchema: z.object({
    section: sectionField,
  }),
  execute: async ({ section }) => {
    try {
      const full = {
        frontmatter:
          'Start a diagram with YAML frontmatter for title and config:\n---\ntitle: My diagram\nconfig:\n  theme: forest\n---\nflowchart TD\n...',
        initDirective:
          'Inline config: `%%{init: {"theme": "dark", "flowchart": {"curve": "linear"}}}%%` on its own line after the diagram keyword.',
        themes:
          'Built-in themes: default, neutral, dark, forest, base. Per-diagram `%%{init}%%` wins over global initialize(). Beta types may pin theme/look (e.g. venn uses redux-color + neo).',
        accessibility:
          'Add `accTitle: Short title` (single line with colon) and `accDescr: ...` or multi-line `accDescr { ... }` for screen readers.',
        comments: '`%%` starts a comment line. Useful for sectioning long diagrams.',
      };
      if (section === 'syntax')
        return { frontmatter: full.frontmatter, initDirective: full.initDirective };
      if (section === 'example') {
        return {
          example: `---\ntitle: Deploy flow\nconfig:\n  theme: forest\n---\nflowchart LR\n    accTitle: Deploy flow\n    A[Build] --> B[Test] --> C[Deploy]`,
        };
      }
      if (section === 'pitfalls') {
        return {
          pitfalls: [
            'Frontmatter must be the very first lines, fenced by --- on their own lines.',
            'init directive JSON must be valid (double quotes, no trailing commas).',
            'Theme variables differ per diagram; check the config reference before overriding.',
          ],
        };
      }
      return full;
    } catch (error) {
      return {
        error: 'Error loading directives guide',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const mermaidValidateDiagram = tool({
  description:
    'Static-check Mermaid code: known type keyword, balanced brackets, tabs, and classic gotchas (lowercase end, o/x edges). Not a full render check.',
  inputSchema: z.object({
    diagram: z.string().describe('Mermaid diagram source code'),
  }),
  execute: async ({ diagram }) => {
    try {
      const warnings: string[] = [];
      const lines = diagram.split('\n');
      const first =
        lines.map((l) => l.trim()).find((l) => l.length > 0 && !l.startsWith('---')) ?? '';
      const keyword = first.split(/[\s:{]/)[0].replace(/;$/, '');
      const key = TYPE_ALIASES[keyword];
      if (!key) {
        return {
          valid: false,
          detectedType: null,
          warnings: [
            `First line "${keyword}" is not a known diagram keyword. Expected one of: ${Object.keys(GUIDES).join(', ')} (or graph/sequenceDiagram/classDiagram/stateDiagram/erDiagram aliases, packet, block, venn-beta, ishikawa-beta).`,
          ],
        };
      }
      if (keyword !== GUIDES[key].keyword && !(key === 'flowchart' && keyword === 'graph')) {
        warnings.push(
          `Keyword "${keyword}" works but the canonical keyword is "${GUIDES[key].keyword}".`,
        );
      }
      const stripped = diagram.replace(/"[^"\n]*"/g, '""');
      const pairs: Array<[string, string, string]> = [
        ['(', ')', 'parentheses'],
        ['[', ']', 'square brackets'],
        ['{', '}', 'curly braces'],
      ];
      for (const [open, close, name] of pairs) {
        const o = (stripped.match(new RegExp(`\\${open}`, 'g')) ?? []).length;
        const c = (stripped.match(new RegExp(`\\${close}`, 'g')) ?? []).length;
        if (o !== c) warnings.push(`Unbalanced ${name}: ${o} "${open}" vs ${c} "${close}".`);
      }
      if (/\t/.test(diagram))
        warnings.push('Tabs detected — use spaces for indentation (mindmap/timeline/kanban).');
      if (key === 'flowchart' || key === 'sequence') {
        if (/(^|[\s:;])end([\s;:)]|$)/.test(stripped))
          warnings.push(
            'Lowercase "end" found — it terminates blocks/subgraphs. Capitalize node text (End/END).',
          );
      }
      if (key === 'flowchart' && /---[ox][A-Za-z0-9]/.test(stripped)) {
        warnings.push(
          'Possible circle/cross edge: "---o" or "---x" creates special ends; add a space or capitalize the node id.',
        );
      }
      if (lines.length > 500)
        warnings.push(
          'Very long diagram (>500 lines) — consider splitting for render performance.',
        );
      return { valid: warnings.length === 0, detectedType: GUIDES[key].keyword, warnings };
    } catch (error) {
      return {
        error: 'Error validating diagram',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const mermaidBuildRenderUrl = tool({
  description:
    'Build a mermaid.ink image/SVG URL for a diagram (base64 payload, no upload). Use to preview or embed rendered output.',
  inputSchema: z.object({
    diagram: z.string().describe('Mermaid diagram source code'),
    format: z
      .enum(['img', 'svg'])
      .optional()
      .describe('Image format: img (PNG) or svg (default img)'),
    theme: z.string().optional().describe('Theme override, e.g. default, dark, forest, neutral'),
  }),
  execute: async ({ diagram, format, theme }) => {
    try {
      const payload: Record<string, unknown> = { code: diagram };
      if (theme) payload.mermaid = { theme };
      const encoded = encodeURIComponent(Buffer.from(JSON.stringify(payload)).toString('base64'));
      const fmt = format ?? 'img';
      return {
        url: `https://mermaid.ink/${fmt}/${encoded}`,
        format: fmt,
        note: 'Rendered by the public mermaid.ink service from the URL payload; nothing is uploaded or stored by this tool.',
      };
    } catch (error) {
      return {
        error: 'Error building render URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
