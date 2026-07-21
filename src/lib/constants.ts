import type { Project, SkillCategory } from '@/types';

export const ABOUT_TEXT = [
  "My dad, a back-end developer, introduced me to software engineering and showed me how reliable systems are built.",
  "I build fast, stable products because software should work without friction. Reliability, performance, and clear behavior guide each decision.",
  "I work across the full product lifecycle, from system architecture and APIs to precise interfaces. I stay close to the details through deployment.",
  "When I'm not coding you'll find me digging through record crates, rewatching Star Wars, reading DC comics, or deep in a tech rabbit hole.",
  "Currently open to select freelance projects.",
];

export const SKILLS: SkillCategory[] = [
  {
    label: 'Agentic Engineering',
    summary: 'Plan, delegate, review, and verify work with coding agents.',
    items: ['Claude Code', 'OpenAI Codex', 'Agent Skills', 'Subagents', 'Code Review'],
  },
  {
    label: 'Agent Tooling',
    summary: 'Give agents the tools, context, and guardrails they need.',
    items: ['MCP Servers', 'Custom Tools', 'Hooks', 'Repository Instructions', 'Context Engineering'],
  },
  {
    label: 'AI Systems',
    summary: 'Build model-backed features around real product data.',
    items: ['LLM APIs', 'RAG', 'Embeddings', 'Vector Search', 'Evals'],
  },
  {
    label: 'Product Engineering',
    summary: 'Ship interfaces, APIs, and back-end systems together.',
    items: ['TypeScript', 'React', 'Next.js', 'Node.js', '.NET'],
  },
  {
    label: 'Cloud & Delivery',
    summary: 'Automate reliable builds, tests, and deployments.',
    items: ['AWS', 'Azure', 'Docker', 'CI/CD', 'GitHub Actions', 'Vercel'],
  },
  {
    label: 'Data & Architecture',
    summary: 'Design storage, identity, APIs, and event flows.',
    items: ['PostgreSQL', 'MongoDB', 'REST APIs', 'Event-Driven Systems', 'Auth'],
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'project-01',
    title: 'Obsidian by Marla',
    description:
      'Luxury fashion portfolio for stylist and creative director Marla McLeod. Full admin portal with image curation, collection management, and inquiry/event tracking.',
    tags: ['Next.js', 'MongoDB', 'TypeScript', 'Iron-session', 'GSAP', 'Tailwind CSS v4'],
    year: '2026',
    url: 'https://www.obsidianbymarla.com/',
    github: 'https://github.com/mic7aelro/obsidianbymarla/',
  },
];
