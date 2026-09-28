// @ts-nocheck
import {
  getAllPackagesDownloadPoint,
  getDownloadCountsPoint,
  getDownloadCountsRangePackage,
  getDownloadRangeAll,
  getVersionDownloads,
} from './downloads.js';
import {
  getPackageMetadata,
  getRegistryChanges,
  getRegistryMeta,
  getRegistryRoot,
  searchPackages,
} from './registry.js';
import { deleteUserTokenLegacy, queryBulkSecurityAdvisories } from './security.js';

export {
  getDownloadCountsPoint,
  getAllPackagesDownloadPoint,
  getDownloadCountsRangePackage,
  getDownloadRangeAll,
  getVersionDownloads,
  getPackageMetadata,
  searchPackages,
  getRegistryRoot,
  getRegistryChanges,
  getRegistryMeta,
  queryBulkSecurityAdvisories,
  deleteUserTokenLegacy,
};

const auth = 'npmApiKey' as const;

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

export const npmTools = [
  entry(
    'npmGetDownloadCountsPoint',
    'Gets total download counts for one package over a period.',
    getDownloadCountsPoint,
    'read',
    true,
    ['downloads', 'stats'],
  ),
  entry(
    'npmGetAllPackagesDownloadPoint',
    'Gets aggregate registry-wide download counts for a period.',
    getAllPackagesDownloadPoint,
    'read',
    true,
    ['downloads', 'stats', 'total'],
  ),
  entry(
    'npmGetDownloadCountsRangePackage',
    'Gets daily download counts for a package between two dates.',
    getDownloadCountsRangePackage,
    'read',
    true,
    ['downloads', 'daily', 'history'],
  ),
  entry(
    'npmGetDownloadRangeAll',
    'Gets daily registry-wide download counts for a period.',
    getDownloadRangeAll,
    'read',
    true,
    ['downloads', 'daily'],
  ),
  entry(
    'npmGetVersionDownloads',
    'Gets per-version download counts for the last 7 days.',
    getVersionDownloads,
    'read',
    true,
    ['downloads', 'version', 'versions'],
  ),
  entry(
    'npmRegistryGetPackage',
    'Fetches package metadata (dist-tags, license, maintainers).',
    getPackageMetadata,
    'read',
    true,
    ['package', 'info', 'version'],
  ),
  entry(
    'npmRegistrySearchPackages',
    'Searches packages by name/keywords/description.',
    searchPackages,
    'read',
    true,
    ['find', 'package', 'discover'],
  ),
  entry(
    'npmRegistryGetRoot',
    'Fetches registry database statistics (package count, update_seq).',
    getRegistryRoot,
    'read',
    true,
    ['stats', 'status'],
  ),
  entry(
    'npmGetRegistryChanges',
    'Streams the registry change feed for replication.',
    getRegistryChanges,
    'read',
    true,
    ['feed', 'sync', 'replication'],
  ),
  entry(
    'npmGetRegistryMeta',
    "Calls registry meta endpoints 'ping' (public) or 'whoami' (authed).",
    getRegistryMeta,
    'read',
    false,
    ['ping', 'whoami', 'health'],
  ),
  entry(
    'npmQueryBulkSecurityAdvisories',
    'Bulk-checks vulnerabilities for multiple packages.',
    queryBulkSecurityAdvisories,
    'read',
    true,
    ['vulnerability', 'vulnerabilities', 'security', 'audit'],
  ),
  entry(
    'npmDeleteUserTokenLegacy',
    'Revokes a user auth token via the legacy endpoint.',
    deleteUserTokenLegacy,
    'delete',
    false,
    ['revoke', 'token', 'remove'],
  ),
];
