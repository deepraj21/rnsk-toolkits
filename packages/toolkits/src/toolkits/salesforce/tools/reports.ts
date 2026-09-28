// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceGetDashboard = tool({
  description:
    'Gets detailed metadata for a specific dashboard including its components, layout, and filters.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    dashboardId: z.string().describe('The Salesforce ID of the dashboard to retrieve.'),
  }),
  execute: async ({ salesforceCredentials, dashboardId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/analytics/dashboards/${dashboardId}`);
  },
});

export const salesforceGetReport = tool({
  description:
    'Gets detailed metadata for a specific report including its structure, columns, filters, and groupings. Only fields included in the report layout are returned; use SALESFORCE_RUN_SOQL_QUERY when specific fields outside the report layout are required.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    reportId: z.string().describe('The Salesforce ID of the report to retrieve metadata for.'),
  }),
  execute: async ({ salesforceCredentials, reportId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/analytics/reports/${reportId}/describe`);
  },
});

export const salesforceGetReportInstance = tool({
  description:
    "Gets the results of a report instance created by running a report. Poll `attributes.status` until it equals 'Success' before parsing results. Response data is nested under `factMap` and `reportExtendedMetadata`; an empty `factMap` or zero rows is a valid successful result, not an error.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    reportId: z.string().describe('The Salesforce ID of the report.'),
    instanceId: z.string().describe('The report instance ID returned from running a report.'),
  }),
  execute: async ({ salesforceCredentials, reportId, instanceId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/analytics/reports/${reportId}/instances/${instanceId}`);
  },
});

export const salesforceListAnalyticsTemplates = tool({
  description:
    'Tool to list CRM Analytics templates available in the org. Use when you need to discover available templates for creating Analytics apps.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    page: z
      .number()
      .int()
      .optional()
      .describe(
        'Page number for pagination (1-based indexing). Specifies which page of results to retrieve.',
      ),
    type: z
      .enum(['App', 'Dashboard', 'Data', 'Embedded', 'Lens'])
      .optional()
      .describe(
        'Filter templates by type. App returns app templates, Dashboard returns dashboard templates, Data returns data templates, Embedded returns embedded templates, Lens returns lens templates.',
      ),
    options: z
      .enum(['CreateApp', 'ManageableOnly', 'ViewOnly'])
      .optional()
      .describe(
        'Filter templates by visibility. CreateApp returns templates that can be used to create apps, ManageableOnly returns templates the user can manage, ViewOnly returns templates the user can only view.',
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe(
        'Number of results per page. Controls how many template records are returned in a single response.',
      ),
  }),
  execute: async ({ salesforceCredentials, page, type, options, pageSize }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/wave/templates`, {
      query: { page: page, type: type, options: options, pageSize: pageSize },
    });
  },
});

export const salesforceListDashboards = tool({
  description:
    "Lists dashboards with basic metadata including name, ID, and URLs. Note: the Analytics REST API (GET /analytics/dashboards) returns only up to ~200 recently-viewed dashboards, not the org's entire dashboard catalog.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/analytics/dashboards`);
  },
});

export const salesforceListReports = tool({
  description:
    "Lists reports with basic metadata including name, ID, and URLs. Note: the Analytics REST API (GET /analytics/reports) returns only up to ~200 recently-viewed reports, not the org's entire report catalog.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/analytics/reports`);
  },
});

