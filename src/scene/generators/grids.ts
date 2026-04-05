import { clamp, hashSigned } from './shared'

function appendSegment(
  segments: number[],
  start: [number, number, number],
  end: [number, number, number],
) {
  segments.push(start[0], start[1], start[2], end[0], end[1], end[2])
}

export function createGridSegments(size: number, centerY: number, divisions: number) {
  const half = size * 0.5
  const step = size / divisions
  const bottom = centerY - half
  const segments: number[] = []

  for (let index = 1; index < divisions; index += 1) {
    const t = -half + index * step

    appendSegment(segments, [t, bottom, -half], [t, bottom, half])
    appendSegment(segments, [-half, bottom, t], [half, bottom, t])
  }

  return new Float32Array(segments)
}

export function generateViewportGridPoints(
  width: number,
  height: number,
  cellSize: number,
  depth: number,
) {
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const columns = Math.max(2, Math.floor(width / cellSize) + 1)
  const rows = Math.max(2, Math.floor(height / cellSize) + 1)
  const points = new Float32Array(columns * rows * 3)
  let offset = 0

  for (let row = 0; row < rows; row += 1) {
    const y = halfHeight - (row / Math.max(1, rows - 1)) * height
    for (let column = 0; column < columns; column += 1) {
      const x = -halfWidth + (column / Math.max(1, columns - 1)) * width
      points[offset * 3] = x
      points[offset * 3 + 1] = y
      points[offset * 3 + 2] = hashSigned(offset * 0.93) * depth
      offset += 1
    }
  }

  return points
}

export function generateMarginGridPoints(
  width: number,
  height: number,
  cellSize: number,
  marginX: number,
  marginY: number,
  depth: number,
) {
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const columns = Math.max(2, Math.floor(width / cellSize) + 1)
  const rows = Math.max(2, Math.floor(height / cellSize) + 1)
  const innerHalfWidth = Math.max(0, halfWidth - marginX)
  const innerHalfHeight = Math.max(0, halfHeight - marginY)
  const points: number[] = []
  let offset = 0

  for (let row = 0; row < rows; row += 1) {
    const y = halfHeight - (row / Math.max(1, rows - 1)) * height

    for (let column = 0; column < columns; column += 1) {
      const x = -halfWidth + (column / Math.max(1, columns - 1)) * width

      if (Math.abs(x) < innerHalfWidth && Math.abs(y) < innerHalfHeight) {
        continue
      }

      points.push(x, y, hashSigned(offset * 0.93) * depth)
      offset += 1
    }
  }

  return new Float32Array(points)
}

type FrameStrip = {
  minX: number
  maxX: number
  minY: number
  maxY: number
  area: number
}

const TOP_FRAME_THICKNESS_SCALE = 1.2

function halton(index: number, base: number) {
  let result = 0
  let fraction = 1 / base
  let current = index

  while (current > 0) {
    result += (current % base) * fraction
    current = Math.floor(current / base)
    fraction /= base
  }

  return result
}

function getFrameStrips(
  width: number,
  height: number,
  frameThicknessX: number,
  frameThicknessY: number,
) {
  const halfWidth = Math.max(width * 0.5, 1e-6)
  const halfHeight = Math.max(height * 0.5, 1e-6)
  const thicknessX = clamp(frameThicknessX, 0, halfWidth)
  const thicknessY = clamp(frameThicknessY, 0, halfHeight)
  const topThicknessY = clamp(thicknessY * TOP_FRAME_THICKNESS_SCALE, 0, halfHeight)
  const innerLeft = -halfWidth + thicknessX
  const innerRight = halfWidth - thicknessX
  const innerTop = halfHeight - topThicknessY
  const innerBottom = -halfHeight + thicknessY
  const sideHeight = Math.max(0, innerTop - innerBottom)

  return [
    {
      minX: -halfWidth,
      maxX: halfWidth,
      minY: innerTop,
      maxY: halfHeight,
      area: width * topThicknessY,
    },
    {
      minX: -halfWidth,
      maxX: halfWidth,
      minY: -halfHeight,
      maxY: innerBottom,
      area: width * thicknessY,
    },
    {
      minX: -halfWidth,
      maxX: innerLeft,
      minY: innerBottom,
      maxY: innerTop,
      area: thicknessX * sideHeight,
    },
    {
      minX: innerRight,
      maxX: halfWidth,
      minY: innerBottom,
      maxY: innerTop,
      area: thicknessX * sideHeight,
    },
  ].filter((strip) => strip.maxX > strip.minX && strip.maxY > strip.minY)
}

function resolveStripCounts(strips: FrameStrip[], totalCount: number) {
  const totalArea = strips.reduce((sum, strip) => sum + strip.area, 0)

  if (totalArea <= 1e-6 || totalCount <= 0) {
    return strips.map(() => 0)
  }

  const counts = strips.map((strip) => Math.floor((strip.area / totalArea) * totalCount))
  let remaining = totalCount - counts.reduce((sum, count) => sum + count, 0)

  if (remaining <= 0) {
    return counts
  }

  const priorities = strips
    .map((strip, index) => ({
      index,
      remainder: (strip.area / totalArea) * totalCount - counts[index],
    }))
    .sort((a, b) => b.remainder - a.remainder)

  for (let index = 0; index < priorities.length && remaining > 0; index += 1) {
    counts[priorities[index].index] += 1
    remaining -= 1
  }

  return counts
}

export function generateFrameScatterPoints(
  width: number,
  height: number,
  frameThicknessX: number,
  frameThicknessY: number,
  count: number,
  depth: number,
) {
  const strips = getFrameStrips(width, height, frameThicknessX, frameThicknessY)
  const stripCounts = resolveStripCounts(strips, count)
  const points = new Float32Array(count * 3)
  let pointIndex = 0
  let sequenceIndex = 1

  for (let stripIndex = 0; stripIndex < strips.length; stripIndex += 1) {
    const strip = strips[stripIndex]
    const stripCount = stripCounts[stripIndex] ?? 0
    const stripWidth = strip.maxX - strip.minX
    const stripHeight = strip.maxY - strip.minY

    for (let localIndex = 0; localIndex < stripCount; localIndex += 1) {
      const x = strip.minX + halton(sequenceIndex, 2) * stripWidth
      const y = strip.minY + halton(sequenceIndex, 3) * stripHeight
      const offset = pointIndex * 3

      points[offset] = x
      points[offset + 1] = y
      points[offset + 2] = depth === 0 ? 0 : hashSigned(sequenceIndex * 0.93) * depth

      pointIndex += 1
      sequenceIndex += 1
    }
  }

  return points
}
