// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest } from './client.js';

export const uploadAttachment = tool({
    description: "Attaches a file to a specified record in a ServiceNow table. This action uploads a file and associates it with a specific record (e.g., incident, problem, change request). The file will be visible in the ServiceNow UI under the record's attachments section. Common use cases: - Attach screenshots to incident reports - Upload documents to change requests - Add log files to problem records - Store evidence files for security incidents The action returns complete attachment metadata including download link, file size, and creation details. Note: This action permanently modifies a live ServiceNow instance — attachments cannot be bulk-removed once added.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        fileName: z.string().describe("Name to give the attachment (e.g., 'report.pdf', 'screenshot.png'). This will be the visible filename in ServiceNow."),
        tableName: z.string().describe("Name of the ServiceNow table to attach the file to (e.g., 'incident', 'problem', 'change_request')."),
        creationTime: z.string().optional().describe("Creation date and time of the attachment. Use this parameter to capture attachment creation times when the Now Mobile app is offline and the attachment is uploaded to a record at a later time."),
        recordSysId: z.string().optional().describe("Sys_id of the specific record in the table to attach the file to. This is the unique identifier of the record (e.g., incident sys_id)."),
        fileToUpload: z.any().optional().describe("File to upload."),
        encryptionContext: z.string().optional().describe("Sys_id of an encryption context record. Specify this parameter to allow only users with the specified encryption context to access the attachment. For additional information on encryption context records, see https://www.servicenow.com/docs/csh?topicname=column-level-encryption-landing&version=yokohama&pubname=yokohama-platform-security."),
        tableSysId: z.string().describe("Sys_id of the record to attach the file to. This is the unique identifier of the record."),
        content: z.string().optional().describe("Inline file content as a string. Use this OR 'file_content' field, not both. The content will be encoded as UTF-8 bytes for upload."),
        contentType: z.string().optional().describe("MIME type of the content. Defaults to 'text/plain' if not specified. Only used when 'content' field is provided."),
    }),
    execute: async ({ servicenowCredentials, fileName, tableName, creationTime, recordSysId, fileToUpload, encryptionContext, tableSysId, content, contentType }) => {
        const query = {
            table_name: tableName,
            table_sys_id: tableSysId ?? recordSysId,
            file_name: fileName,
            creation_time: creationTime,
            encryption_context: encryptionContext,
        };
        let filePart;
        if (typeof fileToUpload === 'string') {
            filePart = new Blob([fileToUpload], { type: contentType ?? 'text/plain' });
        } else if (fileToUpload && typeof fileToUpload === 'object' && typeof fileToUpload.arrayBuffer === 'function') {
            filePart = fileToUpload;
        } else if (fileToUpload && typeof fileToUpload === 'object') {
            const inline = fileToUpload.data ?? fileToUpload.content ?? fileToUpload.fileContent ?? fileToUpload;
            filePart = new Blob([typeof inline === 'string' ? inline : JSON.stringify(inline)], { type: fileToUpload.mimeType ?? fileToUpload.contentType ?? contentType ?? 'text/plain' });
        } else if (content !== undefined) {
            filePart = new Blob([content], { type: contentType ?? 'text/plain' });
        }
        const formData = new FormData();
        if (filePart) {
            formData.append('file', filePart, fileName);
        }
        return snRequest(servicenowCredentials, '/api/now/attachment/file', {
            method: 'POST',
            query,
            ...(filePart ? { formData } : {}),
        });
    },
});

export const getAttachmentList = tool({
    description: "Retrieves attachment metadata from ServiceNow's sys_attachment table. This endpoint queries file attachments and returns metadata including file name, size, content type, download links, and associated table information. Use sysparm_query to filter by file name, table name, content type, or other attachment properties. Note: This returns metadata only; use the download_link in the response to retrieve actual file content.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.string().optional().describe("Limit to be applied on pagination. Note: Unusually large sysparm_limit values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query. Queries for the Attachment API are relative to the Attachments [sys_attachment] table. For example: (sysparm_query=file_name=attachment.doc) The encoded query provides support for order by. To sort responses based on certain fields, use the ORDERBY and ORDERBYDESC clauses in sysparm_query. For example, sysparm_query=ORDERBYfile_name^ORDERBYDESCtable_Name orders the results in ascending order by name first, then in descending order by table name."),
        sysparmOffset: z.string().optional().describe("Number of records to exclude from the query. Use this parameter to get more records than specified in sysparm_limit parameter. For example, if sysparm_limit is set to 500, but there are additional records you want to query, you can specify a sysparm_offset parameter value of 500 to get the second set of records."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmQuery, sysparmOffset }) => {
        return snRequest(servicenowCredentials, '/api/now/attachment', {
            method: 'GET',
            query: {
                sysparm_limit: sysparmLimit,
                sysparm_query: sysparmQuery,
                sysparm_offset: sysparmOffset,
            },
        });
    },
});

export const getAttachment = tool({
    description: "Retrieves metadata for a specific attachment by its sys_id from ServiceNow. Use this action when you need to fetch information about a single attachment file, such as its file name, content type, size, and associated record details. This action returns metadata only; to download the actual file content, use the download_link from the FindFile action or access the file directly via the ServiceNow attachment API.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The sys_id of the attachment to retrieve. This is the unique identifier assigned to the attachment when it was created."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/attachment/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});

export const downloadAttachment = tool({
    description: "Downloads the binary file attachment with the specified sys_id from ServiceNow. Use this action when you need to retrieve the actual file content of an attachment that was previously uploaded to a ServiceNow record (e.g., incident, problem, change_request). This action returns the raw binary file data which can then be saved locally or processed further. The attachment sys_id can be obtained from the 'FindFile' action or from the ServiceNow UI.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("Sys_id of the attachment to download. This is the unique identifier of the attachment record in ServiceNow."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/attachment/file/${encodeURIComponent(sysId)}`, {
            method: 'GET',
            expectBinary: true,
        });
    },
});

export const deleteAttachment = tool({
    description: "Permanently deletes a specific attachment from ServiceNow using its sys_id. This is a destructive, irreversible operation — the attachment cannot be recovered once deleted. Requires the user to have delete permissions on the attachment. If the attachment doesn't exist or the user lacks permissions, an error will be returned. This action should be used when you have the specific sys_id of an attachment to remove (obtained from FindFile action). Use when you need to remove a specific file attachment from a record and know its sys_id.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the attachment to delete. This is a 32-character hexadecimal string that uniquely identifies the attachment record in ServiceNow. Example: '003a3ef24ff1120031577d2ca310c74b'. The attachment must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/attachment/${encodeURIComponent(sysId)}`, {
            method: 'DELETE',
        });
    },
});

export const deleteCsmAttachment = tool({
    description: "Permanently deletes a specific CSM (Customer Service Management) attachment from ServiceNow using its sys_id. This is a destructive, irreversible operation — the CSM attachment cannot be recovered once deleted. Requires the user to have delete permissions on the attachment. If the attachment doesn't exist or the user lacks permissions, an error will be returned. This action specifically targets attachments associated with CSM records (cases, etc.). Use when you need to remove a specific file attachment from a CSM record and know its sys_id.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the CSM attachment to delete. This is a 32-character hexadecimal string that uniquely identifies the attachment record in ServiceNow. Example: '260380fa833bf210dd2dc2dfeeaad3c1'. The attachment must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/now/v1/attachment_csm/${encodeURIComponent(sysId)}`, {
            method: 'DELETE',
        });
    },
});
