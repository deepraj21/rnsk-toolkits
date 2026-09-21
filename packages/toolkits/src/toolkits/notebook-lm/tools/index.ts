// @ts-nocheck
import { addTextSources } from './add-text-sources.js';
import { createAudioOverview } from './create-audio-overview.js';
import { createNotebook } from './create-notebook.js';
import { deleteAudioOverview } from './delete-audio-overview.js';
import { deleteNotebooks } from './delete-notebooks.js';
import { deleteSources } from './delete-sources.js';
import { getNotebook } from './get-notebook.js';
import { getSource } from './get-source.js';
import { listRecentNotebooks } from './list-recent-notebooks.js';
import { shareNotebook } from './share-notebook.js';
import { uploadSourceFile } from './upload-source-file.js';

export {
    addTextSources,
    createAudioOverview,
    createNotebook,
    deleteAudioOverview,
    deleteNotebooks,
    deleteSources,
    getNotebook,
    getSource,
    listRecentNotebooks,
    shareNotebook,
    uploadSourceFile,
};

export const notebookLmTools = [
    {
        name: 'notebookLmCreateNotebook',
        description: 'Create a NotebookLM Enterprise notebook in a licensed Google Cloud project and location.',
        tool: createNotebook,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'notebookLmGetNotebook',
        description: 'Retrieve a NotebookLM Enterprise notebook and its current source metadata.',
        tool: getNotebook,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'notebookLmListRecentNotebooks',
        description: 'List up to 500 NotebookLM Enterprise notebooks ordered by when the connected user last viewed them.',
        tool: listRecentNotebooks,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'notebookLmDeleteNotebooks',
        description: 'Permanently delete one or more NotebookLM Enterprise notebooks by notebook ID.',
        tool: deleteNotebooks,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'notebookLmShareNotebook',
        description: 'Grant, change, or remove account access to a NotebookLM Enterprise notebook.',
        tool: shareNotebook,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'notebookLmAddTextSources',
        description: 'Add one or more named raw-text sources to a NotebookLM Enterprise notebook.',
        tool: addTextSources,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'notebookLmUploadSourceFile',
        description: 'Upload a plain-text file as a source in a NotebookLM Enterprise notebook.',
        tool: uploadSourceFile,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'notebookLmGetSource',
        description: 'Retrieve a notebook source ingestion status, metadata, and failure reason.',
        tool: getSource,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'notebookLmDeleteSources',
        description: 'Permanently remove one or more sources from a NotebookLM Enterprise notebook.',
        tool: deleteSources,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'notebookLmCreateAudioOverview',
        description: 'Start asynchronous generation of a NotebookLM Enterprise audio overview from selected notebook sources.',
        tool: createAudioOverview,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'notebookLmDeleteAudioOverview',
        description: 'Permanently delete an audio overview from a NotebookLM Enterprise notebook. If still generating, this permanently cancels generation.',
        tool: deleteAudioOverview,
        requiredAuth: 'notebookLmToken' as const,
        scope: 'delete' as const,
    },
];
