// @ts-nocheck
import { pipedriveCreateActivity } from './create-activity.js';
import { pipedriveCreateDeal } from './create-deal.js';
import { pipedriveCreateLead } from './create-lead.js';
import { pipedriveCreateNote } from './create-note.js';
import { pipedriveCreateOrganization } from './create-organization.js';
import { pipedriveCreatePerson } from './create-person.js';
import { pipedriveDeleteDeal } from './delete-deal.js';
import { pipedriveGetCurrentUser } from './get-current-user.js';
import { pipedriveGetDeal } from './get-deal.js';
import { pipedriveGetPerson } from './get-person.js';
import { pipedriveListActivities } from './list-activities.js';
import { pipedriveListDeals } from './list-deals.js';
import { pipedriveListLeads } from './list-leads.js';
import { pipedriveListNotes } from './list-notes.js';
import { pipedriveListOrganizations } from './list-organizations.js';
import { pipedriveListPersons } from './list-persons.js';
import { pipedriveListPipelines } from './list-pipelines.js';
import { pipedriveListStages } from './list-stages.js';
import { pipedriveSearchDeals } from './search-deals.js';
import { pipedriveUpdateDeal } from './update-deal.js';
import { pipedriveUpdatePerson } from './update-person.js';

export {
  pipedriveCreateActivity,
  pipedriveCreateDeal,
  pipedriveCreateLead,
  pipedriveCreateNote,
  pipedriveCreateOrganization,
  pipedriveCreatePerson,
  pipedriveDeleteDeal,
  pipedriveGetCurrentUser,
  pipedriveGetDeal,
  pipedriveGetPerson,
  pipedriveListActivities,
  pipedriveListDeals,
  pipedriveListLeads,
  pipedriveListNotes,
  pipedriveListOrganizations,
  pipedriveListPersons,
  pipedriveListPipelines,
  pipedriveListStages,
  pipedriveSearchDeals,
  pipedriveUpdateDeal,
  pipedriveUpdatePerson,
};

