// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const serviceNowCreateCmdbAppService = tool({
    description: "Creates an application service in ServiceNow CMDB or updates an existing one if a service with the same name already exists. Use this action when you need to register a new application service in the Configuration Management Database (CMDB). This endpoint performs a create-or-update operation: if an application service with the specified name already exists, it will be updated with the provided values rather than creating a duplicate.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        name: z.string().describe("Name of the application service to create. If an application service with the same name already exists, it will be updated with the provided values."),
        order: z.number().optional().describe("Display order for the application service. Used when ordering or sorting application services in lists or UIs."),
        tenantId: z.string().optional().describe("Tenant identifier for the application service. Used in multi-tenant deployments to scope the application service to a specific tenant."),
        description: z.string().optional().describe("Description of the application service providing details about its purpose and functionality."),
        owningSegment: z.string().optional().describe("Business owning segment for the application service. Defines the organizational segment that owns and is responsible for this application service."),
        operationalStatus: z.string().optional().describe("Operational status of the application service (e.g., 'Production', 'Development', 'Retired')."),
    }),
    execute: async ({ servicenowCredentials, name, order, tenantId, description, owningSegment, operationalStatus }) => {
        return snRequest(servicenowCredentials, '/api/now/cmdb/app_service/create', {
            method: 'POST',
            body: toServerKeys({ name, order, tenantId, description, owningSegment, operationalStatus }),
        });
    },
});

export const serviceNowCreateCmdbCiLinuxServer = tool({
    description: "Creates a new Linux server configuration item (CI) in the ServiceNow CMDB. Use this action when you need to register a new Linux server in the Configuration Management Database (CMDB). This endpoint creates a record in the cmdb_ci_linux_server table with the specified attributes including hostname, IP address, OS details, and operational information. The created record is returned with its sys_id and auto-generated details.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        os: z.string().optional().describe("Operating system name and version for the Linux server. Common values include: 'Linux Red Hat', 'Linux Ubuntu', 'Linux CentOS', 'Linux SUSE', 'Linux Debian', 'Red Hat Enterprise Linux 7', 'Ubuntu Server 22.04 LTS'. Example: 'Linux Red Hat', 'Linux Ubuntu', 'Red Hat Enterprise Linux 8'"),
        ram: z.number().optional().describe("Total RAM in megabytes (MB) installed on the Linux server. Example: 16384 (for 16GB), 32768 (for 32GB)"),
        fqdn: z.string().optional().describe("Fully Qualified Domain Name (FQDN) of the Linux server. Example: 'web-server-01.example.com'"),
        name: z.string().describe("Name of the Linux server configuration item. This is the primary display name used to identify the server in the CMDB and ServiceNow UI. Example: 'prod-web-server-01', 'test-linux-final'"),
        vendor: z.string().optional().describe("Vendor or reseller from whom the server or software was purchased. Example: 'Dell', 'HP', 'Lenovo', 'AWS'"),
        location: z.string().optional().describe("Physical or logical location of the Linux server. Can be a data center name, building, rack location, or cloud region. Example: 'US-East-1', 'DC1-Rack-A12', 'Building A - Floor 3'"),
        modelId: z.string().optional().describe("Hardware or virtual machine model identifier. Example: 'PowerEdge R740', 'VMware Virtual Platform', 'm5.large'"),
        cpuCount: z.number().optional().describe("Number of CPU cores or processors installed on the Linux server. Example: 4, 8, 16"),
        hostName: z.string().optional().describe("Fully qualified or short hostname of the Linux server as reported by the OS. This is typically the value returned by the 'hostname' command. Example: 'web-server-01', 'test-final.example.com'"),
        diskSpace: z.number().optional().describe("Total disk space in megabytes (MB) allocated to the Linux server. Example: 512000 (for 500GB)"),
        ipAddress: z.string().optional().describe("Primary IP address of the Linux server. Supports both IPv4 and IPv6 formats. Example: '192.168.1.200', '10.0.0.1', '2001:db8::1'"),
        managedBy: z.string().optional().describe("Name or sys_id of the person or group responsible for managing this server. Set sysparm_input_display_value=true to use display names instead of sys_ids."),
        assignedTo: z.string().optional().describe("sys_id or display name of the user assigned primary responsibility for this server. Set sysparm_input_display_value=true to use display names instead of sys_ids."),
        costCenter: z.string().optional().describe("Cost center identifier or name responsible for the financial aspects of this server. Example: 'CC-00123', 'IT Operations'"),
        description: z.string().optional().describe("Detailed description of the Linux server providing context about its purpose, configuration, or any relevant notes. Example: 'Production web server running RHEL 8 with Apache'"),
        environment: z.string().optional().describe("Environment classification for the Linux server. Common values: 'Development', 'Test', 'Production', 'Staging'. Example: 'Production', 'Development'"),
        macAddress: z.string().optional().describe("Primary MAC (Media Access Control) address of the server's network interface. Format: six pairs of hexadecimal digits separated by colons or hyphens. Example: '00:50:56:C0:00:08', '00-50-56-c0-00-08'"),
        manufacturer: z.string().optional().describe("Manufacturer or vendor of the Linux server hardware or virtualization platform. Example: 'VMware Inc.', 'Dell Inc.', 'HP', 'Amazon Web Services'"),
        purchaseDate: z.string().optional().describe("Date when the server hardware or license was purchased. Format: YYYY-MM-DD. Example: '2023-01-15'"),
        serialNumber: z.string().optional().describe("Hardware serial number of the Linux server as assigned by the manufacturer. Example: 'SN-12345ABCDE', 'VMware-42 00 00 00 00 00 00 00-00 00 00 00 00 00 00 00'"),
        supportGroup: z.string().optional().describe("Name of the group responsible for providing support for this server. Example: 'L2 Linux Support', 'NOC'"),
        cpuCoreCount: z.number().optional().describe("Total number of CPU cores (sockets times cores per socket) on the server. Example: 32, 64"),
        installStatus: z.string().optional().describe("Installation status of the Linux server. Common values: '1' = Installed, '2' = On Order, '3' = In Maintenance, '4' = Pending Installation, '5' = Pending Return, '7' = Absent. Example: '1' (Installed)"),
        kernelVersion: z.string().optional().describe("Linux kernel version running on the server. Example: '5.4.0-150-generic', '3.10.0-1160.el7.x86_64'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response (e.g., 'sys_id,name,ip_address'). Invalid fields are ignored. If not specified, all fields are returned."),
        assignmentGroup: z.string().optional().describe("sys_id or display name of the group assigned to manage this server. Set sysparm_input_display_value=true to use display names instead of sys_ids."),
        discoverySource: z.string().optional().describe("Source of the discovery data for this CI. Common values include: 'Manual Entry', 'ServiceNow Discovery', 'LDAP', 'Import Set', 'MID Server', 'ECMDB'. If not specified, defaults to 'Manual Entry'. Example: 'Manual Entry', 'ServiceNow Discovery'"),
        osAddressWidth: z.string().optional().describe("Operating system architecture bit-width. Common values: '32-bit', '64-bit'. Example: '64-bit'"),
        operationalStatus: z.string().optional().describe("Operational status of the Linux server. Common values: '1' = Operational, '2' = Non-Operational, '3' = Being Installed, '4' = Being Repaired, '6' = Under Maintenance. Example: '1' (Operational)"),
        warrantyExpiration: z.string().optional().describe("Date when the server warranty expires. Format: YYYY-MM-DD. Example: '2026-01-15'"),
        sysparmDisplayValue: z.string().optional().describe("Determines the type of data returned in the response. 'false': Returns actual database values (default). 'true': Returns display values. 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response. Defaults to false."),
    }),
    execute: async ({ servicenowCredentials, os, ram, fqdn, name, vendor, location, modelId, cpuCount, hostName, diskSpace, ipAddress, managedBy, assignedTo, costCenter, description, environment, macAddress, manufacturer, purchaseDate, serialNumber, supportGroup, cpuCoreCount, installStatus, kernelVersion, sysparmFields, assignmentGroup, discoverySource, osAddressWidth, operationalStatus, warrantyExpiration, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/table/cmdb_ci_linux_server', {
            method: 'POST',
            query: { sysparm_fields: sysparmFields, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
            body: toServerKeys({ name, os, ram, fqdn, ipAddress, hostName, vendor, location, modelId, cpuCount, cpuCoreCount, diskSpace, macAddress, manufacturer, serialNumber, purchaseDate, warrantyExpiration, installStatus, operationalStatus, environment, description, assignedTo, assignmentGroup, supportGroup, managedBy, costCenter, discoverySource, osAddressWidth, kernelVersion }),
        });
    },
});