export const salesforceQueryReport = tool({
  description:
    'DEPRECATED: Executes a Salesforce report synchronously by its `id` and `reportType`, optionally with dynamic ad-hoc adjustments like filters or groupings, and returns its data without modifying the saved report.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z.string().describe('The unique identifier (ID) of the report to query.'),
    name: z
      .string()
      .optional()
      .describe(
        'The display name of the report. This is typically used for display purposes and may not be unique.',
      ),
    chart: z
      .array(z.record(z.any()))
      .optional()
      .describe('Configuration for the chart to be displayed with the report, if any.'),
    scope: z
      .string()
      .optional()
      .describe(
        'Defines the scope of the data on which you run the report. For example, you can run the report against all opportunities, opportunities you own, or opportunities your team owns. Valid values depend on the report type.',
      ),
    sortBy: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "A list of dictionaries specifying the columns and direction for sorting the report data. Each dictionary should define 'column' (API name) and 'sortOrder' ('asc' or 'desc').",
      ),
    buckets: z
      .array(z.record(z.any()))
      .optional()
      .describe('A list of bucket field definitions to apply to the report.'),
    topRows: z
      .record(z.any())
      .optional()
      .describe('Limits report output to a specified number of top or bottom rows.'),
    currency: z
      .enum([
        'USD',
        'EUR',
        'GBP',
        'CAD',
        'AUD',
        'JPY',
        'CHF',
        'CNY',
        'INR',
        'BRL',
        'MXN',
        'SGD',
        'NZD',
        'HKD',
      ])
      .optional()
      .describe('Supported currency codes for reports.'),
    division: z
      .string()
      .optional()
      .describe(
        "Determines the division of records to include in the report (e.g., West Coast, East Coast). Available only if your organization uses divisions to segment data and you have the 'Affected by Divisions' permission. If you do not have this perm",
      ),
    folderId: z
      .string()
      .optional()
      .describe(
        'The ID of the folder where the report is stored. Necessary if identifying the report by `developerName` within a specific folder.',
      ),
    aggregates: z
      .array(z.string())
      .optional()
      .describe(
        "List of aggregate field identifiers to include in the report (e.g., sum of Amount as 's!Amount', average of Amount as 'a!Amount').",
      ),
    reportType: z
      .record(z.any())
      .describe(
        'Specifies the type of the report, including its unique API name (`type`) and display name (`label`). This defines the objects and fields available for reporting.',
      ),
    crossFilters: z
      .array(z.record(z.any()))
      .optional()
      .describe('A list of cross-object filters to apply to the report.'),
    reportFormat: z
      .enum(['TABULAR', 'SUMMARY', 'MATRIX', 'MULTI_BLOCK'])
      .describe(
        'The desired format for the report output. Determines the structure of the data returned.',
      ),
    detailColumns: z
      .array(z.string())
      .optional()
      .describe(
        'A list of API names of the columns to include in the detail section of the report.',
      ),
    developerName: z
      .string()
      .optional()
      .describe(
        'The unique API developer name of the report being queried. This is often used to identify a saved report definition.',
      ),
    groupingsDown: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'A list of field groupings to be applied down rows (for summary or matrix reports).',
      ),
    hasDetailRows: z
      .boolean()
      .optional()
      .describe(
        'If true, the report output will include individual record rows (detail rows). If false, only summary data is returned.',
      ),
    reportFilters: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'A list of filter conditions to apply to the report data. Each filter specifies a column, operator, and value.',
      ),
    showSubtotals: z
      .boolean()
      .optional()
      .describe('If true, the report output will include subtotals for groupings.'),
    hasRecordCount: z
      .boolean()
      .optional()
      .describe('If true, the report will display the total number of records.'),
    showGrandTotal: z
      .boolean()
      .optional()
      .describe('If true, the report output will include a grand total summary.'),
    groupingsAcross: z
      .array(z.record(z.any()))
      .optional()
      .describe('A list of field groupings to be applied across columns (for matrix reports).'),
    standardFilters: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "A list of standard filters to apply, typically specific to the `reportType`. Each filter is a dictionary with 'name' and 'value' string pairs.",
      ),
    standardDateFilter: z
      .record(z.any())
      .optional()
      .describe('A filter based on a standard or custom date range for a specific date field.'),
    customDetailFormula: z
      .array(z.record(z.any()))
      .optional()
      .describe('A list of row-level (custom detail) formula definitions for the report.'),
    presentationOptions: z
      .record(z.any())
      .optional()
      .describe('Presentation settings for the report.'),
    reportBooleanFilter: z
      .string()
      .optional()
      .describe(
        "A string defining the logical relationship between multiple `reportFilters`. Uses 1-based indexing for filters (e.g., '(1 AND 2) OR 3').",
      ),
    customSummaryFormula: z
      .array(z.record(z.any()))
      .optional()
      .describe('A list of custom summary formula definitions for the report.'),
    historicalSnapshotDates: z
      .array(z.string())
      .optional()
      .describe(
        'A list of dates for which historical trending data should be retrieved. Dates should be in YYYY-MM-DD format.',
      ),
    userOrHierarchyFilterId: z
      .string()
      .optional()
      .describe(
        "The ID of a user or role used to filter the report based on role hierarchy (e.g., 'My Team's Opportunities').",
      ),
    allowedInCustomDetailFormula: z
      .boolean()
      .optional()
      .describe('Indicates if fields used in the report are allowed in custom detail formulas.'),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    name,
    chart,
    scope,
    sortBy,
    buckets,
    topRows,
    currency,
    division,
    folderId,
    aggregates,
    reportType,
    crossFilters,
    reportFormat,
    detailColumns,
    developerName,
    groupingsDown,
    hasDetailRows,
    reportFilters,
    showSubtotals,
    hasRecordCount,
    showGrandTotal,
    groupingsAcross,
    standardFilters,
    standardDateFilter,
    customDetailFormula,
    presentationOptions,
    reportBooleanFilter,
    customSummaryFormula,
    historicalSnapshotDates,
    userOrHierarchyFilterId,
    allowedInCustomDetailFormula,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const { id: sfReportId, ...sfReportRest } = {
      id: id,
      name: name,
      chart: chart,
      scope: scope,
      sortBy: sortBy,
      buckets: buckets,
      topRows: topRows,
      currency: currency,
      division: division,
      folderId: folderId,
      aggregates: aggregates,
      reportType: reportType,
      crossFilters: crossFilters,
      reportFormat: reportFormat,
      detailColumns: detailColumns,
      developerName: developerName,
      groupingsDown: groupingsDown,
      hasDetailRows: hasDetailRows,
      reportFilters: reportFilters,
      showSubtotals: showSubtotals,
      hasRecordCount: hasRecordCount,
      showGrandTotal: showGrandTotal,
      groupingsAcross: groupingsAcross,
      standardFilters: standardFilters,
      standardDateFilter: standardDateFilter,
      customDetailFormula: customDetailFormula,
      presentationOptions: presentationOptions,
      reportBooleanFilter: reportBooleanFilter,
      customSummaryFormula: customSummaryFormula,
      historicalSnapshotDates: historicalSnapshotDates,
      userOrHierarchyFilterId: userOrHierarchyFilterId,
      allowedInCustomDetailFormula: allowedInCustomDetailFormula,
    };
    return sfPost(salesforceCredentials, `/analytics/reports/${sfReportId}?includeDetails=true`, {
      body: { reportMetadata: sfReportRest },
    });
  },
});

