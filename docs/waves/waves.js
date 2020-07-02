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
    uniform vec2 resolution;
    uniform float time;
    attribute vec2 vertPosition;
    varying vec4 fragColor;
    void main() {
      float x = vertPosition.x - resolution.x * 0.5;
      float y = vertPosition.y - resolution.y * 0.5;
      float r = 0.0;
      float g = 0.0;
      float b = 0.0;
      float w = 0.7;
      float t = 1.0;
      for (int i = 0; i < 27; i++) {
        float offsetTime = time + 100000.0 * float(i);
        float c1 = sin((offsetTime / (w * 10.0) + (sin(t) * x + cos(t) * y) / 100.0) * w) / w;
        c1 += sin((offsetTime / (w * 10.0) + (sin(-t) * x + cos(t) * y) / 100.0) * w) / w;
        offsetTime += 1000.0;
        float c2 = sin((offsetTime / (w * 10.0) + (sin(t) * x + cos(t) * y) / 100.0) * w) / w;
        c2 += sin((offsetTime / (w * 10.0) + (sin(-t) * x + cos(t) * y) / 100.0) * w) / w;
        offsetTime += 3000.0;
        float c3 = sin((offsetTime / (w * 10.0) + (sin(t) * x + cos(t) * y) / 100.0) * w) / w;
        c3 += sin((offsetTime / (w * 10.0) + (sin(-t) * x + cos(t) * y) / 100.0) * w) / w;
        r += c1;
        g += c2;
        b += c3;
        w = w * 1.14;
        t = mod(t * 2.0, 2.0 * 3.1415926538);
      }
      r = sin(r) * 0.5 + 0.4;
      g = sin(g) * 0.5 + 0.4;
      b = sin(b) * 0.5 + 0.4;
      fragColor = vec4(
        r,
        g,
        b,
        1.0
      );
      gl_Position = vec4(
        2.0 * vertPosition.x / resolution.x - 1.0,
        -2.0 * vertPosition.y / resolution.y + 1.0,
        0.0,
        1.0
      );
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

let vertices

const triangleVertexBufferObject = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0)
gl.enableVertexAttribArray(positionAttribLocation)
const timeLocation = gl.getUniformLocation(program, 'time')
const resolutionLocation = gl.getUniformLocation(program, 'resolution')

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const xStep = 8
  const yStep = xStep * Math.sqrt(3) / 2
  vertices = []
  for (let x = 0; x < canvas.width + xStep / 2; x += xStep) {
    for (let y = 0; y < canvas.height; y += yStep * 2) {
      vertices.push([
        x, y,
        x + xStep / 2, y + yStep,
        x - xStep / 2, y + yStep,
        x + xStep / 2, y + yStep,
        x - xStep / 2, y + yStep,
        x, y + yStep * 2,
        x, y,
        x + xStep, y,
        x + xStep / 2, y + yStep,
        x + xStep / 2, y + yStep,
        x + xStep, y + yStep * 2,
        x, y + yStep * 2
      ])
    }
  }
  vertices = vertices.flat()
  console.log(vertices.length / 3)
  gl.viewport(0, 0, window.innerWidth, window.innerHeight)
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}
window.addEventListener('resize', resizeCanvas, false)
resizeCanvas()

function redraw () {
  gl.uniform1f(timeLocation, (Date.now() % 0x100000000) * 0.005)
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
  window.requestAnimationFrame(redraw)
}
redraw()
