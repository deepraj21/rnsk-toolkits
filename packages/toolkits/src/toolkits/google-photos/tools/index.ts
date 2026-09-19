// @ts-nocheck
import { addEnrichment, batchAddMediaItems, createAlbum, getAlbum, listAlbums, updateAlbum } from './albums.js';
import {
    batchCreateMediaItems,
    uploadMedia,
} from './uploads.js';
import { batchGetMediaItems, downloadMediaItem, listMediaItems, searchMediaItems, updateMediaItem } from './media.js';

export {
    addEnrichment,
    batchAddMediaItems,
    createAlbum,
    getAlbum,
    listAlbums,
    updateAlbum,
    batchCreateMediaItems,
    uploadMedia,
    batchGetMediaItems,
    downloadMediaItem,
    listMediaItems,
    searchMediaItems,
    updateMediaItem,
};

const auth = 'googlePhotosToken' as const;

export const googlePhotosTools = [
    { name: 'googlePhotosCreateAlbum', description: 'Creates an album with a title.', tool: createAlbum, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosGetAlbum', description: 'Gets an album by ID.', tool: getAlbum, requiredAuth: auth, scope: 'read' as const },
    { name: 'googlePhotosListAlbums', description: 'Lists albums in the Albums tab.', tool: listAlbums, requiredAuth: auth, scope: 'read' as const },
    { name: 'googlePhotosUpdateAlbum', description: 'Updates an app-created album title and/or cover photo.', tool: updateAlbum, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosAddEnrichment', description: 'Adds a text, location, or map enrichment at an album position.', tool: addEnrichment, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosBatchAddMediaItems', description: 'Adds up to 50 app-created items to an app-created album.', tool: batchAddMediaItems, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosBatchCreateMediaItems', description: 'Uploads up to 50 files from URLs and creates media items.', tool: batchCreateMediaItems, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosUploadMedia', description: 'Uploads one file from a URL and creates the media item.', tool: uploadMedia, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosBatchGetMediaItems', description: 'Gets up to 50 media items by ID.', tool: batchGetMediaItems, requiredAuth: auth, scope: 'read' as const },
    { name: 'googlePhotosListMediaItems', description: 'Lists app-created media items (full library needs Picker API).', tool: listMediaItems, requiredAuth: auth, scope: 'read' as const },
    { name: 'googlePhotosSearchMediaItems', description: 'Searches app-created media by album, date, content, or type.', tool: searchMediaItems, requiredAuth: auth, scope: 'read' as const },
    { name: 'googlePhotosUpdateMediaItem', description: 'Updates a media item description.', tool: updateMediaItem, requiredAuth: auth, scope: 'write' as const },
    { name: 'googlePhotosDownloadMediaItem', description: 'Downloads media item bytes (base64).', tool: downloadMediaItem, requiredAuth: auth, scope: 'read' as const },
];
