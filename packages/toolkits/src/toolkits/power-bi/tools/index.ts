// @ts-nocheck
import { powerBiListGroups, powerBiGetGroup, powerBiCreateGroup } from './workspaces.js';
import {
  powerBiListReports,
  powerBiListReportsInGroup,
  powerBiGetReportInGroup,
  powerBiExportReport,
  powerBiGetReportExportStatus,
} from './reports.js';
import {
  powerBiListDatasetsInGroup,
  powerBiGetDatasetInGroup,
  powerBiRefreshDataset,
  powerBiListDatasetRefreshes,
  powerBiExecuteDatasetQuery,
} from './datasets.js';
import { powerBiListDashboardsInGroup, powerBiGetDashboardInGroup } from './dashboards.js';

export {
  powerBiListGroups,
  powerBiGetGroup,
  powerBiCreateGroup,
  powerBiListReports,
  powerBiListReportsInGroup,
  powerBiGetReportInGroup,
  powerBiExportReport,
  powerBiGetReportExportStatus,
  powerBiListDatasetsInGroup,
  powerBiGetDatasetInGroup,
  powerBiRefreshDataset,
  powerBiListDatasetRefreshes,
  powerBiExecuteDatasetQuery,
  powerBiListDashboardsInGroup,
  powerBiGetDashboardInGroup,
};

const auth = 'powerBiCredentials' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[]) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const powerBiTools = [
  entry('powerBiListGroups', powerBiListGroups, 'read', ['workspaces']),
  entry('powerBiGetGroup', powerBiGetGroup, 'read', ['workspace']),
  entry('powerBiCreateGroup', powerBiCreateGroup, 'write', ['workspace']),
  entry('powerBiListReports', powerBiListReports, 'read', ['pbix']),
  entry('powerBiListReportsInGroup', powerBiListReportsInGroup, 'read', ['pbix']),
  entry('powerBiGetReportInGroup', powerBiGetReportInGroup, 'read', ['pbix']),
  entry('powerBiExportReport', powerBiExportReport, 'write', ['pdf', 'export']),
  entry('powerBiGetReportExportStatus', powerBiGetReportExportStatus, 'read', ['export']),
  entry('powerBiListDatasetsInGroup', powerBiListDatasetsInGroup, 'read', ['semantic model']),
  entry('powerBiGetDatasetInGroup', powerBiGetDatasetInGroup, 'read', ['semantic model']),
  entry('powerBiRefreshDataset', powerBiRefreshDataset, 'write', ['semantic model']),
  entry('powerBiListDatasetRefreshes', powerBiListDatasetRefreshes, 'read', ['refresh history']),
  entry('powerBiExecuteDatasetQuery', powerBiExecuteDatasetQuery, 'read', ['dax']),
  entry('powerBiListDashboardsInGroup', powerBiListDashboardsInGroup, 'read', []),
  entry('powerBiGetDashboardInGroup', powerBiGetDashboardInGroup, 'read', []),
];
