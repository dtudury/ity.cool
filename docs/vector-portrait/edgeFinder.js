import { createProgram, createShader } from './webglHelpers.js'

function edgeKernel () {
  const gaussianFunctionFactory = s => {
    const a = 1 / (2 * s ** 2)
    const b = Math.sqrt(2 * Math.PI * s)
    return d => Math.exp(-(d ** 2) * a) / b
  }
  const r = 8
  const g1 = gaussianFunctionFactory(0.5)
  const g2 = gaussianFunctionFactory(0.6)
  let sum1 = 0
  let sum2 = 0
  const kernel1 = []
  const kernel2 = []
  for (let y = -r; y <= r; ++y) {
    const row1 = kernel1[y] = []
    const row2 = kernel2[y] = []
    for (let x = -r; x <= r; ++x) {
      const d = (x ** 2 + y ** 2) ** 0.5
      const w1 = g1(d)
      const w2 = g2(d)
      sum1 += w1
      sum2 += w2
      row1[x] = w1
      row2[x] = w2
    }
  }
  // normalize and combine into texture string array
  const textureStrings = []
  const combos = []
  for (let y = -r; y <= r; ++y) {
    for (let x = -r; x <= r; ++x) {
      const c1 = kernel1[y][x] / sum1
      const c2 = kernel2[y][x] / sum2
      const combo = (c2 - c1) * 100
      if (Math.abs(combo) > 0.00001) {
        combos.push(combo.toFixed(8))
        textureStrings.push(`${combo.toFixed(8)} * texture2D(u_image, v_texCoord + vec2(${(x / 150).toFixed(8)}, ${(y / 150).toFixed(8)}))`)
      }
    }
  }
  return textureStrings.join(' + ')
}

const ek = edgeKernel()

export function createEdgeFinder (gl) {
  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_texCoord.x * 2.0 - 1.0, a_texCoord.y * -2.0 + 1.0, 0, 1);
        v_texCoord = a_texCoord;
      }
  `), createShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;
    void main() {
      vec4 pixel = vec4(${ek});
      float v = 1.0 - (pixel.r + pixel.g + pixel.b) / 3.0;
      gl_FragColor = vec4(v, v, v, 1);
    }
  `)
  )
  gl.useProgram(program)
  const texcoordLocation = gl.getAttribLocation(program, 'a_texCoord')
  const texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]), gl.STATIC_DRAW)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(program)
  gl.enableVertexAttribArray(texcoordLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

  return image => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}
