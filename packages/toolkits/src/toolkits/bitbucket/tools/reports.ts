// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketCreateCommitReportAnnotations = tool({
    description: "Adds multiple annotations to a commit report in bulk. Use when you need to add code analysis findings (vulnerabilities, code smells, bugs) to a report attached to a specific commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to which the report belongs. This is the full SHA-1 commit identifier."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) that contains the commit."),
        reportId: z.string().describe("The unique identifier of the report to which annotations will be added."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
        annotations: z.array(z.object({ external_id: z.string().describe("External ID for the annotation"), annotation_type: z.enum(["VULNERABILITY", "CODE_SMELL", "BUG"]).describe("Annotation type"), path: z.string().describe("File path the annotation applies to"), line: z.number().int().min(0).describe("Line number, 0 for file-level"), summary: z.string().describe("Short summary"), severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Severity"), link: z.string().optional().describe("Optional URL with more info"), details: z.string().optional().describe("Detailed description") })).describe("Array of annotation objects to be added to the report. Each annotation must have path, line, summary, and severity."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, reportId, annotations }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body = annotations.map((a) => ({
                external_id: a.external_id,
                annotation_type: a.annotation_type,
                path: a.path,
                line: a.line,
                summary: a.summary,
                severity: a.severity,
                ...(a.link !== undefined ? { link: a.link } : {}),
                ...(a.details !== undefined ? { details: a.details } : {}),
            }));
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports/${enc(reportId)}/annotations`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create commit report annotations");
        }
    },
});

export const bitbucketGetCommitReport = tool({
    description: "Returns a single report matching the provided ID from a commit. Use when you need to retrieve details of a specific analysis report (e.g., security scan, code coverage, test results, or bug report) for a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to which the report belongs. This is the full SHA-1 commit identifier."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) that contains the commit."),
        reportId: z.string().describe("Either the uuid or external-id of the report to retrieve."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, reportId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports/${enc(reportId)}`);
        } catch (error) {
            return toBbError(error, "Failed to get commit report");
        }
    },
});

export const bitbucketListCommitReports = tool({
    description: "Tool to get reports linked to a specific commit. Use when you need to retrieve analysis results, test reports, security scans, or code coverage data associated with a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to retrieve reports for."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports`);
        } catch (error) {
            return toBbError(error, "Failed to list commit reports");
        }
    },
});

export const bitbucketGetCommitReportAnnotation = tool({
    description: "Returns a single annotation matching the provided ID from a commit report. Use when you need to retrieve details of a specific code analysis finding (e.g., vulnerability, code smell, or bug) identified in a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to which the report belongs. This is the full SHA-1 commit identifier."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) that contains the commit."),
        reportId: z.string().describe("Either the uuid or external-id of the report that contains the annotation."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
        annotationId: z.string().describe("Either the uuid or external-id of the annotation to retrieve."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, reportId, annotationId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports/${enc(reportId)}/annotations/${enc(annotationId)}`);
        } catch (error) {
            return toBbError(error, "Failed to get commit report annotation");
        }
    },
});

