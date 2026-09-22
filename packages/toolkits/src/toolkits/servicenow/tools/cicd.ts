// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const createCilifecyclemgmtAction = tool({
    description: "Adds a specified configuration item (CI) action using the ServiceNow CI Lifecycle Management API. Use this action when you need to create or execute a CI lifecycle action for a Configuration Item in ServiceNow's CMDB. This endpoint allows you to trigger specific lifecycle actions (such as activate, retire, or custom actions) on CIs programmatically. The action requires the CI identifier and the action name to be executed. Ensure the action is valid for the specified CI class.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        ci: z.string().describe("The unique identifier of the Configuration Item (CI) to associate with the action. This can be the sys_id (32-character hexadecimal string) or other CI identifier. Example: '00a96c0d3790200044e0bfc8bcbe5db4'"),
        action: z.string().describe("The name or identifier of the action to execute on the CI. This corresponds to a valid CI lifecycle action defined in the ci_lifecycle_action table. Example: 'test_action', 'activate', 'retire'"),
    }),
    execute: async ({ servicenowCredentials, ci, action }) => {
        return snRequest(servicenowCredentials, '/api/now/cilifecyclemgmt/actions', {
            method: 'POST',
            query: { actionName: action, sysIds: ci },
        });
    },
});

export const createCiLifecycleMgmtOperators = tool({
    description: "Registers a new operator for a non-workflow user in the ServiceNow CI Lifecycle Management system. Use this action when you need to create or register an operator identity for CI lifecycle management purposes. The operator must be associated with a non-workflow user account. The returned req_id can be used to manage the operator (e.g., delete it later).",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        email: z.string().describe("The email address of the operator. Must be a valid email format. Example: 'test@example.com'"),
        lastName: z.string().describe("The last name (surname) of the operator. Example: 'Operator'"),
        userName: z.string().describe("The unique username for the operator being registered. This must be a non-workflow user account. Example: 'test_operator'"),
        firstName: z.string().describe("The first name of the operator. Example: 'Test'"),
    }),
    execute: async ({ servicenowCredentials, email, lastName, userName, firstName }) => {
        return snRequest(servicenowCredentials, '/api/now/cilifecyclemgmt/operators', {
            method: 'POST',
            body: toServerKeys({ email, lastName, userName, firstName }),
        });
    },
});

export const createCiLifecycleMgmtStatuses = tool({
    description: "Sets the operational state for one or more configuration items (CIs) using the ServiceNow CI Lifecycle Management API. Use this action when you need to update the operational status of CIs in ServiceNow's CMDB. This endpoint allows you to programmatically set the operational state (operational, non-operational, on order, inventory, etc.) for a batch of configuration items. The action requires a list of CI identifiers and the operational state value to apply.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysIds: z.array(z.string()).describe("List of Configuration Item (CI) identifiers to set the operational state for. Each identifier should be the sys_id (32-character hexadecimal string) of the CI. Example: ['73aa7167c42'] or ['00a96c0d3790200044e0bfc8bcbe5db4']"),
        requestor: z.string().optional().describe("The user ID or sys_id of the requestor who is setting the operational state. This is required for authorization purposes. Example: 'admin' or '681ccaf9c0a8016400b98a06818d6e1a'"),
        operationalState: z.string().describe("The operational state to set for the specified CIs. Common values: '1' = Operational, '2' = Non-Operational, '3' = On Order, '4' = Inventory. The valid values depend on your ServiceNow configuration. Example: '1'"),
    }),
    execute: async ({ servicenowCredentials, sysIds, requestor, operationalState }) => {
        return snRequest(servicenowCredentials, '/api/now/cilifecyclemgmt/statuses', {
            method: 'POST',
            query: { sysIds: sysIds.join(','), requestorId: requestor, opsLabel: operationalState },
        });
    },
});

export const createSnCicdAppBatchInstall = tool({
    description: "Installs two or more ServiceNow application packages in a single batch operation via the CICD API. Use this action when you need to deploy multiple applications at once as part of a CI/CD pipeline or automated deployment process. The batch install allows for efficient bulk installation of related applications rather than installing them one at a time. This action is idempotent — running it multiple times with the same packages will produce the same result. Note: At least two packages must be specified for a batch install operation.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        name: z.string().describe("The name or label for this batch install operation. This is used for identification purposes."),
        packages: z.array(z.record(z.any())).describe("List of packages to install in a single batch operation. Each package must have a 'name' field containing the application ID. At least two packages are required for batch installation."),
    }),
    execute: async ({ servicenowCredentials, name, packages }) => {
        return snRequest(servicenowCredentials, '/api/sn_cicd/app/batch/install', {
            method: 'POST',
            body: toServerKeys({ name, packages }),
        });
    },
});

