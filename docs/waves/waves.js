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
    precision lowp float;
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
      float f = ${2 * Math.PI} / 820.0;
      float v = 1.0;
      float amp = 0.5;
      float angle = 0.0;
      for (int i = 0; i < 20; i++) {
        r += amp * sin((time + 0.3) * v + f * (sin(angle) * x + cos(angle) * y));
        g += amp * sin((time + 0.5) * v + f * (sin(angle) * x + cos(angle) * y));
        b += amp * sin((time + 0.0) * v + f * (sin(angle) * x + cos(angle) * y));
        f = f * 1.1;
        v = v * 1.1;
        amp = amp * 0.9;
        angle = mod(angle * 2.0 + 10.0, ${2 * Math.PI});
      }
      r = sin(r);
      g = sin(g);
      b = sin(b);
      fragColor = vec4(
        r,
        g,
        r + b,
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
    precision lowp float;
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
  const xStep = 5
  const yStep = xStep * Math.sqrt(3) / 2
  vertices = []
  for (let x = 0; x < canvas.width + xStep / 2; x += xStep) {
    for (let y = 0; y < canvas.height - yStep; y += yStep * 2) {
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

function redraw (time) {
  gl.uniform1f(timeLocation, (time / 1000))
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
  window.requestAnimationFrame(redraw)
}
redraw(0)
