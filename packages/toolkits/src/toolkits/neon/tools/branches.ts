// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonAddRoleToBranch = tool({
    description: "Creates a new PostgreSQL role within a specific branch of a Neon project. Neon is a serverless PostgreSQL platform where roles are database-level users that can connect to the database and have specific permissions. Use this endpoint to: - Create application service accounts for database access - Set up read-only users for reporting - Create admin roles for database management The created role will have an auto-generated password returned in the response. Store this password securely as it may not be retrievable later. You can use the 'reveal_role_password' endpoint to retrieve it again if needed. Note: Role names must be valid PostgreSQL identifiers (max 63 bytes).",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID where the role will be created (e.g., 'br-icy-cake-aebdped3'). Obtain this from the list branches endpoint."),
        projectId: z.string().describe("The Neon project ID (e.g., 'calm-breeze-57229290'). Obtain this from the list projects endpoint."),
        roleName: z.string().describe("The PostgreSQL role name to create. Must be a valid PostgreSQL identifier and cannot exceed 63 bytes in length. Common examples: 'admin', 'readonly_user', 'app_service'."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, roleName }) => {
        const queryParams = undefined;
        const body = {};
        if (roleName !== undefined) setNested(body, 'role.name', roleName);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/roles`, method: 'POST', query: queryParams, body });
    },
});

export const neonCountProjectBranches = tool({
    description: "Tool to get the total number of branches in a Neon project. Use when you need to count branches without retrieving full branch details. Optionally filter by branch name using the search parameter.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        search: z.string().optional().describe("Count branches matching the 'name' in search query"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, search, projectId }) => {
        const res = await neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches`, method: 'GET', query: { search } });
        if (res?.error) return res;
        const branches = Array.isArray(res?.branches) ? res.branches : [];
        return { projectId, count: branches.length, branches };
    },
});

