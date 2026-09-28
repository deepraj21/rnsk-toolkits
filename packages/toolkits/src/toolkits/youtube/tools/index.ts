// @ts-nocheck
import { addVideoToPlaylist } from './add-video-to-playlist.js';
import { createChannelSection } from './create-channel-section.js';
import { createCommentReply } from './create-comment-reply.js';
import { createPlaylist } from './create-playlist.js';
import { deleteChannelSection } from './delete-channel-section.js';
import { deleteComment } from './delete-comment.js';
import { deletePlaylist } from './delete-playlist.js';
import { deletePlaylistItem } from './delete-playlist-item.js';
import { deleteVideo } from './delete-video.js';
import { downloadCaptionTrack } from './download-caption-track.js';
import { getChannelActivities } from './get-channel-activities.js';
import { getChannelIdByHandle } from './get-channel-id-by-handle.js';
import { getChannelStatistics } from './get-channel-statistics.js';
import { getVideoDetailsBatch } from './get-video-details-batch.js';
import { getVideoRating } from './get-video-rating.js';
import { listCaptionTrack } from './list-caption-track.js';
import { listChannelSections } from './list-channel-sections.js';
import { listChannelVideos } from './list-channel-videos.js';
import { listChannels } from './list-channels.js';
import { listCommentThreads } from './list-comment-threads.js';
import { listComments } from './list-comments.js';
import { listI18nLanguages } from './list-i18n-languages.js';
import { listI18nRegions } from './list-i18n-regions.js';
import { listLiveChatMessages } from './list-live-chat-messages.js';
import { listPlaylistImages } from './list-playlist-images.js';
import { listPlaylistItems } from './list-playlist-items.js';
import { listSuperChatEvents } from './list-super-chat-events.js';
import { listUserPlaylists } from './list-user-playlists.js';
import { listUserSubscriptions } from './list-user-subscriptions.js';
import { listVideoAbuseReportReasons } from './list-video-abuse-report-reasons.js';
import { listVideoCategories } from './list-video-categories.js';
import { markCommentAsSpam } from './mark-comment-as-spam.js';
import { multipartUploadVideo } from './multipart-upload-video.js';
import { postComment } from './post-comment.js';
import { rateVideo } from './rate-video.js';
import { reportVideoAbuse } from './report-video-abuse.js';
import { searchYouTube } from './search-youtube.js';
import { setCommentModerationStatus } from './set-comment-moderation-status.js';
import { subscribeChannel } from './subscribe-channel.js';
import { unsubscribeChannel } from './unsubscribe-channel.js';
import { updateCaption } from './update-caption.js';
import { updateChannel } from './update-channel.js';
import { updateChannelSection } from './update-channel-section.js';
import { updateComment } from './update-comment.js';
import { updatePlaylist } from './update-playlist.js';
import { updatePlaylistItem } from './update-playlist-item.js';
import { updateThumbnail } from './update-thumbnail.js';
import { updateVideo } from './update-video.js';
import { uploadVideo } from './upload-video.js';

export {
  addVideoToPlaylist,
  createChannelSection,
  createCommentReply,
  createPlaylist,
  deleteChannelSection,
  deleteComment,
  deletePlaylist,
  deletePlaylistItem,
  deleteVideo,
  downloadCaptionTrack,
  getChannelActivities,
  getChannelIdByHandle,
  getChannelStatistics,
  getVideoDetailsBatch,
  getVideoRating,
  listCaptionTrack,
  listChannelSections,
  listChannelVideos,
  listChannels,
  listCommentThreads,
  listComments,
  listI18nLanguages,
  listI18nRegions,
  listLiveChatMessages,
  listPlaylistImages,
  listPlaylistItems,
  listSuperChatEvents,
  listUserPlaylists,
  listUserSubscriptions,
  listVideoAbuseReportReasons,
  listVideoCategories,
  markCommentAsSpam,
  multipartUploadVideo,
  postComment,
  rateVideo,
  reportVideoAbuse,
  searchYouTube,
  setCommentModerationStatus,
  subscribeChannel,
  unsubscribeChannel,
  updateCaption,
  updateChannel,
  updateChannelSection,
  updateComment,
  updatePlaylist,
  updatePlaylistItem,
  updateThumbnail,
  updateVideo,
  uploadVideo,
};

const auth = 'youtubeToken' as const;

