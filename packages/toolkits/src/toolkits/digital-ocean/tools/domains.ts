// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { digitalOceanRequest, missingKey, toDigitalOceanError } from './client.js';

const authField = {
  digitalOceanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

const paginationFields = {
  page: z.number().int().min(1).optional().describe('Page of results to return (>= 1)'),
  perPage: z.number().int().min(1).max(200).optional().describe('Number of items per page (1-200)'),
};

export const digitalOceanCreateDomain = tool({
  description:
    'Add a domain to DigitalOcean DNS for hosting and management, optionally with an initial A record pointing the apex at an IP address. The domain must be unique in the account.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe("Domain name to add (e.g. 'example.com')"),
    ipAddress: z.string().optional().describe('Optional IPv4 address for an initial apex A record'),
  }),
  execute: async ({ digitalOceanApiKey, name, ipAddress }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/domains', {
        body: { name, ...(ipAddress !== undefined ? { ip_address: ipAddress } : {}) },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create domain');
    }
  },
});

export const digitalOceanListDomains = tool({
  description:
    'List all DNS domains in the account with TTLs and zone files. Paginate with page/per_page; a single request returns only one page.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/domains', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list domains');
    }
  },
});

export const digitalOceanRetrieveDomain = tool({
  description:
    'Get complete details for a domain including TTL and full DNS zone file contents. Use to verify DNS configuration.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe("Fully qualified domain name (e.g. 'example.com')"),
  }),
  execute: async ({ digitalOceanApiKey, name }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(
        digitalOceanApiKey,
        'GET',
        `/domains/${encodeURIComponent(name)}`,
      );
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to retrieve domain');
    }
  },
});

