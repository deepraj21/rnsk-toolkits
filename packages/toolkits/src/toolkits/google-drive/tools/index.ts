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
    keywords: ['browse', 'folder', 'documents'],
    tool: listFiles,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'googleDriveGetFile',
    description: 'Get metadata for a file or folder in Google Drive by ID.',
    keywords: ['info', 'metadata'],
    tool: getFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'googleDriveSearchFiles',
    description: 'Search for files and folders in Google Drive using a Drive query.',
    keywords: ['find', 'lookup', 'document', 'documents'],
    tool: searchFiles,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'googleDriveCreateFolder',
    description: 'Create a new folder in Google Drive.',
    keywords: ['new', 'directory', 'mkdir'],
    tool: createFolder,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'write' as const,
  },
  {
    name: 'googleDriveUploadFile',
    description: 'Upload a file to Google Drive using multipart upload.',
    keywords: ['import', 'add'],
    tool: uploadFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'write' as const,
  },
  {
    name: 'googleDriveDownloadFile',
    description: 'Download file content from Google Drive.',
    keywords: ['export', 'save'],
    tool: downloadFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'googleDriveUpdateFile',
    description: 'Update file metadata in Google Drive (rename, description).',
    keywords: ['rename', 'edit'],
    tool: updateFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'write' as const,
  },
  {
    name: 'googleDriveCopyFile',
    description: 'Copy a file in Google Drive.',
    keywords: ['duplicate', 'clone'],
    tool: copyFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'write' as const,
  },
  {
    name: 'googleDriveMoveFile',
    description: 'Move a file or folder to a different parent folder in Google Drive.',
    keywords: ['relocate', 'organize'],
    tool: moveFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'write' as const,
  },
  {
    name: 'googleDriveDeleteFile',
    description: 'Delete a file or folder in Google Drive (moves to trash).',
    keywords: ['trash', 'remove'],
    tool: deleteFile,
    requiredAuth: 'googleDriveToken' as const,
    scope: 'delete' as const,
  },
];
