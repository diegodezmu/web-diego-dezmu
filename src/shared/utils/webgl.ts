export function supportsWebGL(): boolean {
  try {
    return Boolean(window.WebGL2RenderingContext || window.WebGLRenderingContext)
  } catch {
    return false
  }
}
