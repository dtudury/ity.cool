import { createEdgeFinder } from './edgeFinder.js'
import { createBlurrer } from './blurrer.js'
import { createTriangler } from './triangler.js'
const width = 150
const height = 150

navigator.mediaDevices.getUserMedia({ video: { width, height } }).then(stream => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()
  video.addEventListener('playing', function () {
    const blurPixelsWebglContext = document.querySelector('#blur-pixels').getContext('webgl', { alpha: false, depth: false })
    const edgePixelsCanvas = document.querySelector('#edge-pixels')
    const edgePixelsWebglContext = edgePixelsCanvas.getContext('webgl', { alpha: false, depth: false })
    // const edge2PixelsWebglContext = document.querySelector('#edge2-pixels').getContext('webgl', { alpha: false, depth: false })
    const triangulationPixelsWebglContext = document.querySelector('#triangulation-pixels').getContext('webgl', { alpha: false, depth: false })
    const blurrer = createBlurrer(blurPixelsWebglContext, 0.01)
    const findEdges = createEdgeFinder(edgePixelsWebglContext, 0.5, 0.55, 1)
    // const findEdges2 = createEdgeFinder(edge2PixelsWebglContext, 0.5, 0.6, 1)
    const triangler = createTriangler(triangulationPixelsWebglContext)
    // const videoPixels2dContext = document.querySelector('#video-pixels').getContext('2d')
    const redraw = () => {
      // videoPixels2dContext.drawImage(video, 0, 0, width, height)
      window.requestAnimationFrame(redraw)
      blurrer(video)
      findEdges(video)
      // findEdges2(edgePixelsCanvas)
      const blurPixels = new Uint8Array(width * height * 4)
      blurPixelsWebglContext.readPixels(0, 0, width, height, blurPixelsWebglContext.RGBA, blurPixelsWebglContext.UNSIGNED_BYTE, blurPixels)
      const edgePixels = new Uint8Array(width * height * 4)
      // edge2PixelsWebglContext.readPixels(0, 0, width, height, edge2PixelsWebglContext.RGBA, edge2PixelsWebglContext.UNSIGNED_BYTE, edgePixels)
      edgePixelsWebglContext.readPixels(0, 0, width, height, edgePixelsWebglContext.RGBA, edgePixelsWebglContext.UNSIGNED_BYTE, edgePixels)
      const points = pixelsToPoints(edgePixels)
      triangler(points, blurPixels, width, height)
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
  let points = [[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]]
  for (let v = 0; v <= 220; ++v) {
    if (buckets[v].length) {
      points = [...points, ...buckets[v]]
    }
  }
  return points.map(([x, y]) => {
    return [
      x / width * 2 - 1,
      y / height * 2 - 1
    ]
  })
}
