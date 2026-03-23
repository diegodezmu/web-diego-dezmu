import type { CurveDefinition, StackCluster } from '@/shared/types'
import type { StackLabelDatum } from './types'

type StackCloudResult = {
  points: Float32Array
  labels: StackLabelDatum[]
}

function mulberry32(seed: number) {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(random: () => number) {
  const u = Math.max(random(), 1e-6)
  const v = Math.max(random(), 1e-6)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function hashUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

function hashSigned(seed: number) {
  return hashUnit(seed) * 2 - 1
}

function pathPointAt(svgPath: SVGPathElement, length: number) {
  const point = svgPath.getPointAtLength(length)
  return {
    x: point.x,
    y: point.y,
  }
}

export function sampleSvgPoints(
  svgMarkup: string,
  count: number,
  width: number,
  height: number,
  depth: number,
): Float32Array {
  const parser = new DOMParser()
  const documentSvg = parser.parseFromString(svgMarkup, 'image/svg+xml')
  const root = documentSvg.querySelector('svg')
  const paths = Array.from(documentSvg.querySelectorAll('path'))
    .map((node) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const d = node.getAttribute('d')

      if (!d) {
        return null
      }

      path.setAttribute('d', d)
      return path
    })
    .filter((node): node is SVGPathElement => Boolean(node))

  const viewBox = root?.getAttribute('viewBox')?.split(/\s+/).map(Number)
  const widthSource = viewBox?.[2] ?? Number(root?.getAttribute('width') ?? 1)
  const heightSource = viewBox?.[3] ?? Number(root?.getAttribute('height') ?? 1)
  const lengths = paths.map((path) => path.getTotalLength())
  const totalLength = lengths.reduce((sum, value) => sum + value, 0) || 1
  const points = new Float32Array(count * 3)
  const random = mulberry32(138)
  let cumulative = 0

  const buckets = lengths.map((length) => {
    cumulative += length
    return cumulative / totalLength
  })

  for (let index = 0; index < count; index += 1) {
    const progress = index / Math.max(1, count - 1)
    const jitter = (random() - 0.5) * 0.003
    const lookup = Math.min(0.9999, Math.max(0, progress + jitter))
    const pathIndex = buckets.findIndex((bucket) => lookup <= bucket)
    const selectedIndex = pathIndex === -1 ? buckets.length - 1 : pathIndex
    const selectedPath = paths[selectedIndex]
    const previousBucket = selectedIndex === 0 ? 0 : buckets[selectedIndex - 1]
    const bucketSpan = Math.max(1e-6, buckets[selectedIndex] - previousBucket)
    const localProgress = (lookup - previousBucket) / bucketSpan
    const length = lengths[selectedIndex] * localProgress
    const point = pathPointAt(selectedPath, length)
    const next = pathPointAt(selectedPath, Math.min(length + 1.2, lengths[selectedIndex]))
    const normalX = -(next.y - point.y)
    const normalY = next.x - point.x
    const normalLength = Math.hypot(normalX, normalY) || 1
    const edgeJitter = (random() - 0.5) * 8
    const x = point.x + (normalX / normalLength) * edgeJitter
    const y = point.y + (normalY / normalLength) * edgeJitter

    points[index * 3] = ((x / widthSource) - 0.5) * width
    points[index * 3 + 1] = (0.5 - y / heightSource) * height
    points[index * 3 + 2] = (random() - 0.5) * depth
  }

  return points
}

export function sampleSvgAreaPoints(
  svgMarkup: string,
  count: number,
  width: number,
  height: number,
  depth: number,
): Float32Array {
  const parser = new DOMParser()
  const documentSvg = parser.parseFromString(svgMarkup, 'image/svg+xml')
  const root = documentSvg.querySelector('svg')
  const pathNodes = Array.from(documentSvg.querySelectorAll('path'))
  const viewBox = root?.getAttribute('viewBox')?.split(/\s+/).map(Number)
  const widthSource = viewBox?.[2] ?? Number(root?.getAttribute('width') ?? 1)
  const heightSource = viewBox?.[3] ?? Number(root?.getAttribute('height') ?? 1)
  const canvasWidth = 1600
  const canvasHeight = Math.max(120, Math.round((heightSource / widthSource) * canvasWidth))
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context || pathNodes.length === 0) {
    return sampleSvgPoints(svgMarkup, count, width, height, depth)
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight)
  context.save()
  context.scale(canvasWidth / widthSource, canvasHeight / heightSource)
  context.fillStyle = '#ffffff'

  pathNodes.forEach((node) => {
    const d = node.getAttribute('d')

    if (!d) {
      return
    }

    const path = new Path2D(d)
    const fillRule = node.getAttribute('fill-rule')
    context.fill(path, fillRule === 'evenodd' ? 'evenodd' : 'nonzero')
  })

  context.restore()

  const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight).data
  const solidPixels: number[] = []

  for (let y = 0; y < canvasHeight; y += 1) {
    for (let x = 0; x < canvasWidth; x += 1) {
      if (imageData[(y * canvasWidth + x) * 4 + 3] > 8) {
        solidPixels.push(y * canvasWidth + x)
      }
    }
  }

  if (solidPixels.length === 0) {
    return sampleSvgPoints(svgMarkup, count, width, height, depth)
  }

  const points = new Float32Array(count * 3)
  const random = mulberry32(2481)

  for (let index = 0; index < count; index += 1) {
    const pixel = solidPixels[Math.floor(random() * solidPixels.length)]
    const pixelX = pixel % canvasWidth
    const pixelY = Math.floor(pixel / canvasWidth)
    const localX = pixelX + random()
    const localY = pixelY + random()

    points[index * 3] = ((localX / canvasWidth) - 0.5) * width
    points[index * 3 + 1] = (0.5 - localY / canvasHeight) * height
    points[index * 3 + 2] = (random() - 0.5) * depth
  }

  return points
}

