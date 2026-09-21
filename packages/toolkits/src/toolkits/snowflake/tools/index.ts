// @ts-nocheck
import {
    dropWarehouse,
    fetchCatalogIntegration,
    showDatabases,
    showSchemas,
    showTables,
} from './catalog.js';
import {
    cancelStatementExecution,
    checkStatementStatus,
    executeSql,
    validateCredential,
} from './statements.js';
import {
    getActiveScheduledMaintenances,
    getAllScheduledMaintenances,
    getComponentStatus,
    getStatusRollup,
    getStatusSummary,
    getUnresolvedIncidents,
    getUpcomingScheduledMaintenances,
} from './status.js';

export {
    executeSql,
    checkStatementStatus,
    cancelStatementExecution,
    validateCredential,
    showDatabases,
    showSchemas,
    showTables,
    dropWarehouse,
    fetchCatalogIntegration,
    getStatusSummary,
    getStatusRollup,
    getComponentStatus,
    getUnresolvedIncidents,
    getActiveScheduledMaintenances,
    getUpcomingScheduledMaintenances,
    getAllScheduledMaintenances,
};

const auth = 'snowflakeCredentials' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(name: string, description: string, toolRef: any, scope: Scope, noAuth = false): { name: string; description: string; tool: any; requiredAuth?: typeof auth; scope: Scope } {
    return noAuth ? { name, description, tool: toolRef, scope } : { name, description, tool: toolRef, requiredAuth: auth, scope };
}

export const snowflakeTools = [
    entry('snowflakeExecuteSql', 'Executes SQL synchronously and returns rows (SELECT, DDL, DML, batches).', executeSql, 'write'),
    entry('snowflakeCheckStatementStatus', 'Polls an async statement by handle; follows result partitions.', checkStatementStatus, 'read'),
    entry('snowflakeCancelStatementExecution', 'Cancels a running statement by handle.', cancelStatementExecution, 'delete'),
    entry('snowflakeValidateCredential', 'Validates credentials with a lightweight session query.', validateCredential, 'read'),
    entry('snowflakeShowDatabases', 'Lists accessible databases with filters and pagination.', showDatabases, 'read'),
    entry('snowflakeShowSchemas', 'Lists accessible schemas with scope and filters.', showSchemas, 'read'),
    entry('snowflakeShowTables', 'Lists accessible tables with scope and filters.', showTables, 'read'),
    entry('snowflakeDropWarehouse', 'Permanently drops a warehouse (irreversible).', dropWarehouse, 'delete'),
    entry('snowflakeFetchCatalogIntegration', 'Describes an Iceberg catalog integration.', fetchCatalogIntegration, 'read'),
    entry('snowflakeGetStatusSummary', 'Reads the public status summary (overall + regions + incidents).', getStatusSummary, 'read', true),
    entry('snowflakeGetStatusRollup', 'Reads the public page rollup (indicator + description).', getStatusRollup, 'read', true),
    entry('snowflakeGetComponentStatus', 'Lists per-component status (public, limit applied locally).', getComponentStatus, 'read', true),
    entry('snowflakeGetUnresolvedIncidents', 'Lists unresolved incidents (public).', getUnresolvedIncidents, 'read', true),
    entry('snowflakeGetActiveScheduledMaintenances', 'Lists in-progress/verifying maintenances (public).', getActiveScheduledMaintenances, 'read', true),
    entry('snowflakeGetUpcomingScheduledMaintenances', 'Lists scheduled (not started) maintenances (public).', getUpcomingScheduledMaintenances, 'read', true),
    entry('snowflakeGetAllScheduledMaintenances', 'Lists the 50 most recent maintenances (public).', getAllScheduledMaintenances, 'read', true),
];
