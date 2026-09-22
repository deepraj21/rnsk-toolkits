// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { promRequest, toPromError } from './client.js';

const credsField = z.string().describe('Prometheus credentials JSON with baseUrl and optional username/password or bearerToken');

export const scrapePools = tool({
    description: 'Lists configured scrape pool names.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/scrape_pools');
        } catch (error) {
            return toPromError(error, 'Failed to list scrape pools');
        }
    },
});

export const targets = tool({
    description: 'Returns scrape target discovery state (active + dropped targets with health, labels, last scrape).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        state: z.enum(['active', 'dropped', 'any']).optional().describe('Filter targets (default both)'),
        scrapePool: z.string().optional().describe('Filter by scrape pool name'),
    }),
    execute: async ({ prometheusCredentials, state, scrapePool }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/targets', {
                query: { state, scrapePool },
            });
        } catch (error) {
            return toPromError(error, 'Failed to get targets');
        }
    },
});

export const targetRelabelSteps = tool({
    description: 'Shows step-by-step relabeling rules and their effect on a target label set. Experimental (web-UI oriented).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        scrapePool: z.string().describe('Scrape pool name of the target'),
        labels: z.string().describe('Pre-relabel label set as JSON, e.g. {"__address__":"localhost:9090","job":"prometheus"}'),
    }),
    execute: async ({ prometheusCredentials, scrapePool, labels }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/targets/relabel_steps', {
                query: { scrapePool, labels },
            });
        } catch (error) {
            return toPromError(error, 'Failed to get relabel steps');
        }
    },
});

export const rules = tool({
    description: 'Lists loaded alerting/recording rules with active alerts. Supports filtering by type, name, group, file, and labels.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        type: z.enum(['alert', 'record']).optional().describe('Only alerting or recording rules'),
        ruleName: z.array(z.string()).optional().describe('Filter by rule names'),
        ruleGroup: z.array(z.string()).optional().describe('Filter by rule group names'),
        file: z.array(z.string()).optional().describe('Filter by rule file paths'),
        excludeAlerts: z.boolean().optional().describe('Omit active alerts, rules only'),
        match: z.array(z.string()).optional().describe('Label selectors matched against rule definition labels'),
        groupLimit: z.number().int().optional().describe('Rule groups per page (enables groupNextToken pagination)'),
        groupNextToken: z.string().optional().describe('Pagination token from a previous response'),
    }),
    execute: async ({ prometheusCredentials, ruleName, ruleGroup, file, excludeAlerts, match, groupLimit, groupNextToken, type }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/rules', {
                query: {
                    type,
                    'rule_name[]': ruleName,
                    'rule_group[]': ruleGroup,
                    'file[]': file,
                    exclude_alerts: excludeAlerts,
                    'match[]': match,
                    group_limit: groupLimit,
                    group_next_token: groupNextToken,
                },
            });
        } catch (error) {
            return toPromError(error, 'Failed to list rules');
        }
    },
});

export const alerts = tool({
    description: 'Lists all active alerts firing on this Prometheus instance.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/alerts');
        } catch (error) {
            return toPromError(error, 'Failed to list alerts');
        }
    },
});

export const alertmanagers = tool({
    description: 'Returns Alertmanager discovery state (active + dropped Alertmanagers).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/alertmanagers');
        } catch (error) {
            return toPromError(error, 'Failed to get alertmanagers');
        }
    },
});