export const createSnCicdAppRepoInstall = tool({
    description: "Installs the specified application from the ServiceNow app repository. Use this action when you need to install an application from the ServiceNow Store or a private app repository onto your ServiceNow instance. This is commonly used during CI/CD pipelines to automate the deployment of applications. The action requires the sys_id of the application to install, which can be obtained from the app repository records or from a previous application listing operation.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The sys_id of the application to install from the app repository. This is the unique system identifier for the application record in ServiceNow."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, '/api/sn_cicd/app_repo/install', {
            method: 'POST',
            query: { sys_id: sysId },
        });
    },
});

export const createSnCicdInstanceScanFullScan = tool({
    description: "Initiates a full instance scan by running all active checks present in the ServiceNow instance. Use this action when you need to execute a comprehensive validation scan of your ServiceNow instance, running all configured active checks to identify configuration issues, best practice violations, or compliance problems. This is typically used during CI/CD pipelines or before major changes to ensure the instance meets required standards. This action starts an asynchronous scan operation - the response indicates the scan has been initiated with a 'running' state. Use the returned sys_id to track progress or retrieve detailed results.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
    }),
    execute: async ({ servicenowCredentials }) => {
        return snRequest(servicenowCredentials, '/api/sn_cicd/instance_scan/full_scan', {
            method: 'POST',
        });
    },
});

export const createSnCicdInstanceScanSuiteScanCombo = tool({
    description: "Runs a CI/CD scan using a suite and target (scoped app) combination in ServiceNow. Use this action when you need to execute a compliance or best practices scan against a scoped application using a predefined scan suite and target combination. This is commonly used in CI/CD pipelines to validate that an application meets ServiceNow best practices before deployment or release. The combo_sys_id refers to a saved configuration that links a scan suite with a target scoped application. You can optionally override the target by providing target_scope_app_sys_id. This action modifies the ServiceNow instance by executing a scan. If async_execution is false (default), the request will wait for the scan to complete. Set async_execution to true if you want the scan to run in the background and return immediately.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        comboSysId: z.string().describe("The unique system ID (sys_id) of the scan suite and target combination to run. This is a 32-character hexadecimal string that identifies the combo configuration containing the suite and target (scoped app) to scan. Example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'"),
        asyncExecution: z.boolean().optional().describe("When set to true, the scan runs asynchronously and returns immediately with a job ID. When false (default), the request waits for the scan to complete before returning."),
        targetScopeAppSysId: z.string().optional().describe("The sys_id of the scoped application to run the scan against. If not provided, the target defined in the combo configuration will be used. Example: 'f6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1'"),
    }),
    execute: async ({ servicenowCredentials, comboSysId, asyncExecution, targetScopeAppSysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cicd/instance_scan/suite_scan/combo/${encodeURIComponent(comboSysId)}`, {
            method: 'POST',
            query: { async_execution: asyncExecution, target_scope_app_sys_id: targetScopeAppSysId },
        });
    },
});

export const createSnCicdPluginActivate = tool({
    description: "Activates the specified plugin in ServiceNow's CICD Plugin API. Use this action when you need to activate a plugin on a ServiceNow instance as part of a CI/CD pipeline or automated deployment process. This is commonly used after deploying a plugin to enable its functionality on the target instance. This action modifies the state of the ServiceNow instance by activating the plugin. Ensure the plugin is compatible with your instance and that any prerequisites are met before activation.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        pluginId: z.string().describe("The unique identifier or name of the plugin to activate. This is typically the plugin's scope name or full identifier (e.g., 'com.glide.cs', 'com.snc.pdap')."),
    }),
    execute: async ({ servicenowCredentials, pluginId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cicd/plugin/${encodeURIComponent(pluginId)}/activate`, {
            method: 'POST',
        });
    },
});