export const neonCreateBranchDatabase = tool({
    description: "Creates a new database within a specified project and branch in the Neon platform. This endpoint allows users to set up a new database with a custom name and assign an owner role, facilitating the organization and management of databases within the Neon ecosystem. It should be used when initializing a new database for a specific project or when branching requires a separate database instance. The endpoint is particularly useful for developers and database administrators who need to quickly set up new databases as part of their workflow or application deployment process. Note that this operation only creates the database; additional steps may be required to configure specific schemas, tables, or access permissions within the newly created database.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID where the database will be created (e.g., 'br-lucky-water-afkw1lov'). Obtain via NEON_GET_BRANCHES_FOR_PROJECT action."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
        databaseName: z.string().describe("The name of the database to create. Must be a valid PostgreSQL database name (lowercase letters, numbers, underscores; max 63 characters)."),
        databaseOwnerName: z.string().describe("The name of an existing role that will own the database (e.g., 'neondb_owner'). Obtain available roles via NEON_GET_BRANCH_ROLES_FOR_PROJECT action."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName, databaseOwnerName }) => {
        const queryParams = undefined;
        const body = {};
        if (databaseName !== undefined) setNested(body, 'database.name', databaseName);
        if (databaseOwnerName !== undefined) setNested(body, 'database.owner_name', databaseOwnerName);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/databases`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateBranchesSnapshot = tool({
    description: "Creates a snapshot from the specified branch at a specific point in time. Snapshots capture the state of a branch and can be used for database versioning, creating backups, or establishing checkpoints for AI agents. Use when you need to preserve the exact state of your database at a moment in time. This endpoint may initiate an asynchronous operation.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        lsn: z.string().optional().describe("Target Log Sequence Number (LSN) for the snapshot (e.g., '0/19A3328'). Cannot be used together with timestamp parameter."),
        name: z.string().optional().describe("Name for the snapshot (e.g., 'test-snapshot-root-branch'). If not provided, an auto-generated name will be used."),
        branchId: z.string().describe("The branch ID from which to create the snapshot (e.g., 'br-lucky-water-afkw1lov'). Obtain via NEON_GET_BRANCHES_FOR_PROJECT action."),
        timestamp: z.string().optional().describe("Target timestamp for the snapshot in ISO 8601 format (e.g., '2026-02-15T12:00:00Z'). Cannot be used together with lsn parameter."),
        expiresAt: z.string().optional().describe("Expiration time for the snapshot in ISO 8601 format (e.g., '2026-08-13T00:00:00Z'). After this time, the snapshot will be automatically deleted."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
    }),
    execute: async ({ neonApiKey, lsn, name, branchId, timestamp, expiresAt, projectId }) => {
        const queryParams = undefined;
        const body = {};
        if (lsn !== undefined) setNested(body, 'lsn', lsn);
        if (name !== undefined) setNested(body, 'name', name);
        if (timestamp !== undefined) setNested(body, 'timestamp', timestamp);
        if (expiresAt !== undefined) setNested(body, 'expires_at', expiresAt);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/snapshot`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateNewProjectBranch = tool({
    description: "Creates a new branch in a Neon project. Branches are copy-on-write clones of the parent branch's data, perfect for creating development/staging environments, testing features, or previewing database changes without affecting production. The branch is created from the project's default branch unless a parent_id is specified. By default, the branch copies all data from the parent ('parent-data'). Note: A branch is created without a compute endpoint. To connect to the branch, use the 'create_compute_endpoint' action to add a read_write or read_only endpoint.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID. You can find this on the Settings page in the Neon Console or by listing projects. Format: 'adjective-noun-12345678' (e.g., 'autumn-disk-484331')."),
        branchName: z.string().optional().describe("Name for the new branch. If not specified, an auto-generated name will be used (e.g., 'br-square-base-aehfbgdy'). Max 256 characters."),
        branchParentId: z.string().optional().describe("The branch ID to use as parent for the new branch. If not specified, the project's default branch (usually 'main') is used. Format: 'br-name-id' (e.g., 'br-wispy-dew-591433')."),
        branchInitSource: z.string().optional().describe("How to initialize the branch data. Options: 'parent-data' (default) copies all data from parent, 'schema-only' copies only the schema without data."),
    }),
    execute: async ({ neonApiKey, projectId, branchName, branchParentId, branchInitSource }) => {
        const queryParams = undefined;
        const body = {};
        if (branchName !== undefined) setNested(body, 'branch.name', branchName);
        if (branchParentId !== undefined) setNested(body, 'branch.parent_id', branchParentId);
        if (branchInitSource !== undefined) setNested(body, 'branch.init_source', branchInitSource);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateProjectBranchAnonymized = tool({
    description: "Creates a new branch with anonymized data using PostgreSQL Anonymizer for static masking. Use when developers need to work with masked production data in a safe development environment.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID where the anonymized branch will be created."),
        branchCreate: z.record(z.any()).optional().describe("Configuration for creating the new branch"),
        maskingRules: z.array(z.record(z.any())).optional().describe("Optional list of masking rules to apply to the branch. Each rule specifies how to anonymize a specific column using PostgreSQL Anonymizer functions."),
        annotationValue: z.record(z.any()).optional().describe("Optional metadata annotations to attach to the branch."),
        startAnonymization: z.boolean().optional().describe("If true, automatically starts the anonymization process after branch creation. If false or omitted, masking rules are stored but not applied until manually triggered."),
    }),
    execute: async ({ neonApiKey, projectId, branchCreate, maskingRules, annotationValue, startAnonymization }) => {
        const queryParams = undefined;
        const body = {};
        if (branchCreate !== undefined) setNested(body, 'branch_create', branchCreate);
        if (maskingRules !== undefined) setNested(body, 'masking_rules', maskingRules);
        if (annotationValue !== undefined) setNested(body, 'annotation_value', annotationValue);
        if (startAnonymization !== undefined) setNested(body, 'start_anonymization', startAnonymization);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branch_anonymized`, method: 'POST', query: queryParams, body });
    },
});

export const neonDeleteDatabaseFromBranch = tool({
    description: "Deletes a specific database from a designated branch within a project in the Neon platform. This endpoint should be used when you need to permanently remove a database and all its associated data from a particular branch of a project. It's crucial to use this endpoint with caution as the deletion operation is irreversible. This tool is particularly useful for cleaning up unnecessary databases, managing storage, or removing test databases that are no longer needed. However, it should not be used for temporary data management; instead, consider using database suspension or archiving features if available. Note that this operation only affects the specified branch and does not impact the database in other branches or the main project.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique identifier for the branch within the project. Format: 'br-' prefix followed by alphanumeric characters (e.g., 'br-lucky-water-afkw1lov'). Can be obtained from the list branches API."),
        projectId: z.string().describe("The unique identifier for the Neon project. Format: alphanumeric with hyphens (e.g., 'dry-smoke-26258271'). Can be found in the Neon console or via the list projects API."),
        databaseName: z.string().describe("The name of the database to delete. This is the database name as it appears in PostgreSQL, not an ID. The deletion is permanent and cannot be undone."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/databases/${encodeURIComponent(databaseName)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteProjectBranchById = tool({
    description: "Deletes a specific branch within a project in the Neon B2B SaaS integration platform. This endpoint permanently removes the specified branch and all associated data from the project. It should be used when a branch is no longer needed, such as after merging changes or abandoning a development path. Caution should be exercised when using this endpoint, as the deletion is irreversible. It's important to ensure that any valuable data or configurations in the branch have been backed up or merged before deletion. This operation cannot be undone, so double-checking the project_id and branch_id before execution is crucial to avoid accidental deletions.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteProjectBranchRole = tool({
    description: "Deletes a PostgreSQL role from a specific branch within a Neon project. This permanently removes the role and its associated database permissions. Use this endpoint to: - Remove obsolete user accounts from a database branch - Clean up roles after application decommissioning - Revoke access for former team members Important notes: - This operation is permanent and cannot be undone - The deletion triggers an async 'apply_config' operation on the compute endpoint - If the role doesn't exist, returns 204 No Content (idempotent behavior) - If the role exists and is deleted, returns 200 OK with role and operation details - You cannot delete the default owner role created with the database",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique branch identifier within the project (e.g., 'br-rough-voice-ah2lazzk'). Can be retrieved using the list project branches endpoint."),
        roleName: z.string().describe("The name of the PostgreSQL role to delete from the branch (e.g., 'my_app_user'). Cannot exceed 63 bytes in length. Note: Deleting a role is permanent and cannot be undone."),
        projectId: z.string().describe("The unique Neon project identifier (e.g., 'proud-meadow-87189985'). Can be retrieved using the list projects endpoint."),
    }),
    execute: async ({ neonApiKey, branchId, roleName, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/roles/${encodeURIComponent(roleName)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonFetchDatabaseForBranch = tool({
    description: "Retrieves a list of databases associated with a specific project and branch in the Neon platform. This endpoint allows developers to view all databases within a particular project and branch context, which is useful for managing different environments (e.g., development, staging, production) or versions of an application's database setup. It should be used when you need to inventory the databases in a specific branch or verify the existence of databases in a particular project environment. The endpoint does not provide detailed information about each database's schema or contents; it's primarily for listing purposes.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/databases`, method: 'GET', query: queryParams });
    },
});

