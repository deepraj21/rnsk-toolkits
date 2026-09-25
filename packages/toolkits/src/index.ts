import mathematics from './toolkits/mathematics/manifest.js';
import mongodb from './toolkits/mongodb/manifest.js';
import linear from './toolkits/linear/manifest.js';
import gmail from './toolkits/gmail/manifest.js';
import webSearch from './toolkits/web-search/manifest.js';
import github from './toolkits/github/manifest.js';
import notion from './toolkits/notion/manifest.js';
import googleCalendar from './toolkits/google-calendar/manifest.js';
import googleSheets from './toolkits/google-sheets/manifest.js';
import googleDrive from './toolkits/google-drive/manifest.js';
import googleDocs from './toolkits/google-docs/manifest.js';
import googleMaps from './toolkits/google-maps/manifest.js';
import googlePhotos from './toolkits/google-photos/manifest.js';
import googleContacts from './toolkits/google-contacts/manifest.js';
import googleForms from './toolkits/google-forms/manifest.js';
import aws from './toolkits/aws/manifest.js';
import azure from './toolkits/azure/manifest.js';
import gcp from './toolkits/gcp/manifest.js';
import grafana from './toolkits/grafana/manifest.js';
import newRelic from './toolkits/new-relic/manifest.js';
import npm from './toolkits/npm/manifest.js';
import accuweather from './toolkits/accuweather/manifest.js';
import telegram from './toolkits/telegram/manifest.js';
import snowflake from './toolkits/snowflake/manifest.js';
import gumroad from './toolkits/gumroad/manifest.js';
import razorpay from './toolkits/razorpay/manifest.js';
import prometheus from './toolkits/prometheus/manifest.js';
import dockerHub from './toolkits/docker-hub/manifest.js';
import googleMeet from './toolkits/google-meet/manifest.js';
import googleSlides from './toolkits/google-slides/manifest.js';
import googleClassroom from './toolkits/google-classroom/manifest.js';
import googleTasks from './toolkits/google-tasks/manifest.js';
import googleSearchConsole from './toolkits/google-search-console/manifest.js';
import googleAnalytics from './toolkits/google-analytics/manifest.js';
import googleAds from './toolkits/google-ads/manifest.js';
import youtube from './toolkits/youtube/manifest.js';
import figma from './toolkits/figma/manifest.js';
import reddit from './toolkits/reddit/manifest.js';
import groww from './toolkits/groww/manifest.js';
import cloudflare from './toolkits/cloudflare/manifest.js';
import slack from './toolkits/slack/manifest.js';
import discord from './toolkits/discord/manifest.js';
import confluence from './toolkits/confluence/manifest.js';
import convex from './toolkits/convex/manifest.js';
import datadog from './toolkits/datadog/manifest.js';
import bitbucket from './toolkits/bitbucket/manifest.js';
import gitlab from './toolkits/gitlab/manifest.js';
import huggingFace from './toolkits/hugging-face/manifest.js';
import hostinger from './toolkits/hostinger/manifest.js';
import hackerNews from './toolkits/hacker-news/manifest.js';
import jira from './toolkits/jira/manifest.js';
import jenkins from './toolkits/jenkins/manifest.js';
import harness from './toolkits/harness/manifest.js';
import dynatrace from './toolkits/dynatrace/manifest.js';
import airtable from './toolkits/airtable/manifest.js';
import neo4j from './toolkits/neo4j/manifest.js';
import neon from './toolkits/neon/manifest.js';
import kaggle from './toolkits/kaggle/manifest.js';
import kubernetes from './toolkits/kubernetes/manifest.js';
import devTo from './toolkits/dev-to/manifest.js';
import nasa from './toolkits/nasa/manifest.js';
import notebookLm from './toolkits/notebook-lm/manifest.js';
import vercel from './toolkits/vercel/manifest.js';
import zoho from './toolkits/zoho/manifest.js';
import wordpress from './toolkits/wordpress/manifest.js';
import wise from './toolkits/wise/manifest.js';
import servicenow from './toolkits/servicenow/manifest.js';
import postman from './toolkits/postman/manifest.js';
import splunk from './toolkits/splunk/manifest.js';
import type { ToolkitManifest } from './core/types.js';

export const toolkits: ToolkitManifest[] = [
  mathematics,
  mongodb,
  linear,
  gmail,
  webSearch,
  github,
  notion,
  googleCalendar,
  googleSheets,
  googleDrive,
  googleDocs,
  googleMaps,
  googlePhotos,
  googleContacts,
  googleForms,
  googleMeet,
  googleSlides,
  googleClassroom,
  googleTasks,
  googleSearchConsole,
  googleAnalytics,
  googleAds,
  youtube,
  figma,
  aws,
  azure,
  gcp,
  grafana,
  newRelic,
  npm,
  accuweather,
  telegram,
  snowflake,
  gumroad,
  razorpay,
  prometheus,
  dockerHub,
  reddit,
  groww,
  cloudflare,
  slack,
  discord,
  confluence,
  convex,
  datadog,
  gitlab,
  bitbucket,
  huggingFace,
  hostinger,
  hackerNews,
  jira,
  jenkins,
  harness,
  dynatrace,
  airtable,
  neo4j,
  neon,
  kaggle,
  kubernetes,
  devTo,
  notebookLm,
  nasa,
  vercel,
  zoho,
  wordpress,
  wise,
  servicenow,
  postman,
  splunk,
];
export {
  mathematics,
  mongodb,
  linear,
  gmail,
  webSearch,
  github,
  notion,
  googleCalendar,
  googleSheets,
  googleDrive,
  googleDocs,
  googleMaps,
  googlePhotos,
  googleContacts,
  googleForms,
  googleMeet,
  googleSlides,
  googleClassroom,
  googleTasks,
  googleSearchConsole,
  googleAnalytics,
  googleAds,
  youtube,
  figma,
  aws,
  azure,
  gcp,
  grafana,
  newRelic,
  npm,
  accuweather,
  telegram,
  snowflake,
  gumroad,
  razorpay,
  prometheus,
  dockerHub,
  reddit,
  groww,
  cloudflare,
  slack,
  discord,
  confluence,
  convex,
  datadog,
  gitlab,
  bitbucket,
  huggingFace,
  hostinger,
  hackerNews,
  jira,
  jenkins,
  harness,
  dynatrace,
  airtable,
  neo4j,
  neon,
  kaggle,
  kubernetes,
  devTo,
  notebookLm,
  nasa,
  vercel,
  zoho,
  wordpress,
  wise,
  servicenow,
  postman,
  splunk,
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
