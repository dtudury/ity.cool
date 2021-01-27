import { width, height } from './constants.js'

const R = 8 // bigger than this leads to too complex webgl functions

function gaussianKernel (s) {
  // precalculate couple of values for bell curve function
  const a = 1 / (2 * s ** 2)
  const b = Math.sqrt(2 * Math.PI * s)
  const kernel = []
  for (let y = -R; y <= R; ++y) {
    const row = kernel[y] = []
    for (let x = -R; x <= R; ++x) {
      row[x] = Math.exp(-(x ** 2 + y ** 2) * a) / b
    }
  }
  return kernel
}

function sumKernel (kernel) {
  let sum = 0
  for (let y = -R; y <= R; ++y) {
    for (let x = -R; x <= R; ++x) {
      sum += kernel[y][x]
    }
  }
  return sum
}

function maxKernel (kernel) {
  let max = Number.NEGATIVE_INFINITY
  for (let y = -R; y <= R; ++y) {
    for (let x = -R; x <= R; ++x) {
      max = Math.max(max, kernel[y][x])
    }
  }
  return max
}

function scaleKernel (kernel, scale) {
  for (let y = -R; y <= R; ++y) {
    for (let x = -R; x <= R; ++x) {
      kernel[y][x] *= scale
    }
  }
  return kernel
}

function normalizeKernel (kernel) {
  return scaleKernel(kernel, 1 / sumKernel(kernel))
}

export function normalizedGaussianKernel (s) {
  return normalizeKernel(gaussianKernel(s))
}

export function edgeKernel (s1, s2) {
  const kernel1 = normalizedGaussianKernel(s1)
  const kernel2 = normalizedGaussianKernel(s2)
  const kernel = []
  for (let y = -R; y <= R; ++y) {
    kernel[y] = []
    for (let x = -R; x <= R; ++x) {
      kernel[y][x] = (kernel2[y][x] - kernel1[y][x])
    }
  }
  const temp = scaleKernel(kernel, 1 / maxKernel(kernel))
  return temp
}

export function stringifyKernel (kernel) {
  const textureStrings = []
  for (let y = -R; y <= R; ++y) {
    for (let x = -R; x <= R; ++x) {
      if (Math.abs(kernel[y][x]) >= 0.0001) {
        const mappedX = x / width
        const mappedY = y / height
        textureStrings.push(`${kernel[y][x].toFixed(4)} * texture2D(u_image, v_texCoord + vec2(${mappedX.toFixed(4)}, ${mappedY.toFixed(4)}))`)
      }
    }
  }
  return textureStrings.join(' + ')
}