export const neonFinalizeBranchRestore = tool({
    description: "Finalizes the restore operation for a branch created from a snapshot. This updates the branch to function as the original branch it replaced by: reassigning computes from the original branch (which restarts them), renaming the restored branch to the original's name, and renaming the original branch. Only applies to branches created using the restoreSnapshot endpoint.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        name: z.string().optional().describe("Used to rename the existing branch when it is replaced. If omitted, a default name is generated and used."),
        branchId: z.string().describe("The ID of the branch created from a snapshot that will be finalized. Format: 'br-adjective-noun-alphanumeric' (e.g., 'br-late-voice-ahlrw52f')."),
        projectId: z.string().describe("The Neon project ID. Format: 'adjective-noun-12345678' (e.g., 'proud-meadow-87189985')."),
    }),
    execute: async ({ neonApiKey, name, branchId, projectId }) => {
        const queryParams = undefined;
        const body = {};
        if (name !== undefined) setNested(body, 'name', name);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/finalize_restore`, method: 'POST', query: queryParams, body });
    },
});

export const neonGetBranchesAnonymizedStatus = tool({
    description: "Retrieves the current status of an anonymized branch, including its state and progress information. This endpoint allows you to monitor the anonymization process from initialization through completion. Only anonymized branches will have status information available. Use this action when you need to: - Monitor the progress of an anonymization process - Check the state of an anonymized branch (created, initialized, anonymizing, anonymized, error) - View details about the most recent anonymization attempt - Identify when an anonymization operation failed Note: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID. You can obtain the branch_id by listing the project's branches. Only anonymized branches will have status information available."),
        projectId: z.string().describe("The Neon project ID. You can obtain a project_id by listing the projects for your Neon account."),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/anonymized_status`, method: 'GET', query: queryParams });
    },
});

