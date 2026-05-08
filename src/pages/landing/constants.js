// Design Tokens - Tailwind Config & Shared Constants
export const COLORS = {
  surface: {
    DEFAULT: '#051424',
    dim: '#051424',
    bright: '#2c3a4c',
    container: {
      lowest: '#010f1f',
      low: '#0d1c2d',
      DEFAULT: '#122131',
      high: '#1c2b3c',
      highest: '#273647',
    },
    variant: '#273647',
  },
  primary: {
    DEFAULT: '#dbfcff',
    container: '#00f0ff',
    fixed: '#7df4ff',
    'fixed-dim': '#00dbe9',
  },
  secondary: {
    DEFAULT: '#d0bcff',
    container: '#571bc1',
    fixed: '#e9ddff',
    'fixed-dim': '#d0bcff',
  },
  tertiary: {
    DEFAULT: '#f5f5ff',
    container: '#d1d9f3',
    fixed: '#dae2fd',
    'fixed-dim': '#bec6e0',
  },
  on: {
    primary: '#00363a',
    'primary-container': '#006970',
    'primary-fixed': '#002022',
    'primary-fixed-variant': '#004f54',
    secondary: '#3c0091',
    'secondary-container': '#c4abff',
    'secondary-fixed': '#23005c',
    'secondary-fixed-variant': '#5516be',
    tertiary: '#283044',
    'tertiary-container': '#575e75',
    'tertiary-fixed': '#131b2e',
    'tertiary-fixed-variant': '#3f465c',
    surface: '#d4e4fa',
    'surface-variant': '#b9cacb',
    background: '#d4e4fa',
    error: '#690005',
    'error-container': '#ffdad6',
  },
  error: {
    DEFAULT: '#ffb4ab',
    container: '#93000a',
  },
  outline: {
    DEFAULT: '#849495',
    variant: '#3b494b',
  },
  inverse: {
    surface: '#d4e4fa',
    'on-surface': '#233143',
    primary: '#006970',
  },
  surfaceTint: '#00dbe9',
};

export const NAV_LINKS = [
  { name: 'Platform', href: '#platform', active: true },
  { name: 'Solutions', href: '#solutions', active: false },
  { name: 'Resources', href: '#resources', active: false },
  { name: 'Pricing', href: '#pricing', active: false },
  { name: 'Contact Us', href: '#contact', active: false },
];

export const MODULES = [
  {
    id: '01',
    label: 'MODULE 01',
    title: 'Live Chat Workspace',
    description: 'Real-time interaction with integrated AI assistance for every thread.',
    color: 'primary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOqZJfVEWDej4-rTJwlcESGmiopgJW7EYvR027kUlU_Mhl6GqDNm6qH6sNu_Vitfv6FYT9e1dfPo0kuryWkot5DiKPGOcp2KwBUEh7bFXi5hqUMcPVo4ouWf2V6agOOiEfWMtuQt07UpM45rJY3P7ke3559EyiWGgZ91oz1XsE7G24p-n-bM-olB3ImRniZ14f2B4uM_vCxZwvVDROtmXbXVEHZuTd86PfXJrhJzU_v_P8nirSRaVdfdL_RDd1PAhrhxR9OzN57Ces',
    alt: 'A sophisticated dark mode dashboard UI with sleek glassmorphism panels, featuring vibrant cyan and violet data visualizations, glowing line charts, and organized conversation threads.',
  },
  {
    id: '02',
    label: 'MODULE 02',
    title: 'AI Insights Dashboard',
    description: 'Visual data on sentiment, key topics, and emerging trends across teams.',
    color: 'secondary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAar46SyqID6MTSEZKHx_8vzrYcYaFYD_6clgMkmixFQk8WjH56WFt9Lk9kTujNFv-hRLQpU_QNDue92eLaJ8RWJYx2MpAtHnHx-gBYrQ8umdqo70xCshPxy2bx0Al327tJyd_wf4zpb9uZe93NE3zZaXet3z-mFM-jGRKkOhm6Ur_KzZvx0Q0m2gbS2J7x1aa5tuwilpZQwYF-BT6pMmGZgiLDUjvtnprZ1dLLYkXZIcsrbL1u_iRIFD0GXy1R1NBzgG3rVqY2XmC0',
    alt: 'An abstract visualization of complex digital networks and neural pathways glowing in cyan and soft lavender.',
  },
  {
    id: '03',
    label: 'MODULE 03',
    title: 'Replay + Context',
    description: 'Relive any conversation with AI-generated summaries and context tags.',
    color: 'primary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOqZJfVEWDej4-rTJwlcESGmiopgJW7EYvR027kUlU_Mhl6GqDNm6qH6sNu_Vitfv6FYT9e1dfPo0kuryWkot5DiKPGOcp2KwBUEh7bFXi5hqUMcPVo4ouWf2V6agOOiEfWMtuQt07UpM45rJY3P7ke3559EyiWGgZ91oz1XsE7G24p-n-bM-olB3ImRniZ14f2B4uM_vCxZwvVDROtmXbXVEHZuTd86PfXJrhJzU_v_P8nirSRaVdfdL_RDd1PAhrhxR9OzN57Ces',
    alt: 'A sophisticated dark mode replay interface showing conversation threads with AI-generated context tags and summaries.',
  },
];