export const serviceNowCreateCmdbInstance = tool({
    description: "Creates a single Configuration Item (CI) in ServiceNow CMDB with the specified attributes. Use this action when you need to register a new configuration item (such as servers, databases, network devices, or application services) in the Configuration Management Database. The CI class determines the available attributes and relationships for the item.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        classname: z.string().describe("The name of the CMDB class for the configuration item (CI) to create. Common CI classes include: 'cmdb_ci' (generic CI), 'cmdb_ci_server', 'cmdb_ci_database', 'cmdb_ci_network_adapter', 'cmdb_ci_storage_device', 'cmdb_ci_service_discovered', 'cmdb_ci_hardware', 'cmdb_ciPrinter', etc. Use the full class name without 'u_' prefix for base classes."),
        attributes: z.record(z.any()).describe("A dictionary of attribute name-value pairs for the CI. The available attributes depend on the specified class. Common attributes across many CI classes include: 'name' (CI display name), 'serial_number', 'ip_address', 'mac_address', 'host_name', 'fqdn', 'manufacturer', 'model_id', 'vendor', 'purchase_date', 'assigned_to', 'assignment_group', 'location', 'support_group', 'managed_by', 'operational_status', 'install_status', 'cost', 'cost_center', 'u_custom_attribute'. Example: {'name': 'Production Server 01', 'serial_number': 'SN-12345', 'ip_address': '192.168.1.100'}"),
    }),
    execute: async ({ servicenowCredentials, classname, attributes }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/${encodeURIComponent(classname)}`, {
            method: 'POST',
            body: { attributes, source: 'ServiceNow' },
        });
    },
});

export const serviceNowCreateCmdbInstanceRelation = tool({
    description: "Creates an inbound and/or outbound relation for a specific configuration item (CI) in the ServiceNow CMDB. Use this action when you need to establish relationships between configuration items in the CMDB, such as indicating that a server 'runs on' hardware, a service 'depends on' a database, or an application 'hosts' middleware components. This action adds relations to the specified CI (identified by classname and sys_id) without modifying the CI itself. Relations are bidirectional in the CMDB - adding an outbound relation from CI A to CI B also creates a corresponding inbound relation on CI B. Common use cases: Building CMDB relationship maps, establishing application dependencies, defining infrastructure hierarchies, or documenting service relationships.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The sys_id of the source configuration item to add relations to. This is a 32-character hexadecimal string. Example: '12345678901234567890123456789012'"),
        classname: z.string().describe("The CMDB class name for the configuration item (e.g., 'cmdb_ci', 'cmdb_ci_server', 'cmdb_ci_service'). This is the table name that defines the type of CI."),
        inboundRelations: z.array(z.any()).optional().describe("List of inbound relations to create to this CI from other CIs. Inbound relations represent relationships where other CIs are the source. Each item's `type` must be a cmdb_rel_type sys_id (see ListCmdbRelTypes), not a display label like 'Used by::Depends on'."),
        outboundRelations: z.array(z.any()).optional().describe("List of outbound relations to create from this CI to other CIs. Outbound relations represent relationships where this CI is the source. Each item's `type` must be a cmdb_rel_type sys_id (see ListCmdbRelTypes), not a display label like 'Depends on::Used by'."),
    }),
    execute: async ({ servicenowCredentials, sysId, classname, inboundRelations, outboundRelations }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/${encodeURIComponent(classname)}/${encodeURIComponent(sysId)}/relation`, {
            method: 'POST',
            body: toServerKeys({ inboundRelations, outboundRelations }),
        });
    },
});

