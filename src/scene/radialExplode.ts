/**
 * Expande posiciones radialmente desde un centro, in-place.
 * @param positions - Float32Array (x,y,z,x,y,z,...)
 * @param amount - Intensidad: 0 = sin efecto, 1 = expansion maxima
 * @param strength - Factor de escala radial al amount maximo
 * @param centerX - Centro de expansion X (normalmente 0)
 * @param centerY - Centro de expansion Y (normalmente 0)
 * @param centerZ - Centro de expansion Z (normalmente 0)
 */
export function applyRadialExplode(
  positions: Float32Array,
  amount: number,
  strength: number,
  centerX: number,
  centerY: number,
  centerZ: number,
): void {
  const scale = amount * strength

  for (let index = 0; index < positions.length; index += 3) {
    const dx = positions[index] - centerX
    const dy = positions[index + 1] - centerY
    const dz = positions[index + 2] - centerZ

    positions[index] += dx * scale
    positions[index + 1] += dy * scale
    positions[index + 2] += dz * scale
  }
}
