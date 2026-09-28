// @ts-nocheck
import { listDocuments } from './list-documents.js';
import { getDocument } from './get-document.js';
import { getDocumentText } from './get-document-text.js';
import { createDocument } from './create-document.js';
import { insertText } from './insert-text.js';
import { appendText } from './append-text.js';
import { replaceText } from './replace-text.js';
import { deleteContent } from './delete-content.js';
import { copyDocument } from './copy-document.js';
import { deleteDocument } from './delete-document.js';

export {
  listDocuments,
  getDocument,
  getDocumentText,
  createDocument,
  insertText,
  appendText,
  replaceText,
  deleteContent,
  copyDocument,
  deleteDocument,
};

export const googleDocsTools = [
  {
    name: 'googleDocsListDocuments',
    description: "List Google Docs documents in the user's Drive.",
    tool: listDocuments,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'read' as const,
    keywords: ['files', 'find', 'browse'],
  },
  {
    name: 'googleDocsGetDocument',
    description: 'Get the full Google Docs document structure including title and body content.',
    tool: getDocument,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'read' as const,
    keywords: ['read'],
  },
  {
    name: 'googleDocsGetDocumentText',
    description: 'Get the plain text content of a Google Docs document.',
    tool: getDocumentText,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'read' as const,
    keywords: ['read', 'export', 'plaintext', 'content'],
  },
  {
    name: 'googleDocsCreateDocument',
    description: 'Create a new blank Google Docs document with a title.',
    tool: createDocument,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'write' as const,
    keywords: ['new', 'write', 'doc'],
  },
  {
    name: 'googleDocsInsertText',
    description: 'Insert text at a specific index in a Google Docs document.',
    tool: insertText,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'write' as const,
    keywords: ['edit', 'write', 'type'],
  },
  {
    name: 'googleDocsAppendText',
    description: 'Append text to the end of a Google Docs document.',
    tool: appendText,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'write' as const,
    keywords: ['add', 'write'],
  },
  {
    name: 'googleDocsReplaceText',
    description: 'Find and replace all occurrences of text in a Google Docs document.',
    tool: replaceText,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'write' as const,
    keywords: ['find-replace', 'edit'],
  },
  {
    name: 'googleDocsDeleteContent',
    description: 'Delete a range of content from a Google Docs document.',
    tool: deleteContent,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'clear'],
  },
  {
    name: 'googleDocsCopyDocument',
    description: 'Copy a Google Docs document.',
    tool: copyDocument,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'write' as const,
    keywords: ['duplicate', 'clone'],
  },
  {
    name: 'googleDocsDeleteDocument',
    description: 'Delete a Google Docs document (moves to trash).',
    tool: deleteDocument,
    requiredAuth: 'googleDocsToken' as const,
    scope: 'delete' as const,
    keywords: ['trash', 'remove'],
  },
];
