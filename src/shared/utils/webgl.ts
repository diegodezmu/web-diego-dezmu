export function supportsWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')

    if (!context) {
      return false
    }

    if ('getExtension' in context) {
      const loseContext = context.getExtension('WEBGL_lose_context')
      loseContext?.loseContext()
    }

    return true
  } catch {
    return false
  }
}
