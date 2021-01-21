import { createProgram, createShader } from './webglHelpers.js'
import Delaunator from './delaunator.4.0.1.js'
console.log(Delaunator)

export function createTriangler (gl) {
  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      attribute vec3 a_fragColor;
      varying vec3 v_fragColor;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_fragColor = a_fragColor;
      }
    `), createShader(gl, gl.FRAGMENT_SHADER, `
      precision lowp float;
      varying vec3 v_fragColor;
      void main() {
        gl_FragColor = vec4(v_fragColor, 1.0);
      }  
    `)
  )
  gl.useProgram(program)
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()
  const fragColorLocation = gl.getAttribLocation(program, 'a_fragColor')
  const fragColorBuffer = gl.createBuffer()
  return (pointColors) => {
    const points = pointColors.map(([x, y]) => [x, y])
    const rgb = pointColors.map(([x, y, r, g, b]) => [r / 255, g / 255, b / 255])
    const triangles = Delaunator.from(points).triangles
    const positions = []
    for (let i = 0; i < triangles.length; ++i) {
      positions[i] = points[triangles[i]]
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.flat(2)), gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLocation)

    const colors = []
    for (let i = 0; i < triangles.length; ++i) {
      colors[i] = rgb[triangles[i]].map(v => v + Math.random() * 0.2 - 0.1)
    }
    const fragColors = Float32Array.from(colors.flat())
    gl.bindBuffer(gl.ARRAY_BUFFER, fragColorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, fragColors, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(fragColorLocation, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(fragColorLocation)

    gl.drawArrays(gl.TRIANGLES, 0, positions.length)
  }
}
