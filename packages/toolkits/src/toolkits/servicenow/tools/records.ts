// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest } from './client.js';

export const createRecord = tool({
    description: "Inserts a new record into the specified ServiceNow table with the provided field values. Use this action when you need to create a new record in any ServiceNow table (e.g., incident, problem, change_request, task, sys_user). The created record is returned with its sys_id and auto-generated number. NOTE: This action uses the /api/now/table/ endpoint as documented. The existing CreateARecord action uses /api/now/v1/table/.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        tableName: z.string().describe("The name of the table where the record will be created (e.g., 'incident', 'problem', 'change_request', 'sys_user')."),
        recordData: z.record(z.any()).optional().describe("Field-value pairs for the new record. Available fields depend on the table schema. For 'incident' table, common fields include: 'short_description', 'description', 'urgency' (1-3), 'impact' (1-3), 'priority', 'assignment_group', 'assigned_to', 'category', 'state'. For reference fields (like 'assignment_group' or 'assigned_to'), use the sys_id of the referenced record, or set sysparm_input_display_value=true to use display values. Example: {'short_description': 'Network outage', 'urgency': '1', 'impact': '1', 'description': 'Unable to access network'}"),
        sysparmView: z.enum(['desktop', 'mobile', 'both']).optional().describe("UI view to determine which fields are returned in the response. If not specified, returns fields from the default view."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'number,short_description,state'). Invalid fields are ignored. If not specified, all fields are returned."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values (e.g., user names) instead of sys_ids in record_data for reference fields. When false (default), reference fields must contain sys_ids."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, tableName, recordData, sysparmView, sysparmFields, sysparmDisplayValue, sysparmInputDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/table/${encodeURIComponent(tableName)}`, {
            method: 'POST',
            query: {
                sysparm_view: sysparmView,
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_input_display_value: sysparmInputDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
            body: recordData,
        });
    },
});

export const getRecordList = tool({
    description: "Retrieves multiple records from a specified ServiceNow table with optional filtering and pagination. Use this action to query and fetch records from any ServiceNow table (e.g., incident, sys_user, problem). Supports filtering via sysparm_query, field selection, pagination, and display value options.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        tableName: z.string().optional().describe("The name of the table from which to retrieve the record."),
        sysparmView: z.enum(['desktop', 'mobile', 'both']).optional().describe("UI view for which to render the data. Determines the fields returned in the response."),
        sysparmLimit: z.number().optional().describe("Maximum number of records to return. For requests that exceed this number of records, use the sysparm_offset parameter to paginate record retrieval. This limit is applied before ACL evaluation. If no records return, including records you have access to, rearrange the record order so records you have access to return first. Note: Unusually large sysparm_limit values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query used to filter the result set. Syntax: <col_name><operator><value>. All parameters are case-sensitive. Operators: = (exact match), != (not equal), ^ (AND), ^OR (OR), LIKE (contains string), STARTSWITH, ENDSWITH (string fields only). Multiple conditions: <col_name><operator><value>^<col_name><operator><value>. Example: active=true^priority=1. Sorting: Append ORDERBY<col_name> or ORDERBYDESC<col_name>. Example: active=true^ORDERBYnumber^ORDERBYDESCcategory."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid fields are ignored."),
        sysparmOffset: z.number().optional().describe("Starting record index for which to begin retrieving records. Use this value to paginate record retrieval. This functionality enables the retrieval of all records, regardless of the number of records, in small manageable chunks. For example, the first time you call this endpoint, sysparm_offset is set to '0'. To simply page through all available records, use sysparm_offset=sysparm_offset+sysparm_limit, until you reach the end of all records. Don't pass a negative number in the sysparm_offset parameter."),
        nameValuePairs: z.string().optional().describe("DEPRECATED: This parameter does not work in the ServiceNow Table API and will be ignored. Use 'sysparm_query' instead for filtering records. Example: sysparm_query='active=true^priority=1' for multiple conditions."),
        sysparmNoCount: z.boolean().optional().describe("Flag that indicates whether to execute a select count(*) query on the table to return the number of rows in the associated table."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned, either the actual values from the database or the display values of the fields. Display values are manipulated based on the actual value in the database and user or system settings and preferences. If returning display values, the value that is returned is dependent on the field type. Choice fields: The database value may be a number, but the display value will be more descriptive. Date fields: The database value is in UTC format, while the display value is based on the user's time zone. Encrypted text: The database value is encrypted, while the displayed value is unencrypted based on the user's encryption context. Reference fields: The database value is sys_id, but the display value is a display field of the referenced record."),
        sysparmQueryCategory: z.string().optional().describe("Name of the category to use for queries."),
        sysparmQueryNoDomain: z.boolean().optional().describe("Flag that indicates whether to restrict the record search to only the domains for which the logged in user is configured. Valid values: false (Exclude the record if it is in a domain that the currently logged in user is not configured to access), true (Include the record even if it is in a domain that the currently logged in user is not configured to access). Note: The sysparm_query_no_domain parameter is available only to system administrators or users who have the query_no_domain_table_api role."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields."),
        sysparmSuppressPaginationHeader: z.boolean().optional().describe("Flag that indicates whether to remove the Link header from the response. The Link header provides various URLs to relative pages in the record set which you can use to paginate the returned record set. Valid values: true (Remove the Link header from the response), false (Do not remove the Link header from the response)."),
    }),
    execute: async ({ servicenowCredentials, tableName, sysparmView, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, nameValuePairs, sysparmNoCount, sysparmDisplayValue, sysparmQueryCategory, sysparmQueryNoDomain, sysparmExcludeReferenceLink, sysparmSuppressPaginationHeader }) => {
        return snRequest(
            servicenowCredentials,
            tableName !== undefined ? `/api/now/table/${encodeURIComponent(tableName)}` : '/api/now/table',
            {
                method: 'GET',
                query: {
                    sysparm_view: sysparmView,
                    sysparm_limit: sysparmLimit,
                    sysparm_query: sysparmQuery,
                    sysparm_fields: sysparmFields,
                    sysparm_offset: sysparmOffset,
                    name_value_pairs: nameValuePairs,
                    sysparm_no_count: sysparmNoCount,
                    sysparm_display_value: sysparmDisplayValue,
                    sysparm_query_category: sysparmQueryCategory,
                    sysparm_query_no_domain: sysparmQueryNoDomain,
                    sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
                    sysparm_suppress_pagination_header: sysparmSuppressPaginationHeader,
                },
            },
        );
    },
});

export const getRecord = tool({
    description: "Retrieves the record identified by the specified sys_id from the specified table. Use this action when you need to fetch a single record from any ServiceNow table (e.g., incident, sys_user, problem) by providing its table name and unique sys_id. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("Sys_id of the record to retrieve. This is a 32-character hexadecimal string that uniquely identifies the record."),
        tableName: z.string().describe("Name of the table to retrieve the record from."),
        sysparmView: z.string().optional().describe("UI view to use for field selection."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Exclude reference links in the response."),
        sysparmLimit: z.number().optional().describe("Maximum number of records to return. For requests that exceed this number of records, use pagination via sysparm_offset. Note: Unusually large values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter results. Syntax: <col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: state=1^priority=2"),
        sysparmOffset: z.number().optional().describe("Starting record index for pagination. Set to sysparm_offset + sysparm_limit to retrieve subsequent pages of results."),
        sysparmSuppressPaginationHeader: z.boolean().optional().describe("Set to true to exclude the Link header from the response for pagination."),
    }),
    execute: async ({ servicenowCredentials, sysId, tableName, sysparmView, sysparmFields, sysparmDisplayValue, sysparmExcludeReferenceLink, sysparmLimit, sysparmQuery, sysparmOffset, sysparmSuppressPaginationHeader }) => {
        return snRequest(servicenowCredentials, `/api/now/table/${encodeURIComponent(tableName)}/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            query: {
                sysparm_view: sysparmView,
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
                sysparm_limit: sysparmLimit,
                sysparm_query: sysparmQuery,
                sysparm_offset: sysparmOffset,
                sysparm_suppress_pagination_header: sysparmSuppressPaginationHeader,
            },
        });
    },
});

