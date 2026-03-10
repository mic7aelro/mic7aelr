import type { Project, SkillCategory } from '@/types';

export const ABOUT_TEXT = [
  "I got into software engineering because of my dad, a back-end developer who showed me what the craft looked like up close.",
  "Years of slow, broken apps made it personal. I build things that are fast, stable, and stay up. No excuses for software that doesn't work.",
  "With a focus on full-stack web development, I work across the entire product lifecycle from system design to pixel-perfect UI. I care deeply about the craft.",
  "When I'm not coding you'll find me digging through record crates, rewatching Star Wars, reading DC comics, or deep in a tech rabbit hole.",
  "Currently open to select freelance projects.",
];

export const SKILLS: SkillCategory[] = [
  {
    label: 'Languages',
    items: ['Python', 'C#', 'TypeScript', 'Java', 'JavaScript', 'SQL'],
  },
  {
    label: 'Frontend',
    items: ['React', 'Next.js', 'GSAP', 'CSS / Tailwind'],
  },
  {
    label: 'Backend',
    items: ['Node.js', '.NET', 'FastAPI', 'REST'],
  },
  {
    label: 'Databases',
    items: ['MongoDB', 'SQL', 'PostgreSQL'],
  },
  {
    label: 'Infrastructure',
    items: ['AWS', 'Azure', 'Docker', 'CI/CD', 'GitHub Actions', 'Vercel'],
  },
  {
    label: 'Architecture',
    items: ['REST', 'GraphQL', 'Microservices', 'Event-Driven'],
  },
  {
    label: 'Security',
    items: ['Auth0', 'OAuth', 'JWT'],
  },
  {
    label: 'AI',
    items: ['Claude Code', 'ChatGPT', 'Vector Databases', 'Embeddings'],
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
