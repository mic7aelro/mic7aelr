import type { Project, SkillCategory } from '@/types';

export const ABOUT_TEXT = [
  "I've always loved building things. It started with LEGOs. Then, one day, my dad, a back-end developer, introduced me to software engineering. The rest is history.",
  "My love for software began with gaming. As a kid, I played games like Club Penguin, Poptropica, Cool Math Games, but none quite as impactful as Minecraft. Its sandbox gave me the freedom to explore and build, but before long, I wanted more. Then I discovered modding. I saw people create imaginative new worlds and experiences for a game I already loved. Their work gave me a sense of wonder, and I knew I wanted to create that feeling for others through technology. I did not know it yet, but software, programming, and code would become how I did it.",
  "Over time, I realized that I loved understanding how things work, building them myself, and improving them. In high school, I discovered that software was the perfect medium for that curiosity. Nothing is more satisfying than building a system that uses thoughtful design and automation to make someone's life easier.",
  "When I'm not coding you'll find me enjoying films (I'd classify myself as a cinephile), digging through record crates, rewatching Star Wars, reading DC comics, or deep in a tech rabbit hole.",
];

export const SKILLS: SkillCategory[] = [
  {
    label: 'Agentic Systems',
    summary: 'Orchestrate models, tools, and review in reliable workflows.',
    items: ['LangGraph', 'MCP', 'Agent Orchestration', 'Tool Calling', 'Claude Code', 'OpenAI Codex'],
  },
  {
    label: 'AI Product Engineering',
    summary: 'Turn model capabilities into complete, usable products.',
    items: ['TypeScript', 'React', 'Next.js', 'FastAPI', 'GraphQL', 'LLM APIs', '.NET'],
  },
  {
    label: 'Distributed Systems & Data',
    summary: 'Design reliable APIs, data stores, identity, and event flows.',
    items: ['PostgreSQL', 'MongoDB', 'REST APIs', 'Event-Driven Systems', 'Auth'],
  },
  {
    label: 'Cloud Platform & Delivery',
    summary: 'Deploy, automate, and operate reliable systems in the cloud.',
    items: ['AWS', 'ECS', 'Lambda', 'S3', 'Azure', 'Docker', 'CI/CD', 'GitHub Actions'],
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
    image: '/images/projects/obsidian-marla.jpg',
    imageAlt: 'Marla McLeod in a black hood and sunglasses',
    url: 'https://www.obsidianbymarla.com/',
    github: 'https://github.com/mic7aelro/obsidianbymarla/',
  },
  {
    id: 'project-02',
    title: 'Mel Events Co.',
    description:
      'Wedding and event coordination studio in South Florida. Built from the client\'s brand book, with a purpose-built inquiry pipeline: the contact form writes through Resend, and custom Cloudflare email routing carries every inquiry to a live inbox on a domain that had been dark since 2025.',
    tags: ['Next.js 16', 'TypeScript', 'Resend', 'Cloudflare DNS', 'Motion', 'Tailwind CSS v4'],
    year: '2026',
    image: '/images/projects/mel-events.jpg',
    imageAlt: 'Melanie Mule, owner and lead coordinator of Mel Events Co.',
    url: 'https://meleventsco.com/',
  },
];
