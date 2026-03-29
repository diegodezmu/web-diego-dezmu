/**
 * Aplica distorsion wavefold in-place sobre un buffer de posiciones.
 * @param positions - Float32Array de posiciones (x,y,z,x,y,z,...)
 * @param amount - Intensidad del fold: 0 = sin efecto, 1 = fold maximo
 * @param range - Rango de plegado en unidades mundo (recomendado: 2.0-4.0)
 */
export function applyHoldWavefold(
  positions: Float32Array,
  amount: number,
  range: number,
): void {
  if (amount <= 0 || range <= 0) {
    return
  }

  const halfRange = range / 2

  for (let index = 0; index < positions.length; index += 1) {
    const value = positions[index]
    const folded = halfRange - Math.abs((((value % range) + range) % range) - halfRange)
    positions[index] = value + (folded - value) * amount
  }
}
