// @ts-nocheck
import { greenhouseCreateApplication } from './create-application.js';
import { greenhouseCreateCandidate } from './create-candidate.js';
import { greenhouseCreateJob } from './create-job.js';
import { greenhouseCreateNote } from './create-note.js';
import { greenhouseGetCandidate } from './get-candidate.js';
import { greenhouseGetJob } from './get-job.js';
import { greenhouseListApplications } from './list-applications.js';
import { greenhouseListCandidates } from './list-candidates.js';
import { greenhouseListJobs } from './list-jobs.js';
import { greenhouseUpdateCandidate } from './update-candidate.js';
import { greenhouseUpdateJob } from './update-job.js';

export {
  greenhouseCreateApplication,
  greenhouseCreateCandidate,
  greenhouseCreateJob,
  greenhouseCreateNote,
  greenhouseGetCandidate,
  greenhouseGetJob,
  greenhouseListApplications,
  greenhouseListCandidates,
  greenhouseListJobs,
  greenhouseUpdateCandidate,
  greenhouseUpdateJob,
};

export const greenhouseTools = [
  {
    name: 'greenhouseListJobs',
    description:
      'Lists Greenhouse jobs (requisitions) with cursor pagination. Filter by status (open/draft/closed), ids, department, office, requisition id, or created/opened/closed date range. Follow nextCursor for more pages.',
    tool: greenhouseListJobs,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'read' as const,
    keywords: ['requisitions', 'openings', 'postings', 'hiring plan'],
  },
  {
    name: 'greenhouseGetJob',
    description:
      'Gets one Greenhouse job by id: title, status, department, offices, requisition id, and timestamps.',
    tool: greenhouseGetJob,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'read' as const,
    keywords: ['requisition', 'role', 'opening', 'details'],
  },
  {
    name: 'greenhouseCreateJob',
    description:
      'Creates a new Greenhouse job from an existing template job (templateJobId + numberOfOpenings). The template supplies the interview plan, scorecards, and hiring team.',
    tool: greenhouseCreateJob,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'write' as const,
    keywords: ['requisition', 'open role', 'new opening', 'headcount', 'template'],
  },
  {
    name: 'greenhouseUpdateJob',
    description:
      'Updates a Greenhouse job: rename it, change requisition id, notes, department, offices, or custom fields. Only provided fields change.',
    tool: greenhouseUpdateJob,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'write' as const,
    keywords: ['edit', 'rename', 'requisition', 'reassign', 'department'],
  },
  {
    name: 'greenhouseListCandidates',
    description:
      'Lists Greenhouse candidates with cursor pagination. Filter by ids, email address, tag, or created/updated date range. Follow nextCursor for more pages.',
    tool: greenhouseListCandidates,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'read' as const,
    keywords: ['applicants', 'people', 'prospects', 'talent', 'search'],
  },
  {
    name: 'greenhouseGetCandidate',
    description:
      'Gets one Greenhouse candidate by id: name, company, title, tags, emails, phones, and addresses.',
    tool: greenhouseGetCandidate,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'read' as const,
    keywords: ['applicant', 'profile', 'person', 'prospect'],
  },
  {
    name: 'greenhouseCreateCandidate',
    description:
      'Creates a Greenhouse candidate (firstName + lastName required). Pass jobId to also apply them to a job, or prospectPoolId to add them as a prospect.',
    tool: greenhouseCreateCandidate,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'write' as const,
    keywords: ['add', 'applicant', 'source', 'prospect', 'import', 'new person'],
  },
  {
    name: 'greenhouseUpdateCandidate',
    description:
      'Updates a Greenhouse candidate profile: name, company, title, tags, canEmail, or custom fields. Array fields (tags, emails, phones) replace the existing list wholesale.',
    tool: greenhouseUpdateCandidate,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'write' as const,
    keywords: ['edit', 'rename', 'tag', 'contact', 'profile'],
  },
  {
    name: 'greenhouseListApplications',
    description:
      'Lists Greenhouse applications (a candidate on a specific job). Filter by ids, candidate ids, job ids, status (in_process/rejected/hired/converted), or stage name. Follow nextCursor for more pages.',
    tool: greenhouseListApplications,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'read' as const,
    keywords: ['pipeline', 'stage', 'hiring', 'candidates for job', 'funnel'],
  },
  {
    name: 'greenhouseCreateApplication',
    description:
      'Creates a Greenhouse application — attaches an existing candidate to a job (candidateId + jobId), or adds them as a prospect (candidateId + prospect=true).',
    tool: greenhouseCreateApplication,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'write' as const,
    keywords: ['apply', 'advance', 'prospect', 'move candidate', 'pipeline'],
  },
  {
    name: 'greenhouseCreateNote',
    description:
      'Creates a note on a Greenhouse candidate: NOTE (Notes tab), EMAIL (logs an email into the activity feed), or ACTIVITY (free-form entry). Optionally anchor to a specific application.',
    tool: greenhouseCreateNote,
    requiredAuth: 'greenhouseCredentials' as const,
    scope: 'write' as const,
    keywords: ['comment', 'log email', 'activity', 'feedback', 'interview notes'],
  },
];
