export function fitPointCount(source: Float32Array, count: number) {
  const sourceCount = source.length / 3

  if (sourceCount === count) {
    return source
  }

  const points = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const sourceIndex = Math.floor((index / count) * sourceCount) % sourceCount
    const sourceOffset = sourceIndex * 3
    const targetOffset = index * 3
    points[targetOffset] = source[sourceOffset]
    points[targetOffset + 1] = source[sourceOffset + 1]
    points[targetOffset + 2] = source[sourceOffset + 2]
  }

  return points
}