function crossMod(t: number, amount: number, freqX: number, freqY: number) {
  if (amount === 0) {
    return 0
  }

  return amount * Math.sin(freqX * freqY * t)
}

function wavefold(value: number, amount: number) {
  if (amount <= 0) {
    return value
  }

  const gained = value * (1 + amount * 3)
  return (2 / Math.PI) * Math.asin(Math.sin((Math.PI / 2) * gained))
}

function ringMod(value: number, t: number, modFreq: number) {
  if (modFreq <= 0) {
    return value
  }

  return value * Math.sin(modFreq * t)
}

function getCurvePoint(curve: CurveDefinition, t: number, phaseOffset: number) {
  const localCross = crossMod(t, curve.crossModAmount, curve.freqX, curve.freqY)
  let x = Math.sin(curve.freqX * t + curve.phase + phaseOffset + localCross)
  let y = Math.sin(curve.freqY * t + localCross)

  x = wavefold(x, curve.foldAmount)
  y = wavefold(y, curve.foldAmount)
  x = ringMod(x, t, curve.ringModFreq)
  y = ringMod(y, t, curve.ringModFreq)

  return { x, y }
}

export function fillLissajousPoints(
  buffer: Float32Array,
  curve: CurveDefinition,
  phaseOffset: number,
  width: number,
  height: number,
  depth: number,
  thickness: number,
) {
  const count = buffer.length / 3

  for (let index = 0; index < count; index += 1) {
    const seedBase = index + 1
    const progressJitter = (hashUnit(seedBase * 0.71) - 0.5) * 0.028
    const progress = (index / count + progressJitter + 1) % 1
    const t = progress * Math.PI * 2
    const point = getCurvePoint(curve, t, phaseOffset)
    const nextPoint = getCurvePoint(curve, (progress + 1 / count) * Math.PI * 2, phaseOffset)

    const tangentX = nextPoint.x - point.x
    const tangentY = nextPoint.y - point.y
    const normalLength = Math.hypot(tangentX, tangentY) || 1
    const normalX = -tangentY / normalLength
    const normalY = tangentX / normalLength
    const tangentLength = Math.hypot(tangentX, tangentY) || 1
    const tangentNormX = tangentX / tangentLength
    const tangentNormY = tangentY / tangentLength
    const densityBand = hashUnit(seedBase * 1.13)
    const bandPulse = 0.72 + Math.sin(t * 6 + seedBase * 0.003) * 0.16
    let normalOffset = 0
    let tangentOffset = 0
    let depthOffset = 0

    if (densityBand < 0.7) {
      const spread = Math.pow(hashUnit(seedBase * 1.77), 1.35) * thickness * 3.4 * bandPulse
      normalOffset = hashSigned(seedBase * 2.17) * spread
      tangentOffset = hashSigned(seedBase * 2.61) * thickness * 0.9
      depthOffset = hashSigned(seedBase * 3.11) * depth * 0.22
    } else if (densityBand < 0.9) {
      const spread = (1.1 + hashUnit(seedBase * 1.91) * 1.6) * thickness * 3.7 * bandPulse
      normalOffset = hashSigned(seedBase * 2.33) * spread
      tangentOffset = hashSigned(seedBase * 2.89) * thickness * 1.8
      depthOffset = hashSigned(seedBase * 3.47) * depth * 0.38
    } else {
      const spread = (2.1 + hashUnit(seedBase * 2.07) * 2.6) * thickness * 3.9 * bandPulse
      normalOffset = hashSigned(seedBase * 2.53) * spread
      tangentOffset = hashSigned(seedBase * 3.03) * thickness * 3.2
      depthOffset = hashSigned(seedBase * 3.61) * depth * 0.62
    }

    const breathing = Math.sin(t * 4 + phaseOffset * 0.32 + seedBase * 0.0015) * thickness * 0.3
    const x = point.x * width + normalX * (normalOffset + breathing) + tangentNormX * tangentOffset
    const y = point.y * height + normalY * (normalOffset + breathing) + tangentNormY * tangentOffset

    buffer[index * 3] = x
    buffer[index * 3 + 1] = y
    buffer[index * 3 + 2] =
      Math.sin(t * 3 + phaseOffset * 0.4) * depth * 0.1 + depthOffset
  }
}

