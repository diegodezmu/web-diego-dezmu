import type { AppSection, StackCluster } from '@/shared/types'

export const sectionOrder: AppSection[] = ['home', 'about', 'stack', 'contact']

export const sectionLabels: Record<AppSection, string> = {
  home: 'home',
  about: 'about',
  stack: 'stack',
  contact: 'contact',
}

export const siteContent = {
  displayName: 'Diego Dezmu',
  role: 'AI System Designer',
  aboutTitle: 'about',
  aboutParagraphs: [
    'Diego is an AI builder with a foundation in software development, product design and audio engineering.',
    '"My multidisciplinary background taught me to think in systems: optimize signals, remove noise, and ensure the output is clean". For over a decade of career I applied that same logic to every framework, from designing mobile apps to immersive audiovisual experiences, audio interfaces, workflows or any kind of solution.',
    '"Today I am currently specialized in generative AI, working at the intersection of solution design and intelligent systems, agent architectures, and automations that connect work ecosystems."',
    '"I combine design thinking with the technical ability to build with AI. I do not need to translate between teams. I speak both languages."',
  ],
  contactTitleLines: ['send the brief.', "I'll bring the", 'architecture'],
  contactEmail: 'diego.dezmu@gmail.com',
  contactCaption: '© COPYWRIGHT DIEGO.DEZMU 2026',
}

export const stackClusterConfig: StackCluster[] = [
  {
    name: 'AI skills',
    slug: 'ai',
    weight: 12,
    colorHint: '#d1d1d1',
    skills: [
      'LLM',
      'Automation',
      'n8n',
      'Workflows',
      'Agentic flows',
      'Context engineering',
      'Prompt engineering',
      'MCP',
      'API',
      'RAG',
      'Fine-tuning',
      'Embeddings',
    ],
  },
  {
    name: 'Design skills',
    slug: 'design',
    weight: 10,
    colorHint: '#d1d1d1',
    skills: [
      'Design systems',
      'UX',
      'Design thinking',
      'UI',
      'Product design',
      'Systems architecture',
      'Figma',
      'Prototyping',
      'Touch designer',
      'Motion design',
    ],
  },
  {
    name: 'Development skills',
    slug: 'development',
    weight: 15,
    colorHint: '#ffffff',
    skills: [
      'VSCode',
      'Claude Code',
      'Codex',
      'Python',
      'React',
      'Next.js',
      'Node.js',
      'Git',
      'WebGL',
      'Three.js',
      'GSAP',
      'GLSL',
      'Vercel',
      'Supabase',
      'PostgreSQL',
    ],
  },
  {
    name: 'Sound skills',
    slug: 'sound',
    weight: 6,
    colorHint: '#c8c8c8',
    skills: [
      'Sound design',
      'Audio engineering',
      'Audio Mixing',
      'Audio mastering',
      'Ableton Live',
      'Max4live',
    ],
  },
]
