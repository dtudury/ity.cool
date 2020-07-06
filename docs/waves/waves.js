import { h, render, proxy, watchFunction, mapEntries } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'

const model = window.model = proxy({})
const examples = {
  'flame rings': {
    cellSize: 5,
    waves: 18,
    fStart: 0.02,
    vStart: 0.4,
    ampStart: 0.9,
    angleStart: 1.5,
    fScale: 1.05,
    vScale: 1.25,
    ampScale: 0.85,
    angleScale: 1.1,
    startRGB: { r: 0.4, g: 0.2, b: 0 },
    offsetRGB: { r: 0.20, g: 0.10, b: 0 },
    rMapping: [-10, 0, 0, 1],
    gMapping: [0, -10, 0, 1],
    bMapping: [0, 0, -10, 1]
  },
  'sunny side up': {
    cellSize: 5,
    waves: 13,
    fStart: 0.02,
    vStart: 2.4,
    ampStart: 0.9,
    angleStart: 1,
    fScale: 1.05,
    vScale: 0.9,
    ampScale: 0.85,
    angleScale: 2.1,
    startRGB: { r: 2, g: 4, b: 0 },
    offsetRGB: { r: 0, g: 0, b: 0 },
    rMapping: [0, 5, 5, -4.5],
    gMapping: [5, 5, 5, -4.5],
    bMapping: [5, 5, 0, -4.5]
  },
  'lava lamp (default)': {
    cellSize: 5,
    waves: 13,
    fStart: 0.02,
    vStart: 2.4,
    ampStart: 0.9,
    angleStart: 1,
    fScale: 1.05,
    vScale: 0.97,
    ampScale: 0.97,
    angleScale: 2.1,
    startRGB: { r: 0, g: 0, b: 0 },
    offsetRGB: { r: 0.4, g: 0.8, b: 0 },
    rMapping: [-15, -5, -5, 10],
    bMapping: [-5, 0, -5, 9],
    gMapping: [0, -5, 0, 4]
  },
  'unicorn farts': {
    cellSize: 5,
    waves: 30,
    fStart: 0.01,
    vStart: 1.0,
    ampStart: 0.4,
    angleStart: 3,
    fScale: 1.15,
    vScale: 1.05,
    ampScale: 0.90,
    angleScale: 2,
    startRGB: { r: 0, g: 0, b: 0 },
    offsetRGB: { r: 20, g: 0, b: 10 },
    rMapping: [1.2, 0, 0, 0.2],
    gMapping: [0, 1.2, 0, 0.2],
    bMapping: [0, 0, 1.2, 0.2]
  }
}

function setFromHash () {
  Object.assign(model, examples['lava lamp (default)'])
  if (document.location.hash) {
    try {
      const hash = JSON.parse(unescape(document.location.hash.substring(1)))
      Object.assign(model, hash)
    } catch (err) {
      console.error(err)
    }
  }
}
setFromHash()

window.addEventListener('hashchange', setFromHash)

