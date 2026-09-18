// @ts-nocheck
import { createMeet } from './create-meet.js';
import { endActiveConference } from './end-active-conference.js';
import { getConferenceRecordByName } from './get-conference-record-by-name.js';
import { getMeet } from './get-meet.js';
import { getParticipantSession } from './get-participant-session.js';
import { getRecordingsByConferenceRecordId } from './get-recordings-by-conference-record-id.js';
import { getTranscript } from './get-transcript.js';
import { getTranscriptEntry } from './get-transcript-entry.js';
import { getTranscriptsByConferenceRecordId } from './get-transcripts-by-conference-record-id.js';
import { listConferenceRecords } from './list-conference-records.js';
import { listParticipants } from './list-participants.js';
import { listParticipantSessions } from './list-participant-sessions.js';
import { listRecordings } from './list-recordings.js';
import { listTranscriptEntries } from './list-transcript-entries.js';
import { updateSpace } from './update-space.js';

export {
    createMeet,
    endActiveConference,
    getConferenceRecordByName,
    getMeet,
    getParticipantSession,
    getRecordingsByConferenceRecordId,
    getTranscript,
    getTranscriptEntry,
    getTranscriptsByConferenceRecordId,
    listConferenceRecords,
    listParticipants,
    listParticipantSessions,
    listRecordings,
    listTranscriptEntries,
    updateSpace,
};

export const googleMeetTools = [
    {
        name: 'googleMeetCreateMeet',
        description:
            'Creates a new Google Meet space with optional configuration. Does not attach to any calendar event — calendar linking requires a separate Calendar tool call. Capture `meetingUri`, `meetingCode`, and `space.name` from ...',
        tool: createMeet,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleMeetEndActiveConference',
        description:
            'Ends an active conference in a Google Meet space. REQUIRES \'space_name\' parameter (e.g., \'spaces/jQCFfuBOdN5z\' or just \'jQCFfuBOdN5z\'). Use when you need to terminate an ongoing conference in a specified space. ...',
        tool: endActiveConference,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'googleMeetGetConferenceRecordByName',
        description:
            'Tool to get a specific conference record by its resource name. Use when you have the conference record ID and need to retrieve detailed information about a single meeting instance.',
        tool: getConferenceRecordByName,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetGetMeet',
        description:
            'Retrieve details of a Google Meet space using its unique identifier. Newly created spaces may return incomplete data; retry after 1–3 seconds if needed.',
        tool: getMeet,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetGetParticipantSession',
        description:
            'Retrieves detailed information about a specific participant session from a Google Meet conference record. Returns session details including start time and end time for a single join/leave session. A participant sessio...',
        tool: getParticipantSession,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetGetRecordingsByConferenceRecordId',
        description:
            'Retrieves recordings from Google Meet for a given conference record ID. Only returns recordings if recording was enabled and permitted by the organizer\'s domain policies; a valid conference_record_id does not guarant...',
        tool: getRecordingsByConferenceRecordId,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetGetTranscript',
        description:
            'Retrieves a specific transcript by its resource name. Returns transcript details including state (STARTED, ENDED, FILE_GENERATED), start/end times, and Google Docs destination. PREREQUISITE: Obtain the transcript reso...',
        tool: getTranscript,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetGetTranscriptEntry',
        description:
            'Fetches a single transcript entry by resource name for targeted inspection or incremental processing. Use when you have a specific transcript entry resource name and need to retrieve its details (text, speaker, timest...',
        tool: getTranscriptEntry,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetGetTranscriptsByConferenceRecordId',
        description:
            'Retrieves all transcripts for a specific Google Meet conference using its conference_record_id. Transcripts require processing time after a meeting ends — empty results may be transient; retry after a delay before con...',
        tool: getTranscriptsByConferenceRecordId,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetListConferenceRecords',
        description:
            'Tool to list conference records. Use when you need to retrieve a list of past conferences, optionally filtering them by criteria like meeting code, space name, or time range.',
        tool: listConferenceRecords,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetListParticipants',
        description:
            'Lists the participants in a conference record. By default, ordered by join time descending. Use to retrieve all participants who joined a specific Google Meet conference, with support for filtering active participants...',
        tool: listParticipants,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetListParticipantSessions',
        description:
            'Lists all participant sessions for a specific participant in a Google Meet conference. A participant session represents each unique join or leave session when a user joins a conference from a device. If a user joins m...',
        tool: listParticipantSessions,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetListRecordings',
        description:
            'Tool to list recording resources from a conference record. Use when you need to retrieve recordings from a specific Google Meet conference. Recordings are created when meeting recording is enabled and saved to Google ...',
        tool: listRecordings,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetListTranscriptEntries',
        description:
            'Tool to list structured transcript entries (speaker/time/text segments) for a specific Google Meet transcript. Use when you need to access the detailed content of a transcript, including individual spoken segments wit...',
        tool: listTranscriptEntries,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleMeetUpdateSpace',
        description:
            'Updates the settings of an existing Google Meet space. Requires organizer/host privileges and the meetings.space.created OAuth scope. REQUIRED PARAMETER: - name: The space identifier (e.g., \'spaces/jQCFfuBOdN5z\'). T...',
        tool: updateSpace,
        requiredAuth: 'googleMeetToken' as const,
        scope: 'write' as const,
    },
];