export const youtubeTools = [
  {
    name: 'youtubeAddVideoToPlaylist',
    keywords: ['playlists', 'playlist', 'organize'],
    description: 'Adds a video to a playlist. Use to organize videos or build curated collections.',
    tool: addVideoToPlaylist,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeCreateChannelSection',
    keywords: ['channel', 'channels', 'layout', 'homepage'],
    description:
      'Creates a channel section (featured playlists, uploads, channels) on your channel.',
    tool: createChannelSection,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeCreateCommentReply',
    keywords: ['comments', 'comment', 'reply', 'respond'],
    description: 'Replies to an existing comment. Use to respond to users on videos.',
    tool: createCommentReply,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeCreatePlaylist',
    keywords: ['playlists', 'playlist', 'collection'],
    description: 'Creates a new playlist on your channel.',
    tool: createPlaylist,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeDeleteChannelSection',
    keywords: ['channel', 'layout', 'remove'],
    description: 'Deletes a channel section you have permission to remove.',
    tool: deleteChannelSection,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'youtubeDeleteComment',
    keywords: ['comments', 'comment', 'remove'],
    description: 'Deletes a comment owned by your channel.',
    tool: deleteComment,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'youtubeDeletePlaylist',
    keywords: ['playlists', 'playlist', 'remove'],
    description: 'Permanently deletes your playlist. Requires explicit confirmation.',
    tool: deletePlaylist,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'youtubeDeletePlaylistItem',
    keywords: ['playlists', 'playlist', 'remove'],
    description: 'Removes a video from a playlist by playlist item ID.',
    tool: deletePlaylistItem,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'youtubeDeleteVideo',
    keywords: ['videos', 'remove'],
    description: 'Permanently deletes your video. Requires explicit confirmation.',
    tool: deleteVideo,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'youtubeDownloadCaptionTrack',
    keywords: ['captions', 'caption', 'subtitle', 'subtitles', 'transcript'],
    description: 'Downloads an owned caption track as text. Requires owning the video.',
    tool: downloadCaptionTrack,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeGetChannelActivities',
    keywords: ['channel', 'channels', 'uploads', 'activity'],
    description: 'Gets recent channel activities (uploads, likes, playlist events).',
    tool: getChannelActivities,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeGetChannelIdByHandle',
    keywords: ['channel', 'handle', 'username', 'id'],
    description: 'Resolves a channel handle or URL to its channel ID.',
    tool: getChannelIdByHandle,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeGetChannelStatistics',
    keywords: ['channel', 'channels', 'subscribers', 'views', 'analytics', 'stats'],
    description: 'Gets subscriber, view, and video counts for channels.',
    tool: getChannelStatistics,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeGetVideoDetailsBatch',
    keywords: ['videos', 'video', 'details', 'metrics', 'stats'],
    description: 'Retrieves details for many videos in one batched call. Use for cohort metrics.',
    tool: getVideoDetailsBatch,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeGetVideoRating',
    keywords: ['videos', 'video', 'like', 'likes', 'dislike'],
    description: 'Checks your like/dislike ratings on videos.',
    tool: getVideoRating,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListCaptionTrack',
    keywords: ['captions', 'caption', 'subtitles', 'subtitle', 'tracks'],
    description: 'Lists caption tracks for a video. Use track IDs to download or update.',
    tool: listCaptionTrack,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListChannelSections',
    keywords: ['channel', 'sections', 'layout'],
    description: 'Retrieves channel homepage layout sections.',
    tool: listChannelSections,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListChannelVideos',
    keywords: ['videos', 'video', 'channel', 'uploads'],
    description: 'Lists videos from a channel via its uploads playlist, with search fallback.',
    tool: listChannelVideos,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListChannels',
    keywords: ['channel', 'mine', 'handle', 'username'],
    description: 'Lists channels by ID, handle, username, or ownership with full details.',
    tool: listChannels,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListCommentThreads',
    keywords: ['comments', 'comment', 'thread', 'threads', 'replies'],
    description: 'Retrieves comment threads for a video or channel with replies.',
    tool: listCommentThreads,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListComments',
    keywords: ['comment', 'replies', 'thread'],
    description: 'Lists individual comments by ID or replies to a parent comment.',
    tool: listComments,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListI18nLanguages',
    keywords: ['language', 'languages', 'locale', 'i18n'],
    description: 'Lists interface languages YouTube supports.',
    tool: listI18nLanguages,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListI18nRegions',
    keywords: ['region', 'regions', 'country', 'geo', 'i18n'],
    description: 'Lists content regions YouTube supports for geo filtering.',
    tool: listI18nRegions,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListLiveChatMessages',
    keywords: ['chat', 'live', 'livestream', 'broadcast', 'comments'],
    description: 'Lists live chat messages for monitoring broadcasts or chat history.',
    tool: listLiveChatMessages,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListPlaylistImages',
    keywords: ['playlists', 'playlist', 'thumbnail', 'thumbnails', 'image'],
    description: 'Retrieves custom thumbnail images for a playlist.',
    tool: listPlaylistImages,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListPlaylistItems',
    keywords: ['videos', 'video', 'playlists', 'playlist'],
    description: 'Lists videos in a playlist with pagination.',
    tool: listPlaylistItems,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListSuperChatEvents',
    keywords: ['superchat', 'live', 'donation', 'revenue', 'chat'],
    description: 'Lists Super Chat/Sticker purchases from the past 30 days.',
    tool: listSuperChatEvents,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListUserPlaylists',
    keywords: ['playlists', 'playlist', 'mine', 'my'],
    description: 'Lists playlists owned by the authenticated user.',
    tool: listUserPlaylists,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListUserSubscriptions',
    keywords: ['subscription', 'subscriptions', 'subscribed', 'channels', 'my'],
    description: 'Lists the authenticated user channel subscriptions.',
    tool: listUserSubscriptions,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListVideoAbuseReportReasons',
    keywords: ['report', 'abuse', 'flag', 'reasons'],
    description: 'Lists valid abuse report reasons for use with reportVideoAbuse.',
    tool: listVideoAbuseReportReasons,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeListVideoCategories',
    keywords: ['category', 'categories', 'genre'],
    description: 'Lists video categories for a region or by ID.',
    tool: listVideoCategories,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeMarkCommentAsSpam',
    keywords: ['comments', 'comment', 'spam', 'moderate'],
    description: 'Flags comments as spam (deprecated endpoint, still functional).',
    tool: markCommentAsSpam,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeMultipartUploadVideo',
    keywords: ['videos', 'video', 'upload', 'uploads', 'publish'],
    description: 'Uploads a video (metadata + bytes in one request) from a file URL.',
    tool: multipartUploadVideo,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubePostComment',
    keywords: ['comments', 'comment', 'reply'],
    description: 'Posts a new top-level comment on a video.',
    tool: postComment,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeRateVideo',
    keywords: ['videos', 'video', 'like', 'likes', 'dislike', 'unlike'],
    description: 'Likes, dislikes, or un-rates a video.',
    tool: rateVideo,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeReportVideoAbuse',
    keywords: ['videos', 'video', 'report', 'flag', 'abuse'],
    description: 'Reports a video for abusive content.',
    tool: reportVideoAbuse,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeSearchYouTube',
    keywords: ['videos', 'video', 'channels', 'search', 'find', 'query'],
    description: 'Searches YouTube for videos, channels, or playlists.',
    tool: searchYouTube,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'youtubeSetCommentModerationStatus',
    keywords: ['comments', 'comment', 'moderate', 'approve', 'reject'],
    description: 'Holds, publishes, or rejects comments; optionally bans authors.',
    tool: setCommentModerationStatus,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeSubscribeChannel',
    keywords: ['subscription', 'subscriptions', 'channel', 'follow', 'subscribe'],
    description: 'Subscribes you to a channel by channel ID.',
    tool: subscribeChannel,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUnsubscribeChannel',
    keywords: ['subscription', 'subscriptions', 'unfollow', 'unsubscribe'],
    description: 'Removes a subscription by subscription ID.',
    tool: unsubscribeChannel,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'youtubeUpdateCaption',
    keywords: ['captions', 'caption', 'subtitle', 'subtitles'],
    description: 'Updates caption track metadata (name, language, draft status).',
    tool: updateCaption,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdateChannel',
    keywords: ['channels', 'channel', 'branding', 'settings'],
    description: 'Updates owned channel branding, promotion, and localizations.',
    tool: updateChannel,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdateChannelSection',
    keywords: ['channel', 'sections', 'layout'],
    description: 'Updates a channel section (title, position, featured content).',
    tool: updateChannelSection,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdateComment',
    keywords: ['comments', 'comment', 'edit'],
    description: 'Edits the text of an existing comment.',
    tool: updateComment,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdatePlaylist',
    keywords: ['playlists', 'playlist', 'title', 'privacy'],
    description: 'Updates playlist title, description, and privacy status.',
    tool: updatePlaylist,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdatePlaylistItem',
    keywords: ['playlists', 'playlist', 'videos', 'reorder'],
    description: 'Reorders a playlist item or updates its note and privacy.',
    tool: updatePlaylistItem,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdateThumbnail',
    keywords: ['videos', 'video', 'thumbnail', 'thumbnails', 'image'],
    description: 'Sets a custom video thumbnail from an image URL.',
    tool: updateThumbnail,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUpdateVideo',
    keywords: ['videos', 'video', 'title', 'privacy', 'metadata'],
    description: 'Updates video title, description, tags, category, and privacy.',
    tool: updateVideo,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'youtubeUploadVideo',
    keywords: ['videos', 'video', 'uploads', 'publish', 'upload'],
    description: 'Uploads a video from a file URL via resumable session (best for large files).',
    tool: uploadVideo,
    requiredAuth: auth,
    scope: 'write' as const,
  },
];