export const neonGetBranchesBackupSchedule = tool({
    description: "Retrieves the backup schedule configuration for a specified branch within a Neon project. This endpoint provides information about when backups are created and how long they are retained. Use this when you need to verify or audit the backup schedule settings for a branch. Note: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/backup_schedule`, method: 'GET', query: queryParams });
    },
});

export const neonGetBranchesForProject = tool({
    description: "Retrieves a list of branches associated with a specific project in the Neon B2B SaaS integration platform. This endpoint should be used when you need to get an overview of all branches within a particular project, which is useful for version management and workflow control. It provides information about different versions or development stages of the project, allowing for efficient project management and collaboration. The endpoint is particularly helpful when planning merges, reviewing project history, or deciding on which branch to base new development work.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        search: z.string().optional().describe("Search by branch 'name' or 'id'. You can specify partial 'name' or 'id' values to filter results. "),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, search, projectId }) => {
        const queryParams = { search: search };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches`, method: 'GET', query: queryParams });
    },
});

export const neonGetBranchesMaskingRules = tool({
    description: "Retrieves the masking rules for the specified anonymized branch. Masking rules define how sensitive data should be anonymized using PostgreSQL Anonymizer. Use this when you need to view the data anonymization configuration for a branch. Note: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID. You can obtain this by listing the project's branches."),
        projectId: z.string().describe("The Neon project ID. You can obtain this by listing the projects for your Neon account."),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/masking_rules`, method: 'GET', query: queryParams });
    },
});

export const neonGetBranchRolesForProject = tool({
    description: "Retrieves the roles associated with a specific branch within a project in the Neon B2B SaaS integration platform. This endpoint is used to fetch the current role assignments for a given project and branch combination, which is essential for managing access control and permissions within the Neon ecosystem. It should be used when you need to review or audit the roles assigned to a particular branch, such as before making changes to permissions or when verifying the current access structure. The endpoint does not modify any roles; it only provides a read-only view of the existing role assignments. Keep in mind that the response will only include roles for the specified branch and does not provide information about roles in other branches or at the project level.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/roles`, method: 'GET', query: queryParams });
    },
});

export const neonGetProjectBranches = tool({
    description: "Retrieves detailed information about a specific branch within a Neon project. This endpoint allows developers to fetch the current state and configuration of a branch, including its name, creation timestamp, and other relevant metadata. It's particularly useful when you need to verify branch details, check its status, or gather information for further operations on the branch. The endpoint should be used when you require up-to-date information about a single branch in your project's context. Note that this endpoint only provides read access and does not modify any branch data.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}`, method: 'GET', query: queryParams });
    },
});

export const neonGetProjectBranchRole = tool({
    description: "Retrieves detailed information about a specific role within a particular branch of a Neon project. This endpoint is used to fetch the current configuration, permissions, and other relevant details associated with the specified role. It's particularly useful for auditing access controls, verifying role settings, or gathering information before making modifications to role permissions. The endpoint requires precise identification of the project, branch, and role, ensuring that the correct role information is retrieved from the appropriate context within the Neon platform's hierarchical structure.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique identifier of the branch within the project (e.g., 'br-lucky-water-afkw1lov'). You can obtain this from the list branches endpoint."),
        roleName: z.string().describe("The name of the database role to retrieve (e.g., 'neondb_owner', 'authenticator', 'authenticated', 'anonymous'). This is the PostgreSQL role name within the branch."),
        projectId: z.string().describe("The unique identifier of the Neon project (e.g., 'dry-smoke-26258271'). You can obtain this from the list projects endpoint."),
    }),
    execute: async ({ neonApiKey, branchId, roleName, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/roles/${encodeURIComponent(roleName)}`, method: 'GET', query: queryParams });
    },
});

export const neonGetProjectBranchSchemaComparison = tool({
    description: "Compares the database schema of a branch with another branch's schema in a Neon project. Returns the difference as a unified diff format string. Use this when you need to understand what schema changes exist between two branches (e.g., before merging, to review migrations, or to verify schema consistency). The comparison can be done at specific points in time using LSN or timestamp parameters for both branches.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        lsn: z.string().optional().describe("Optional Log Sequence Number (LSN) for which the schema is retrieved. Format: 'X/XXXXXXXX' (e.g., '0/1F79928')."),
        dbName: z.string().describe("Name of the database for which the schema is compared (e.g., 'neondb'). Can be obtained from the databases list for a branch."),
        baseLsn: z.string().optional().describe("Optional Log Sequence Number (LSN) for the base branch schema. Format: 'X/XXXXXXXX'."),
        branchId: z.string().describe("The branch ID to get the schema from (e.g., 'br-calm-bread-ah40d54d'). Can be obtained from the branches list for a project."),
        timestamp: z.string().optional().describe("Optional ISO 8601 timestamp for the point in time for which the schema is retrieved (e.g., '2022-11-30T20:09:48Z')."),
        projectId: z.string().describe("The Neon project ID (e.g., 'proud-meadow-87189985'). Can be obtained from the project list or project details."),
        baseBranchId: z.string().optional().describe("Optional branch ID to compare the schema with. If not specified, compares with the parent branch."),
        baseTimestamp: z.string().optional().describe("Optional ISO 8601 timestamp for the point in time for the base branch schema (e.g., '2022-11-30T20:09:48Z')."),
    }),
    execute: async ({ neonApiKey, lsn, dbName, baseLsn, branchId, timestamp, projectId, baseBranchId, baseTimestamp }) => {
        const queryParams = { lsn: lsn, db_name: dbName, base_lsn: baseLsn, timestamp: timestamp, base_branch_id: baseBranchId, base_timestamp: baseTimestamp };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/schema_comparison`, method: 'GET', query: queryParams });
    },
});

