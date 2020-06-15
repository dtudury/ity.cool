const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl')
// handle !gl

document.body.appendChild(canvas)
document.body.style.margin = 0
while (document.body.lastChild) {
  document.body.removeChild(document.body.lastChild)
}
document.body.appendChild(canvas)

const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, `
  precision mediump float;
  attribute vec2 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;
  void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
  }
`)
gl.compileShader(vertexShader)

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, `
  precision mediump float;
  varying vec3 fragColor;
  void main() {
    gl_FragColor = vec4(fragColor, 1.0);
  }
`)
gl.compileShader(fragmentShader)

const program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)
// check for errors and validate

const triangleVertices = new Float32Array([
  // X, Y, R, G, B
  0.0, 1.0, 1.0, 1.0, 0.0,
  -1.0, -1.0, 0.0, 1.0, 1.0,
  1.0, -1.0, 1.0, 0.0, 1.0
])

const triangleVertexBufferObject = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)

const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0)
gl.enableVertexAttribArray(positionAttribLocation)

const colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT)
gl.enableVertexAttribArray(colorAttribLocation)


let redrawing = false

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewport(0, 0, window.innerWidth, window.innerHeight)
  redraw()
}
window.addEventListener('resize', resizeCanvas, false)
resizeCanvas()

function redraw() {
  if (!redrawing) {
    redrawing = true
    window.requestAnimationFrame(() => {
      redrawing = false
      redraw()
    })
  }
  triangleVertices[1] = Math.sin(Date.now() / 1000)
  triangleVertices[5] = triangleVertices[6] = Math.sin(Date.now() / 1200)
  triangleVertices[10] = -(triangleVertices[11] = Math.sin(Date.now() / 1300))
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.DYNAMIC_DRAW)
  gl.clearColor(0.25, 0.75, 1.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Main render loop
  gl.useProgram(program)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}