export const serviceNowCreateDataClassificationClassify = tool({
    description: "Assigns pre-defined or user-defined data classifications to existing dictionary entries. Use this action when you need to classify sensitive or confidential table columns according to your organization's data governance policies. This action classifies Dictionary [sys_dictionary] entries (table.column metadata) — not individual records — by assigning them one or more Data Classification [data_classification] labels such as 'Public', 'Internal', 'Confidential', or custom labels defined on the instance. Requires the admin or data_classification_admin role.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        dataClasses: z.array(z.any()).describe("Sys_ids of the Data Classification [data_classification] records to assign to every dictionary entry listed in dictionary_entries. Example: ['40edb1f51bbcec50b92a10a61a4bcb8a']"),
        dictionaryEntries: z.array(z.any()).describe("Sys_ids of the Dictionary [sys_dictionary] records (table.column entries) to classify. Not record sys_ids — these must be sys_dictionary entries, e.g. the sys_id of the incident.caller_id dictionary entry. Example: ['445de0a6dba30300efc57416bf9619b0']"),
    }),
    execute: async ({ servicenowCredentials, dataClasses, dictionaryEntries }) => {
        return snRequest(servicenowCredentials, '/api/now/data_classification/classify', {
            method: 'POST',
            body: { dictionary_entries: dictionaryEntries.join(','), data_classes: dataClasses.join(',') },
        });
    },
});

export const serviceNowCreateDataClassificationClear = tool({
    description: "Removes all data classifications for a specific record in a ServiceNow table. Use this action when you need to clear/reset data classification labels from a record, such as when reclassifying sensitive data, removing outdated classifications, or preparing records for re-processing. This action clears all data classification entries associated with the specified record. Note: This operation may require appropriate ServiceNow permissions. If the user lacks permission to modify data classifications on the specified table, an error will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the record whose data classifications should be cleared. This is a 32-character hexadecimal string that uniquely identifies the record. Example: 'abc1234567890abcdef1234567890ab'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, '/api/now/data_classification/clear', {
            method: 'POST',
            body: { dictionary_entries: sysId },
        });
    },
});

export const serviceNowCreateIdentifyreconcileEnhanced = tool({
    description: "Inserts or updates configuration items (CIs) in ServiceNow CMDB using the enhanced Identification and Reconciliation API. Use this action when you need to bulk-insert or update multiple configuration items in the CMDB, with automatic identification of existing CIs based on identifying attributes (name, IP address, serial number, MAC address, hostname, or sys_id) and optional creation of CI relationships. This API provides better error handling and detailed per-item results compared to basic CMDB instance APIs. This action is useful for CMDB data population, reconciliation of discovered CIs against the CMDB, bulk CI updates, and establishing CI relationships during discovery or import workflows.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        items: z.array(z.any()).describe("Array of configuration item (CI) objects to insert or update in the CMDB. Each item must have at least one identifying field (name, class_name, sys_id, ip_address, serial_number, mac_address, or host_name) to match an existing CI. If no existing CI matches, a new CI is created. The 'attributes' dict can be used to set or update CMDB fields on matched CIs. Example: [{'name': 'Server 01', 'className': 'cmdb_ci_server', 'ip_address': '192.168.1.100', 'attributes': {'operational_status': '1'}}]"),
        relations: z.array(z.any()).optional().describe("Array of relationship objects to create between CIs. Relationships are directional, defined as 'Source::Target' format. Each relation requires source and target CI identification (via sys_id, link, or name). Relations are processed after CIs. Example: [{'type': 'Runs on::Runs', 'source': {'name': 'App Server'}, 'target': {'name': 'DB Server'}}]"),
    }),
    execute: async ({ servicenowCredentials, items, relations }) => {
        return snRequest(servicenowCredentials, '/api/now/identifyreconcile/enhanced', {
            method: 'POST',
            body: toServerKeys({ items, relations }),
        });
    },
});

