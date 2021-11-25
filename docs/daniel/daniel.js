import {
  h,
  render
} from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'

render(
  document.body,
  h`<canvas style="display: block;"/>`
)
const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl')
if (!gl) {
  console.error('no webgl?!')
}

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
  createShader(
    gl.VERTEX_SHADER,
    `
    precision lowp float;
    uniform vec2 resolution;
    uniform float time;
    attribute vec2 vertPosition;
    varying vec4 fragColor;
    void main() {
      float t = time / 3.0;
      t = t * t;
      float x = 0.5 - vertPosition.x / resolution.x;
      x = x * t;
      float y = 0.5 - vertPosition.y / resolution.y;
      y = y * t;
      float v = 
        + x * x * x
        - 3.0 * x * x * y
        - 3.0 * x * y * y
        + y * y * y
        ;
      v = v - floor(v);
      fragColor = vec4(
        v,
        v,
        v,
        1.0
      );
      gl_Position = vec4(
        2.0 * vertPosition.x / resolution.x - 1.0,
        -2.0 * vertPosition.y / resolution.y + 1.0,
        0.0,
        1.0
      );
    }
  `
  ),
  createShader(
    gl.FRAGMENT_SHADER,
    `
    precision lowp float;
    varying vec4 fragColor;
    void main() {
      gl_FragColor = fragColor;
    }
  `
  )
)
gl.useProgram(program)

let vertices

const triangleVertexBufferObject = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(
  positionAttribLocation,
  2,
  gl.FLOAT,
  gl.FALSE,
  2 * Float32Array.BYTES_PER_ELEMENT,
  0
)
gl.enableVertexAttribArray(positionAttribLocation)
const timeLocation = gl.getUniformLocation(program, 'time')
const resolutionLocation = gl.getUniformLocation(program, 'resolution')

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const xStep = 1
  const yStep = (xStep * Math.sqrt(3)) / 2
  vertices = []
  for (let x = 0; x < canvas.width + xStep / 2; x += xStep) {
    for (let y = 0; y < canvas.height; y += yStep * 2) {
      vertices.push([
        x,
        y,
        x + xStep / 2,
        y + yStep,
        x - xStep / 2,
        y + yStep,
        x + xStep / 2,
        y + yStep,
        x - xStep / 2,
        y + yStep,
        x,
        y + yStep * 2,
        x,
        y,
        x + xStep,
        y,
        x + xStep / 2,
        y + yStep,
        x + xStep / 2,
        y + yStep,
        x + xStep,
        y + yStep * 2,
        x,
        y + yStep * 2
      ])
    }
  }
  vertices = vertices.flat()
  gl.viewport(0, 0, window.innerWidth, window.innerHeight)
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}
window.addEventListener('resize', resizeCanvas, false)
resizeCanvas()

function redraw (t) {
  const time = (t / 1000) % 0x10000
  gl.uniform1f(timeLocation, time)
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
  window.requestAnimationFrame(redraw)
}
redraw(0)