export function generateFramePoints(
  count: number,
  width: number,
  height: number,
  depth: number,
): Float32Array {
  const points = new Float32Array(count * 3)
  const random = mulberry32(3301)
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const bandWidth = Math.min(width, height) * 0.055
  const perimeter = width * 2 + height * 2

  for (let index = 0; index < count; index += 1) {
    const along = random() * perimeter
    const inward = random() * bandWidth
    const alongJitter = hashSigned(index * 1.31) * bandWidth * 0.04
    const inwardJitter = hashSigned(index * 1.73) * bandWidth * 0.08
    let x = 0
    let y = 0

    if (along < width) {
      x = -halfWidth + along + alongJitter
      y = halfHeight - inward + inwardJitter
    } else if (along < width + height) {
      x = halfWidth - inward + inwardJitter
      y = halfHeight - (along - width) + alongJitter
    } else if (along < width * 2 + height) {
      x = halfWidth - (along - width - height) - alongJitter
      y = -halfHeight + inward - inwardJitter
    } else {
      x = -halfWidth + inward - inwardJitter
      y = -halfHeight + (along - width * 2 - height) - alongJitter
    }

    points[index * 3] = x
    points[index * 3 + 1] = y
    points[index * 3 + 2] = hashSigned(index * 2.19) * depth * 0.08
  }

  return points
}