export const serviceNowCreateIdentifyreconcileQuery = tool({
    description: "Queries the ServiceNow Identify and Reconcile API to determine whether a Configuration Item (CI) should be inserted (created) or updated in the CMDB based on identity matching rules. Use this action when you need to check whether a CI already exists in the CMDB before creating or updating it, or when you want ServiceNow to automatically determine the correct operation (INSERT vs UPDATE) based on configured identity matching rules and the provided attributes. This is commonly used during data migration, discovery integration, or bulk CI reconciliation workflows where the operation (create vs update) needs to be determined programmatically. Note: This action performs a query/reconciliation check only — it does not execute the actual INSERT or UPDATE operation. It returns the recommended operation and the matched CI details.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        source: z.string().describe("The name of the data source that identifies the origin of the CI data being reconciled. This is used by ServiceNow to determine which reconciliation rules and identity matching rules apply. The source must be a valid data source configured in ServiceNow (e.g., 'cmdb_azure', 'cmdb_aws', 'test_source'). Example: 'cmdb_azure'"),
        attributes: z.record(z.any()).describe("A dictionary of attribute name-value pairs used to identify or match an existing CI. ServiceNow uses these attributes along with identity matching rules to determine whether an existing CI matches (triggering an update) or no match exists (triggering an insert). Common identifying attributes include: 'name' (CI display name), 'serial_number', 'ip_address', 'mac_address', 'host_name', 'fqdn', 'asset_tag'. Example: {'name': 'Test Server', 'ip_address': '192.168.1.100'}"),
        className: z.string().describe("The name of the CMDB class for the configuration item (CI) to identify/reconcile. Common CI classes include: 'cmdb_ci' (generic CI), 'cmdb_ci_server', 'cmdb_ci_database', 'cmdb_ci_network_adapter', 'cmdb_ci_storage_device', 'cmdb_ci_service_discovered', 'cmdb_ci_hardware', 'cmdb_ciPrinter', 'cmdb_ci_application', etc. Example: 'cmdb_ci'"),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, source, attributes, className, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/identifyreconcile/query', {
            method: 'POST',
            query: { sysparm_data_source: source, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
            body: { items: [{ className, values: attributes }] },
        });
    },
});

export const serviceNowCreateIdentifyreconcileQueryenhanced = tool({
    description: "Performs identification and reconciliation of configuration items (CIs) in the ServiceNow CMDB. Use this action when you need to determine whether to insert a new CI or update an existing one based on matching attributes. The API compares the provided data against existing CIs and returns the recommended operation (insert/update) along with the matched or created CI details. This is useful for data imports, discovery integration, or synchronizing CI data from external sources. Note: When dry_run is false (default), this action may create or modify existing CIs in the CMDB.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        data: z.record(z.any()).describe("A dictionary containing the configuration item (CI) attributes to reconcile. The available attributes depend on the CMDB class. Common attributes include: 'name' (CI display name, often required), 'u_class' or 'sys_class_name' (CMDB class), 'serial_number', 'ip_address', 'mac_address', 'host_name', 'fqdn', 'manufacturer', 'model_id', 'vendor', 'operational_status', 'install_status'. The API uses these attributes to match against existing CIs in the CMDB. Example: {'name': 'Production Server 01', 'u_class': 'cmdb_ci_server', 'ip_address': '192.168.1.100'}"),
        source: z.string().describe("The source identifier for the reconciliation query. This identifies the data source or integration point that is providing the CI data. Examples: 'cmdb_import_set', 'discovery', 'manual', or a custom integration name."),
        dryRun: z.boolean().optional().describe("When set to true, performs a simulation without actually creating or updating any CIs. Useful for previewing what changes would be made before committing. Default is false, meaning changes will be applied."),
        reconciliationType: z.string().optional().describe("The type of reconciliation to perform. Determines how the API matches incoming data against existing CIs. Common values: 'exact' (exact match on all specified fields), 'fuzzy' (partial match), or 'identify' (identification only without creating/updating). If not specified, uses the default reconciliation behavior configured in ServiceNow."),
    }),
    execute: async ({ servicenowCredentials, data, source, dryRun, reconciliationType }) => {
        // reconciliationType has no documented API slot — ignored in the request.
        const { sys_class_name: sysClassName, u_class: uClass, ...rest } = data ?? {};
        const items = [{ className: sysClassName ?? uClass, values: rest }];
        const path = dryRun === false ? '/api/now/identifyreconcile' : '/api/now/identifyreconcile/queryEnhanced';
        return snRequest(servicenowCredentials, path, {
            method: 'POST',
            query: { sysparm_data_source: source },
            body: { items },
        });
    },
});

export const serviceNowCreateUpdateCmdCi = tool({
    description: "Creates or updates CMDB configuration items (CIs) using the ServiceNow Identification and Reconciliation Engine (IRE) via the identify-reconcile endpoint. Use this action when you need to upsert CIs into the CMDB with automatic deduplication. The IRE matches incoming CI data against existing records using configured identification rules (based on fields like name, IP address, serial number, etc.) and either updates the matched CI or creates a new one. This prevents duplicate configuration items from being created. You can also submit relationship data alongside CIs to create or update CI relationships (e.g., 'Contains', 'Depends on'). Note: Identification rules must be configured in ServiceNow for this endpoint to work correctly. If no matching rule is found, the IRE may create a new CI or reject the entry depending on your configuration.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        items: z.array(z.any()).describe("Array of CI objects to insert or update in the CMDB using the Identification and Reconciliation Engine (IRE). Each object contains CMDB fields that are used both for matching (via identification rules) and for populating CI attributes. Key fields include: 'className' (CMDB table name), 'name' (CI display name), 'sys_id' (to update an existing CI directly), 'ip_address', 'serial_number', 'host_name', 'mac_address', 'fqdn', 'manufacturer', 'model_id', etc. The IRE matches incoming CIs against existing records using identification rules configured in ServiceNow, preventing duplicate CIs. Example: [{'className': 'cmdb_ci', 'name': 'test-ci', 'ip_address': '192.168.1.100'}]"),
        relations: z.array(z.any()).optional().describe("Array of relationship objects to create or update alongside the CIs. Each relation links a parent CI to a child CI with a relationship type. Fields include: 'parent' (sys_id or name of parent CI), 'child' (sys_id or name of child CI), 'type' (relationship type name). Example: [{'parent': 'web-server-01', 'child': 'web-app-01', 'type': 'Contains'}]"),
    }),
    execute: async ({ servicenowCredentials, items, relations }) => {
        return snRequest(servicenowCredentials, '/api/now/identifyreconcile', {
            method: 'POST',
            body: toServerKeys({ items, relations }),
        });
    },
});

