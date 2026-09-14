// @ts-nocheck
import { listFiles } from './list-files.js';
import { getFile } from './get-file.js';
import { searchFiles } from './search-files.js';
import { createFolder } from './create-folder.js';
import { uploadFile } from './upload-file.js';
import { downloadFile } from './download-file.js';
import { updateFile } from './update-file.js';
import { copyFile } from './copy-file.js';
import { moveFile } from './move-file.js';
import { deleteFile } from './delete-file.js';

export {
    listFiles,
    getFile,
    searchFiles,
    createFolder,
    uploadFile,
    downloadFile,
    updateFile,
    copyFile,
    moveFile,
    deleteFile,
};

export const googleDriveTools = [
    {
        name: 'googleDriveListFiles',
        description: 'List files and folders in Google Drive.',
        tool: listFiles,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleDriveGetFile',
        description: 'Get metadata for a file or folder in Google Drive by ID.',
        tool: getFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleDriveSearchFiles',
        description: 'Search for files and folders in Google Drive using a Drive query.',
        tool: searchFiles,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleDriveCreateFolder',
        description: 'Create a new folder in Google Drive.',
        tool: createFolder,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleDriveUploadFile',
        description: 'Upload a file to Google Drive using multipart upload.',
        tool: uploadFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleDriveDownloadFile',
        description: 'Download file content from Google Drive.',
        tool: downloadFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleDriveUpdateFile',
        description: 'Update file metadata in Google Drive (rename, description).',
        tool: updateFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleDriveCopyFile',
        description: 'Copy a file in Google Drive.',
        tool: copyFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleDriveMoveFile',
        description: 'Move a file or folder to a different parent folder in Google Drive.',
        tool: moveFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleDriveDeleteFile',
        description: 'Delete a file or folder in Google Drive (moves to trash).',
        tool: deleteFile,
        requiredAuth: 'googleDriveToken' as const,
        scope: 'delete' as const,
    },
];
