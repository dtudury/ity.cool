import { createProgram, createShader } from './webglHelpers.js'
import { edgeKernel, stringifyKernel } from './kernels.js'

export function createEdgeFinder (gl, s1, s2, factor) {
  const kernel = stringifyKernel(edgeKernel(s1, s2, factor))
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
        vec4 pixel = vec4(${kernel});
        float v = 1.0 - (0.2627 * pixel.r + 0.6780 * pixel.g + 0.0593 * pixel.b);
        // float v = 1.0 - (pixel.r + pixel.g + pixel.b) / 3.0;
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
  gl.useProgram(program)
  gl.enableVertexAttribArray(texcoordLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

  return image => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}
