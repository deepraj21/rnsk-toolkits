// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldLive, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );
const streamId = z.string().describe('Live stream ID');

export const cloudinaryGetLiveStreams = tool({
  description: 'List all live streams in the product environment.',
  inputSchema: z.object({ cloudinaryCredentials: credField }),
  execute: ({ cloudinaryCredentials }) =>
    cldLive(parseCreds(cloudinaryCredentials), 'GET', '/live_streams'),
});

export const cloudinaryGetLiveStream = tool({
  description: 'Get one live stream configuration, status, inputs, and outputs.',
  inputSchema: z.object({ cloudinaryCredentials: credField, liveStreamId: streamId }),
  execute: ({ cloudinaryCredentials, liveStreamId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'GET',
      `/live_streams/${encodeURIComponent(liveStreamId)}`,
    ),
});

export const cloudinaryCreateLiveStream = tool({
  description:
    'Create an RTMP live stream (starts idle). Returns the ingest URI and stream key for the encoder.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    input: z
      .object({ type: z.string().describe('Ingest protocol (only "rtmp" is supported)') })
      .describe('Input config'),
    name: z.string().optional().describe('Stream name, e.g. "Product launch stream"'),
    maxRuntimeSec: z.number().int().optional().describe('Auto-stop after this many seconds'),
    idleTimeoutSec: z.number().int().optional().describe('Stop after this many idle seconds'),
  }),
  execute: ({ cloudinaryCredentials, input, name, maxRuntimeSec, idleTimeoutSec }) =>
    cldLive(parseCreds(cloudinaryCredentials), 'POST', '/live_streams', {
      input,
      name,
      max_runtime_sec: maxRuntimeSec,
      idle_timeout_sec: idleTimeoutSec,
    }),
});

export const cloudinaryUpdateLiveStream = tool({
  description: 'Update a live stream name, idle timeout, or max runtime.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    liveStreamId: streamId,
    name: z.string().optional().describe('New stream name'),
    maxRuntimeSec: z
      .number()
      .int()
      .nullable()
      .optional()
      .describe('New max runtime (null removes the limit)'),
    idleTimeoutSec: z
      .number()
      .int()
      .nullable()
      .optional()
      .describe('New idle timeout (null removes it)'),
  }),
  execute: ({ cloudinaryCredentials, liveStreamId, name, maxRuntimeSec, idleTimeoutSec }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'PATCH',
      `/live_streams/${encodeURIComponent(liveStreamId)}`,
      {
        name,
        max_runtime_sec: maxRuntimeSec,
        idle_timeout_sec: idleTimeoutSec,
      },
    ),
});

export const cloudinaryDeleteLiveStream = tool({
  description: 'Permanently delete a live stream that is no longer needed.',
  inputSchema: z.object({ cloudinaryCredentials: credField, liveStreamId: streamId }),
  execute: ({ cloudinaryCredentials, liveStreamId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'DELETE',
      `/live_streams/${encodeURIComponent(liveStreamId)}`,
    ),
});

export const cloudinaryActivateLiveStream = tool({
  description:
    'Manually activate an idle live stream (alternative: start pushing to the ingest URI).',
  inputSchema: z.object({ cloudinaryCredentials: credField, liveStreamId: streamId }),
  execute: ({ cloudinaryCredentials, liveStreamId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'POST',
      `/live_streams/${encodeURIComponent(liveStreamId)}/activate`,
      {},
    ),
});

export const cloudinaryIdleLiveStream = tool({
  description: 'Park an active live stream in idle state without deleting it.',
  inputSchema: z.object({ cloudinaryCredentials: credField, liveStreamId: streamId }),
  execute: ({ cloudinaryCredentials, liveStreamId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'POST',
      `/live_streams/${encodeURIComponent(liveStreamId)}/idle`,
      {},
    ),
});

export const cloudinaryGetLiveStreamOutputs = tool({
  description: 'List outputs (HLS, archive, simulcasts) configured on a live stream.',
  inputSchema: z.object({ cloudinaryCredentials: credField, liveStreamId: streamId }),
  execute: ({ cloudinaryCredentials, liveStreamId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'GET',
      `/live_streams/${encodeURIComponent(liveStreamId)}/outputs`,
    ),
});

export const cloudinaryGetLiveStreamOutput = tool({
  description: 'Get one live stream output configuration.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    liveStreamId: streamId,
    liveStreamOutputId: z.string().describe('Output ID'),
  }),
  execute: ({ cloudinaryCredentials, liveStreamId, liveStreamOutputId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'GET',
      `/live_streams/${encodeURIComponent(liveStreamId)}/outputs/${encodeURIComponent(liveStreamOutputId)}`,
    ),
});

const outputFields = {
  uri: z.string().optional().describe('Destination RTMP URI for simulcasts'),
  name: z.string().optional().describe('Output name, e.g. "YouTube Simulcast"'),
  vendor: z.string().optional().describe('Simulcast vendor, e.g. "youtube","facebook","twitch"'),
  publicId: z.string().optional().describe('Public ID for archive outputs'),
  streamKey: z.string().optional().describe('Stream key authenticating the output'),
};

export const cloudinaryCreateLiveStreamOutput = tool({
  description:
    'Add an output to a live stream: HLS, archive, or simulcast to YouTube/Facebook/Twitch.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    liveStreamId: streamId,
    type: z.string().describe('Output type: "hls", "simulcast", or "archive"'),
    ...outputFields,
  }),
  execute: ({
    cloudinaryCredentials,
    liveStreamId,
    type,
    uri,
    name,
    vendor,
    publicId,
    streamKey,
  }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'POST',
      `/live_streams/${encodeURIComponent(liveStreamId)}/outputs`,
      {
        type,
        uri,
        name,
        vendor,
        public_id: publicId,
        stream_key: streamKey,
      },
    ),
});

export const cloudinaryUpdateLiveStreamOutput = tool({
  description: 'Update a custom simulcast output (default HLS/archive outputs cannot be updated).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    liveStreamId: streamId,
    liveStreamOutputId: z.string().describe('Output ID to update'),
    ...outputFields,
  }),
  execute: ({
    cloudinaryCredentials,
    liveStreamId,
    liveStreamOutputId,
    uri,
    name,
    vendor,
    publicId,
    streamKey,
  }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'PATCH',
      `/live_streams/${encodeURIComponent(liveStreamId)}/outputs/${encodeURIComponent(liveStreamOutputId)}`,
      {
        uri,
        name,
        vendor,
        public_id: publicId,
        stream_key: streamKey,
      },
    ),
});

export const cloudinaryDeleteLiveStreamOutput = tool({
  description: 'Remove an output configuration from a live stream.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    liveStreamId: streamId,
    outputId: z.string().describe('Output ID to delete'),
  }),
  execute: ({ cloudinaryCredentials, liveStreamId, outputId }) =>
    cldLive(
      parseCreds(cloudinaryCredentials),
      'DELETE',
      `/live_streams/${encodeURIComponent(liveStreamId)}/outputs/${encodeURIComponent(outputId)}`,
    ),
});
