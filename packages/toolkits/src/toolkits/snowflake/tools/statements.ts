// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { parseCredentials, snowflakeCredentialsField, snowflakeSqlApi, submitStatement } from './client.js';

const executionContext = {
    role: z.string().optional().describe("Role (case-sensitive; default the token user's DEFAULT_ROLE)"),
    warehouse: z.string().optional().describe('Warehouse (case-sensitive; required for compute; default DEFAULT_WAREHOUSE)'),
    database: z.string().optional().describe("Database (case-sensitive; default DEFAULT_NAMESPACE)"),
    timeout: z.number().int().optional().describe('Timeout seconds (0 = max 604800; default server default)'),
};

export const executeSql = tool({
    description:
        'Executes SQL synchronously (SELECT, DDL, DML; semicolon-separated batches run in sequence) and returns rows. For INFORMATION_SCHEMA filter on table_schema + table_catalog and parenthesize mixed AND/OR.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        statement: z.string().min(1).describe("SQL text, e.g. 'SELECT * FROM my_table;'"),
        schemaName: z.string().optional().describe('Schema context (maps to SQL API schema)'),
        bindings: z.record(z.any()).optional().describe('Bind variables for parameterized queries (prevents SQL injection)'),
        parameters: z.record(z.any()).optional().describe('Session parameters, e.g. STATEMENT_TIMEOUT_IN_SECONDS'),
        requestId: z.string().optional().describe('Idempotency key (UUID) — safe retries reuse the same statement'),
        ...executionContext,
    }),
    execute: async ({ snowflakeCredentials, statement, schemaName, bindings, parameters, requestId, ...ctx }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        return submitStatement(creds as any, { statement, schema: schemaName, bindings, parameters, requestId, ...ctx });
    },
});

export const checkStatementStatus = tool({
    description:
        'Polls an async statement by handle until no longer pending; follows partition pages for large result sets. Pair with executeSql async batches or the deprecated submit flow.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        statementHandle: z.string().describe('Statement handle UUID from submission'),
        partition: z.number().int().min(0).optional().describe('Result partition index (0-based) for paged fetches'),
        requestId: z.string().optional().describe('Idempotency key echoed on the request'),
    }),
    execute: async ({ snowflakeCredentials, statementHandle, partition, requestId }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        try {
            const result = await snowflakeSqlApi(creds as any, `/statements/${statementHandle}`, { query: { partition }, requestId });
            if ((result as any)?.error) return { error: 'Failed to check statement status', ...(result as any) };
            return result;
        } catch (error) {
            return { error: 'Error checking statement status', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const cancelStatementExecution = tool({
    description: 'Cancels a running statement by handle. Use to stop long-running queries.',
    inputSchema: z.object({
        snowflakeCredentials: snowflakeCredentialsField,
        statementHandle: z.string().describe('Handle of the running statement to cancel'),
        requestId: z.string().optional().describe('Idempotency key echoed on the request'),
    }),
    execute: async ({ snowflakeCredentials, statementHandle, requestId }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        try {
            const result = await snowflakeSqlApi(creds as any, `/statements/${statementHandle}/cancel`, { method: 'POST', requestId });
            if ((result as any)?.error) return { error: 'Failed to cancel statement', ...(result as any) };
            return result;
        } catch (error) {
            return { error: 'Error canceling statement', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const validateCredential = tool({
    description:
        'Validates credentials with a lightweight session query. Returns user/role/warehouse/database/schema/version on success, auth details on failure.',
    inputSchema: z.object({ snowflakeCredentials: snowflakeCredentialsField }),
    execute: async ({ snowflakeCredentials }) => {
        const creds = parseCredentials(snowflakeCredentials);
        if ((creds as any)?.error) return creds;
        return submitStatement(
            creds as any,
            { statement: 'SELECT CURRENT_USER() AS "user", CURRENT_ROLE() AS "role", CURRENT_WAREHOUSE() AS "warehouse", CURRENT_DATABASE() AS "database", CURRENT_SCHEMA() AS "schema", CURRENT_VERSION() AS "version"' },
            'validate credentials',
        );
    },
});
