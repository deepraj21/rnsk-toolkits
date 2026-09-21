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
function entry(name: string, description: string, toolRef: any, scope: Scope, noAuth = false): { name: string; description: string; tool: any; requiredAuth?: typeof auth; scope: Scope } {
    return noAuth ? { name, description, tool: toolRef, scope } : { name, description, tool: toolRef, requiredAuth: auth, scope };
}

export const npmTools = [
    entry('npmGetDownloadCountsPoint', 'Gets total download counts for one package over a period.', getDownloadCountsPoint, 'read', true),
    entry('npmGetAllPackagesDownloadPoint', 'Gets aggregate registry-wide download counts for a period.', getAllPackagesDownloadPoint, 'read', true),
    entry('npmGetDownloadCountsRangePackage', 'Gets daily download counts for a package between two dates.', getDownloadCountsRangePackage, 'read', true),
    entry('npmGetDownloadRangeAll', 'Gets daily registry-wide download counts for a period.', getDownloadRangeAll, 'read', true),
    entry('npmGetVersionDownloads', 'Gets per-version download counts for the last 7 days.', getVersionDownloads, 'read', true),
    entry('npmRegistryGetPackage', 'Fetches package metadata (dist-tags, license, maintainers).', getPackageMetadata, 'read', true),
    entry('npmRegistrySearchPackages', 'Searches packages by name/keywords/description.', searchPackages, 'read', true),
    entry('npmRegistryGetRoot', 'Fetches registry database statistics (package count, update_seq).', getRegistryRoot, 'read', true),
    entry('npmGetRegistryChanges', 'Streams the registry change feed for replication.', getRegistryChanges, 'read', true),
    entry('npmGetRegistryMeta', "Calls registry meta endpoints 'ping' (public) or 'whoami' (authed).", getRegistryMeta, 'read'),
    entry('npmQueryBulkSecurityAdvisories', 'Bulk-checks vulnerabilities for multiple packages.', queryBulkSecurityAdvisories, 'read', true),
    entry('npmDeleteUserTokenLegacy', 'Revokes a user auth token via the legacy endpoint.', deleteUserTokenLegacy, 'delete'),
];
