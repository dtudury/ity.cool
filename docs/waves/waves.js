const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl')
if (!gl) {
  console.error('no webgl?!')
}

canvas.style.display = 'block'
document.body.appendChild(canvas)
document.body.style.margin = 0
while (document.body.lastChild) {
  document.body.removeChild(document.body.lastChild)
}
document.body.appendChild(canvas)

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewport(0, 0, window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', resizeCanvas, false)
resizeCanvas()

function createProgram (vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

function createShader (type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }
  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

const program = createProgram(
  createShader(gl.VERTEX_SHADER, `
    precision mediump float;
    uniform float u_time;
    attribute vec2 vertPosition;
    varying vec4 fragColor;
    void main() {
      fragColor = vec4(
        (sin(vertPosition.x * 5.0) + 1.0) * 0.5, 
        (sin(vertPosition.y * 5.0) + 1.0) * 0.5, 
        (sin(u_time) + 1.0) * 0.5, 
        1.0
      );
      gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
  `),
  createShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying vec4 fragColor;
    void main() {
      gl_FragColor = fragColor;
    }
  `)
)
gl.useProgram(program)

const triangleVertices = new Float32Array([
  0.0, 1.0,
  -0.1, -1.0,
  0.1, -1.0,
  0.0, 1.0,
  -0.1, -1.0,
  0.1, -1.0
])

const triangleVertexBufferObject = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0)
gl.enableVertexAttribArray(positionAttribLocation)
const timeLocation = gl.getUniformLocation(program, 'u_time')

function redraw () {
  const t = Date.now()
  gl.uniform1f(timeLocation, (t % 0x10000000) / 1000)
  triangleVertices[1] = Math.sin(t / 1000)
  triangleVertices[2] = triangleVertices[3] = Math.sin(t / 1200)
  triangleVertices[4] = -(triangleVertices[5] = Math.sin(t / 1300))
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.DYNAMIC_DRAW)
  gl.clearColor(0.25, 0.75, 1.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
  window.requestAnimationFrame(redraw)
}
redraw()
