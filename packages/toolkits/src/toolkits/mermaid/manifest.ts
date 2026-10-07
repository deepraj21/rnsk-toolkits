import { defineToolkit, defineTool } from '../../core/define.js';
import { MERMAID_ICON } from './icon.js';
import { mermaidTools } from './tools/index.js';

export default defineToolkit({
  id: 'mermaid',
  displayName: 'Mermaid',
  shortDescription:
    'Mermaid diagram guidance: syntax rules and examples for every chart type, plus validation and render URLs. No sign-in needed.',
  category: 'Design & Creative Tools',
  icon: MERMAID_ICON,
  auth: { type: 'none' },
  tools: mermaidTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      scope: entry.scope,
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.15',
    homepage: 'https://mermaid.js.org',
    docsUrl: 'https://docs.mermaidchart.com/mermaid-oss/syntax/flowchart',
    apiDocsUrl: 'https://docs.mermaidchart.com/mermaid-oss/syntax/flowchart',
  },
});