export const salesforceRunReport = tool({
  description:
    'Runs a report synchronously (GET /analytics/reports/{id}?includeDetails=true) and returns the results in one call. This does NOT create an asynchronous report instance — for that, use the async run resource. Results are returned in a nested structure (factMap, reportExtendedMetadata), not a flat record list; an empty factMap/rows is a valid result. Avoid repeated calls when freshness allows.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    reportId: z.string().describe('The Salesforce ID of the report to run.'),
  }),
  execute: async ({ salesforceCredentials, reportId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/analytics/reports/${reportId}`, {
      query: { includeDetails: 'true' },
    });
  },
});

export const salesforceRunReportAsync = tool({
  description:
    'Run a Salesforce report asynchronously (POST /analytics/reports/{id}/instances). Returns an instance id and status; the report runs in the background. Retrieve results later with get_report_instance using the returned instance id. Use this (instead of the synchronous run_report) for large reports or to avoid blocking. Without this action, get_report_instance had no obtainable instance id.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    reportId: z.string().describe('The Salesforce ID of the report to run asynchronously.'),
    includeDetails: z
      .boolean()
      .optional()
      .describe(
        'If true, the async run includes detailed (row-level) results in addition to aggregates. Passed as the includeDetails query parameter.',
      ),
    reportMetadata: z
      .record(z.any())
      .optional()
      .describe(
        "Optional reportMetadata object to override the report's filters/settings for this run only (e.g. reportFilters, standardDateFilter). Sent as the request body when provided.",
      ),
  }),
  execute: async ({ salesforceCredentials, reportId, includeDetails, reportMetadata }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/analytics/reports/${reportId}/instances`, {
      body: { reportMetadata: reportMetadata },
      query: { includeDetails: includeDetails },
    });
  },
});