export const createSnCicdTestsuiteRun = tool({
    description: "Starts a specified automated test suite using ServiceNow's CI/CD Pipeline API. Use this action when you need to execute an automated test suite as part of a CI/CD pipeline or deployment process. This action initiates the test suite run and returns a progress identifier that can be used with GetSnCicdProgress to monitor execution status. The action is commonly used during automated testing phases in deployment pipelines to validate application changes before production deployment.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        testSuiteId: z.string().optional().describe("Deprecated alias for test_suite_sys_id, kept for backward compatibility. Use test_suite_sys_id instead."),
        testSuiteName: z.string().optional().describe("The name of the automated test suite to run. Required if test_suite_sys_id is not specified."),
        testSuiteSysId: z.string().optional().describe("The sys_id of the automated test suite (Test [sys_atf_test_suite]) to run. Required if test_suite_name is not specified. Example: 'a1b2c3d4e5f67890abcdef1234567890'"),
    }),
    execute: async ({ servicenowCredentials, testSuiteId, testSuiteName, testSuiteSysId }) => {
        return snRequest(servicenowCredentials, '/api/sn_cicd/testsuite/run', {
            method: 'POST',
            query: { test_suite_sys_id: testSuiteSysId ?? testSuiteId, test_suite_name: testSuiteName },
        });
    },
});

export const deleteCiLifecycleMgmtAction = tool({
    description: "Permanently deletes a specific CI Lifecycle Management action from ServiceNow using its sys_id. Use this action when you need to remove a CI Lifecycle Management action record that is no longer needed. This action is irreversible — the CI action cannot be recovered once deleted. Requires the user to have appropriate permissions for the CI Lifecycle Management module. Use when you need to clean up obsolete, incorrect, or duplicate CI lifecycle action records.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        actionSysId: z.string().describe("The unique system ID (sys_id) of the CI Lifecycle Management action to delete. This is a 32-character hexadecimal string that uniquely identifies the action record. Example: '9a8f5b3c1d4e7f2a6b0c8d3e5f7a1b9c'. The action must exist, or a 404 error will be returned. This parameter corresponds to the 'sys_id' field of the 'statemgmt_ci_actions' table."),
    }),
    execute: async ({ servicenowCredentials, actionSysId }) => {
        return snRequest(servicenowCredentials, `/api/now/cilifecyclemgmt/actions/${encodeURIComponent(actionSysId)}`, {
            method: 'DELETE',
        });
    },
});

export const deleteCiLifecycleMgmtOperators = tool({
    description: "Permanently unregisters an operator from the ServiceNow CI Lifecycle Management system. This action removes an operator registration for non-workflow users. This is a destructive, irreversible operation — once the operator is unregistered, it cannot be recovered and will need to be re-registered if needed again. Use this action with caution. Use when you need to clean up obsolete operator registrations for non-workflow users in the CI Lifecycle Management system. The user must have appropriate permissions to unregister operators. If the operator doesn't exist or the user lacks permissions, an error will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        reqId: z.string().describe("The unique identifier of the operator to unregister. This is the operator ID that was assigned when the operator was registered. Example: 'test-operator-id-123'. The operator must exist in the CI Lifecycle Management system, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, reqId }) => {
        return snRequest(servicenowCredentials, `/api/now/cilifecyclemgmt/operators/${encodeURIComponent(reqId)}`, {
            method: 'DELETE',
        });
    },
});

export const getCilifecyclemgmtActions = tool({
    description: "Retrieves a specific CI Lifecycle Management action from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular CI Lifecycle Management action, including its name, state, description, and associated CMDB class. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the CI Lifecycle Management action to retrieve. This is a 32-character hexadecimal string that uniquely identifies the action record. Example: '00000000000000000000000000000000'"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,state,class_name'"),
        sysparmDisplayValue: z.string().optional().describe("Determines the type of data returned for reference fields. 'false': Returns actual database values (sys_ids for references). 'true': Returns display values (names for references). 'all': Returns both display and actual values."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields."),
    }),
    execute: async ({ servicenowCredentials, sysId, sysparmFields, sysparmDisplayValue, sysparmExcludeReferenceLink }) => {
        return snRequest(servicenowCredentials, `/api/now/cilifecyclemgmt/actions/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            query: {
                sysparm_fields: sysparmFields,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
            },
        });
    },
});

export const getCilifecyclemgmtCompatActions = tool({
    description: "Determines whether two specified Configuration Items (CIs) in the ServiceNow CMDB are compatible using the CI Lifecycle Management compatActions endpoint. Use this action when you need to verify compatibility between two Configuration Items before planning changes, deployments, or scheduling activities that involve multiple CIs. This helps ensure that changes to one CI won't negatively impact another CI in the configuration.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        ci1: z.string().describe("The sys_id of the first Configuration Item (CI) to check for compatibility. This is a 32-character hexadecimal string that uniquely identifies the CI record in the CMDB. Example: '00a96c0d3790200044e0bfc8bcbe5db4'"),
        ci2: z.string().describe("The sys_id of the second Configuration Item (CI) to check for compatibility. This is a 32-character hexadecimal string that uniquely identifies the CI record in the CMDB. Example: '00a96c0d3790200044e0bfc8bcbe5db5'"),
    }),
    execute: async ({ servicenowCredentials, ci1, ci2 }) => {
        return snRequest(servicenowCredentials, '/api/now/cilifecyclemgmt/compatActions', {
            method: 'GET',
            query: { actionName: ci1, otherActionName: ci2 },
        });
    },
});

export const getCiLifecycleMgmtLeasesExpired = tool({
    description: "Determines whether a CI Lifecycle Management lease has expired for the specified lease record. Use this action when you need to check the expiration status of a lease in ServiceNow's CI Lifecycle Management system. This is a read-only operation that queries whether the specified lease has expired based on its end date and current system time. This action is useful for: - Verifying lease validity before performing operations that require an active lease - Auditing expired leases in the CMDB - Triggering renewal workflows when leases are expired",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the lease record to check for expiration status. This is a 32-character hexadecimal string that uniquely identifies the lease record in the CI Lifecycle Management system. Example: '00000000000000000000000000000001'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/cilifecyclemgmt/leases/${encodeURIComponent(sysId)}/expired`, {
            method: 'GET',
        });
    },
});