export const updateRecord = tool({
    description: "Updates an existing record in a specified ServiceNow table by its sys_id using the Table API. Use this action when you need to modify specific fields of an existing record, such as updating the short_description, changing the state, reassigning the record, adding close_notes, or modifying any other table field. Only the fields specified in record_data are updated — all other fields retain their current values. This action sends a PATCH request to the ServiceNow Table API. This action modifies data but the changes can be reverted by calling this action again with the corrected values. This is an idempotent operation — calling it multiple times with the same parameters produces the same result.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the record to update. This is a 32-character hexadecimal string. Example: '3877ccb6833ff210dd2dc2dfeeaad375'"),
        tableName: z.string().describe("The name of the table containing the record to update. Examples: 'incident', 'problem', 'change_request', 'task', 'sys_user'."),
        recordData: z.record(z.any()).optional().describe("Field-value pairs to update on the record. Only the specified fields are updated; all other fields retain their current values. For 'incident' table, common fields include: 'short_description', 'description', 'urgency' (1-3), 'impact' (1-3), 'priority', 'assignment_group', 'assigned_to', 'category', 'state', 'close_notes', 'work_notes'. For reference fields (like 'assigned_to'), use the sys_id of the referenced record, or set sysparm_input_display_value=true to use display values. Example: {'short_description': 'Updated via API', 'urgency': '2', 'impact': '2'}"),
        sysparmView: z.enum(['desktop', 'mobile', 'both']).optional().describe("UI view that determines which fields are returned."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid fields are ignored. If not specified, all fields are returned. Example: 'number,short_description,state,assigned_to'"),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmInputDisplayValue: z.boolean().optional().describe("Set to true if providing display values (e.g., user names) instead of sys_ids in record_data for reference fields. When false (default), reference fields must contain sys_ids."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, sysId, tableName, recordData, sysparmView, sysparmFields, sysparmDisplayValue, sysparmInputDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/table/${encodeURIComponent(tableName)}/${encodeURIComponent(sysId)}`, {
            method: 'PATCH',
            query: {
                sysparm_view: sysparmView,
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_input_display_value: sysparmInputDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
            body: recordData,
        });
    },
});