render(document.body, h`
  <canvas style="display: block;"/>
  <details>
    <summary>details</summary>
    TODO: Put some controls here to edit inputs. In the meantime, here's some examples:
    <ul>
    ${mapEntries(examples, (value, name) => {
      return h`<li><a href="#${escape(JSON.stringify(value))}">${name}</a></li>`
    })}
    </ul>
    The model is global and "live" so if you wanted to open the console and start editing properties on model, things would change (including the url)
  </details>
`)
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
  createShader(gl.VERTEX_SHADER, `
    precision lowp float;
    uniform vec2 resolution;
    uniform float time;
    uniform int waves;
    uniform float fStart;
    uniform float vStart;
    uniform float ampStart;
    uniform float angleStart;
    uniform float fScale;
    uniform float vScale;
    uniform float ampScale;
    uniform float angleScale;
    uniform vec3 startRGB;
    uniform vec3 offsetRGB;
    uniform vec4 rMapping;
    uniform vec4 gMapping;
    uniform vec4 bMapping;
    attribute vec2 vertPosition;
    varying vec4 fragColor;
    void main() {
      float x = vertPosition.x - resolution.x * 0.5;
      float y = vertPosition.y - resolution.y * 0.5;
      float r = startRGB.r;
      float g = startRGB.g;
      float b = startRGB.b;
      float f = fStart;
      float v = vStart;
      float amp = ampStart;
      float angle = angleStart;
      for (int i = 0; i < 100; i++) {
        if (i > waves) {
          break;
        }
        float t = time + float(i);
        r += amp * sin((t + offsetRGB.r) * v + f * (sin(angle) * x + cos(angle) * y));
        g += amp * sin((t + offsetRGB.g) * v + f * (sin(angle) * x + cos(angle) * y));
        b += amp * sin((t + offsetRGB.b) * v + f * (sin(angle) * x + cos(angle) * y));
        f = f * fScale;
        v = v * vScale;
        amp = amp * ampScale;
        angle = mod(angle * angleScale, ${2 * Math.PI});
      }
      r = sin(r) * 0.5 + 0.5;
      g = sin(g) * 0.5 + 0.5;
      b = sin(b) * 0.5 + 0.5;
      fragColor = vec4(
        rMapping[3] + rMapping.r * r + rMapping.g * g + rMapping.b * b,
        gMapping[3] + gMapping.r * r + gMapping.g * g + gMapping.b * b,
        bMapping[3] + bMapping.r * r + bMapping.g * g + bMapping.b * b,
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
const wavesLocation = gl.getUniformLocation(program, 'waves')
const fStartLocation = gl.getUniformLocation(program, 'fStart')
const vStartLocation = gl.getUniformLocation(program, 'vStart')
const ampStartLocation = gl.getUniformLocation(program, 'ampStart')
const angleStartLocation = gl.getUniformLocation(program, 'angleStart')
const fScaleLocation = gl.getUniformLocation(program, 'fScale')
const vScaleLocation = gl.getUniformLocation(program, 'vScale')
const ampScaleLocation = gl.getUniformLocation(program, 'ampScale')
const angleScaleLocation = gl.getUniformLocation(program, 'angleScale')
const startRGBLocation = gl.getUniformLocation(program, 'startRGB')
const offsetRGBLocation = gl.getUniformLocation(program, 'offsetRGB')
const rMappingLocation = gl.getUniformLocation(program, 'rMapping')
const gMappingLocation = gl.getUniformLocation(program, 'gMapping')
const bMappingLocation = gl.getUniformLocation(program, 'bMapping')

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const xStep = model.cellSize
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
  gl.viewport(0, 0, window.innerWidth, window.innerHeight)
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}
window.addEventListener('resize', resizeCanvas, false)

watchFunction(() => {
  resizeCanvas()
  gl.uniform1i(wavesLocation, model.waves)
  gl.uniform1f(fStartLocation, model.fStart)
  gl.uniform1f(vStartLocation, model.vStart)
  gl.uniform1f(ampStartLocation, model.ampStart)
  gl.uniform1f(angleStartLocation, model.angleStart)
  gl.uniform1f(fScaleLocation, model.fScale)
  gl.uniform1f(vScaleLocation, model.vScale)
  gl.uniform1f(ampScaleLocation, model.ampScale)
  gl.uniform1f(angleScaleLocation, model.angleScale)
  gl.uniform3f(startRGBLocation, model.startRGB.r, model.startRGB.g, model.startRGB.b)
  gl.uniform3f(offsetRGBLocation, model.offsetRGB.r, model.offsetRGB.g, model.offsetRGB.b)
  gl.uniform4f(rMappingLocation, ...model.rMapping)
  gl.uniform4f(gMappingLocation, ...model.gMapping)
  gl.uniform4f(bMappingLocation, ...model.bMapping)
  document.location.hash = escape(JSON.stringify(model))
})

function redraw (t) {
  const time = (t / 1000) % 0x10000
  gl.uniform1f(timeLocation, time)
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
  window.requestAnimationFrame(redraw)
}
redraw(0)
