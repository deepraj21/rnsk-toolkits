import mathematics from './toolkits/mathematics/manifest.js';
import linear from './toolkits/linear/manifest.js';
import gmail from './toolkits/gmail/manifest.js';
import webSearch from './toolkits/web-search/manifest.js';
import github from './toolkits/github/manifest.js';
import notion from './toolkits/notion/manifest.js';
import googleCalendar from './toolkits/google-calendar/manifest.js';
import googleSheets from './toolkits/google-sheets/manifest.js';
import googleDrive from './toolkits/google-drive/manifest.js';
import googleDocs from './toolkits/google-docs/manifest.js';
import googleForms from './toolkits/google-forms/manifest.js';
import aws from './toolkits/aws/manifest.js';
import gcp from './toolkits/gcp/manifest.js';
import grafana from './toolkits/grafana/manifest.js';
import dockerHub from './toolkits/docker-hub/manifest.js';
import googleMeet from './toolkits/google-meet/manifest.js';
import googleSlides from './toolkits/google-slides/manifest.js';
import googleClassroom from './toolkits/google-classroom/manifest.js';
import googleTasks from './toolkits/google-tasks/manifest.js';
import googleSearchConsole from './toolkits/google-search-console/manifest.js';
import googleAds from './toolkits/google-ads/manifest.js';
import youtube from './toolkits/youtube/manifest.js';
import figma from './toolkits/figma/manifest.js';
import reddit from './toolkits/reddit/manifest.js';
import groww from './toolkits/groww/manifest.js';
import cloudflare from './toolkits/cloudflare/manifest.js';
import slack from './toolkits/slack/manifest.js';
import discord from './toolkits/discord/manifest.js';
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
  googleDrive,
  googleDocs,
  googleForms,
  googleMeet,
  googleSlides,
  googleClassroom,
  googleTasks,
  googleSearchConsole,
  googleAds,
  youtube,
  figma,
  aws,
  gcp,
  grafana,
  dockerHub,
  reddit,
  groww,
  cloudflare,
  slack,
  discord,
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
  googleDrive,
  googleDocs,
  googleForms,
  googleMeet,
  googleSlides,
  googleClassroom,
  googleTasks,
  googleSearchConsole,
  googleAds,
  youtube,
  figma,
  aws,
  gcp,
  grafana,
  dockerHub,
  reddit,
  groww,
  cloudflare,
  slack,
  discord,
};
export * from './core/index.js';

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
