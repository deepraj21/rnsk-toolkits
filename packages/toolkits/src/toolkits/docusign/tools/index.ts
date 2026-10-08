// @ts-nocheck
import { docusignListEnvelopes } from './envelopes.js';
import { docusignGetEnvelope } from './envelopes.js';
import { docusignCreateEnvelope } from './envelopes.js';
import { docusignUpdateEnvelope } from './envelopes.js';
import { docusignListEnvelopeDocuments } from './envelopes.js';
import { docusignGetEnvelopeRecipients } from './envelopes.js';
import { docusignListTemplates } from './templates.js';
import { docusignGetTemplate } from './templates.js';
import { docusignCreateEnvelopeFromTemplate } from './templates.js';
import { docusignListUsers } from './users.js';
import { docusignGetUser } from './users.js';

export {
  docusignListEnvelopes,
  docusignGetEnvelope,
  docusignCreateEnvelope,
  docusignUpdateEnvelope,
  docusignListEnvelopeDocuments,
  docusignGetEnvelopeRecipients,
  docusignListTemplates,
  docusignGetTemplate,
  docusignCreateEnvelopeFromTemplate,
  docusignListUsers,
  docusignGetUser,
};

const auth = 'docusignCredentials' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[] = []) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const docusignTools = [
  entry('docusignListEnvelopes', docusignListEnvelopes, 'read', ['esign', 'contracts']),
  entry('docusignGetEnvelope', docusignGetEnvelope, 'read', []),
  entry('docusignCreateEnvelope', docusignCreateEnvelope, 'write', ['signing']),
  entry('docusignUpdateEnvelope', docusignUpdateEnvelope, 'write', []),
  entry('docusignListEnvelopeDocuments', docusignListEnvelopeDocuments, 'read', []),
  entry('docusignGetEnvelopeRecipients', docusignGetEnvelopeRecipients, 'read', []),
  entry('docusignListTemplates', docusignListTemplates, 'read', []),
  entry('docusignGetTemplate', docusignGetTemplate, 'read', []),
  entry('docusignCreateEnvelopeFromTemplate', docusignCreateEnvelopeFromTemplate, 'write', []),
  entry('docusignListUsers', docusignListUsers, 'read', []),
  entry('docusignGetUser', docusignGetUser, 'read', []),
];
