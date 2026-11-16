// @ts-nocheck
import type { ToolDefinition } from '../../../core/types.js';
import { spotifySearch } from './search.js';
import { spotifyGetTrack } from './get-track.js';
import { spotifyGetAlbum } from './get-album.js';
import { spotifyGetAlbumTracks } from './get-album-tracks.js';
import { spotifyGetArtist } from './get-artist.js';
import { spotifyGetArtistAlbums } from './get-artist-albums.js';
import { spotifyGetEpisode } from './get-episode.js';
import { spotifyGetShow } from './get-show.js';
import { spotifyGetShowEpisodes } from './get-show-episodes.js';
import { spotifyGetAudiobook } from './get-audiobook.js';
import { spotifyGetAudiobookChapters } from './get-audiobook-chapters.js';
import { spotifyGetChapter } from './get-chapter.js';
import { spotifyGetCurrentUser } from './get-current-user.js';
import { spotifyGetTopItems } from './get-top-items.js';
import { spotifyGetFollowedArtists } from './get-followed-artists.js';
import { spotifyGetSavedItems } from './get-saved-items.js';
import { spotifyCheckLibraryItems } from './check-library-items.js';
import { spotifySaveLibraryItems } from './save-library-items.js';
import { spotifyRemoveLibraryItems } from './remove-library-items.js';
import { spotifyGetPlaylist } from './get-playlist.js';
import { spotifyGetPlaylistItems } from './get-playlist-items.js';
import { spotifyGetMyPlaylists } from './get-my-playlists.js';
import { spotifyGetPlaylistCover } from './get-playlist-cover.js';
import { spotifyCreatePlaylist } from './create-playlist.js';
import { spotifyUpdatePlaylistDetails } from './update-playlist-details.js';
import { spotifyAddPlaylistItems } from './add-playlist-items.js';
import { spotifyReplacePlaylistItems } from './replace-playlist-items.js';
import { spotifyRemovePlaylistItems } from './remove-playlist-items.js';
import { spotifyUploadPlaylistCover } from './upload-playlist-cover.js';
import { spotifyGetPlaybackState } from './get-playback-state.js';
import { spotifyGetCurrentlyPlaying } from './get-currently-playing.js';
import { spotifyGetDevices } from './get-devices.js';
import { spotifyGetQueue } from './get-queue.js';
import { spotifyGetRecentlyPlayed } from './get-recently-played.js';
import { spotifyStartPlayback } from './start-playback.js';
import { spotifyPausePlayback } from './pause-playback.js';
import { spotifySkipToNext } from './skip-to-next.js';
import { spotifySkipToPrevious } from './skip-to-previous.js';
import { spotifySeekToPosition } from './seek-to-position.js';
import { spotifySetVolume } from './set-volume.js';
import { spotifyToggleShuffle } from './toggle-shuffle.js';
import { spotifySetRepeatMode } from './set-repeat-mode.js';
import { spotifyTransferPlayback } from './transfer-playback.js';
import { spotifyAddToQueue } from './add-to-queue.js';

export {
  spotifySearch,
  spotifyGetTrack,
  spotifyGetAlbum,
  spotifyGetAlbumTracks,
  spotifyGetArtist,
  spotifyGetArtistAlbums,
  spotifyGetEpisode,
  spotifyGetShow,
  spotifyGetShowEpisodes,
  spotifyGetAudiobook,
  spotifyGetAudiobookChapters,
  spotifyGetChapter,
  spotifyGetCurrentUser,
  spotifyGetTopItems,
  spotifyGetFollowedArtists,
  spotifyGetSavedItems,
  spotifyCheckLibraryItems,
  spotifySaveLibraryItems,
  spotifyRemoveLibraryItems,
  spotifyGetPlaylist,
  spotifyGetPlaylistItems,
  spotifyGetMyPlaylists,
  spotifyGetPlaylistCover,
  spotifyCreatePlaylist,
  spotifyUpdatePlaylistDetails,
  spotifyAddPlaylistItems,
  spotifyReplacePlaylistItems,
  spotifyRemovePlaylistItems,
  spotifyUploadPlaylistCover,
  spotifyGetPlaybackState,
  spotifyGetCurrentlyPlaying,
  spotifyGetDevices,
  spotifyGetQueue,
  spotifyGetRecentlyPlayed,
  spotifyStartPlayback,
  spotifyPausePlayback,
  spotifySkipToNext,
  spotifySkipToPrevious,
  spotifySeekToPosition,
  spotifySetVolume,
  spotifyToggleShuffle,
  spotifySetRepeatMode,
  spotifyTransferPlayback,
  spotifyAddToQueue,
};

