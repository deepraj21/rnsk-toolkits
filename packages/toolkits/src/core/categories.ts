export const CONNECTOR_CATEGORIES = [
  'Developer Tools & DevOps',
  'Collaboration & Communication',
  'AI & Machine Learning',
  'Document & File Management',
  'Productivity & Project Management',
  'CRM',
  'Analytics & Data',
  'Entertainment & Media',
  'Education & LMS',
  'Design & Creative Tools',
  'Marketing & Social Media',
  'Scheduling & Booking',
  'E-commerce',
  'Finance & Accounting',
  'Sales & Customer Support',
  'HR & Recruiting',
  'Social Media',
  'Workflow Automation',
  'Data & Analytics',
  'Advertising & Marketing',
] as const;

export type ConnectorCategory = (typeof CONNECTOR_CATEGORIES)[number];
