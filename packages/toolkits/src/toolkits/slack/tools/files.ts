// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackListFiles = tool({
    description:
        'List workspace files (metadata only, not content), filterable by user, channel, date, and type. Only files visible to the caller are returned. Check paging.pages for full pagination.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID to filter by'),
        user: z.string().optional().describe('User ID to filter by'),
        types: z.string().optional().describe('Comma-separated: all,spaces,snippets,images,pdfs,gdocs,zips'),
        tsFrom: z.number().optional().describe('Only files created after this Unix timestamp'),
        tsTo: z.number().optional().describe('Only files created before this Unix timestamp'),
        count: z.string().optional().describe('Files per page (default 100, max 1000)'),
        page: z.string().optional().describe('Page number (default 1)'),
        showFilesHiddenByLimit: z.boolean().optional().describe('Show truncated metadata for limit-hidden files'),
        teamId: z.string().optional().describe('Workspace ID (Enterprise Grid)'),
    }),
    execute: async ({ slackToken, teamId, tsFrom, tsTo, showFilesHiddenByLimit, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.list', {
                ...rest,
                team_id: teamId,
                ts_from: tsFrom,
                ts_to: tsTo,
                show_files_hidden_by_limit: showFilesHiddenByLimit,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list files');
        }
    },
});

export const slackGetFileInfo = tool({
    description:
        'Get detailed metadata and paginated comments for a file by ID. Does not download content — use slackDownloadFile for private URLs. Also retrieves canvases and Slack Lists by file ID.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().describe('File ID, e.g. F123ABCDEF0'),
        count: z.number().optional().describe('Comments per page (default 100)'),
        page: z.number().optional().describe('Comment page number (default 1)'),
        limit: z.number().optional().describe('Max comments to return'),
        cursor: z.string().optional().describe('Comment pagination cursor (preferred over page)'),
    }),
    execute: async ({ slackToken, file, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.info', { file, ...rest });
        } catch (error) {
            return toSlackError(error, 'Failed to get file info');
        }
    },
});

export const slackDeleteFile = tool({
    description:
        'Permanently delete a file by ID, including comments and shares. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().describe('File ID to delete'),
    }),
    execute: async ({ slackToken, file }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.delete', { file });
        } catch (error) {
            return toSlackError(error, 'Failed to delete file');
        }
    },
});

export const slackDeleteFileComment = tool({
    description:
        'Delete a comment from a file by file ID and comment ID. Irreversible.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().describe('File ID containing the comment'),
        id: z.string().describe('Comment ID to delete, e.g. Fc1234567890'),
    }),
    execute: async ({ slackToken, file, id }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.comments.delete', { file, id });
        } catch (error) {
            return toSlackError(error, 'Failed to delete file comment');
        }
    },
});

export const slackShareFilePublicUrl = tool({
    description:
        'Enable public sharing for a file, generating a public URL anyone with the link can open. Verify intent before sharing sensitive files.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().describe('File ID to share publicly, e.g. F0123456789'),
    }),
    execute: async ({ slackToken, file }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.sharedPublicURL', { file });
        } catch (error) {
            return toSlackError(error, 'Failed to share file publicly');
        }
    },
});

export const slackRevokeFilePublicUrl = tool({
    description:
        'Revoke a file public URL, making it private again. No-op when not public; irreversible.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().describe('File ID to make private'),
    }),
    execute: async ({ slackToken, file }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.revokePublicURL', { file });
        } catch (error) {
            return toSlackError(error, 'Failed to revoke file public URL');
        }
    },
});

export const slackDownloadFile = tool({
    description:
        'Get file metadata with authenticated download URLs (url_private, url_private_download). Fetch the URL with the Slack token to download bytes; this tool returns links, not content.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().describe('File ID to download, e.g. F123ABCDEF0'),
        count: z.number().optional().describe('Comments per page'),
        page: z.number().optional().describe('Comment page number'),
        limit: z.number().optional().describe('Max comments to return'),
        cursor: z.string().optional().describe('Comment pagination cursor'),
    }),
    execute: async ({ slackToken, file, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const info = await slackApi(slackToken, 'files.info', { file, ...rest });
            const f = info?.file ?? {};
            return {
                file_info: { name: f.name, title: f.title, mimetype: f.mimetype, size: f.size },
                download_urls: {
                    url_private: f.url_private,
                    url_private_download: f.url_private_download,
                    permalink: f.permalink,
                },
                note: 'Fetch url_private with Authorization: Bearer <slack token> to download the bytes.',
            };
        } catch (error) {
            return toSlackError(error, 'Failed to download file');
        }
    },
});

export const slackUploadFile = tool({
    description:
        'Upload text content as a file to Slack (snippet/post), optionally shared to a channel or thread with a comment. Uses the files.getUploadURLExternal flow. For binary files, share a URL via message instead.',
    inputSchema: z.object({
        slackToken: tokenField,
        content: z.string().describe('Text content to save as a file'),
        filename: z.string().describe('Filename, e.g. report.txt'),
        title: z.string().optional().describe('Title shown in Slack'),
        channels: z.string().optional().describe('Single channel ID to share to (omit to keep private)'),
        initialComment: z.string().optional().describe('Comment introducing the file'),
        threadTs: z.string().optional().describe('Parent message ts to post the file as a thread reply'),
    }),
    execute: async ({ slackToken, content, filename, title, channels, initialComment, threadTs }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const length = new TextEncoder().encode(content).length;
            const urlData = await slackApi(slackToken, 'files.getUploadURLExternal', { filename, length });
            if (!urlData?.upload_url || !urlData?.file_id) {
                return { error: 'Failed to get upload URL', details: urlData };
            }
            const putRes = await fetch(urlData.upload_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: content,
            });
            if (!putRes.ok) {
                return { error: 'Failed to upload file bytes', details: { status: putRes.status } };
            }
            return await slackApi(slackToken, 'files.completeUploadExternal', {
                files: JSON.stringify([{ id: urlData.file_id, title: title ?? filename }]),
                channel_id: channels,
                initial_comment: initialComment,
                thread_ts: threadTs,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to upload file');
        }
    },
});

