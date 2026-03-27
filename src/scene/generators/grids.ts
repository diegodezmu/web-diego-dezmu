import { hashSigned } from './shared'

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
