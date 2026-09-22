// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest } from './client.js';

export const importRecords = tool({
    description: "Inserts incoming data into a specified ServiceNow staging table and triggers the associated transform map to move the data into the production table. Use this action when you need to bulk-import data into ServiceNow through the Import Set API. This is commonly used for data migration, integrating external data sources, or loading data from CSV files into ServiceNow tables. The staging table must have a transform map configured to map the staging table fields to the target production table fields.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        items: z.array(z.record(z.any())).optional().describe("List of data objects to import into the staging table. Each object contains field-value pairs corresponding to the columns in the staging table. The fields must match the columns defined in the staging table schema. Example: [{'short_description': 'Test item', 'description': 'Import test'}]. The data will be inserted into the staging table and the transform map associated with the staging table will be triggered to move data to the production table."),
        stagingTableName: z.string().describe("Name of the import set staging table to insert data into. This is the name of a staging table (usually prefixed with 'u_') that is configured with a transform map to move data into a production table. Common staging table names include: 'u_test_import_set', 'u_incident_staging', 'u_cmdb_ci_staging', etc."),
        records: z.array(z.record(z.any())).optional().describe("Array of record objects to insert into the staging table. Each record contains field-value pairs matching the columns of the staging table. These records will be queued for transform based on the transform map associated with the staging table. Example: [{'short_description': 'Test record 1'}, {'short_description': 'Test record 2'}]"),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values instead of sys_ids for reference fields in the records. When false (default), reference fields must contain sys_ids."),
    }),
    execute: async ({ servicenowCredentials, items, stagingTableName, records, sysparmInputDisplayValue }) => {
        const body = items !== undefined ? { items } : records !== undefined ? { records } : undefined;
        return snRequest(servicenowCredentials, `/api/now/import/${encodeURIComponent(stagingTableName)}/insertMultiple`, {
            method: 'POST',
            query: { sysparm_input_display_value: sysparmInputDisplayValue },
            ...(body ? { body } : {}),
        });
    },
});

export const getImportStagingRecord = tool({
    description: "Retrieves the specified import staging record and its associated target records. Use this action when you need to fetch a specific import staging record to view its current state, check import status, or retrieve the imported data before it is loaded into the target table. This is useful for auditing import processes, debugging failed imports, or monitoring data import progress. Common use cases: - Check the status of a specific import record - View the raw imported data for debugging - Verify that data was correctly staged before transformation - Retrieve import metadata (source, target table, batch info)",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The sys_id of the import staging record to retrieve. This is the unique identifier assigned to the staging record."),
        stagingTableName: z.string().describe("Name of the import set staging table from which to retrieve the record. This is the table where imported data is staged before being transformed and loaded into target tables."),
    }),
    execute: async ({ servicenowCredentials, sysId, stagingTableName }) => {
        return snRequest(servicenowCredentials, `/api/now/import/${encodeURIComponent(stagingTableName)}/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});
