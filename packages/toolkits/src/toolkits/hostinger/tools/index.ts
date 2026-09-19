// @ts-nocheck
import {
    hostingerCheckDomainAvailability,
    hostingerListDomains,
    hostingerGetDomainForwarding,
    hostingerGenerateFreeSubdomain,
    hostingerVerifyDomainOwnership,
} from './domains.js';
import {
    hostingerCreateWhoisProfile,
    hostingerGetWhoisProfile,
    hostingerGetWhoisProfileUsage,
    hostingerListWhoisProfiles,
} from './whois.js';
import { hostingerGetDnsRecords, hostingerValidateDnsRecords, hostingerListDnsSnapshots } from './dns.js';
import {
    hostingerListVirtualMachines,
    hostingerListTemplates,
    hostingerGetTemplateDetails,
    hostingerListDataCenters,
    hostingerCreatePublicKey,
    hostingerListPublicKeys,
    hostingerDeletePublicKey,
} from './vps.js';
import { hostingerListCatalogItems, hostingerListPaymentMethods, hostingerListSubscriptions } from './billing.js';
import { hostingerListOrders, hostingerListWebsites } from './hosting.js';

export {
    hostingerCheckDomainAvailability,
    hostingerListDomains,
    hostingerGetDomainForwarding,
    hostingerGenerateFreeSubdomain,
    hostingerVerifyDomainOwnership,
    hostingerCreateWhoisProfile,
    hostingerGetWhoisProfile,
    hostingerGetWhoisProfileUsage,
    hostingerListWhoisProfiles,
    hostingerGetDnsRecords,
    hostingerValidateDnsRecords,
    hostingerListDnsSnapshots,
    hostingerListVirtualMachines,
    hostingerListTemplates,
    hostingerGetTemplateDetails,
    hostingerListDataCenters,
    hostingerCreatePublicKey,
    hostingerListPublicKeys,
    hostingerDeletePublicKey,
    hostingerListCatalogItems,
    hostingerListPaymentMethods,
    hostingerListSubscriptions,
    hostingerListOrders,
    hostingerListWebsites,
};

export const hostingerTools = [
    { name: 'HostingerCheckDomainAvailability', description: hostingerCheckDomainAvailability.description!, tool: hostingerCheckDomainAvailability, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListDomains', description: hostingerListDomains.description!, tool: hostingerListDomains, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerGetDomainForwarding', description: hostingerGetDomainForwarding.description!, tool: hostingerGetDomainForwarding, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerGenerateFreeSubdomain', description: hostingerGenerateFreeSubdomain.description!, tool: hostingerGenerateFreeSubdomain, requiredAuth: 'hostingerApiKey' as const, scope: 'write' as const },
    { name: 'HostingerVerifyDomainOwnership', description: hostingerVerifyDomainOwnership.description!, tool: hostingerVerifyDomainOwnership, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerCreateWhoisProfile', description: hostingerCreateWhoisProfile.description!, tool: hostingerCreateWhoisProfile, requiredAuth: 'hostingerApiKey' as const, scope: 'write' as const },
    { name: 'HostingerGetWhoisProfile', description: hostingerGetWhoisProfile.description!, tool: hostingerGetWhoisProfile, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerGetWhoisProfileUsage', description: hostingerGetWhoisProfileUsage.description!, tool: hostingerGetWhoisProfileUsage, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListWhoisProfiles', description: hostingerListWhoisProfiles.description!, tool: hostingerListWhoisProfiles, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerGetDnsRecords', description: hostingerGetDnsRecords.description!, tool: hostingerGetDnsRecords, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerValidateDnsRecords', description: hostingerValidateDnsRecords.description!, tool: hostingerValidateDnsRecords, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListDnsSnapshots', description: hostingerListDnsSnapshots.description!, tool: hostingerListDnsSnapshots, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListVirtualMachines', description: hostingerListVirtualMachines.description!, tool: hostingerListVirtualMachines, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListTemplates', description: hostingerListTemplates.description!, tool: hostingerListTemplates, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerGetTemplateDetails', description: hostingerGetTemplateDetails.description!, tool: hostingerGetTemplateDetails, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListDataCenters', description: hostingerListDataCenters.description!, tool: hostingerListDataCenters, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerCreatePublicKey', description: hostingerCreatePublicKey.description!, tool: hostingerCreatePublicKey, requiredAuth: 'hostingerApiKey' as const, scope: 'write' as const },
    { name: 'HostingerListPublicKeys', description: hostingerListPublicKeys.description!, tool: hostingerListPublicKeys, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerDeletePublicKey', description: hostingerDeletePublicKey.description!, tool: hostingerDeletePublicKey, requiredAuth: 'hostingerApiKey' as const, scope: 'delete' as const },
    { name: 'HostingerListCatalogItems', description: hostingerListCatalogItems.description!, tool: hostingerListCatalogItems, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListPaymentMethods', description: hostingerListPaymentMethods.description!, tool: hostingerListPaymentMethods, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListSubscriptions', description: hostingerListSubscriptions.description!, tool: hostingerListSubscriptions, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListOrders', description: hostingerListOrders.description!, tool: hostingerListOrders, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
    { name: 'HostingerListWebsites', description: hostingerListWebsites.description!, tool: hostingerListWebsites, requiredAuth: 'hostingerApiKey' as const, scope: 'read' as const },
];
