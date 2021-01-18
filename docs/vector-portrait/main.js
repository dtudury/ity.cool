const width = 150
const height = 150
navigator.mediaDevices.getUserMedia({ video: { width, height } }).then(stream => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()
  video.addEventListener('playing', function () {
    const edgePixelsWebglContext = document.querySelector('#edge-pixels').getContext('webgl')
    const updateEdges = createAndUseImageProcessingProgram(edgePixelsWebglContext)
    // const videoPixels2dContext = document.querySelector('#video-pixels').getContext('2d')
    const redraw = () => {
      // videoPixels2dContext.drawImage(video, 0, 0, width, height)
      window.requestAnimationFrame(redraw)
      updateEdges(video)
    }
    redraw()
  })
}, console.error)

function edgeKernel () {
  const gaussianFunctionFactory = s => {
    const a = 1 / (2 * s ** 2)
    const b = Math.sqrt(2 * Math.PI * s)
    return d => Math.exp(-(d ** 2) * a) / b
  }
  const r = 7
  const g1 = gaussianFunctionFactory(1)
  const g2 = gaussianFunctionFactory(4)
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
  let sum = 0
  let abssum = 0
  for (let y = -r; y <= r; ++y) {
    for (let x = -r; x <= r; ++x) {
      const c1 = 1 * kernel1[y][x] / sum1
      const c2 = 2 * kernel2[y][x] / sum2
      const combo = (c1 - c2)
      textureStrings.push(`${combo.toFixed(8)} * texture2D(u_image, v_texCoord + vec2(${x / width}, ${y / height}))`)
      kernel1[y][x] = combo
      sum += combo
      abssum += Math.abs(combo)
    }
  }
  console.log(sum)
  console.log(abssum)
  console.log(kernel1)
  console.log(kernel1.map(row => row.map(cell => cell.toFixed(8))).map(JSON.stringify).join('\n'))
  // console.log(kernel2.map(row => row.map(cell => cell.toFixed(8))).map(JSON.stringify).join('\n'))
  return textureStrings.join(' + ')
}

const ek = edgeKernel()

function createAndUseImageProcessingProgram (gl) {
  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_texCoord * -2.0 + 1.0, 0, 1);
        v_texCoord = a_texCoord;
      }
  `), createShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;
    void main() {
       // gl_FragColor = texture2D(u_image, v_texCoord);
       gl_FragColor = abs(${ek});
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

function createProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }
  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}