export const pipedriveTools = [
  {
    name: 'pipedriveListDeals',
    description:
      'Lists Pipedrive deals with cursor pagination, filterable by pipeline, stage, status, owner, person, or organization.',
    tool: pipedriveListDeals,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['deals', 'opportunities', 'pipeline', 'sales', 'list'],
  },
  {
    name: 'pipedriveGetDeal',
    description:
      'Gets one Pipedrive deal by ID: value, status, stage, linked person/organization, owner, and custom fields.',
    tool: pipedriveGetDeal,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['deal', 'details', 'opportunity', 'pipeline', 'lookup'],
  },
  {
    name: 'pipedriveCreateDeal',
    description:
      'Creates a Pipedrive deal with a title, optional person/organization links, pipeline/stage, value, and expected close date.',
    tool: pipedriveCreateDeal,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['new deal', 'opportunity', 'create', 'sales', 'add'],
  },
  {
    name: 'pipedriveUpdateDeal',
    description:
      'Updates a Pipedrive deal: move stages, change status/value/owner, or edit custom fields. Only provided fields change.',
    tool: pipedriveUpdateDeal,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['edit', 'move stage', 'won', 'lost', 'update'],
  },
  {
    name: 'pipedriveDeleteDeal',
    description: 'Deletes a Pipedrive deal. Use only when the user explicitly asks to remove it.',
    tool: pipedriveDeleteDeal,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'delete', 'discard', 'deal'],
  },
  {
    name: 'pipedriveSearchDeals',
    description:
      'Full-text searches Pipedrive deals by term (title, notes, email) with optional person/organization/status filters.',
    tool: pipedriveSearchDeals,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['search', 'find', 'lookup', 'deals', 'query'],
  },
  {
    name: 'pipedriveListPersons',
    description:
      'Lists Pipedrive persons (contacts) with cursor pagination, filterable by owner, organization, or deal.',
    tool: pipedriveListPersons,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['persons', 'contacts', 'people', 'list'],
  },
  {
    name: 'pipedriveGetPerson',
    description:
      'Gets one Pipedrive person by ID: name, emails, phones, organization link, owner, and custom fields.',
    tool: pipedriveGetPerson,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['person', 'contact', 'details', 'lookup'],
  },
  {
    name: 'pipedriveCreatePerson',
    description:
      'Creates a Pipedrive person (contact) with a name, optional emails, phones, organization link, and owner.',
    tool: pipedriveCreatePerson,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['new contact', 'person', 'create', 'add', 'email'],
  },
  {
    name: 'pipedriveUpdatePerson',
    description:
      'Updates a Pipedrive person: rename, change emails/phones, re-link organization, or edit custom fields.',
    tool: pipedriveUpdatePerson,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['edit', 'contact', 'update', 'rename', 'merge'],
  },
  {
    name: 'pipedriveListOrganizations',
    description:
      'Lists Pipedrive organizations (companies) with cursor pagination, filterable by owner.',
    tool: pipedriveListOrganizations,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['organizations', 'companies', 'accounts', 'list'],
  },
  {
    name: 'pipedriveCreateOrganization',
    description:
      'Creates a Pipedrive organization (company) with a name, optional website, industry, size, and address.',
    tool: pipedriveCreateOrganization,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['new company', 'organization', 'create', 'account', 'add'],
  },
  {
    name: 'pipedriveListActivities',
    description:
      'Lists Pipedrive activities (calls, meetings, tasks, emails) with cursor pagination, filterable by owner, person, deal, and done state.',
    tool: pipedriveListActivities,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['activities', 'tasks', 'meetings', 'calls', 'agenda'],
  },
  {
    name: 'pipedriveCreateActivity',
    description:
      'Creates a Pipedrive activity (call, meeting, task, email...) with subject, type, due date/time, and a linked person/deal/organization.',
    tool: pipedriveCreateActivity,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['activity', 'task', 'meeting', 'call', 'schedule', 'follow-up'],
  },
  {
    name: 'pipedriveListNotes',
    description:
      'Lists Pipedrive notes with offset pagination, filterable by the deal/person/organization/lead they are attached to.',
    tool: pipedriveListNotes,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['notes', 'comments', 'memo', 'list'],
  },
  {
    name: 'pipedriveCreateNote',
    description:
      'Creates a Pipedrive note (HTML) attached to exactly one object: a deal, person, organization, lead, project, or task.',
    tool: pipedriveCreateNote,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['note', 'comment', 'memo', 'attach', 'add'],
  },
  {
    name: 'pipedriveListLeads',
    description:
      'Lists Pipedrive leads (unqualified opportunities) with offset pagination, filterable by owner, person, and organization.',
    tool: pipedriveListLeads,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['leads', 'prospects', 'inquiries', 'list'],
  },
  {
    name: 'pipedriveCreateLead',
    description:
      'Creates a Pipedrive lead (unqualified opportunity) with a title, linked to a person or organization, with optional value.',
    tool: pipedriveCreateLead,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'write' as const,
    keywords: ['new lead', 'prospect', 'create', 'inbound', 'add'],
  },
  {
    name: 'pipedriveListPipelines',
    description:
      'Lists Pipedrive sales pipelines with their IDs, names, and ordering — needed to find pipeline and stage IDs.',
    tool: pipedriveListPipelines,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['pipelines', 'workflow', 'structure', 'list'],
  },
  {
    name: 'pipedriveListStages',
    description:
      'Lists Pipedrive deal stages, optionally for one pipeline — needed to find stage IDs for creating or moving deals.',
    tool: pipedriveListStages,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['stages', 'pipeline stages', 'workflow', 'list'],
  },
  {
    name: 'pipedriveGetCurrentUser',
    description:
      'Gets the Pipedrive user behind the API token: name, email, company, and permissions — also verifies the token works.',
    tool: pipedriveGetCurrentUser,
    requiredAuth: 'pipedriveApiToken' as const,
    scope: 'read' as const,
    keywords: ['me', 'current user', 'profile', 'account', 'whoami'],
  },
];
