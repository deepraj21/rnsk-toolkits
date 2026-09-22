import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { RAZORPAY_ICON } from './icon.js';
import { razorpayTools } from './tools/index.js';

export default defineToolkit({
  id: 'razorpay',
  displayName: 'Razorpay',
  shortDescription: 'Manage orders, payments, invoices, payouts, and settlements.',
  category: 'Finance & Accounting',
  icon: RAZORPAY_ICON,
  auth: {
    type: 'basic_auth',
    tokenField: 'razorpayCredentials',
    provider: {
      connectDescription:
        "Connect Razorpay with your key_id and key_secret (Dashboard > Settings > API Keys) stored as 'key_id:key_secret'. All APIs use Basic Auth (base64 of the pair) against https://api.razorpay.com/v1. OAuth (partner flow, auth.razorpay.com) is not used: it needs a partner application and its tokens expire hourly.",
    },
  },
  allowedHosts: ['api.razorpay.com'],
  tools: razorpayTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.11',
    homepage: 'https://razorpay.com',
    docsUrl: 'https://razorpay.com/docs/api',
  },
});