export const FEATURES = [
  {
    icon: 'psychology',
    title: 'AI Insights',
    description: 'Automated distillation of complex conversations into bullet-point highlights and sentiment analysis scores.',
    span: 'md:col-span-2',
    color: 'primary',
  },
  {
    icon: 'search',
    title: 'Smart Search',
    description: 'Search by intent, not just keywords. Find that one specific decision made 3 months ago.',
    span: '',
    color: 'secondary',
  },
  {
    icon: 'analytics',
    title: 'Analytics',
    description: 'Quantitative metrics on team efficiency, response quality, and communication patterns.',
    span: '',
    color: 'primary',
  },
  {
    icon: 'terminal',
    title: 'Developer API',
    description: 'Connect your internal tools directly to the BeyondStrings intelligence engine.',
    span: '',
    color: 'secondary',
  },
  {
    icon: 'hub',
    title: 'Unified Workspace',
    description: 'One central hub for all communication channels. Slack, Discord, and Email integrated into one flow.',
    span: 'md:col-span-2',
    color: 'primary',
  },
  {
    icon: 'history',
    title: 'Memory Bank',
    description: 'Perpetual storage for all interactions with semantic indexing for long-term recall.',
    span: '',
    color: 'secondary',
  },
];

export const STEPS = [
  {
    number: '01',
    title: 'Import',
    description: 'Connect your data sources in seconds via our secure connectors.',
    color: 'primary',
  },
  {
    number: '02',
    title: 'AI Understands',
    description: 'Our models index and analyze semantic relationships within your messages.',
    color: 'secondary',
  },
  {
    number: '03',
    title: 'Act Faster',
    description: 'Extract insights, generate reports, and find answers with lightning speed.',
    color: 'primary',
  },
];

export const USE_CASES = [
  {
    title: 'Professionals',
    description: 'Manage your personal workflows and never lose track of project details.',
    color: 'primary',
  },
  {
    title: 'Teams',
    description: 'Sync knowledge across departments and reduce repetitive questions.',
    color: 'secondary',
  },
  {
    title: 'Founders',
    description: "Get a birds-eye view of your startup's momentum and core bottlenecks.",
    color: 'primary',
  },
  {
    title: 'Analysts',
    description: 'Extract deep research from customer feedback and market signals.',
    color: 'secondary',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: [
      '1,000 messages/mo',
      '3 Integrations',
      'Basic AI Summaries',
    ],
    cta: 'Start Free',
    popular: false,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$25',
    period: '/mo',
    features: [
      '50,000 messages/mo',
      'Unlimited Integrations',
      'Advanced Smart Search',
      'API Access',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$53',
    period: '/mo',
    features: [
      'Unlimited everything',
      'Custom Model Training',
      'Priority Support',
      'SSO & Enterprise Security',
    ],
    cta: 'Contact Sales',
    popular: false,
    highlighted: false,
  },
];

export const TESTIMONIALS = [
  {
    quote: "BeyondStrings changed how we handle customer feedback. We've cut research time by 70%.",
    author: 'Sarah Chen',
    role: 'Product Head, FlowState',
    rating: 5,
  },
  {
    quote: 'The search functionality is magic. I can find decisions made in Slack months ago instantly.',
    author: 'Marcus Thorne',
    role: 'Founder, Velocity AI',
    rating: 5,
  },
  {
    quote: 'Enterprise-grade security that actually works for a fast-moving dev team. Highly recommended.',
    author: 'Elena Rodriguez',
    role: 'CTO, SecureStack',
    rating: 5,
  },
];

export const TRUST_LOGOS = [
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Discord', slug: 'discord' },
  { name: 'GitHub', slug: 'github' },
  { name: 'n8n', slug: 'n8n' },
  { name: 'Notion', slug: 'notion' },
];

export const CHECKLIST_ITEMS = [
  'Secure SOC2 Type II compliant environment',
  'Native integration with 50+ enterprise apps',
  'Custom fine-tuning for your industry vocabulary',
  'Dedicated account success manager',
];

export const FOOTER_LINKS = [
  { name: 'Platform', href: '#platform' },
  { name: 'Solutions', href: '#solutions' },
  { name: 'Resources', href: '#resources' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact Us', href: '#contact' },
];

export const CONTACT_INFO = [
  { icon: 'mail', text: 'hello@beyondstrings.ai' },
  { icon: 'location_on', text: 'San Francisco, CA' },
  { icon: 'chat', text: 'Live chat available 24/7 for Pro users' },
];
