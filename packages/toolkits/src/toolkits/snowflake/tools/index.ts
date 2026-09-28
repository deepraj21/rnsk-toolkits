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
function entry(
  name: string,
  description: string,
  toolRef: any,
  scope: Scope,
  noAuth = false,
  keywords: string[] = [],
): {
  name: string;
  description: string;
  tool: any;
  requiredAuth?: typeof auth;
  scope: Scope;
  keywords: string[];
} {
  return noAuth
    ? { name, description, tool: toolRef, scope, keywords }
    : { name, description, tool: toolRef, requiredAuth: auth, scope, keywords };
}

export const snowflakeTools = [
  entry(
    'snowflakeExecuteSql',
    'Executes SQL synchronously and returns rows (SELECT, DDL, DML, batches).',
    executeSql,
    'write',
    false,
    ['query'],
  ),
  entry(
    'snowflakeCheckStatementStatus',
    'Polls an async statement by handle; follows result partitions.',
    checkStatementStatus,
    'read',
    false,
    ['poll', 'async'],
  ),
  entry(
    'snowflakeCancelStatementExecution',
    'Cancels a running statement by handle.',
    cancelStatementExecution,
    'delete',
    false,
    ['kill', 'abort'],
  ),
  entry(
    'snowflakeValidateCredential',
    'Validates credentials with a lightweight session query.',
    validateCredential,
    'read',
    false,
    ['auth', 'ping'],
  ),
  entry(
    'snowflakeShowDatabases',
    'Lists accessible databases with filters and pagination.',
    showDatabases,
    'read',
    false,
    ['database'],
  ),
  entry(
    'snowflakeShowSchemas',
    'Lists accessible schemas with scope and filters.',
    showSchemas,
    'read',
    false,
    ['schema'],
  ),
  entry(
    'snowflakeShowTables',
    'Lists accessible tables with scope and filters.',
    showTables,
    'read',
    false,
    ['table'],
  ),
  entry(
    'snowflakeDropWarehouse',
    'Permanently drops a warehouse (irreversible).',
    dropWarehouse,
    'delete',
    false,
    ['delete', 'remove', 'compute'],
  ),
  entry(
    'snowflakeFetchCatalogIntegration',
    'Describes an Iceberg catalog integration.',
    fetchCatalogIntegration,
    'read',
    false,
    ['iceberg'],
  ),
  entry(
    'snowflakeGetStatusSummary',
    'Reads the public status summary (overall + regions + incidents).',
    getStatusSummary,
    'read',
    true,
    ['health', 'outage'],
  ),
  entry(
    'snowflakeGetStatusRollup',
    'Reads the public page rollup (indicator + description).',
    getStatusRollup,
    'read',
    true,
    ['health'],
  ),
  entry(
    'snowflakeGetComponentStatus',
    'Lists per-component status (public, limit applied locally).',
    getComponentStatus,
    'read',
    true,
    ['health'],
  ),
  entry(
    'snowflakeGetUnresolvedIncidents',
    'Lists unresolved incidents (public).',
    getUnresolvedIncidents,
    'read',
    true,
    ['incident', 'outage'],
  ),
  entry(
    'snowflakeGetActiveScheduledMaintenances',
    'Lists in-progress/verifying maintenances (public).',
    getActiveScheduledMaintenances,
    'read',
    true,
    ['maintenance', 'downtime'],
  ),
  entry(
    'snowflakeGetUpcomingScheduledMaintenances',
    'Lists scheduled (not started) maintenances (public).',
    getUpcomingScheduledMaintenances,
    'read',
    true,
    ['maintenance', 'upcoming', 'planned'],
  ),
  entry(
    'snowflakeGetAllScheduledMaintenances',
    'Lists the 50 most recent maintenances (public).',
    getAllScheduledMaintenances,
    'read',
    true,
    ['maintenance', 'history'],
  ),
];