export const getCiLifecycleMgmtNotAllowedOpsTransition = tool({
    description: "Determines whether a configuration item (CI) can be transitioned based on CI lifecycle management rules. Use this action when you need to check if a configuration item (CI) in ServiceNow's CMDB has any allowed state transitions under the CI lifecycle management rules. This is typically used when validating whether a CI can be moved to a specific state in its lifecycle, such as before scheduling maintenance or making configuration changes. The endpoint queries the CI lifecycle management rules to determine if the specified CI has any transition restrictions or if certain state changes are not permitted.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the configuration item (CI) to check for not allowed operations transition. This is a 32-character hexadecimal string that uniquely identifies the CI record in ServiceNow CMDB. Example: '00a96c0d3790200044e0bfc8bcbe5db4'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, '/api/now/cilifecyclemgmt/notAllowedOpsTransition', {
            method: 'GET',
            query: { sys_id: sysId },
        });
    },
});

export const getCilifecyclemgmtRequestorsValid = tool({
    description: "Validates whether a specified active workflow requestor exists and is valid in ServiceNow CI Lifecycle Management. Use this action when you need to verify that a CI Lifecycle Management workflow requestor is valid and active before proceeding with related operations such as change requests, deployment approvals, or CI lifecycle workflows. This is a read-only check that does not modify any data. The action queries the CI Lifecycle Management API with the requestor ID and returns a boolean result indicating validity. If the requestor is not found or is inactive, the API typically returns false.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        reqId: z.string().describe("The unique identifier of the workflow requestor to validate. This is typically the sys_id of the requestor record in the CI Lifecycle Management system. Example: 'test123456789012345678901234567'"),
    }),
    execute: async ({ servicenowCredentials, reqId }) => {
        return snRequest(servicenowCredentials, `/api/now/cilifecyclemgmt/requestors/${encodeURIComponent(reqId)}/valid`, {
            method: 'GET',
        });
    },
});

export const getCiLifecycleMgmtStatuses = tool({
    description: "Retrieves the current operational status for a Configuration Item (CI) in ServiceNow CMDB using the CI Lifecycle Management API. Use this action when you need to check the current operational state of a specific Configuration Item, such as whether it is running, has a problem, or is non-operational. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the Configuration Item (CI) for which to retrieve the current operational status. This is a 32-character hexadecimal string that uniquely identifies the CI record in ServiceNow CMDB. Example: '00a96c0d3790200044e0bfc8bcbe5db4'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/cilifecyclemgmt/statuses/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});

export const getSnCdmSharedLibrariesUploadStatus = tool({
    description: "Retrieves the current status of a shared library upload operation in ServiceNow. Use this action when you need to check whether a library upload has completed successfully, is still in progress, or has failed. The upload_id should be obtained from a previous upload operation response or task. This is a read-only operation that queries the current status without modifying any data.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        uploadId: z.string().describe("The unique identifier of the upload operation to retrieve the status for."),
    }),
    execute: async ({ servicenowCredentials, uploadId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cdm/shared_libraries/upload-status/${encodeURIComponent(uploadId)}`, {
            method: 'GET',
        });
    },
});

export const getSnCicdAppBatchResults = tool({
    description: "Retrieves the results of a batch application install operation from ServiceNow CI/CD. Use this action when you need to check the status and details of a previously initiated batch application install or deployment operation. The result_id should be obtained from the response of the batch operation that was initiated. This is a read-only operation that does not modify any data in ServiceNow. This action is particularly useful for tracking the progress of multi-app deployments or installations, checking individual item success/failure status, and identifying any errors that occurred during the batch operation.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        resultId: z.string().describe("The unique identifier of the batch operation result to retrieve. This is a 32-character hexadecimal string that identifies the batch results record. Obtain this value from the response of a previous batch install operation. Example: 'bb23487e833bf210dd2dc2dfeeaad3c4'"),
    }),
    execute: async ({ servicenowCredentials, resultId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cicd/app/batch/results/${encodeURIComponent(resultId)}`, {
            method: 'GET',
        });
    },
});

