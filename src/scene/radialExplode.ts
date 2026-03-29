/**
 * Expande posiciones radialmente basandose en los targets, in-place.
 * El desplazamiento se calcula desde targets para evitar
 * retroalimentacion entre frames.
 * @param positions - Buffer de posiciones actuales (se muta)
 * @param targets - Buffer de posiciones objetivo (solo lectura)
 * @param amount - Intensidad: 0 = sin efecto
 * @param centerX - Centro de expansion X (normalmente 0)
 * @param centerY - Centro de expansion Y (normalmente 0)
 * @param centerZ - Centro de expansion Z (normalmente 0)
 */
export function applyRadialExplode(
  positions: Float32Array,
  targets: Float32Array,
  amount: number,
  centerX: number,
  centerY: number,
  centerZ: number,
): void {
  for (let index = 0; index < positions.length; index += 3) {
    const dx = targets[index] - centerX
    const dy = targets[index + 1] - centerY
    const dz = targets[index + 2] - centerZ

    positions[index] += dx * amount
    positions[index + 1] += dy * amount
    positions[index + 2] += dz * amount
  }
}
