// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildShow, parseCredentials, quoteIdent, snowflakeCredentialsField, submitStatement } from './client.js';

const showContext = {
    role: z.string().optional().describe('Role for the SHOW statement'),
    warehouse: z.string().optional().describe('Warehouse (SHOW works without a running warehouse)'),
    timeout: z.number().int().optional().describe('Timeout seconds'),
};

const showFilters = {
    terse: z.boolean().optional().describe('Subset of columns only'),
    history: z.boolean().optional().describe('Include dropped objects within Time Travel retention'),
    likePattern: z.string().optional().describe("SQL wildcard filter (% and _), e.g. '%test%' (case-insensitive)"),
    startsWith: z.string().optional().describe("Prefix filter, e.g. 'PROD' (case-sensitive)"),
    limit: z.number().int().min(1).max(10000).optional().describe('Max rows (<= 10000)'),
    fromName: z.string().optional().describe('With limit: start pagination at names matching this string'),
};

export const showDatabases = tool({
    description: 'Lists accessible databases (name, created date, owner, retention). Supports LIKE/prefix filters, history, and limit/from pagination.',
    inputSchema: z.object({ snowflakeCredentials: snowflakeCredentialsField, ...showContext, ...showFilters }),
    execute: async ({ snowflakeCredentials, terse, history, likePattern, startsWith, limit, fromName, ...ctx }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        return submitStatement(creds as any, { statement: buildShow('DATABASES', undefined, { terse, history, likePattern, startsWith, limit, fromName }), ...ctx }, 'show databases');
    },
});

export const showSchemas = tool({
    description: 'Lists accessible schemas (name, database, owner, retention). Scope via in_scope: ACCOUNT, DATABASE (+database), or a database name.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        database: z.string().optional().describe('Database context (used with in_scope DATABASE)'),
        inScope: z.string().optional().describe("Scope: 'ACCOUNT', 'DATABASE', or a database name"),
        ...showContext,
        ...showFilters,
    }),
    execute: async ({ snowflakeCredentials, database, inScope, terse, history, likePattern, startsWith, limit, fromName, ...ctx }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        let scope: string | undefined;
        if (inScope) {
            const upper = inScope.toUpperCase();
            if (upper === 'ACCOUNT') scope = 'IN ACCOUNT';
            else if (upper === 'DATABASE') scope = database ? `IN DATABASE ${quoteIdent(database)}` : 'IN DATABASE';
            else scope = `IN DATABASE ${quoteIdent(inScope)}`;
        } else if (database) {
            scope = `IN DATABASE ${quoteIdent(database)}`;
        }
        return submitStatement(creds as any, { statement: buildShow('SCHEMAS', scope, { terse, history, likePattern, startsWith, limit, fromName }), database, ...ctx }, 'show schemas');
    },
});

export const showTables = tool({
    description: 'Lists accessible tables (rows, bytes, clustering, retention). Scope with database/schema or in_scope; supports LIKE/prefix/history/pagination.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        database: z.string().optional().describe('Database context'),
        schema: z.string().optional().describe('Schema context (with database → IN SCHEMA db.schema)'),
        inScope: z.string().optional().describe("Scope: 'ACCOUNT', 'DATABASE', 'SCHEMA', or a qualified name"),
        ...showContext,
        ...showFilters,
    }),
    execute: async ({ snowflakeCredentials, database, schema, inScope, terse, history, likePattern, startsWith, limit, fromName, ...ctx }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        let scope: string | undefined;
        if (database && schema) scope = `IN SCHEMA ${quoteIdent(database)}.${quoteIdent(schema)}`;
        else if (inScope) {
            const upper = inScope.toUpperCase();
            if (upper === 'ACCOUNT') scope = 'IN ACCOUNT';
            else if (upper === 'DATABASE') scope = database ? `IN DATABASE ${quoteIdent(database)}` : 'IN DATABASE';
            else if (upper === 'SCHEMA') scope = database && schema ? `IN SCHEMA ${quoteIdent(database)}.${quoteIdent(schema)}` : 'IN SCHEMA';
            else scope = `IN ${inScope}`;
        } else if (database) {
            scope = `IN DATABASE ${quoteIdent(database)}`;
        }
        return submitStatement(creds as any, { statement: buildShow('TABLES', scope, { terse, history, likePattern, startsWith, limit, fromName }), database, schema, ...ctx }, 'show tables');
    },
});

export const dropWarehouse = tool({
    description: 'Permanently drops a warehouse (irreversible). Requires appropriate privileges; use if_exists to skip errors when absent.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        name: z.string().describe('Warehouse name to drop'),
        ifExists: z.boolean().optional().describe('Skip error when the warehouse does not exist'),
        role: z.string().optional(),
        timeout: z.number().int().optional(),
    }),
    execute: async ({ snowflakeCredentials, name, ifExists, ...ctx }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        return submitStatement(creds as any, { statement: `DROP WAREHOUSE ${ifExists ? 'IF EXISTS ' : ''}${quoteIdent(name)}`, ...ctx }, 'drop warehouse');
    },
});

export const fetchCatalogIntegration = tool({
    description: 'Describes a catalog integration (Iceberg: AWS Glue, Open Catalog/Polaris, REST) — configuration and metadata.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        name: z.string().describe('Catalog integration name'),
        role: z.string().optional(),
        warehouse: z.string().optional(),
        timeout: z.number().int().optional(),
    }),
    execute: async ({ snowflakeCredentials, name, ...ctx }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        return submitStatement(creds as any, { statement: `DESCRIBE CATALOG INTEGRATION ${quoteIdent(name)}`, ...ctx }, 'describe catalog integration');
    },
});
