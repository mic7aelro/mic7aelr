import type { Project, SkillCategory } from '@/types';

export const ABOUT_TEXT = [
  "I've always loved building things. It started with LEGOs. Then, one day, my dad, a back-end developer, introduced me to software engineering. The rest is history.",
  "My love for software began with gaming. As a kid, I played games like Club Penguin, Poptropica, Cool Math Games, but none quite as impactful as Minecraft. Its sandbox gave me the freedom to explore and build, but before long, I wanted more. Then I discovered modding. I saw people create imaginative new worlds and experiences for a game I already loved. Their work gave me a sense of wonder, and I knew I wanted to create that feeling for others through technology. I did not know it yet, but software, programming, and code would become how I did it.",
  "Over time, I realized that I loved understanding how things work, building them myself, and improving them. In high school, I discovered that software was the perfect medium for that curiosity. Nothing is more satisfying than building a system that uses thoughtful design and automation to make someone's life easier.",
  "When I'm not coding you'll find me enjoying films (I'd classify myself as a cinephile), digging through record crates, rewatching Star Wars, reading DC comics, or deep in a tech rabbit hole.",
];

export const SKILLS: SkillCategory[] = [
  {
    label: 'Agentic Engineering',
    summary: 'Orchestrate models, tools, and review in reliable workflows.',
    items: ['Claude Code', 'OpenAI Codex', 'MCP', 'LangGraph', 'Tool Calling', 'LLM APIs'],
  },
  {
    label: 'Frontend',
    summary: 'Build fast, accessible interfaces with motion and 3D.',
    items: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Motion', 'Three.js'],
  },
  {
    label: 'Backend & Data',
    summary: 'Design APIs, data models, auth, and email delivery.',
    items: ['Node.js', 'REST APIs', 'GraphQL', 'FastAPI', '.NET', 'PostgreSQL', 'Neon', 'Supabase', 'MongoDB', 'Resend'],
  },
  {
    label: 'Platform & Delivery',
    summary: 'Deploy, automate, and operate systems in the cloud.',
    items: ['Vercel', 'AWS', 'Lambda', 'ECS', 'S3', 'Azure', 'Cloudflare', 'Docker', 'GitHub Actions', 'Vitest'],
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'project-01',
    title: 'Obsidian by Marla',
    description:
      'Fashion portfolio for stylist and creative director Marla McLeod. An admin portal manages image uploads, collections, inquiries, and events.',
    tags: ['Next.js', 'TypeScript', 'MongoDB', 'Vercel Blob', 'Resend', 'GSAP'],
    year: '2026',
    image: '/images/projects/obsidian-marla.jpg',
    imageAlt: 'Marla McLeod in a black hood and sunglasses',
    url: 'https://www.obsidianbymarla.com/',
    github: 'https://github.com/mic7aelro/obsidianbymarla/',
  },
  {
    id: 'project-02',
    title: 'Mel Events Co.',
    description:
      'Wedding and event studio in South Florida, built from the client\'s brand book. An admin inbox tracks inquiries, sends proposals, and threads email replies through Resend.',
    tags: ['Next.js', 'TypeScript', 'MongoDB', 'Resend', 'Motion', 'Tailwind CSS'],
    year: '2026',
    image: '/images/projects/mel-events-logo.png',
    imageAlt: 'Mel Events Co. logo',
    visual: 'logo',
    url: 'https://meleventsco.com/',
  },
  {
    id: 'project-03',
    title: 'Justus Resolutions',
    description:
      'Mediation and arbitration practice in Georgia. Attorneys request a date with a neutral, and an admin portal approves each request and books it through Calendly.',
    tags: ['Next.js', 'TypeScript', 'Neon Postgres', 'Resend', 'Calendly API', 'Tailwind CSS'],
    year: '2026',
    image: '/images/projects/justus-resolutions-logo.png',
    imageAlt: 'Justus Resolutions logo',
    visual: 'logo',
    url: 'https://justusresolutions.com/',
  },
];
