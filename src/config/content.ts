import type { AppSection, StackGroupLayout, StackSkillSpec } from '@/shared/types'

export const sectionOrder: AppSection[] = ['home', 'about', 'stack', 'contact']

export const sectionLabels: Record<AppSection, string> = {
  home: 'HOME',
  about: 'ABOUT',
  stack: 'STACK',
  contact: 'CONTACT',
}

export const siteContent = {
  displayName: 'DIEGO DEZMU',
  microDisplayName: 'D. DEZMU',
  rolePrimary: 'AI BUILDER',
  roleSecondary: 'PRODUCT DESIGNER',
  aboutTitle: 'ABOUT',
  aboutParagraphs: [
    'Diego is an AI builder with a foundation in software development, product design and audio engineering.',
    '"My multidisciplinary background taught me to think in systems: optimize signals, remove noise, and ensure the output is clean". For over a decade of career I applied that same logic to every framework, from designing mobile apps to immersive audiovisual experiences, audio interfaces, workflows or any kind of solution.',
    '"Today I am currently specialized in generative AI, working at the intersection of solution design and intelligent systems, agent architectures, and automations that connect work ecosystems."',
    '"I combine design thinking with the technical ability to build with AI. I do not need to translate between teams. I speak both languages."',
  ],
  stackTitle: 'STACK',
  contactTitle: 'CONTACT',
  contactEmail: 'diego.dezmu@gmail.com',
  contactSocialLabel: 'Instagram / Twitter',
  menuCaption: '\u00a9 COPYWRIGHT DIEGO DEZMU 2026',
}

export const stackGroupLayouts: StackGroupLayout[] = [
  {
    slug: 'design',
    center: [-1.82, 1.62, -0.22],
    spread: [1.88, 1.18, 1.02],
  },
  {
    slug: 'ai',
    center: [1.88, 1.18, 0.56],
    spread: [1.62, 1.08, 1.08],
  },
  {
    slug: 'engineering',
    center: [1.42, -1.58, -0.66],
    spread: [2.16, 1.26, 1.24],
  },
  {
    slug: 'tooling',
    center: [-1.08, -1.74, 0.34],
    spread: [1.62, 1.06, 0.86],
  },
  {
    slug: 'audio',
    center: [-3.98, -0.12, -0.16],
    spread: [0.98, 0.72, 0.58],
  },
]

export const stackSkillSpecs: StackSkillSpec[] = [
  { label: 'LLM', group: 'ai', densityTier: 5 },
  { label: 'n8n', group: 'ai', densityTier: 3 },
  { label: 'Workflows', group: 'ai', densityTier: 3 },
  { label: 'Agentic flows', group: 'ai', densityTier: 4 },
  { label: 'Context engineering', group: 'ai', densityTier: 5 },
  { label: 'Prompting', group: 'ai', densityTier: 5 },
  { label: 'MCP', group: 'ai', densityTier: 4 },
  { label: 'API', group: 'ai', densityTier: 4 },
  { label: 'RAG', group: 'ai', densityTier: 3 },
  { label: 'Fine-tuning', group: 'ai', densityTier: 2 },
  { label: 'Embeddings', group: 'ai', densityTier: 2 },
  { label: 'Design systems', group: 'design', densityTier: 5 },
  { label: 'UX', group: 'design', densityTier: 5 },
  { label: 'Design thinking', group: 'design', densityTier: 3 },
  { label: 'UI', group: 'design', densityTier: 5 },
  { label: 'Product', group: 'design', densityTier: 3 },
  { label: 'Figma', group: 'design', densityTier: 5 },
  { label: 'Prototyping', group: 'design', densityTier: 4 },
  { label: 'Touch designer', group: 'design', densityTier: 1 },
  { label: 'Motion design', group: 'design', densityTier: 1 },
  { label: 'VSCode', group: 'tooling', densityTier: 4 },
  { label: 'Claude Code', group: 'tooling', densityTier: 3 },
  { label: 'Codex', group: 'tooling', densityTier: 4 },
  { label: 'Python', group: 'tooling', densityTier: 1 },
  { label: 'React', group: 'engineering', densityTier: 2 },
  { label: 'Next.js', group: 'engineering', densityTier: 1 },
  { label: 'Node.js', group: 'engineering', densityTier: 1 },
  { label: 'Git', group: 'tooling', densityTier: 3 },
  { label: 'WebGL', group: 'engineering', densityTier: 2 },
  { label: 'Three.js', group: 'engineering', densityTier: 3 },
  { label: 'GSAP', group: 'engineering', densityTier: 2 },
  { label: 'GLSL', group: 'engineering', densityTier: 2 },
  { label: 'Vercel', group: 'engineering', densityTier: 2 },
  { label: 'Supabase', group: 'engineering', densityTier: 2 },
  { label: 'PostgreSQL', group: 'engineering', densityTier: 2 },
  { label: 'Sound design', group: 'audio', densityTier: 3 },
  { label: 'Mixing', group: 'audio', densityTier: 3 },
  { label: 'mastering', group: 'audio', densityTier: 2 },
  { label: 'Ableton Live', group: 'audio', densityTier: 4 },
  { label: 'Max4live', group: 'audio', densityTier: 1 },
]