export const spotifyTools: ToolDefinition[] = [
  {
    name: 'spotifySearch',
    description:
      "Searches Spotify's catalog for tracks, albums, artists, playlists, shows, episodes, and audiobooks. Returns up to 10 results per requested type with paging — use the returned IDs/URIs with the other Spotify tools.",
    tool: spotifySearch,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'find', 'lookup', 'song', 'podcast', 'artist', 'album'],
  },
  {
    name: 'spotifyGetTrack',
    description:
      'Gets full catalog details for one track — artists, album, duration, popularity, markets. Accepts a track ID, spotify:track: URI, or open.spotify.com URL.',
    tool: spotifyGetTrack,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'track', 'song', 'details', 'metadata'],
  },
  {
    name: 'spotifyGetAlbum',
    description:
      'Gets full catalog details for one album — artists, release date, label, copyrights, images, and its first page of tracks. Accepts an album ID, URI, or URL.',
    tool: spotifyGetAlbum,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'album', 'record', 'release', 'details'],
  },
  {
    name: 'spotifyGetAlbumTracks',
    description:
      "Gets a page of an album's tracks as a paging object (limit/offset). Use to enumerate an album beyond the first page returned by spotifyGetAlbum.",
    tool: spotifyGetAlbumTracks,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'album', 'tracks', 'songs', 'page'],
  },
  {
    name: 'spotifyGetArtist',
    description:
      'Gets full catalog details for one artist — genres, popularity, followers, images. Accepts an artist ID, spotify:artist: URI, or open.spotify.com URL.',
    tool: spotifyGetArtist,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'artist', 'band', 'musician', 'details'],
  },
  {
    name: 'spotifyGetArtistAlbums',
    description:
      "Gets a page of an artist's albums (max 10 per call), filterable by release group (album/single/appears_on/compilation) and country.",
    tool: spotifyGetArtistAlbums,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'artist', 'discography', 'albums', 'releases'],
  },
  {
    name: 'spotifyGetEpisode',
    description:
      'Gets full catalog details for one podcast episode — description, duration, preview URL, release date, and its show. Accepts an episode ID, URI, or URL. Needs user-read-playback-position.',
    tool: spotifyGetEpisode,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'episode', 'podcast', 'show', 'details'],
  },
  {
    name: 'spotifyGetShow',
    description:
      'Gets full catalog details for a podcast/show — publisher, total episodes, languages, images. Accepts a show ID, URI, or URL. Needs user-read-playback-position.',
    tool: spotifyGetShow,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'show', 'podcast', 'series', 'details'],
  },
  {
    name: 'spotifyGetShowEpisodes',
    description:
      "Gets a page of a podcast's episodes as a paging object (limit/offset). Needs user-read-playback-position.",
    tool: spotifyGetShowEpisodes,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'show', 'episodes', 'podcast', 'page'],
  },
  {
    name: 'spotifyGetAudiobook',
    description:
      'Gets full catalog details for one audiobook — authors, narrators, chapters (first page), publisher, languages. Accepts an audiobook ID, URI, or URL.',
    tool: spotifyGetAudiobook,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'audiobook', 'book', 'narrator', 'details'],
  },
  {
    name: 'spotifyGetAudiobookChapters',
    description:
      "Gets a page of an audiobook's chapters as a paging object (limit/offset).",
    tool: spotifyGetAudiobookChapters,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'audiobook', 'chapters', 'page'],
  },
  {
    name: 'spotifyGetChapter',
    description:
      'Gets full catalog details for one audiobook chapter — chapter number, start/end position, duration, and its audiobook. Accepts a chapter ID, URI, or URL.',
    tool: spotifyGetChapter,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'chapter', 'audiobook', 'details'],
  },
  {
    name: 'spotifyGetCurrentUser',
    description:
      "Gets the profile of the user behind the connected account — display name, country, product tier, followers (and email with user-read-email). Use to confirm whose account is connected.",
    tool: spotifyGetCurrentUser,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'whoami', 'profile', 'account', 'me'],
  },
  {
    name: 'spotifyGetTopItems',
    description:
      "Gets the user's top artists or top tracks over a time range (last 4 weeks / last 6 months / all time) as a paging object. Needs user-top-read.",
    tool: spotifyGetTopItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'top', 'stats', 'favorite', 'listening', 'history'],
  },
  {
    name: 'spotifyGetFollowedArtists',
    description:
      "Gets a cursor-paged list of artists the user follows (max 50 per call; pass cursors.next as `after` for the next page). Needs user-follow-read.",
    tool: spotifyGetFollowedArtists,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'following', 'artists', 'follow', 'list'],
  },
  {
    name: 'spotifyGetSavedItems',
    description:
      "Gets the user's saved (\"Liked\") library items — tracks, albums, shows, episodes, or audiobooks — as a paging object, newest first. Needs user-library-read.",
    tool: spotifyGetSavedItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'library', 'saved', 'liked', 'favorites'],
  },
  {
    name: 'spotifyCheckLibraryItems',
    description:
      "Checks which of up to 40 items are already in the user's library — returns booleans aligned to the input order. Needs user-library-read.",
    tool: spotifyCheckLibraryItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'library', 'contains', 'saved', 'check', 'liked'],
  },
  {
    name: 'spotifyGetPlaylist',
    description:
      "Gets full details for one playlist — name, description, owner, visibility, followers, images, and its first page of tracks. Accepts a playlist ID, URI, or URL.",
    tool: spotifyGetPlaylist,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'playlist', 'details', 'owner', 'tracks'],
  },
  {
    name: 'spotifyGetPlaylistItems',
    description:
      "Gets a page of a playlist's items (tracks/episodes) in playlist order as a paging object; `fields` trims the response. Needs playlist-read-private for private playlists.",
    tool: spotifyGetPlaylistItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'playlist', 'tracks', 'items', 'page'],
  },
  {
    name: 'spotifyGetMyPlaylists',
    description:
      "Gets a page of the playlists in the current user's profile (owned and followed) as a paging object. Needs playlist-read-private.",
    tool: spotifyGetMyPlaylists,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'playlists', 'mine', 'owned', 'list'],
  },
  {
    name: 'spotifyGetPlaylistCover',
    description:
      "Gets the cover images currently set on a playlist (size variants, largest first); empty array if none. Accepts a playlist ID, URI, or URL.",
    tool: spotifyGetPlaylistCover,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'playlist', 'cover', 'image', 'artwork'],
  },
  {
    name: 'spotifyGetPlaybackState',
    description:
      "Gets the user's current playback state — device, progress, shuffle/repeat/volume flags, and playing context (empty object when idle). Needs user-read-playback-state.",
    tool: spotifyGetPlaybackState,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'playback', 'now playing', 'player', 'state'],
  },
  {
    name: 'spotifyGetCurrentlyPlaying',
    description:
      "Gets what is playing right now — the track/episode object plus progress (empty object when nothing is playing). Needs user-read-currently-playing.",
    tool: spotifyGetCurrentlyPlaying,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'now playing', 'current', 'track', 'player'],
  },
  {
    name: 'spotifyGetDevices',
    description:
      "Lists the user's playback devices (phones, computers, speakers, web player) with active/volume state. Use a device id as deviceId in the playback tools. Needs user-read-playback-state.",
    tool: spotifyGetDevices,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'devices', 'speakers', 'player', 'targets'],
  },
  {
    name: 'spotifyGetQueue',
    description:
      "Gets the user's playback queue — what is playing now plus upcoming items in order. Needs user-read-currently-playing or user-read-playback-state.",
    tool: spotifyGetQueue,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'queue', 'upcoming', 'next', 'player'],
  },
  {
    name: 'spotifyGetRecentlyPlayed',
    description:
      "Gets the user's recently played items (up to 50) as a cursor-paged object, newest first, with after/before timestamps for paging. Needs user-read-recently-played.",
    tool: spotifyGetRecentlyPlayed,
    requiredAuth: 'spotifyToken' as const,
    scope: 'read' as const,
    keywords: ['spotify', 'recent', 'history', 'listening', 'plays'],
  },
  {
    name: 'spotifySaveLibraryItems',
    description:
      "Saves (\"likes\") up to 40 tracks/albums/shows/episodes/audiobooks to the user's library in one call. Needs user-library-modify.",
    tool: spotifySaveLibraryItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'save', 'like', 'library', 'add', 'favorite'],
  },
  {
    name: 'spotifyRemoveLibraryItems',
    description:
      "Removes up to 40 items from the user's library (unlikes tracks, unfollows albums/shows/etc.). Needs user-library-modify.",
    tool: spotifyRemoveLibraryItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'delete' as const,
    keywords: ['spotify', 'remove', 'unlike', 'library', 'delete', 'unfollow'],
  },
  {
    name: 'spotifyCreatePlaylist',
    description:
      "Creates an empty playlist in the current user's profile (name required; description, public, collaborative optional) — follow up with spotifyAddPlaylistItems. Needs playlist-modify-public.",
    tool: spotifyCreatePlaylist,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'playlist', 'create', 'new', 'make'],
  },
  {
    name: 'spotifyUpdatePlaylistDetails',
    description:
      "Changes a playlist's name, description, visibility, and/or collaborative flag — only the fields you pass are updated. Needs playlist-modify-public.",
    tool: spotifyUpdatePlaylistDetails,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'playlist', 'rename', 'edit', 'update', 'description'],
  },
  {
    name: 'spotifyAddPlaylistItems',
    description:
      "Adds up to 100 tracks/episodes to a playlist — appended by default or inserted at `position`. Needs playlist-modify-public.",
    tool: spotifyAddPlaylistItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'playlist', 'add', 'insert', 'tracks'],
  },
  {
    name: 'spotifyReplacePlaylistItems',
    description:
      "Replaces a playlist's entire contents with a new list of items (or, with rangeStart/insertBefore instead, reorders existing items). The two modes are mutually exclusive. Needs playlist-modify-public.",
    tool: spotifyReplacePlaylistItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'playlist', 'replace', 'reorder', 'overwrite', 'sort'],
  },
  {
    name: 'spotifyRemovePlaylistItems',
    description:
      "Removes up to 100 specific track/episode occurrences from a playlist, optionally validated against a snapshot ID. Needs playlist-modify-public.",
    tool: spotifyRemovePlaylistItems,
    requiredAuth: 'spotifyToken' as const,
    scope: 'delete' as const,
    keywords: ['spotify', 'playlist', 'remove', 'delete', 'tracks'],
  },
  {
    name: 'spotifyUploadPlaylistCover',
    description:
      "Sets a playlist's cover image from base64-encoded JPEG data (max 256 KB, square, e.g. 300x300). Needs ugc-image-upload plus a playlist-modify scope.",
    tool: spotifyUploadPlaylistCover,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'playlist', 'cover', 'image', 'artwork', 'upload'],
  },
  {
    name: 'spotifyStartPlayback',
    description:
      "Starts/resumes playback on a device: pass contextUri (album/artist/playlist), uris (specific tracks), or neither to resume. Optional offset picks the start item, positionMs seeks. Needs user-modify-playback-state (Premium).",
    tool: spotifyStartPlayback,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'play', 'resume', 'start', 'playback', 'device'],
  },
  {
    name: 'spotifyPausePlayback',
    description:
      'Pauses playback on a device (or the active device). Needs user-modify-playback-state.',
    tool: spotifyPausePlayback,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'pause', 'stop', 'playback', 'device'],
  },
  {
    name: 'spotifySkipToNext',
    description: 'Skips playback to the next track in the queue. Needs user-modify-playback-state.',
    tool: spotifySkipToNext,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'skip', 'next', 'forward', 'playback'],
  },
  {
    name: 'spotifySkipToPrevious',
    description:
      'Skips playback to the previous track (or restarts the current one). Needs user-modify-playback-state.',
    tool: spotifySkipToPrevious,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'skip', 'previous', 'back', 'playback'],
  },
  {
    name: 'spotifySeekToPosition',
    description:
      'Seeks to a position in milliseconds within the currently playing track. Needs user-modify-playback-state.',
    tool: spotifySeekToPosition,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'seek', 'position', 'timestamp', 'playback'],
  },
  {
    name: 'spotifySetVolume',
    description: 'Sets playback volume on a device, 0-100 percent. Needs user-modify-playback-state.',
    tool: spotifySetVolume,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'volume', 'loud', 'quiet', 'playback'],
  },
  {
    name: 'spotifyToggleShuffle',
    description: 'Turns shuffle on or off for the playback context. Needs user-modify-playback-state.',
    tool: spotifyToggleShuffle,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'shuffle', 'random', 'playback'],
  },
  {
    name: 'spotifySetRepeatMode',
    description:
      'Sets repeat mode: "track" (one track), "context" (whole context), or "off". Needs user-modify-playback-state.',
    tool: spotifySetRepeatMode,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'repeat', 'loop', 'playback'],
  },
  {
    name: 'spotifyTransferPlayback',
    description:
      "Transfers playback to one or more other devices (e.g. web player → speaker), optionally starting playback immediately. Needs user-modify-playback-state (Premium).",
    tool: spotifyTransferPlayback,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'transfer', 'device', 'handoff', 'speaker', 'playback'],
  },
  {
    name: 'spotifyAddToQueue',
    description:
      "Adds an item to the end of the user's playback queue. Needs user-modify-playback-state.",
    tool: spotifyAddToQueue,
    requiredAuth: 'spotifyToken' as const,
    scope: 'write' as const,
    keywords: ['spotify', 'queue', 'add', 'next up', 'playback'],
  },
];
