import mathematics from './toolkits/mathematics/manifest.js';
import linear from './toolkits/linear/manifest.js';
import gmail from './toolkits/gmail/manifest.js';
import webSearch from './toolkits/web-search/manifest.js';
import github from './toolkits/github/manifest.js';
import notion from './toolkits/notion/manifest.js';
import googleCalendar from './toolkits/google-calendar/manifest.js';
import googleSheets from './toolkits/google-sheets/manifest.js';
import type { ToolkitManifest } from './core/types.js';

export const toolkits: ToolkitManifest[] = [
  mathematics,
  linear,
  gmail,
  webSearch,
  github,
  notion,
  googleCalendar,
  googleSheets,
];

export {
  mathematics,
  linear,
  gmail,
  webSearch,
  github,
  notion,
  googleCalendar,
  googleSheets,
};
export * from './core/index.js';
export * from './runtime/index.js';

export function getAllTools() {
  return toolkits.flatMap((t) =>
    t.tools.map((toolDef) => ({
      name: toolDef.name,
      description: toolDef.description ?? toolDef.tool.description ?? '',
      tool: toolDef.tool,
      requiredAuth: toolDef.requiredAuth,
      scope: toolDef.scope,
      toolkitId: t.id,
    })),
  );
}

export function registerAllTools(registry: {
  register: (
    name: string,
    description: string,
    tool: unknown,
    options?: { requiredAuth?: string; scope?: 'read' | 'write' | 'delete'; toolkitId?: string },
  ) => void;
}) {
  for (const entry of getAllTools()) {
    registry.register(entry.name, entry.description, entry.tool, {
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      toolkitId: entry.toolkitId,
    });
  }
}