export const deleteRecord = tool({
    description: "Permanently deletes a specific record from a ServiceNow table using its sys_id. Use this action when you need to remove a record from a ServiceNow table and the record's sys_id is known. This is a destructive operation that cannot be undone. The record will be permanently removed from the table. Requires the user to have delete permissions on the specified table. If the record doesn't exist or the user lacks permissions, an error will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the record to delete. This is a 32-character hexadecimal string that uniquely identifies the record. Example: '3a24ff2e83b7f210dd2dc2dfeeaad37e'. The record must exist in the specified table, or a 404 error will be returned."),
        tableName: z.string().describe("Name of the ServiceNow table from which to delete the record (e.g., 'incident', 'problem', 'change_request', 'task'). The table must exist in the ServiceNow instance and the user must have delete permissions for it."),
        sysparmQueryNoDomain: z.boolean().optional().describe("Set to true to include records from domains the logged-in user is not configured to access (requires admin or query_no_domain_table_api role). When false (default), only records in the user's configured domains can be deleted."),
    }),
    execute: async ({ servicenowCredentials, sysId, tableName, sysparmQueryNoDomain }) => {
        return snRequest(servicenowCredentials, `/api/now/table/${encodeURIComponent(tableName)}/${encodeURIComponent(sysId)}`, {
            method: 'DELETE',
            query: { sysparm_query_no_domain: sysparmQueryNoDomain },
        });
    },
});

export const getRecordStats = tool({
    description: "Retrieves aggregate statistics for a specified ServiceNow table, including COUNT, AVG, MIN, MAX, and SUM calculations. Use this action when you need to perform aggregate queries on ServiceNow tables to get statistical summaries (e.g., count of incidents by state, average priority, min/max values for specific fields, or grouped aggregations). Supports filtering records with sysparm_query, calculating various aggregates, grouping results, and filtering aggregated results with the having clause.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        tableName: z.string().describe("The name of the table to aggregate statistics from (e.g., 'incident', 'sys_user', 'task')."),
        sysparmCount: z.boolean().optional().describe("Set to true to return the count of records matching the query."),
        sysparmQuery: z.string().optional().describe("Encoded query string to filter records before aggregating. Syntax: <col_name><operator><value>. Operators: = (equals), != (not equals), ^ (AND), ^OR (OR), LIKE, STARTSWITH, ENDSWITH. Example: active=true^priority=1"),
        sysparmHaving: z.string().optional().describe("Having clause to filter aggregated results based on aggregate values. Syntax: <aggregate_function><operator><value>. Example: 'count>10' returns only groups with count greater than 10."),
        sysparmGroupBy: z.string().optional().describe("Comma-separated list of fields to group results by. When specified, aggregate functions are calculated per group. Example: 'state,active' groups results by state and active status."),
        sysparmAvgFields: z.string().optional().describe("Comma-separated list of numeric fields to calculate average for. Example: 'priority,urgency' calculates average priority and urgency values."),
        sysparmMaxFields: z.string().optional().describe("Comma-separated list of fields to calculate maximum value for. Example: 'priority,state' returns maximum priority and state values."),
        sysparmMinFields: z.string().optional().describe("Comma-separated list of fields to calculate minimum value for. Example: 'priority,state' returns minimum priority and state values."),
        sysparmSumFields: z.string().optional().describe("Comma-separated list of numeric fields to calculate sum for. Example: 'priority' returns sum of all priority values."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Display value options for stats query responses"),
    }),
    execute: async ({ servicenowCredentials, tableName, sysparmCount, sysparmQuery, sysparmHaving, sysparmGroupBy, sysparmAvgFields, sysparmMaxFields, sysparmMinFields, sysparmSumFields, sysparmDisplayValue }) => {
        return snRequest(servicenowCredentials, `/api/now/stats/${encodeURIComponent(tableName)}`, {
            method: 'GET',
            query: {
                sysparm_count: sysparmCount,
                sysparm_query: sysparmQuery,
                sysparm_having: sysparmHaving,
                sysparm_group_by: sysparmGroupBy,
                sysparm_avg_fields: sysparmAvgFields,
                sysparm_max_fields: sysparmMaxFields,
                sysparm_min_fields: sysparmMinFields,
                sysparm_sum_fields: sysparmSumFields,
                sysparm_display_value: sysparmDisplayValue,
            },
        });
    },
});

export const getTableSchema = tool({
    description: "Retrieves all available table record types from the ServiceNow instance using the Table API documentation endpoint. Use this action when you need to discover all available tables and their record types in a ServiceNow instance before performing queries, creating records, or understanding the data structure available in the instance. This is useful for dynamic table selection and exploration purposes. This action queries the /api/now/doc/table/schema endpoint which returns metadata about all tables accessible in the ServiceNow instance, including both system tables and custom tables.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
    }),
    execute: async ({ servicenowCredentials }) => {
        return snRequest(servicenowCredentials, '/api/now/doc/table/schema', {
            method: 'GET',
        });
    },
});