export const neonGetSchemaForProjectBranch = tool({
    description: "Retrieves the PostgreSQL database schema (DDL) for a specific database on a branch within a Neon project. Returns the schema as SQL statements (similar to pg_dump output), including CREATE TABLE, ALTER TABLE, CREATE INDEX, and other DDL statements. This is useful for understanding the database structure, comparing schemas between branches, or for documentation purposes. The schema can be retrieved at the current point in time or at a specific historical point using either an LSN or timestamp parameter. Note: The branch's compute endpoint must be active for this endpoint to work.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        lsn: z.string().optional().describe("Optional Log Sequence Number (LSN) to retrieve the schema at a specific point in the WAL. Format: 'X/XXXXXXXX' (e.g., '0/1F79928'). If not specified, returns the current schema."),
        dbName: z.string().describe("Name of the database to retrieve schema for (e.g., 'neondb'). Can be obtained from the databases list for a branch."),
        branchId: z.string().describe("The branch ID (e.g., 'br-lucky-water-afkw1lov'). Can be obtained from the branches list for a project."),
        timestamp: z.string().optional().describe("Optional ISO 8601 timestamp to retrieve the schema at a specific point in time (e.g., '2025-07-26T17:44:06Z'). If not specified, returns the current schema."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Can be obtained from the project list or project details."),
    }),
    execute: async ({ neonApiKey, lsn, dbName, branchId, timestamp, projectId }) => {
        const queryParams = { lsn: lsn, db_name: dbName, timestamp: timestamp };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/schema`, method: 'GET', query: queryParams });
    },
});

export const neonModifyBranchDetailsInProject = tool({
    description: "Updates the details of a specific branch within a project in the Neon platform. This endpoint allows you to modify the name and protection status of an existing branch. It is particularly useful when you need to rename a branch or change its protection settings without creating a new branch. The endpoint uses partial updates, so you can specify only the fields you want to change. This tool should be used when managing branch configurations in a Neon project, but it cannot be used to create new branches or delete existing ones.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique identifier of the branch to modify. Format: 'br-<adjective>-<noun>-<alphanumeric>' (e.g., 'br-square-base-aehfbgdy'). Can be obtained from the branches list endpoint for a project."),
        projectId: z.string().describe("The unique identifier of the Neon project containing the branch to modify. Format: '<adjective>-<noun>-<number>' (e.g., 'calm-breeze-57229290'). Can be obtained from the projects list endpoint."),
        branchName: z.string().optional().describe("The new name for the branch. If not provided, the branch name remains unchanged. Branch names should be descriptive and follow your team's naming conventions (e.g., 'main', 'production', 'development', 'feature-xyz')."),
        branchProtected: z.boolean().optional().describe("Whether the branch should be protected. Protected branches have restrictions that prevent certain destructive operations. Set to true to enable protection, false to disable it. If not provided, the protection status remains unchanged. Note: Protection features may require a paid plan."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, branchName, branchProtected }) => {
        const queryParams = undefined;
        const body = {};
        if (branchName !== undefined) setNested(body, 'branch.name', branchName);
        if (branchProtected !== undefined) setNested(body, 'branch.protected', branchProtected);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}`, method: 'PATCH', query: queryParams, body });
    },
});

