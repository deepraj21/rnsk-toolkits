// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { missingCredentialsError, splunkEntries, splunkRequest } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const ownerField = z.string().optional().describe('Owner context, "-" for all (default "-")');
const appField = z.string().optional().describe('App context, "-" for all (default "-")');

function ns(owner?: string, app?: string): string {
  return `/servicesNS/${encodeURIComponent(owner ?? '-')}/${encodeURIComponent(app ?? '-')}`;
}

function summarizeSavedSearch(entry: { name?: string; content?: Record<string, unknown> }) {
  const c = entry.content ?? {};
  return {
    name: entry.name,
    search: c.search,
    cronSchedule: c.cron_schedule,
    disabled: c.disabled,
    description: c.description,
    nextScheduledTime: c.next_scheduled_time,
    alertSeverity: c.alert_severity,
  };
}

export const splunkListSavedSearches = tool({
  description: 'List saved searches (reports and alerts) with SPL, schedule and disabled state. Use to discover reusable searches.',
  inputSchema: z.object({
    splunkCredentials: authField,
    owner: ownerField,
    app: appField,
    count: z.number().int().min(1).max(1000).optional().describe('Max items to return (default 100)'),
    search: z.string().optional().describe('Filter text matched against names, e.g. "errors"'),
  }),
  execute: async ({ splunkCredentials, owner, app, count, search }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, `${ns(owner, app)}/saved/searches`, {
        query: { count: count ?? 100, search },
      });
      const savedSearches = splunkEntries(data).map(summarizeSavedSearch);
      return { count: savedSearches.length, savedSearches };
    } catch (error) {
      return { error: 'Failed to list saved searches', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkGetSavedSearch = tool({
  description: 'Get a saved search including full SPL, schedule, alert condition and configured alert actions.',
  inputSchema: z.object({
    splunkCredentials: authField,
    savedSearchName: z.string().describe('Saved search name'),
    owner: ownerField,
    app: appField,
  }),
  execute: async ({ splunkCredentials, savedSearchName, owner, app }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(
        splunkCredentials,
        `${ns(owner, app)}/saved/searches/${encodeURIComponent(savedSearchName)}`,
      );
    } catch (error) {
      return { error: 'Failed to get saved search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkCreateSavedSearch = tool({
  description: 'Create a saved search (report or scheduled alert) with SPL, cron schedule and optional email alerting.',
  inputSchema: z.object({
    splunkCredentials: authField,
    savedSearchName: z.string().describe('Name for the saved search'),
    search: z.string().describe('SPL search body'),
    appName: z.string().optional().describe('App to create in (default "search")'),
    cronSchedule: z.string().optional().describe('Cron schedule, e.g. "*/15 * * * *" (omit for report-only)'),
    description: z.string().optional().describe('Description'),
    disabled: z.boolean().optional().describe('Create in disabled state'),
    alertCondition: z.string().optional().describe('Alert condition, e.g. "search count > 10"'),
    emailTo: z.string().optional().describe('Email alert recipients (enables email action)'),
  }),
  execute: async ({ splunkCredentials, savedSearchName, search, appName, cronSchedule, description, disabled, alertCondition, emailTo }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/servicesNS/nobody/${encodeURIComponent(appName ?? 'search')}/saved/searches`, {
        method: 'POST',
        form: {
          name: savedSearchName,
          search,
          cron_schedule: cronSchedule,
          description,
          disabled,
          alert_condition: alertCondition,
          'actions.email.to': emailTo,
          actions: emailTo ? 'email' : undefined,
        },
      });
    } catch (error) {
      return { error: 'Failed to create saved search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkUpdateSavedSearch = tool({
  description: 'Update a saved search SPL, schedule, description or enabled state.',
  inputSchema: z.object({
    splunkCredentials: authField,
    savedSearchName: z.string().describe('Saved search name'),
    owner: ownerField,
    app: appField,
    search: z.string().optional().describe('New SPL search body'),
    cronSchedule: z.string().optional().describe('New cron schedule'),
    description: z.string().optional().describe('New description'),
    disabled: z.boolean().optional().describe('Disable (true) or enable (false)'),
    alertCondition: z.string().optional().describe('New alert condition'),
  }),
  execute: async ({ splunkCredentials, savedSearchName, owner, app, search, cronSchedule, description, disabled, alertCondition }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(
        splunkCredentials,
        `${ns(owner, app)}/saved/searches/${encodeURIComponent(savedSearchName)}`,
        {
          method: 'POST',
          form: {
            search,
            cron_schedule: cronSchedule,
            description,
            disabled,
            alert_condition: alertCondition,
          },
        },
      );
    } catch (error) {
      return { error: 'Failed to update saved search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkDeleteSavedSearch = tool({
  description: 'Delete a saved search. Scheduled runs stop — confirm with the user first.',
  inputSchema: z.object({
    splunkCredentials: authField,
    savedSearchName: z.string().describe('Saved search name to delete'),
    owner: ownerField,
    app: appField,
  }),
  execute: async ({ splunkCredentials, savedSearchName, owner, app }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(
        splunkCredentials,
        `${ns(owner, app)}/saved/searches/${encodeURIComponent(savedSearchName)}`,
        { method: 'DELETE' },
      );
    } catch (error) {
      return { error: 'Failed to delete saved search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkDispatchSavedSearch = tool({
  description: 'Run a saved search now and get its sid. Use to trigger reports or test alerts on demand.',
  inputSchema: z.object({
    splunkCredentials: authField,
    savedSearchName: z.string().describe('Saved search name to run'),
    owner: ownerField,
    app: appField,
    earliestTime: z.string().optional().describe('Override start time, e.g. "-1h"'),
    latestTime: z.string().optional().describe('Override end time, e.g. "now"'),
    triggerActions: z.boolean().optional().describe('Fire alert actions for this run'),
  }),
  execute: async ({ splunkCredentials, savedSearchName, owner, app, earliestTime, latestTime, triggerActions }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = (await splunkRequest(
        splunkCredentials,
        `${ns(owner, app)}/saved/searches/${encodeURIComponent(savedSearchName)}/dispatch`,
        {
          method: 'POST',
          form: { earliest_time: earliestTime, latest_time: latestTime, trigger_actions: triggerActions },
        },
      )) as { sid?: string };
      return { sid: data.sid };
    } catch (error) {
      return { error: 'Failed to dispatch saved search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
