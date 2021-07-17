import { createBlurrer } from './blurrer.js'
import { createEdgeFinder } from './edger.js'
import { createTriangler } from './triangler.js'
import { width, height, cellSize, threshold, sigma0, sigma1, sigma2, cutoff } from './constants.js'

navigator.mediaDevices.getUserMedia({ video: { width, height } }).then(stream => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()
  video.addEventListener('playing', function () {
    const blurPixelsWebglContext = document.querySelector('#blur-pixels').getContext('webgl', { alpha: false, depth: false })
    const edgePixelsCanvas = document.querySelector('#edge-pixels')
    const edgePixelsWebglContext = edgePixelsCanvas.getContext('webgl', { alpha: false, depth: false })
    const triangulationPixelsWebglContext = document.querySelector('#triangulation-pixels').getContext('webgl', { alpha: false, depth: false })
    const updateBlur = createBlurrer(blurPixelsWebglContext, sigma0)
    const updateEdges = createEdgeFinder(edgePixelsWebglContext, sigma1, sigma2, cutoff)
    const updateTriangles = createTriangler(triangulationPixelsWebglContext)
    const redraw = () => {
      window.requestAnimationFrame(redraw)
      updateBlur(video)
      updateEdges(video)
      const blurPixels = new Uint8Array(width * height * 4)
      blurPixelsWebglContext.readPixels(0, 0, width, height, blurPixelsWebglContext.RGBA, blurPixelsWebglContext.UNSIGNED_BYTE, blurPixels)
      const edgePixels = new Uint8Array(width * height * 4)
      edgePixelsWebglContext.readPixels(0, 0, width, height, edgePixelsWebglContext.RGBA, edgePixelsWebglContext.UNSIGNED_BYTE, edgePixels)
      const points = pixelsToPoints(edgePixels)
      updateTriangles(points, blurPixels, width, height)
    }
    redraw()
  })
}, console.error)

function pixelsToPoints (edgeness) {
  const toIndex = (x, y) => 4 * (y * width + x)
  function hasNeighbor (x, y) {
    return x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
      !edgeness[toIndex(x + 1, y)] ||
      !edgeness[toIndex(x - 1, y)] ||
      !edgeness[toIndex(x, y + 1)] ||
      !edgeness[toIndex(x, y - 1)]
  }
  const field = []
  function set (x, y, value) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    field[y * width + x] = value
    return true
  }
  function get (x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    return field[y * width + x]
  }
  const points = []
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      if (hasNeighbor(x, y)) {
      // if (!edgeness[toIndex(x, y)]) {
        points.push([x, y])
        set(x, y, true)
      }
    }
  }
  points.forEach(([x, y]) => {
    if (get(x, y)) {
      walkFrom(x, y)
    }
  })
  return points.map(([x, y]) => {
    return [
      x / (width - 1) * 2 - 1,
      y / (height - 1) * 2 - 1
    ]
  })
}
