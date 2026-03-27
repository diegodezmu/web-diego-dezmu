export function mulberry32(seed: number) {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

export function gaussian(random: () => number) {
  const u = Math.max(random(), 1e-6)
  const v = Math.max(random(), 1e-6)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function hashUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

export function hashSigned(seed: number) {
  return hashUnit(seed) * 2 - 1
}

export function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function toTuple(x: number, y: number, z: number): [number, number, number] {
  return [x, y, z]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function fillBufferPoint(
  buffer: Float32Array,
  index: number,
  point: [number, number, number],
) {
  const offset = index * 3
  buffer[offset] = point[0]
  buffer[offset + 1] = point[1]
  buffer[offset + 2] = point[2]
}
