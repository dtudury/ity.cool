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
  return (pointColors, pixels, width, height) => {
    const points = pointColors.map(([x, y]) => [x, y])
    const triangles = Delaunator.from(points).triangles
    const positions = []
    for (let i = 0; i < triangles.length; i += 3) {
      positions.push([
        points[triangles[i]],
        points[triangles[i + 1]],
        points[triangles[i + 2]]
      ])
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.flat(2)), gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLocation)

    const colors = []
    for (let i = 0; i < positions.length; ++i) {
      const x = Math.round(((1 + (positions[i][0][0] + positions[i][1][0] + positions[i][2][0]) / 3) / 2) * width)
      const y = Math.round(((1 + (positions[i][0][1] + positions[i][1][1] + positions[i][2][1]) / 3) / 2) * height)
      const rIndex = (x + y * width) * 4
      const noise = 0.0
      const color = [
        pixels[rIndex] / 255 + (Math.random() * 2 - 1) * noise,
        pixels[rIndex + 1] / 255 + (Math.random() * 2 - 1) * noise,
        pixels[rIndex + 2] / 255 + (Math.random() * 2 - 1) * noise
      ]
      // if (Math.random() * 10000 < 1) console.log(color)
      colors.push([color, color, color])
    }
    const fragColors = Float32Array.from(colors.flat(2))
    gl.bindBuffer(gl.ARRAY_BUFFER, fragColorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, fragColors, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(fragColorLocation, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(fragColorLocation)

    gl.drawArrays(gl.TRIANGLES, 0, positions.length * 3)
  }
}