export function generateFullscreenPoints(
  count: number,
  width: number,
  height: number,
  depth: number,
): Float32Array {
  const points = new Float32Array(count * 3)
  const random = mulberry32(420)

  for (let index = 0; index < count; index += 1) {
    const xProgress = random() * 2 - 1
    const yProgress = random() * 2 - 1
    const stripeWarp = Math.sin(yProgress * 10 + index * 0.02) * 0.28
    points[index * 3] = (xProgress + stripeWarp) * width * 0.5
    points[index * 3 + 1] = yProgress * height * 0.5
    points[index * 3 + 2] = (random() - 0.5) * depth
  }

  return points
}

export function generateStackCloud(count: number, clusters: StackCluster[]): StackCloudResult {
  const points = new Float32Array(count * 3)
  const random = mulberry32(8800)
  const totalWeight = clusters.reduce((sum, cluster) => sum + cluster.weight, 0) || 1
  const horizontalScale = 0.72
  const clusterPositions: Record<string, [number, number, number]> = {
    ai: [-1.6 * horizontalScale, 0.78, 0.18],
    design: [-5.1 * horizontalScale, -0.74, -0.42],
    development: [2.4 * horizontalScale, 0.14, 0.34],
    sound: [5.45 * horizontalScale, -0.92, 0.72],
  }
  const clusterSpreads: Record<string, [number, number, number]> = {
    ai: [2.6 * horizontalScale, 1.55, 1.15],
    design: [2.2 * horizontalScale, 1.4, 1.08],
    development: [3.3 * horizontalScale, 1.75, 1.35],
    sound: [1.9 * horizontalScale, 1.2, 1.02],
  }
  const labels: StackLabelDatum[] = []
  let offset = 0

  clusters.forEach((cluster, clusterIndex) => {
    const center = clusterPositions[cluster.slug] ?? [0, 0, 0]
    const spread = clusterSpreads[cluster.slug] ?? [2, 1.2, 1]
    const ratio = cluster.weight / totalWeight
    const clusterCount = clusterIndex === clusters.length - 1 ? count - offset : Math.floor(count * ratio)
    const skillAnchors = cluster.skills.map((skill, skillIndex) => {
      const ring = skillIndex / Math.max(1, cluster.skills.length)
      const angle = ring * Math.PI * 2 + clusterIndex * 0.4
      const radius = 0.65 + (skillIndex % 4) * 0.24
      const position: [number, number, number] = [
        center[0] + Math.cos(angle) * spread[0] * radius * 0.6,
        center[1] + Math.sin(angle * 1.2) * spread[1] * 0.45,
        center[2] + Math.sin(angle) * spread[2] * 0.55,
      ]

      labels.push({
        id: `${cluster.slug}-${skillIndex}`,
        text: skill,
        position,
        clusterSlug: cluster.slug,
      })

      return position
    })

    for (let pointIndex = 0; pointIndex < clusterCount; pointIndex += 1) {
      const anchor = skillAnchors[Math.floor(random() * skillAnchors.length)] ?? center
      const x =
        anchor[0] +
        gaussian(random) * spread[0] * 0.34 +
        Math.sin(anchor[0] * 0.7 + pointIndex * 0.08) * 0.18
      const y =
        anchor[1] +
        gaussian(random) * spread[1] * 0.34 +
        Math.sin(pointIndex * 0.11 + anchor[2]) * 0.12
      const z = anchor[2] + gaussian(random) * spread[2] * 0.48
      const porous = Math.sin(x * 0.92) + Math.cos(y * 1.6) + Math.sin(z * 2.4)

      if (porous > 1.6) {
        continue
      }

      points[offset * 3] = x
      points[offset * 3 + 1] = y
      points[offset * 3 + 2] = z
      offset += 1
    }
  })

  for (let fillIndex = offset; fillIndex < count; fillIndex += 1) {
    const progression = fillIndex / count
    points[fillIndex * 3] = (progression - 0.5) * 8.3
    points[fillIndex * 3 + 1] = Math.sin(progression * Math.PI * 4) * 0.9
    points[fillIndex * 3 + 2] = Math.cos(progression * Math.PI * 6) * 0.8
  }

  return {
    points,
    labels,
  }
}
