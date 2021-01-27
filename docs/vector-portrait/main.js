import { createBlurrer } from './blurrer.js'
import { createEdgeFinder } from './edger.js'
import { createTriangler } from './triangler.js'
import { width, height, cellSize, threshold, sigma1, sigma2, cutoff } from './constants.js'

navigator.mediaDevices.getUserMedia({ video: { width, height } }).then(stream => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()
  video.addEventListener('playing', function () {
    const blurPixelsWebglContext = document.querySelector('#blur-pixels').getContext('webgl', { alpha: false, depth: false })
    const edgePixelsCanvas = document.querySelector('#edge-pixels')
    const edgePixelsWebglContext = edgePixelsCanvas.getContext('webgl', { alpha: false, depth: false })
    const triangulationPixelsWebglContext = document.querySelector('#triangulation-pixels').getContext('webgl', { alpha: false, depth: false })
    const updateBlur = createBlurrer(blurPixelsWebglContext, sigma1)
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
  const buckets = Array(256)
  for (let v = 0; v < 256; ++v) {
    buckets[v] = []
  }
  for (let cellY = 0; cellY < height; cellY += cellSize) {
    for (let cellX = 0; cellX < width; cellX += cellSize) {
      let darkestV = Number.POSITIVE_INFINITY
      let darkestXY
      for (let y = cellY; y < cellY + cellSize; ++y) {
        for (let x = cellX; x < cellX + cellSize; ++x) {
          const index = 4 * (y * width + x)
          const v = edgeness[index]
          if (v < darkestV) {
            darkestV = v
            darkestXY = [x, y]
          }
        }
      }
      buckets[darkestV].push(darkestXY)
    }
  }
  let points = [[0, 0], [width, 0], [width, height], [0, height]]
  for (let v = 0; v <= threshold; ++v) {
    if (buckets[v].length) {
      points = [...points, ...buckets[v]]
    }
  }
  return points.map(([x, y]) => {
    return [
      x / (width - 1) * 2 - 1,
      y / (height - 1) * 2 - 1
    ]
  })
}