export const serviceNowDeleteCmdbInstanceRelation = tool({
    description: "Permanently deletes a specific CMDB CI (Configuration Item) relation using its sys_id. This is a destructive, irreversible operation — the relation between two CIs cannot be recovered once deleted. The relation represents a connection between a parent and child CI (e.g., a server running an application). Requires the user to have the ITIL role and appropriate CMDB permissions. If the relation, CI, or class doesn't exist, or the user lacks permissions, an error will be returned. Use when you need to remove a specific relationship between two configuration items in the CMDB.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The sys_id of the CI (Configuration Item) record. This is a required path parameter that uniquely identifies the CI instance within the specified class table. It is a 32-character hexadecimal string. Example: '106c5c13c61122750194a1e96cfde951'"),
        classname: z.string().describe("Name of the CMDB CI (Configuration Item) class. This is a required path parameter that identifies the class table to which the CI belongs. Common values include 'cmdb_ci_server', 'cmdb_ci_application', 'cmdb_ci_service_discovered', etc. Example: 'cmdb_ci_server'"),
        relSysId: z.string().describe("The sys_id of the CMDB relation to delete. This is a required path parameter that uniquely identifies the relationship record between two CIs. It is a 32-character hexadecimal string. Example: '2ce248ba833bf210dd2dc2dfeeaad3c0'"),
    }),
    execute: async ({ servicenowCredentials, sysId, classname, relSysId }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/${encodeURIComponent(classname)}/${encodeURIComponent(sysId)}/relation/${encodeURIComponent(relSysId)}`, {
            method: 'DELETE',
        });
    },
});

export const serviceNowGetAllDataClasses = tool({
    description: "Retrieves all data classification records from the ServiceNow Data Classification API. Use this action when you need to list all available data classification levels (e.g., Public, Internal, Confidential, Restricted) configured in a ServiceNow instance. Data classifications are used to label and categorize data based on sensitivity levels for security and compliance purposes. This action is read-only and does not modify any records. Use sysparm_limit and sysparm_offset to paginate through classification records.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of records to return. Use with sysparm_offset to paginate through results."),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to retrieve the next page."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmOffset }) => {
        return snRequest(servicenowCredentials, '/api/now/data_classification/getAllDataClasses', {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_offset: sysparmOffset },
        });
    },
});

export const serviceNowGetAppServiceContent = tool({
    description: "Retrieves a list of configuration items (CIs) associated with a specific application service in ServiceNow CMDB. Use this action when you need to query what infrastructure components (servers, databases, applications, etc.) are part of a given application service. This is useful for impact analysis, change management, and understanding service dependencies within the CMDB.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The sys_id (unique identifier) of the application service whose configuration items (CIs) you want to retrieve."),
        sysparmLimit: z.number().optional().describe("Maximum number of configuration items to return. Use pagination parameters for larger result sets."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return. Invalid field names are silently ignored. Example: 'sys_id,name,ip_address'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmLimit, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/app_service/${encodeURIComponent(sysId)}/getContent`, {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_fields: sysparmFields, sysparm_offset: sysparmOffset, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowGetCmdbCiLinuxServer = tool({
    description: "Retrieves a single CMDB Linux server configuration item (CI) by its sys_id, including its attributes and relationship information. Use this action when you need to fetch detailed information about a specific Linux server from ServiceNow's CMDB, such as its attributes (name, IP address, OS version, kernel version, etc.) and both its inbound (dependents) and outbound (dependencies) relationships with other CIs. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the CMDB Linux server configuration item to retrieve. This is a 32-character hexadecimal string that uniquely identifies the CI record. Example: '3a290cc60a0a0bb400000bdb386af1cf'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,ip_address,operational_status'"),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmFields, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/cmdb_ci_linux_server/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            query: { sysparm_fields: sysparmFields, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowGetCmdbCsdmAppServiceFindService = tool({
    description: "Finds and returns basic information about one or more application services in the ServiceNow CMDB using the CSDM (Common Service Data Model) app_service find_service endpoint. Use this action when you need to search for application services by name (supports wildcards), retrieve their basic metadata such as operational status, owning segment, and business criticality, or check whether a specific application service exists in the CMDB.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        name: z.string().describe("Name of the application service to find. Supports wildcards using '*' prefix or suffix. Examples: 'My Service', '*-production', 'app-*', '*-db-*'"),
        sysparmLimit: z.number().optional().describe("Maximum number of application service records to return. Use pagination parameters for larger result sets."),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,description,operational_status'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, name, sysparmLimit, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/cmdb/csdm/app_service/find_service', {
            method: 'GET',
            query: { name, sysparm_limit: sysparmLimit, sysparm_fields: sysparmFields, sysparm_offset: sysparmOffset, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowGetCmdbInstance = tool({
    description: "Retrieves configuration items (CIs) from a specified CMDB class using the ServiceNow CMDB Instance API. Use this action when you need to query configuration items from the CMDB by class name, such as retrieving all servers (cmdb_ci_server), computers (cmdb_ci_computer), databases (cmdb_ci_database), or all CIs (cmdb_ci). Supports filtering via sysparm_query and pagination via sysparm_limit and sysparm_offset.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        classname: z.string().describe("Name of the CMDB class to query (e.g., 'cmdb_ci', 'cmdb_ci_server', 'cmdb_ci_computer', 'cmdb_ci_database', 'cmdb_ci_service_discovered', 'cmdb_ci_application'). Use 'cmdb_ci' to query the base CI class and retrieve all configuration items."),
        sysparmLimit: z.number().optional().describe("Maximum number of configuration item records to return. Use pagination for larger result sets."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter configuration items. Syntax: <col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: operational_status=1^environment=Production"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,ip_address,operational_status'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, classname, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/${encodeURIComponent(classname)}`, {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset, sysparm_fields: sysparmFields, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowGetCmdbInstanceById = tool({
    description: "Retrieves a single CMDB configuration item (CI) by its class name and sys_id, including its attributes and relationship information. Use this action when you need to fetch detailed information about a specific configuration item from ServiceNow's CMDB, such as its attributes (name, IP, status, etc.) and both its inbound (dependents) and outbound (dependencies) relationships with other CIs. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the CMDB configuration item to retrieve. This is a 32-character hexadecimal string that uniquely identifies the CI record. Example: '00a96c0d3790200044e0bfc8bcbe5db4'"),
        classname: z.string().describe("Name of the CMDB CI class (table) to query. Examples: 'cmdb_ci', 'cmdb_ci_linux_server', 'cmdb_ci_apache', 'cmdb_ci_service_discovered'. The class name determines which type of configuration item to retrieve."),
    }),
    execute: async ({ servicenowCredentials, sysId, classname }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/${encodeURIComponent(classname)}/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});

export const serviceNowGetCmdbMeta = tool({
    description: "Retrieves metadata and schema information for a specified CMDB (Configuration Management Database) class. Use this action when you need to discover the field structure, data types, mandatory fields, and relationships of a CMDB class before performing queries or updates. This is useful for understanding what fields are available for filtering, display, or modification operations. The user must have the ITIL role to access CMDB metadata.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        className: z.string().describe("The CMDB class name to retrieve metadata for. Common classes include: 'cmdb_ci' (base CI class), 'cmdb_ci_server', 'cmdb_ci_database', 'cmdb_ci_service', 'cmdb_ci_web_server', 'cmdb_ci_linux_server', 'cmdb_ci_win_server', 'cmdb_ci_appl'."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values. 'true': Returns display values. 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, className, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/meta/${encodeURIComponent(className)}`, {
            method: 'GET',
            query: { sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowListCmdbCiLinuxServers = tool({
    description: "Retrieves Linux server configuration items (CIs) from the ServiceNow CMDB using the cmdb_ci_linux_server class. Use this action when you need to query Linux servers from the CMDB, such as retrieving all Linux servers for inventory reporting, filtering by operational status, environment, or other attributes. Supports filtering via sysparm_query and pagination via sysparm_limit and sysparm_offset. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of Linux server records to return. Use pagination for larger result sets."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter Linux servers. Syntax: <col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: operational_status=1^environment=Production"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,ip_address,operational_status'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/cmdb/instance/cmdb_ci_linux_server', {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset, sysparm_fields: sysparmFields, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowListCmdbcIs = tool({
    description: "Retrieves configuration items (CIs) from the ServiceNow CMDB using the base cmdb_ci class. Use this action when you need to query all configuration items from the CMDB, regardless of their specific type (servers, computers, databases, applications, etc.). This endpoint queries the base cmdb_ci class which contains all CIs. Supports filtering via sysparm_query and pagination via sysparm_limit and sysparm_offset.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of configuration item records to return. Use pagination for larger result sets."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter configuration items. Syntax: <col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: operational_status=1^environment=Production"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,ip_address,operational_status'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/cmdb/instance/cmdb_ci', {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset, sysparm_fields: sysparmFields, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowListCmdbRelTypes = tool({
    description: "Retrieves CMDB relationship types from the ServiceNow cmdb_rel_type table using the Table API. Use this action when you need to discover what types of relationships are defined between Configuration Items (CIs) in the CMDB. Common relationship types include 'Runs on', 'Contains', 'Depends on', 'Hosted on', and 'Connects to'. This is useful for understanding the relationship schema before creating or querying CI relationships. Supports filtering via sysparm_query, pagination via sysparm_limit and sysparm_offset, field selection via sysparm_fields, and display value formatting via sysparm_display_value.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of relationship type records to return. Use pagination for larger result sets."),
        sysparmQuery: z.string().optional().describe("Encoded query to filter relationship types. Syntax: <col_name><operator><value>. Operators: '=' (exact match), '!=' (not equal), '^' (AND), '^OR' (OR), LIKE, STARTSWITH, ENDSWITH. Example: active=true^nameLIKEserver"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,child_class_name,parent_class_name'"),
        sysparmOffset: z.number().optional().describe("Starting record offset for pagination. Set to sysparm_offset + sysparm_limit to paginate through results."),
        sysparmDisplayValue: z.string().optional().describe("Determines the format of field values in the response. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Set to true to exclude Table API links for reference fields in the response."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, '/api/now/table/cmdb_rel_type', {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_query: sysparmQuery, sysparm_offset: sysparmOffset, sysparm_fields: sysparmFields, sysparm_display_value: sysparmDisplayValue, sysparm_exclude_reference_link: sysparmExcludeReferenceLink },
        });
    },
});

export const serviceNowUpdateCmdbCsdmAppServicePopulateService = tool({
    description: "Populates an Application Service with CI (Configuration Item) relationships based on the CSDM (Common Service Data Model) model. Use this action when you need to automatically discover and populate the CIs (Configuration Items) and their relationships that belong to an application service in ServiceNow's CMDB. This endpoint has been deprecated by ServiceNow. Consider using alternative approaches for CI population.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        serviceSysId: z.string().describe("The sys_id of the Application Service to populate with CI relationships. This is a required path parameter that uniquely identifies the application service record. Example: '17c04876833bf210dd2dc2dfeeaad3ee'"),
        populationMethod: z.record(z.any()).optional().describe('population_method object, e.g. {type: "cmdb_group_based", group_id: "..."}'),
    }),
    execute: async ({ servicenowCredentials, serviceSysId, populationMethod }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/csdm/app_service/${encodeURIComponent(serviceSysId)}/populate_service`, {
            method: 'PUT',
            body: { population_method: populationMethod ?? { type: 'discovery' } },
        });
    },
});

export const serviceNowUpdateCmdbcsdmAppServiceServiceDetails = tool({
    description: "Updates the service details for a specific application service in the CMDB CSDM (Common Service Data Model). Use this action when you need to modify the metadata, ownership, tier classification, or operational details of an application service in ServiceNow's Configuration Management Database. This endpoint specifically updates the service_details attributes of the application service identified by its sys_id. This is an update (PUT) operation, so the provided fields will be set on the record. Fields not included in the request will retain their current values unless otherwise specified by the API. Common use cases: Updating application service ownership, changing tier or environment classifications, modifying criticality levels, or updating operational status.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        name: z.string().optional().describe("The display name of the application service. This is the human-readable name used to identify the service. Example: 'Payment Processing Service'"),
        tier: z.string().optional().describe("The tier classification of the application service. Valid values: '1' = Prescription, '2' = Billing, '3' = Monitoring, '4' = Custom Application Services. Use the numeric string value corresponding to the desired tier."),
        criticality: z.string().optional().describe("The criticality level of the application service for business operations. Valid values: '1' = High, '2' = Medium, '3' = Low. Use the numeric string value corresponding to the criticality level."),
        description: z.string().optional().describe("A detailed description of the application service explaining its purpose, functionality, and business value. Example: 'Handles all payment processing including credit cards and ACH transfers'"),
        environment: z.string().optional().describe("The deployment environment for the application service. Valid values: '1' = Development, '2' = Test, '3' = Production, '4' = Staging. Use the numeric string value corresponding to the environment."),
        owningTeam: z.string().optional().describe("The sys_id of the team responsible for owning and maintaining the application service. Reference to sn_orgstructure_team table. Example: 'xyz987654321fedcba9876543210zyxw'"),
        primaryOwner: z.string().optional().describe("The sys_id of the primary owner/person responsible for this application service. Reference to sys_user table. Example: 'usr1234567890abcdef1234567890ab'"),
        serviceSysId: z.string().describe("The unique system ID (sys_id) of the application service record to update. This is a 32-character hexadecimal string that identifies the specific application service in the cmdb_ci_appl_service table. Example: 'abc1234567890abcdef1234567890ab'"),
        secondaryOwner: z.string().optional().describe("The sys_id of the secondary/backup owner for this application service. Reference to sys_user table. Example: 'usr987654321fedcba9876543210zyxw'"),
        operationalStatus: z.string().optional().describe("The current operational status of the application service. Typical values: '1' = Operational, '2' = Non-Operational, '3' = Decommissioned, '7' = Under Maintenance. Example: '1'"),
        owningApplication: z.string().optional().describe("The sys_id of the application that this service supports. Reference to cmdb_ci_appl table. Example: 'app1234567890abcdef1234567890ab'"),
        businessCriticality: z.string().optional().describe("Additional business criticality designation or notes. Can include details about why the service is critical and any associated SLAs. Example: 'Mission critical - 99.99% uptime required'"),
        owningBusinessService: z.string().optional().describe("The sys_id of the parent business service that owns this application service. Reference to cmdb_ci_service table. Example: 'svc1234567890abcdef1234567890ab'"),
    }),
    execute: async ({ servicenowCredentials, name, tier, criticality, description, environment, owningTeam, primaryOwner, serviceSysId, secondaryOwner, operationalStatus, owningApplication, businessCriticality, owningBusinessService }) => {
        const basicDetails = toServerKeys({ name, environment });
        return snRequest(servicenowCredentials, `/api/now/cmdb/csdm/app_service/${encodeURIComponent(serviceSysId)}/service_details`, {
            method: 'PUT',
            body: {
                ...(Object.keys(basicDetails).length > 0 ? { basic_details: basicDetails } : {}),
                ...toServerKeys({ tier, criticality, description, owningTeam, primaryOwner, secondaryOwner, operationalStatus, owningApplication, businessCriticality, owningBusinessService }),
            },
        });
    },
});

export const serviceNowUpdateCmdbInstance = tool({
    description: "Updates an existing configuration item (CI) record in the ServiceNow CMDB by its sys_id. Use this action when you need to modify attributes of a specific configuration item in the Configuration Management Database. This action sends a PUT request to the CMDB Instance API endpoint, replacing the specified attributes of the CI record. Note: The classname and sys_id are required path parameters. Only include the attributes you want to update in the request. This action performs a full update operation - fields not included in the request will retain their current values unless the API enforces specific default behavior. Common use cases: Updating CI operational status, changing ownership, modifying location information, updating IP addresses, changing assignment groups, or updating custom CMDB fields. Merged variant also accepts flat CI fields (as in the PATCH variant), which are folded into attributes.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        className: z.string().describe("The name of the CMDB class (table) that the configuration item belongs to. This is a required path parameter. Common class names include: cmdb_ci (generic CI), cmdb_ci_server, cmdb_ci_database, cmdb_ci_network_adapter, cmdb_ci_ip_switch, cmdb_ci_lb, cmdb_ci_storage_device, cmdb_ciPrinter, cmdb_ci_appl, etc. Example: 'cmdb_ci' or 'cmdb_ci_server'"),
        sysId: z.string().describe("The unique system ID (sys_id) of the configuration item record to update. This is a 32-character hexadecimal string that uniquely identifies the CI. Example: '1234567890abcdef1234567890abcdef'"),
        source: z.string().optional().describe("Required. The entity that is updating this information — must be one of the choice values in the discovery_source field of the cmdb_ci table (e.g. 'ServiceNow', 'ImportSet', 'ManualStagingTable'). Query the choice list via GET /api/now/table/sys_choice?sysparm_query=name=cmdb_ci^element=discovery_source to see valid values on this instance."),
        attributes: z.record(z.any()).optional().describe("A dictionary of CI attribute name-value pairs to update. These are the field names and values specific to the CMDB class. Common attributes include: name, short_description, description, serial_number, ip_address, mac_address, manufacturer, model_number, install_status, operational_status, owned_by, assigned_to, assignment_group, location, etc. Example: {'name': 'Production Web Server', 'operational_status': '1'}"),
        additionalAttributes: z.record(z.any()).optional().describe("Additional CMDB attributes to update that are not explicitly listed above. Use this for custom fields (prefixed with u_) or less common fields. Example: {'u_custom_field': 'value', 'u_environment': 'production'}"),
        name: z.string().optional().describe("Display name of the configuration item. Example: 'web-server-prod-01'"),
        ipAddress: z.string().optional().describe("Primary IP address of the configuration item. Example: '192.168.1.100'"),
        hostName: z.string().optional().describe("Hostname of the configuration item. Example: 'web-server-prod-01'"),
        fqdn: z.string().optional().describe("Fully qualified domain name of the configuration item. Example: 'web-server-prod-01.example.com'"),
        serialNumber: z.string().optional().describe("Serial number assigned by the manufacturer. Example: 'ABC123XYZ'"),
        installStatus: z.string().optional().describe("Installation status of the configuration item. Common values: '1' = Installed, '2' = On Order, '3' = On Maintenance, '4' = Stocked, '6' = In Service, '7' = Retired. Example: '1'"),
        operationalStatus: z.string().optional().describe("Operational status of the configuration item. Common values: '1' = Operational, '2' = Non-Operational, '3' = Decommissioned, '7' = Under Maintenance. Example: '1'"),
        environment: z.string().optional().describe("Environment type for the configuration item. Common values: 'Development', 'Test', 'Production', 'Staging', 'QA'. Example: 'Production'"),
        manufacturer: z.string().optional().describe("Manufacturer or vendor of the configuration item. Example: 'Dell Inc.', 'Cisco Systems'"),
        modelNumber: z.string().optional().describe("Model number of the configuration item. Example: 'PowerEdge R740', 'UCS-B200-M4'"),
        description: z.string().optional().describe("Detailed description of the configuration item explaining its purpose and functionality."),
        shortDescription: z.string().optional().describe("Brief summary or title of the configuration item. Example: 'Production web server for app-1'"),
        cost: z.string().optional().describe("Cost or price of the configuration item. Example: '15000.00'"),
        company: z.string().optional().describe("Sys_id of the company that owns or is associated with this configuration item."),
        location: z.string().optional().describe("Physical location or data center of the configuration item. Example: 'NYC-DC-1', 'EU-West-1'"),
        managedBy: z.string().optional().describe("Sys_id of the user or group that manages this configuration item."),
        supportedBy: z.string().optional().describe("Sys_id of the user or group that provides support for this configuration item."),
        assignmentGroup: z.string().optional().describe("Sys_id of the assignment group responsible for this configuration item."),
        purchaseDate: z.string().optional().describe("Date the configuration item was purchased (format: YYYY-MM-DD). Example: '2024-01-15'"),
        warrantyExpiration: z.string().optional().describe("Warranty expiration date for the configuration item (format: YYYY-MM-DD). Example: '2027-01-15'"),
    }),
    execute: async ({ servicenowCredentials, className, sysId, source, attributes, additionalAttributes, name, ipAddress, hostName, fqdn, serialNumber, installStatus, operationalStatus, environment, manufacturer, modelNumber, description, shortDescription, cost, company, location, managedBy, supportedBy, assignmentGroup, purchaseDate, warrantyExpiration }) => {
        return snRequest(servicenowCredentials, `/api/now/cmdb/instance/${encodeURIComponent(className)}/${encodeURIComponent(sysId)}`, {
            method: 'PUT',
            body: {
                attributes: {
                    ...toServerKeys({ name, ipAddress, hostName, fqdn, serialNumber, installStatus, operationalStatus, environment, manufacturer, modelNumber, description, shortDescription, cost, company, location, managedBy, supportedBy, assignmentGroup, purchaseDate, warrantyExpiration }),
                    ...(attributes ?? {}),
                    ...(additionalAttributes ?? {}),
                },
                source: source ?? 'Manual',
            },
        });
    },
});