export const bitbucketDeleteCommitReportAnnotation = tool({
    description: "Deletes a single annotation matching the provided ID from a commit report. Use when you need to remove a specific annotation from a code analysis report.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to which the report belongs. This is the full SHA-1 commit identifier."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) that contains the commit."),
        reportId: z.string().describe("The unique identifier of the report that contains the annotation."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
        annotationId: z.string().describe("The unique identifier of the annotation to delete."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, reportId, annotationId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports/${enc(reportId)}/annotations/${enc(annotationId)}`);
        } catch (error) {
            return toBbError(error, "Failed to delete commit report annotation");
        }
    },
});

export const bitbucketUpdateCommitReportAnnotation = tool({
    description: "Creates or updates an individual annotation for a commit report. Use when you need to add or modify code analysis findings (vulnerabilities, code smells, or bugs) identified in a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        line: z.number().int().min(1).optional().describe("Line number in the file where the finding occurs. Must be a positive integer."),
        link: z.string().optional().describe("URL providing more information about the finding, such as documentation or issue tracker link."),
        path: z.string().optional().describe("File path where the annotation applies, relative to the repository root."),
        commit: z.string().describe("The commit hash to which the report belongs. This is the full SHA-1 commit identifier."),
        result: z.enum(["PASSED", "FAILED", "IGNORED", "SKIPPED"]).optional().describe("Enumeration of annotation result statuses."),
        details: z.string().optional().describe("Extended description providing additional context, remediation guidance, or technical details about the finding."),
        summary: z.string().describe("Brief description of the finding. Should concisely explain what was detected."),
        severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Impact level of the finding. CRITICAL for severe issues requiring immediate attention, HIGH for important issues, MEDIUM for moderate concerns, LOW for minor issues."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) that contains the commit."),
        reportId: z.string().describe("Either the uuid or external-id of the report that will contain the annotation."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
        externalId: z.string().optional().describe("Unique identifier for tracking this annotation in an external system. Useful for correlating with external tools."),
        annotationId: z.string().describe("Either the uuid or external-id of the annotation to create or update."),
        annotationType: z.enum(["VULNERABILITY", "CODE_SMELL", "BUG"]).describe("Type of annotation indicating the nature of the finding: VULNERABILITY for security issues, CODE_SMELL for maintainability issues, or BUG for functional defects."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, reportId, annotationId, annotationType, summary, severity, line, link, path, result, details, externalId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {
                annotation_type: annotationType,
                summary,
                severity,
            };
            if (externalId !== undefined) body.external_id = externalId;
            if (path !== undefined) body.path = path;
            if (line !== undefined) body.line = line;
            if (link !== undefined) body.link = link;
            if (details !== undefined) body.details = details;
            if (result !== undefined) body.result = result;
            return await bbRequest(bitbucketToken, 'PUT', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports/${enc(reportId)}/annotations/${enc(annotationId)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update commit report annotation");
        }
    },
});

export const bitbucketUpdateCommitInsightReport = tool({
    description: "Create or update an insight report for a commit. Creates a new report if it doesn't exist, or replaces the existing one if a report already exists for the given repository, commit, and report key. Note: replacing an existing report will be rejected if the authenticated user was not the creator of the specified report.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        data: z.array(z.object({ type: z.enum(["DURATION", "BOOLEAN", "NUMBER", "PERCENTAGE", "TEXT", "LINK", "DATE"]).describe("Data item type"), title: z.string().describe("Label for the data item"), value: z.union([z.string(), z.number(), z.boolean()]).describe("Value matching the data type") })).max(6).optional().describe("Array of data items containing additional information about the report. Maximum 6 items."),
        link: z.string().optional().describe("An external link providing more information about the report. Must be a valid HTTP/HTTPS URL."),
        title: z.string().describe("The title of the report. Maximum 450 characters."),
        commit: z.string().describe("The commit hash to which the report belongs. This is the full SHA-1 commit identifier (40 characters)."),
        result: z.enum(["PASSED", "FAILED", "PENDING"]).optional().describe("Enum for report results."),
        details: z.string().describe("Detailed description of the report. Maximum 2000 characters. Supports escaped newlines."),
        logoUrl: z.string().optional().describe("URL to the logo image for the reporting tool. Must be a valid HTTP/HTTPS URL."),
        reporter: z.string().optional().describe("The name of the system or tool that created the report. Maximum 450 characters."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) that contains the commit."),
        reportId: z.string().describe("Unique identifier for the report. Recommend using reverse DNS namespacing (e.g., 'com.company.tool.report-name')."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
        reportType: z.enum(["SECURITY", "COVERAGE", "TEST", "BUG"]).describe("The type of report: SECURITY, COVERAGE, TEST, or BUG."),
        remoteLinkEnabled: z.boolean().optional().describe("Whether remote link is enabled for the report."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, reportId, title, details, reportType, data, link, result, logoUrl, reporter, remoteLinkEnabled }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { title, details, report_type: reportType };
            if (reporter !== undefined) body.reporter = reporter;
            if (result !== undefined) body.result = result;
            if (link !== undefined) body.link = link;
            if (logoUrl !== undefined) body.logo_url = logoUrl;
            if (remoteLinkEnabled !== undefined) body.remote_link_enabled = remoteLinkEnabled;
            if (data !== undefined) body.data = data;
            return await bbRequest(bitbucketToken, 'PUT', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/reports/${enc(reportId)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update commit insight report");
        }
    },
});