export const getSnCicdInstanceScanResult = tool({
    description: "Retrieves the current progress and status of a CI/CD instance scan operation in ServiceNow. Use this action when you need to check the status of an ongoing or completed ServiceNow instance scan that validates configurations, detects issues, or checks compliance. The progress_id should be obtained from the response of a previously initiated instance scan operation. This is a read-only operation that queries the current scan status without modifying any data. This action is typically used in a polling loop after initiating an instance scan to determine when the scan completes and to retrieve the scan results once finished.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        progressId: z.string().describe("The unique identifier for the instance scan progress operation to retrieve. This ID is typically returned from a previous instance scan initiation response. Example: 'test-progress-id-12345' or a system-generated GUID"),
    }),
    execute: async ({ servicenowCredentials, progressId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cicd/instance_scan/result/${encodeURIComponent(progressId)}`, {
            method: 'GET',
        });
    },
});

export const getSnCicdProgress = tool({
    description: "Retrieves the current progress and status of a CI/CD operation in ServiceNow. Use this action when you need to check the status of an ongoing CI/CD pipeline execution, commit operation, or deployment. The progress_id should be obtained from a previous CI/CD operation response. This is a read-only operation that queries the current status without modifying any data.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        progressId: z.string().describe("The unique identifier for the CI/CD progress operation to retrieve. This ID is typically returned from a previous CI/CD operation such as a pipeline execution, commit, or deployment. Example: 'test' or a system-generated GUID"),
    }),
    execute: async ({ servicenowCredentials, progressId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cicd/progress/${encodeURIComponent(progressId)}`, {
            method: 'GET',
        });
    },
});

export const getSnCicdTestsuiteResults = tool({
    description: "Retrieves the results of a test suite run from ServiceNow CI/CD based on the result ID. Use this action when you need to check the status, completion percentage, or final outcome of a previously initiated test suite execution in the ServiceNow CI/CD pipeline. The result_id should be obtained from the response of a test suite run initiation action. This is a read-only operation that queries the current state without modifying any data.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        resultId: z.string().describe("The unique identifier of the test suite result to retrieve. This ID is returned when a test suite run is initiated."),
    }),
    execute: async ({ servicenowCredentials, resultId }) => {
        return snRequest(servicenowCredentials, `/api/sn_cicd/testsuite/results/${encodeURIComponent(resultId)}`, {
            method: 'GET',
        });
    },
});

export const retrieveSnCicdUpdateSet = tool({
    description: "Retrieves an update set with a given sys_id from the ServiceNow CICD (Continuous Integration/Continuous Delivery) plugin. Use this action when you need to retrieve an update set from the CICD plugin to access its contents, including remote updates and application details. This operation is typically used as a preliminary step before deploying or reviewing update set changes through the CICD pipeline. The action requires the sys_id of an existing update set that is available in the CICD system. After successful retrieval, the update set details including its state, application info, and remote updates will be returned.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        updateSetId: z.string().describe("The sys_id of the update set to retrieve from the CICD plugin. This is the unique system identifier assigned to the update set."),
        updateSourceId: z.string().optional().describe("The sys_id of the update source. Either update_source_id or update_source_instance_id is required."),
        updateSourceInstanceId: z.string().optional().describe("The sys_id of the update source instance. Either update_source_id or update_source_instance_id is required."),
    }),
    execute: async ({ servicenowCredentials, updateSetId, updateSourceId, updateSourceInstanceId }) => {
        return snRequest(servicenowCredentials, '/api/sn_cicd/update_set/retrieve', {
            method: 'POST',
            query: {
                update_set_id: updateSetId,
                update_source_id: updateSourceId,
                update_source_instance_id: updateSourceInstanceId,
            },
        });
    },
});
