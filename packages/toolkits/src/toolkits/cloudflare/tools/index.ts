// @ts-nocheck
import { cloudflareCreateDnsRecord } from './create-dns-record.js';
import { cloudflareListDnsRecords } from './list-dns-records.js';
import { cloudflareUpdateDnsRecord } from './update-dns-record.js';
import { cloudflareDeleteDnsRecord } from './delete-dns-record.js';
import { cloudflareListZones } from './list-zones.js';
import { cloudflareCreateZone } from './create-zone.js';
import { cloudflareUpdateZone } from './update-zone.js';
import { cloudflareDeleteZone } from './delete-zone.js';
import { cloudflareListAccounts } from './list-accounts.js';
import { cloudflareListAccountMembers } from './list-account-members.js';
import { cloudflareCreateList } from './create-list.js';
import { cloudflareListWafLists } from './list-waf-lists.js';
import { cloudflareUpdateList } from './update-list.js';
import { cloudflareDeleteList } from './delete-list.js';
import { cloudflareListFirewallRules } from './list-firewall-rules.js';
import { cloudflareGetBotManagementSettings } from './get-bot-management-settings.js';
import { cloudflareListMonitors } from './list-monitors.js';
import { cloudflareListPools } from './list-pools.js';
import { cloudflareListTunnels } from './list-tunnels.js';
import { cloudflareUpdateTunnelConfiguration } from './update-tunnel-configuration.js';

export {
  cloudflareCreateDnsRecord,
  cloudflareListDnsRecords,
  cloudflareUpdateDnsRecord,
  cloudflareDeleteDnsRecord,
  cloudflareListZones,
  cloudflareCreateZone,
  cloudflareUpdateZone,
  cloudflareDeleteZone,
  cloudflareListAccounts,
  cloudflareListAccountMembers,
  cloudflareCreateList,
  cloudflareListWafLists,
  cloudflareUpdateList,
  cloudflareDeleteList,
  cloudflareListFirewallRules,
  cloudflareGetBotManagementSettings,
  cloudflareListMonitors,
  cloudflareListPools,
  cloudflareListTunnels,
  cloudflareUpdateTunnelConfiguration,
};

export const cloudflareTools = [
  {
    name: 'cloudflareCreateDnsRecord',
    description: cloudflareCreateDnsRecord.description!,
    tool: cloudflareCreateDnsRecord,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['cname', 'txt'],
  },
  {
    name: 'cloudflareListDnsRecords',
    description: cloudflareListDnsRecords.description!,
    tool: cloudflareListDnsRecords,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'cloudflareUpdateDnsRecord',
    description: cloudflareUpdateDnsRecord.description!,
    tool: cloudflareUpdateDnsRecord,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['edit'],
  },
  {
    name: 'cloudflareDeleteDnsRecord',
    description: cloudflareDeleteDnsRecord.description!,
    tool: cloudflareDeleteDnsRecord,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'delete' as const,
    keywords: ['remove'],
  },
  {
    name: 'cloudflareListZones',
    description: cloudflareListZones.description!,
    tool: cloudflareListZones,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['domain', 'domains'],
  },
  {
    name: 'cloudflareCreateZone',
    description: cloudflareCreateZone.description!,
    tool: cloudflareCreateZone,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['domain'],
  },
  {
    name: 'cloudflareUpdateZone',
    description: cloudflareUpdateZone.description!,
    tool: cloudflareUpdateZone,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['pause', 'domain'],
  },
  {
    name: 'cloudflareDeleteZone',
    description: cloudflareDeleteZone.description!,
    tool: cloudflareDeleteZone,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'domain'],
  },
  {
    name: 'cloudflareListAccounts',
    description: cloudflareListAccounts.description!,
    tool: cloudflareListAccounts,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['account'],
  },
  {
    name: 'cloudflareListAccountMembers',
    description: cloudflareListAccountMembers.description!,
    tool: cloudflareListAccountMembers,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['member', 'user'],
  },
  {
    name: 'cloudflareCreateList',
    description: cloudflareCreateList.description!,
    tool: cloudflareCreateList,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['allowlist', 'blocklist', 'waf'],
  },
  {
    name: 'cloudflareListWafLists',
    description: cloudflareListWafLists.description!,
    tool: cloudflareListWafLists,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['allowlist', 'blocklist'],
  },
  {
    name: 'cloudflareUpdateList',
    description: cloudflareUpdateList.description!,
    tool: cloudflareUpdateList,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['edit'],
  },
  {
    name: 'cloudflareDeleteList',
    description: cloudflareDeleteList.description!,
    tool: cloudflareDeleteList,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'delete' as const,
    keywords: ['remove'],
  },
  {
    name: 'cloudflareListFirewallRules',
    description: cloudflareListFirewallRules.description!,
    tool: cloudflareListFirewallRules,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['waf', 'rule'],
  },
  {
    name: 'cloudflareGetBotManagementSettings',
    description: cloudflareGetBotManagementSettings.description!,
    tool: cloudflareGetBotManagementSettings,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['bots', 'protection'],
  },
  {
    name: 'cloudflareListMonitors',
    description: cloudflareListMonitors.description!,
    tool: cloudflareListMonitors,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['monitor', 'healthcheck'],
  },
  {
    name: 'cloudflareListPools',
    description: cloudflareListPools.description!,
    tool: cloudflareListPools,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['pool', 'origin'],
  },
  {
    name: 'cloudflareListTunnels',
    description: cloudflareListTunnels.description!,
    tool: cloudflareListTunnels,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'read' as const,
    keywords: ['tunnel', 'cloudflared'],
  },
  {
    name: 'cloudflareUpdateTunnelConfiguration',
    description: cloudflareUpdateTunnelConfiguration.description!,
    tool: cloudflareUpdateTunnelConfiguration,
    requiredAuth: 'cloudflareApiKey' as const,
    scope: 'write' as const,
    keywords: ['tunnel', 'ingress', 'config'],
  },
];