export const neonPatchBranchDatabaseInformation = tool({
    description: "Updates the properties of a specific database within a project branch in the Neon platform. This endpoint allows for partial modifications of database attributes, such as changing its name or owner. It should be used when you need to rename a database or transfer ownership to a different role within the same project and branch. The update is performed using the PATCH method, allowing for selective property changes without affecting unspecified attributes. Note that this operation modifies existing database metadata and does not create new databases or alter the actual data within the database.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID where the database resides (e.g., 'br-lucky-water-afkw1lov')"),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271')"),
        databaseName: z.string().describe("The current name of the database to update"),
        newDatabaseName: z.string().optional().describe("The new name for the database. Use this to rename the database."),
        databaseOwnerName: z.string().optional().describe("The name of the role to transfer database ownership to. The role must exist in the branch."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName, newDatabaseName, databaseOwnerName }) => {
        const queryParams = undefined;
        const body = {};
        if (newDatabaseName !== undefined) setNested(body, 'database.name', newDatabaseName);
        if (databaseOwnerName !== undefined) setNested(body, 'database.owner_name', databaseOwnerName);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/databases/${encodeURIComponent(databaseName)}`, method: 'PATCH', query: queryParams, body });
    },
});

export const neonResetRolePasswordForBranch = tool({
    description: "Resets the password for a PostgreSQL role on a specific Neon branch and generates a new password. Use this when credentials need to be rotated for security purposes (e.g., employee offboarding, suspected compromise, or routine security practices). The response includes the new password - store it securely as it cannot be retrieved later. The new password becomes active once the triggered 'apply_config' operation completes; the old password remains valid until then. Note: This is a destructive operation that invalidates the current password.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID where the role exists (e.g., 'br-lucky-water-afkw1lov')"),
        roleName: z.string().describe("The name of the database role whose password should be reset (e.g., 'neondb_owner', 'authenticator')"),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271')"),
    }),
    execute: async ({ neonApiKey, branchId, roleName, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/roles/${encodeURIComponent(roleName)}/reset_password`, method: 'POST', query: queryParams });
    },
});

