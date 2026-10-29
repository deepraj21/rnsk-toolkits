// @ts-nocheck
import { mailchimpAddMember } from './add-member.js';
import { mailchimpArchiveMember } from './archive-member.js';
import { mailchimpCreateAudience } from './create-audience.js';
import { mailchimpCreateCampaign } from './create-campaign.js';
import { mailchimpGetAudience } from './get-audience.js';
import { mailchimpGetCampaign } from './get-campaign.js';
import { mailchimpGetCampaignReport } from './get-campaign-report.js';
import { mailchimpGetMember } from './get-member.js';
import { mailchimpListAudiences } from './list-audiences.js';
import { mailchimpListCampaigns } from './list-campaigns.js';
import { mailchimpListMembers } from './list-members.js';
import { mailchimpScheduleCampaign } from './schedule-campaign.js';
import { mailchimpSendCampaign } from './send-campaign.js';
import { mailchimpSetCampaignContent } from './set-campaign-content.js';
import { mailchimpUpdateMember } from './update-member.js';

export {
  mailchimpAddMember,
  mailchimpArchiveMember,
  mailchimpCreateAudience,
  mailchimpCreateCampaign,
  mailchimpGetAudience,
  mailchimpGetCampaign,
  mailchimpGetCampaignReport,
  mailchimpGetMember,
  mailchimpListAudiences,
  mailchimpListCampaigns,
  mailchimpListMembers,
  mailchimpScheduleCampaign,
  mailchimpSendCampaign,
  mailchimpSetCampaignContent,
  mailchimpUpdateMember,
};

export const mailchimpTools = [
  {
    name: 'mailchimpListAudiences',
    description:
      'Lists the Mailchimp account audiences (lists) with count/offset pagination. Returns each audience id, name, and subscriber counts.',
    tool: mailchimpListAudiences,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['lists', 'contacts', 'subscribers', 'audience'],
  },
  {
    name: 'mailchimpGetAudience',
    description:
      'Gets one Mailchimp audience (list) by id: name, subscriber counts, stats, and campaign defaults.',
    tool: mailchimpGetAudience,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['list', 'details', 'subscribers', 'stats'],
  },
  {
    name: 'mailchimpCreateAudience',
    description:
      'Creates a new Mailchimp audience (list) with contact and default sender info. Returns the new audience id for adding members and campaigns.',
    tool: mailchimpCreateAudience,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['new list', 'signup', 'create', 'contact list'],
  },
  {
    name: 'mailchimpListMembers',
    description:
      "Lists a Mailchimp audience's members (contacts) with pagination, filterable by subscription status.",
    tool: mailchimpListMembers,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['contacts', 'subscribers', 'people', 'signups'],
  },
  {
    name: 'mailchimpGetMember',
    description:
      'Gets one Mailchimp audience member by email: subscription status, merge fields, tags, and engagement stats.',
    tool: mailchimpGetMember,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['contact', 'subscriber', 'lookup', 'status'],
  },
  {
    name: 'mailchimpAddMember',
    description:
      'Adds a new member (contact) to a Mailchimp audience with a status (subscribed/pending/transactional), merge fields, and tags.',
    tool: mailchimpAddMember,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['subscribe', 'signup', 'contact', 'enroll', 'add'],
  },
  {
    name: 'mailchimpUpdateMember',
    description:
      'Updates a Mailchimp audience member by email: change status, merge fields, tags, or VIP flag. Upserts by email.',
    tool: mailchimpUpdateMember,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['edit', 'subscribe', 'unsubscribe', 'merge', 'tag'],
  },
  {
    name: 'mailchimpArchiveMember',
    description:
      "Archives (removes) a member from a Mailchimp audience. Use only when the user explicitly asks to remove someone; to stop sending without removing, set status to 'unsubscribed'.",
    tool: mailchimpArchiveMember,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'delete', 'unsubscribe', 'archive', 'opt out'],
  },
  {
    name: 'mailchimpListCampaigns',
    description:
      'Lists Mailchimp campaigns with pagination, filterable by status (save/schedule/sending/sent) and type.',
    tool: mailchimpListCampaigns,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['emails', 'blasts', 'newsletters', 'sends'],
  },
  {
    name: 'mailchimpGetCampaign',
    description:
      'Gets one Mailchimp campaign by id: recipients, settings (subject, from, reply-to), status, and send time.',
    tool: mailchimpGetCampaign,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['email', 'details', 'newsletter', 'settings'],
  },
  {
    name: 'mailchimpCreateCampaign',
    description:
      "Creates a Mailchimp campaign (regular by default) targeting an audience or segment, with subject, from name, and reply-to. Starts in 'save' status — set content, then send or schedule.",
    tool: mailchimpCreateCampaign,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['email', 'newsletter', 'blast', 'draft', 'compose'],
  },
  {
    name: 'mailchimpSetCampaignContent',
    description:
      'Sets the HTML and/or plain-text body of a Mailchimp campaign, with Merge Tags like *|FNAME|*. Required before sending or scheduling.',
    tool: mailchimpSetCampaignContent,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['body', 'html', 'template', 'copy', 'personalize'],
  },
  {
    name: 'mailchimpSendCampaign',
    description:
      "Sends a Mailchimp campaign immediately to its audience (must be in 'save' status with content set). Delivers real email — confirm before sending.",
    tool: mailchimpSendCampaign,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['deliver', 'blast', 'dispatch', 'ship', 'now'],
  },
  {
    name: 'mailchimpScheduleCampaign',
    description:
      'Schedules a Mailchimp campaign to send at a future ISO-8601 time, with optional time-zone staggered delivery.',
    tool: mailchimpScheduleCampaign,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'write' as const,
    keywords: ['send later', 'queue', 'timed', 'delay', 'calendar'],
  },
  {
    name: 'mailchimpGetCampaignReport',
    description:
      'Gets the performance report for a sent Mailchimp campaign: open rate, click rate, unsubscribes, and bounces.',
    tool: mailchimpGetCampaignReport,
    requiredAuth: 'mailchimpApiKey' as const,
    scope: 'read' as const,
    keywords: ['analytics', 'stats', 'opens', 'clicks', 'results'],
  },
];