export const slackAddRemoteFile = tool({
    description:
        'Register an external file (Google Drive, Dropbox, etc.) with Slack for discovery and sharing. Requires a stable external_id and a reachable external_url.',
    inputSchema: z.object({
        slackToken: tokenField,
        title: z.string().describe('Title shown in Slack'),
        externalId: z.string().describe('Your stable unique ID for the file (for later update/delete)'),
        externalUrl: z.string().describe('Reachable URL of the file'),
        filetype: z.string().optional().describe("File type, e.g. 'pdf', 'docx', 'gdoc'"),
        previewImage: z.string().optional().describe('Base64-encoded preview thumbnail'),
        indexableFileContents: z.string().optional().describe('Plain text for Slack search indexing'),
    }),
    execute: async ({ slackToken, title, externalId, externalUrl, filetype, previewImage, indexableFileContents }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.remote.add', {
                title,
                external_id: externalId,
                external_url: externalUrl,
                filetype,
                preview_image: previewImage,
                indexable_file_contents: indexableFileContents,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to add remote file');
        }
    },
});

export const slackGetRemoteFile = tool({
    description:
        'Get info about a remote file by Slack file ID or your external_id. Remote files only — not for Slack-hosted uploads.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().optional().describe('Slack file ID, e.g. F2147483862'),
        externalId: z.string().optional().describe('Your external ID from files.remote.add'),
    }),
    execute: async ({ slackToken, file, externalId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (!file && !externalId) {
                return { error: 'Provide file or externalId.' };
            }
            return await slackApi(slackToken, 'files.remote.info', { file, external_id: externalId });
        } catch (error) {
            return toSlackError(error, 'Failed to get remote file');
        }
    },
});

export const slackUpdateRemoteFile = tool({
    description:
        'Update metadata of a registered remote file (title, URL, type, preview, searchable text). Identify by file or external_id; cannot change the file type fundamentally.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().optional().describe('Slack file ID, e.g. F12345678'),
        externalId: z.string().optional().describe('Your external ID for the file'),
        title: z.string().optional().describe('New title'),
        externalUrl: z.string().optional().describe('New public URL'),
        filetype: z.string().optional().describe("New file type, e.g. 'pdf', 'gdoc'"),
        previewImage: z.string().optional().describe('New preview image (URL or base64, max 1MB)'),
        indexableFileContents: z.string().optional().describe('New searchable text (max 1MB)'),
    }),
    execute: async ({ slackToken, file, externalId, ...updates }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (!file && !externalId) {
                return { error: 'Provide file or externalId.' };
            }
            return await slackApi(slackToken, 'files.remote.update', {
                file,
                external_id: externalId,
                title: updates.title,
                external_url: updates.externalUrl,
                filetype: updates.filetype,
                preview_image: updates.previewImage,
                indexable_file_contents: updates.indexableFileContents,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update remote file');
        }
    },
});

export const slackRemoveRemoteFile = tool({
    description:
        'Remove the Slack reference to a remote file by file or external_id. The external file itself is untouched.',
    inputSchema: z.object({
        slackToken: tokenField,
        file: z.string().optional().describe('Slack file ID, e.g. F0123ABCDEF'),
        externalId: z.string().optional().describe('Your external ID for the file'),
    }),
    execute: async ({ slackToken, file, externalId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (!file && !externalId) {
                return { error: 'Provide file or externalId.' };
            }
            return await slackApi(slackToken, 'files.remote.remove', { file, external_id: externalId });
        } catch (error) {
            return toSlackError(error, 'Failed to remove remote file');
        }
    },
});

export const slackShareRemoteFile = tool({
    description:
        'Share a registered remote file into channels or DMs by comma-separated IDs. The file must already be registered.',
    inputSchema: z.object({
        slackToken: tokenField,
        channels: z.string().describe('Comma-separated channel/DM IDs, e.g. C0123456789,D0987654321'),
        file: z.string().optional().describe('Slack file ID'),
        externalId: z.string().optional().describe('Your external ID for the file'),
    }),
    execute: async ({ slackToken, channels, file, externalId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (!file && !externalId) {
                return { error: 'Provide file or externalId.' };
            }
            return await slackApi(slackToken, 'files.remote.share', {
                channels,
                file,
                external_id: externalId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to share remote file');
        }
    },
});

export const slackListRemoteFiles = tool({
    description:
        'List team remote files, filterable by channel and creation timestamps. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID to filter by'),
        tsFrom: z.number().optional().describe('Only files created after this timestamp'),
        tsTo: z.number().optional().describe('Only files created before this timestamp'),
        limit: z.number().optional().describe('Max files per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, tsFrom, tsTo, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'files.remote.list', {
                ...rest,
                ts_from: tsFrom,
                ts_to: tsTo,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list remote files');
        }
    },
});