export const digitalOceanDeleteDomain = tool({
  description:
    'Permanently delete a domain from DigitalOcean DNS. If it backs a Let\u2019s Encrypt certificate, delete the certificate first and reconfigure dependent resources.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe("Fully qualified domain name to delete (e.g. 'example.com')"),
  }),
  execute: async ({ digitalOceanApiKey, name }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(
        digitalOceanApiKey,
        'DELETE',
        `/domains/${encodeURIComponent(name)}`,
      );
      return { success: true, message: `Domain ${name} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete domain');
    }
  },
});

const recordType = z
  .enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'])
  .describe('DNS record type');

export const digitalOceanCreateDomainRecord = tool({
  description:
    'Create a DNS record (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA) under a domain. Confirm the domain exists first. Use name "@" for the root domain.',
  inputSchema: z.object({
    ...authField,
    domainName: z.string().describe("Domain to add the record to (e.g. 'example.com')"),
    type: recordType,
    data: z
      .string()
      .describe(
        'Record value (IP, hostname, or text depending on type; FQDN with trailing dot for CAA issue/issuewild)',
      ),
    name: z.string().optional().describe("Host name (e.g. 'www'); use '@' for the root domain"),
    priority: z.number().int().optional().describe('Priority for MX and SRV records'),
    port: z.number().int().optional().describe('Port for SRV records'),
    ttl: z.number().int().optional().describe('Time to live in seconds'),
    weight: z.number().int().optional().describe('Weight for SRV records'),
    flags: z.number().int().optional().describe('Flags for CAA records'),
    tag: z.string().optional().describe('Tag for CAA records (issue, issuewild, iodef)'),
  }),
  execute: async ({
    digitalOceanApiKey,
    domainName,
    type,
    data,
    name,
    priority,
    port,
    ttl,
    weight,
    flags,
    tag,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(
        digitalOceanApiKey,
        'POST',
        `/domains/${encodeURIComponent(domainName)}/records`,
        {
          body: {
            type,
            data,
            ...(name !== undefined ? { name } : {}),
            ...(priority !== undefined ? { priority } : {}),
            ...(port !== undefined ? { port } : {}),
            ...(ttl !== undefined ? { ttl } : {}),
            ...(weight !== undefined ? { weight } : {}),
            ...(flags !== undefined ? { flags } : {}),
            ...(tag !== undefined ? { tag } : {}),
          },
        },
      );
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create domain record');
    }
  },
});

export const digitalOceanListDomainRecords = tool({
  description:
    "List DNS records for a domain with pagination. Filter by record type (A, CNAME, MX, ...) or record name ('www', '@').",
  inputSchema: z.object({
    ...authField,
    domainName: z.string().describe("Domain whose records to list (e.g. 'example.com')"),
    ...paginationFields,
    type: z
      .enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SRV', 'LOC', 'CAA'])
      .optional()
      .describe('Filter records by DNS record type'),
    recordName: z.string().optional().describe("Filter by record name (e.g. 'www', '@' for root)"),
  }),
  execute: async ({ digitalOceanApiKey, domainName, page, perPage, type, recordName }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(
        digitalOceanApiKey,
        'GET',
        `/domains/${encodeURIComponent(domainName)}/records`,
        { query: { page, per_page: perPage, type, name: recordName } },
      );
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list domain records');
    }
  },
});

export const digitalOceanRetrieveDomainRecord = tool({
  description:
    'Get a single DNS record by domain name and record ID. Use to fetch record details before updating or deleting.',
  inputSchema: z.object({
    ...authField,
    domainName: z.string().describe("Domain name (e.g. 'example.com')"),
    recordId: z.number().int().min(1).describe('Numeric ID of the DNS record'),
  }),
  execute: async ({ digitalOceanApiKey, domainName, recordId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(
        digitalOceanApiKey,
        'GET',
        `/domains/${encodeURIComponent(domainName)}/records/${recordId}`,
      );
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to retrieve domain record');
    }
  },
});

export const digitalOceanUpdateDomainRecord = tool({
  description:
    'Update any attribute of an existing DNS record (data, name, TTL, priority, port, weight, flags, tag). Confirm the record ID first.',
  inputSchema: z.object({
    ...authField,
    domainName: z.string().describe("Domain name (e.g. 'example.com')"),
    recordId: z.number().int().min(1).describe('Numeric ID of the DNS record to update'),
    type: z.string().optional().describe("DNS record type (e.g. 'A', 'CNAME', 'TXT', 'MX')"),
    data: z.string().optional().describe('New record value (e.g. IP address for A records)'),
    name: z.string().optional().describe("New host name (e.g. 'www', '@')"),
    priority: z.number().int().min(0).optional().describe('Priority for MX records'),
    port: z.number().int().min(0).optional().describe('Port for SRV records'),
    ttl: z.number().int().positive().optional().describe('Time to live in seconds'),
    weight: z.number().int().min(0).optional().describe('Weight for SRV records'),
    flags: z.number().int().min(0).optional().describe('Flags for CAA records'),
    tag: z.string().optional().describe('Tag for CAA records'),
  }),
  execute: async ({
    digitalOceanApiKey,
    domainName,
    recordId,
    type,
    data,
    name,
    priority,
    port,
    ttl,
    weight,
    flags,
    tag,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(
        digitalOceanApiKey,
        'PUT',
        `/domains/${encodeURIComponent(domainName)}/records/${recordId}`,
        {
          body: {
            ...(type !== undefined ? { type } : {}),
            ...(data !== undefined ? { data } : {}),
            ...(name !== undefined ? { name } : {}),
            ...(priority !== undefined ? { priority } : {}),
            ...(port !== undefined ? { port } : {}),
            ...(ttl !== undefined ? { ttl } : {}),
            ...(weight !== undefined ? { weight } : {}),
            ...(flags !== undefined ? { flags } : {}),
            ...(tag !== undefined ? { tag } : {}),
          },
        },
      );
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to update domain record');
    }
  },
});

export const digitalOceanDeleteDomainRecord = tool({
  description:
    'Delete a DNS record by domain name and record ID. Returns success on 204 No Content.',
  inputSchema: z.object({
    ...authField,
    domainName: z.string().describe("Domain name (e.g. 'example.com')"),
    recordId: z.number().int().min(1).describe('Numeric ID of the DNS record to delete'),
  }),
  execute: async ({ digitalOceanApiKey, domainName, recordId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(
        digitalOceanApiKey,
        'DELETE',
        `/domains/${encodeURIComponent(domainName)}/records/${recordId}`,
      );
      return { success: true, message: `DNS record ${recordId} deleted from ${domainName}.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete domain record');
    }
  },
});