export const neonRestoreProjectBranch = tool({
    description: "This endpoint restores a branch to a specific state or point in time. Use it to recover data, revert changes, or create new branch states based on historical data. The restoration uses either a Log Sequence Number (LSN) or timestamp from the source branch. Important: For self-restoration or branches with children, use preserve_under_name to save the current state. Note: Restoration time varies based on data volume and restoration point.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The ID of the branch to restore (the target branch that will receive the restored data)."),
        projectId: z.string().describe("The Neon project ID containing the branch to restore."),
        sourceLsn: z.string().optional().describe("A Log Sequence Number (LSN) on the source branch. The branch will be restored with data from this LSN. Format example: '0/19A3328'."),
        sourceBranchId: z.string().describe("The branch_id of the restore source branch. If source_timestamp and source_lsn are omitted, the branch will be restored to head. If source_branch_id is equal to the branch's id (self-restoration), source_timestamp or source_lsn is required."),
        sourceTimestamp: z.string().optional().describe("A timestamp identifying a point in time on the source branch. The branch will be restored with data starting from this point in time. The timestamp must be provided in ISO 8601 format; for example: '2024-02-26T12:00:00Z'."),
        preserveUnderName: z.string().optional().describe("If provided, the previous state of the branch will be saved to a new branch with this name. Required if the branch has children or if source_branch_id equals the branch id (self-restoration). All existing child branches will be moved to the newly created branch under this name."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, sourceLsn, sourceBranchId, sourceTimestamp, preserveUnderName }) => {
        const queryParams = undefined;
        const body = {};
        if (sourceBranchId !== undefined) setNested(body, 'source_branch_id', sourceBranchId);
        if (sourceLsn !== undefined) setNested(body, 'source_lsn', sourceLsn);
        if (sourceTimestamp !== undefined) setNested(body, 'source_timestamp', sourceTimestamp);
        if (preserveUnderName !== undefined) setNested(body, 'preserve_under_name', preserveUnderName);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/restore`, method: 'POST', query: queryParams, body });
    },
});

export const neonRetrieveBranchDatabaseDetails = tool({
    description: "Retrieves detailed information about a specific database within a Neon project and branch. This endpoint allows developers to fetch crucial metadata and configuration details for a given database, enabling them to monitor and manage their database resources effectively. It should be used when you need to inspect the current state, settings, or properties of a particular database in your Neon environment. The endpoint provides a snapshot of the database's characteristics but does not modify any data or settings.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
        databaseName: z.string().describe("The database name"),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/databases/${encodeURIComponent(databaseName)}`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveBranchEndpoints = tool({
    description: "Retrieves all compute endpoints associated with a specific branch in a Neon project. Compute endpoints are the connection points for accessing your PostgreSQL database - they provide the hostname and configuration needed to connect to your database. Use this action when you need to: - Get connection details (host, region) for a branch's database - Check endpoint status (active, idle, suspended) - Review autoscaling and connection pooling settings - Monitor endpoint activity and configuration Returns a list of endpoints with details like host, region, current state, autoscaling limits, and pooler configuration. Most branches have one read_write endpoint, but may have additional read-only replicas.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique branch ID (e.g., 'br-lucky-water-afkw1lov'). Can be obtained from the list branches API or Neon console."),
        projectId: z.string().describe("The unique Neon project ID (e.g., 'dry-smoke-26258271'). Can be found in the Neon console URL or via the list projects API."),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/endpoints`, method: 'GET', query: queryParams });
    },
});

export const neonRevealRolePasswordInBranch = tool({
    description: "Reveals the password for a specific role within a branch of a Neon project. This endpoint is used when you need to retrieve a previously hidden or encrypted password for a database role. It's particularly useful for administrators who need to access or share role credentials securely. The endpoint should be used cautiously, as it exposes sensitive information. It does not modify the password, only retrieves it. Note that frequent use of this endpoint may be logged or restricted for security purposes.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique identifier of the branch within the project. Format: 'br-adjective-noun-xxxxxxxx' (e.g., 'br-lucky-water-afkw1lov'). Obtain from list branches API."),
        roleName: z.string().describe("The name of the database role whose password you want to reveal. Common roles include 'neondb_owner' (default owner), 'authenticator', 'authenticated', 'anonymous', or custom roles you've created."),
        projectId: z.string().describe("The unique identifier of the Neon project. Format: 'adjective-noun-12345678' (e.g., 'dry-smoke-26258271'). Obtain from list projects API."),
    }),
    execute: async ({ neonApiKey, branchId, roleName, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/roles/${encodeURIComponent(roleName)}/reveal_password`, method: 'POST', query: queryParams });
    },
});

export const neonSetBranchAsDefault = tool({
    description: "Sets a specified branch as the default branch for a given project in Neon. This endpoint allows users to designate a particular branch as the primary or main branch for a project, which can be useful for organizing workflows and setting default behaviors. The operation is performed using a POST request, indicating that it modifies the state of the project. Use this endpoint when you need to change the default branch of a project, such as after creating a new branch or deciding to switch the main development focus. It's important to note that this action may affect how other operations interact with the project, as many systems use the default branch as a reference point for various functionalities.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/set_as_default`, method: 'POST', query: queryParams });
    },
});

export const neonStartBranchAnonymization = tool({
    description: "Starts the anonymization process for an anonymized branch that is in the initialized, error, or anonymized state. This will apply all defined masking rules to anonymize sensitive data in the branch databases. The branch must be an anonymized branch to start anonymization. Note: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/anonymize`, method: 'POST', query: queryParams });
    },
});

export const neonUpdateBranchesMaskingRules = tool({
    description: "Updates the masking rules for the specified anonymized branch. Masking rules define how sensitive data should be anonymized using PostgreSQL Anonymizer. Use this when you need to add, modify, or remove data anonymization rules for a branch. Note: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID. You can obtain this by listing the project's branches. The branch must be an anonymized branch."),
        projectId: z.string().describe("The Neon project ID. You can obtain this by listing the projects for your Neon account."),
        maskingRules: z.array(z.record(z.any())).describe("List of masking rules to apply to the branch. This will replace all existing masking rules for the branch. Pass an empty array to remove all masking rules."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, maskingRules }) => {
        const queryParams = undefined;
        const body = {};
        if (maskingRules !== undefined) setNested(body, 'masking_rules', maskingRules);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/masking_rules`, method: 'PATCH', query: queryParams, body });
    },
});
