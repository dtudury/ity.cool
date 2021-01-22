import { createBlurrer } from './blurrer.js'
import { createEdgeFinder } from './edger.js'
import { createTriangler } from './triangler.js'
import { width, height } from './constants.js'

navigator.mediaDevices.getUserMedia({ video: { width, height } }).then(stream => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()
  video.addEventListener('playing', function () {
    const blurPixelsWebglContext = document.querySelector('#blur-pixels').getContext('webgl', { alpha: false, depth: false })
    const edgePixelsCanvas = document.querySelector('#edge-pixels')
    const edgePixelsWebglContext = edgePixelsCanvas.getContext('webgl', { alpha: false, depth: false })
    const triangulationPixelsWebglContext = document.querySelector('#triangulation-pixels').getContext('webgl', { alpha: false, depth: false })
    const updateBlur = createBlurrer(blurPixelsWebglContext, 0.5)
    const updateEdges = createEdgeFinder(edgePixelsWebglContext, 0.5, 0.55, 1)
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
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const v = edgeness[4 * (y * width + x)]
      buckets[v].push([x, y])
    }
  }
  let points = [[0, 0], [width, 0], [width, height], [0, height]]
  for (let v = 0; v <= 220; ++v) {
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
