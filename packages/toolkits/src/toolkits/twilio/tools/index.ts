// @ts-nocheck
import { twilioListMessages } from './messages.js';
import { twilioGetMessage } from './messages.js';
import { twilioSendMessage } from './messages.js';
import { twilioDeleteMessage } from './messages.js';
import { twilioListCalls } from './calls.js';
import { twilioGetCall } from './calls.js';
import { twilioCreateCall } from './calls.js';
import { twilioGetAccount } from './account.js';
import { twilioListIncomingPhoneNumbers } from './account.js';
import { twilioLookupPhoneNumber } from './account.js';

export {
  twilioListMessages,
  twilioGetMessage,
  twilioSendMessage,
  twilioDeleteMessage,
  twilioListCalls,
  twilioGetCall,
  twilioCreateCall,
  twilioGetAccount,
  twilioListIncomingPhoneNumbers,
  twilioLookupPhoneNumber,
};

const auth = 'twilioCredentials' as const;
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

export const twilioTools = [
  entry('twilioListMessages', twilioListMessages, 'read', []),
  entry('twilioGetMessage', twilioGetMessage, 'read', []),
  entry('twilioSendMessage', twilioSendMessage, 'write', []),
  entry('twilioDeleteMessage', twilioDeleteMessage, 'delete', []),
  entry('twilioListCalls', twilioListCalls, 'read', []),
  entry('twilioGetCall', twilioGetCall, 'read', []),
  entry('twilioCreateCall', twilioCreateCall, 'write', []),
  entry('twilioGetAccount', twilioGetAccount, 'read', []),
  entry('twilioListIncomingPhoneNumbers', twilioListIncomingPhoneNumbers, 'read', []),
  entry('twilioLookupPhoneNumber', twilioLookupPhoneNumber, 'read', []),
];
