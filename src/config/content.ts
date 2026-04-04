import type { AppSection, StackSkillGroup, StackSkillSpec } from '@/shared/types'

type ContactSocialLink = {
  label: string
  href: string
}

/** Tinte global de las partículas en todas las escenas.
 *  Formato #RRGGBB — editable con cualquier color picker. */
export const PARTICLE_TINT_COLOR = 'rgba(111, 101, 220, 1)'

const contactSocialLinks: ContactSocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/ddezmu' },
  { label: 'twitter / X', href: 'https://x.com/ddezmu' },
]

export const sectionOrder: AppSection[] = ['home', 'about', 'stack', 'contact']

export const sectionLabels: Record<AppSection, string> = {
  home: 'HOME',
  about: 'ABOUT',
  stack: 'STACK',
  contact: 'CONTACT',
}

export const siteContent = {
  displayName: 'DIEGO DEZMU',
  microDisplayName: 'D.DEZMU',
  rolePrimary: 'AI BUILDER',
  roleSecondary: 'PRODUCT DESIGNER',
  aboutTitle: 'ABOUT',
  aboutParagraphs: [
    'Diego Dezmu is an AI builder with a foundation in software development, product design and audio engineering.',
    '"My multidisciplinary background taught me to think in systems: optimize signals, remove noise, and ensure the output is clean. For over a decade of career I applied that same logic to every framework, from designing mobile apps to immersive audiovisual experiences, audio interfaces, workflows or any kind of solution.',
    '"Today I am currently specialized in generative AI, working at the intersection of solution design and intelligent systems, agentic architectures, and automations that connect work ecosystems."',
    '"I combine design thinking with the technical ability to build with AI. I do not need to translate between teams. I speak both languages."',
  ],
  stackTitle: 'STACK',
  contactTitle: 'CONTACT',
  contactEmail: 'diego.dezmu@gmail.com',
  contactSocialLinks,
  menuCaption: '\u00a9 COPYWRIGHT DIEGO DEZMU 2026',
}

export const stackGroupPalette: Record<StackSkillGroup, string> = {
  engineering: '#b8bec8',
  design: '#d0cbc5',
  ai: '#e1e4ea',
  tooling: '#9b9faa',
  audio: '#b7b2ac',
}

export const stackSkillSpecs: StackSkillSpec[] = [
  { label: 'LLM', group: 'ai', densityTier: 10 },
  { label: 'n8n', group: 'ai', densityTier: 6 },
  { label: 'Workflows', group: 'ai', densityTier: 6 },
  { label: 'Agentic flows', group: 'ai', densityTier: 8 },
  { label: 'Context engineering', group: 'ai', densityTier: 9 },
  { label: 'Prompting', group: 'ai', densityTier: 10 },
  { label: 'MCP', group: 'ai', densityTier: 8 },
  { label: 'API', group: 'ai', densityTier: 7 },
  { label: 'RAG', group: 'ai', densityTier: 8 },
  { label: 'Fine-tuning', group: 'ai', densityTier: 5 },
  { label: 'Embeddings', group: 'ai', densityTier: 4 },
  { label: 'Design systems', group: 'design', densityTier: 9 },
  { label: 'UX', group: 'design', densityTier: 10 },
  { label: 'Design thinking', group: 'design', densityTier: 7 },
  { label: 'UI', group: 'design', densityTier: 10 },
  { label: 'Product Design', group: 'design', densityTier: 7 },
  { label: 'Figma', group: 'design', densityTier: 10 },
  { label: 'Prototyping', group: 'design', densityTier: 8 },
  { label: 'Touch designer', group: 'design', densityTier: 2 },
  { label: 'Motion design', group: 'design', densityTier: 4 },
  { label: 'Antigravity', group: 'tooling', densityTier: 7 },
  { label: 'Claude Code', group: 'tooling', densityTier: 7 },
  { label: 'Codex', group: 'tooling', densityTier: 7 },
  { label: 'Python', group: 'tooling', densityTier: 3 },
  { label: 'React', group: 'engineering', densityTier: 4 },
  { label: 'Next.js', group: 'engineering', densityTier: 2 },
  { label: 'Node.js', group: 'engineering', densityTier: 2 },
  { label: 'Git', group: 'tooling', densityTier: 6 },
  { label: 'WebGL', group: 'engineering', densityTier: 5 },
  { label: 'Three.js', group: 'engineering', densityTier: 6 },
  { label: 'GSAP', group: 'engineering', densityTier: 4 },
  { label: 'GLSL', group: 'engineering', densityTier: 2 },
  { label: 'Vercel', group: 'engineering', densityTier: 6 },
  { label: 'Supabase', group: 'engineering', densityTier: 5 },
  { label: 'PostgreSQL', group: 'engineering', densityTier: 4 },
  { label: 'Sound design', group: 'audio', densityTier: 6 },
  { label: 'Audio Mixing', group: 'audio', densityTier: 7 },
  { label: 'Audio mastering', group: 'audio', densityTier: 5 },
  { label: 'Ableton Live', group: 'audio', densityTier: 8 },
  { label: 'Max4live', group: 'audio', densityTier: 2 },
]
