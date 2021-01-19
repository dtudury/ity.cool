import { createEdgeFinder } from './edgeFinder.js'
const width = 150
const height = 150
navigator.mediaDevices.getUserMedia({ video: { width, height } }).then(stream => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()
  video.addEventListener('playing', function () {
    const edgePixelsWebglContext = document.querySelector('#edge-pixels').getContext('webgl')
    const findEdges = createEdgeFinder(edgePixelsWebglContext)
    // const videoPixels2dContext = document.querySelector('#video-pixels').getContext('2d')
    const redraw = () => {
      // videoPixels2dContext.drawImage(video, 0, 0, width, height)
      window.requestAnimationFrame(redraw)
      findEdges(video)
      const pixels = new Uint8Array(width * height * 4)
      edgePixelsWebglContext.readPixels(0, 0, width, height, edgePixelsWebglContext.RGBA, edgePixelsWebglContext.UNSIGNED_BYTE, pixels)
    }
    redraw()
  })
}, console.error)
