import { h } from '../esm/0.6.0.min.js'

function r (values, amount = 1) {
  if (Array.isArray(values)) {
    return values.map(value => r(value, amount))
  }
  return values + amount * Math.random() * 1 - 0.5
}

export function box (x, y, z, width, height, depth, shadow, unitWidth = 20, unitHeight = unitWidth, color) {
  const scale = Math.min(unitHeight, unitWidth)
  const unitDepthX = scale / 3
  const unitDepthY = scale / 2
  const wiggle = scale / 12
  /**
   *   5------6
   *  /|     /|
   * 2-+----3 |
   * | 7----+-4
   * |/     |/
   * 0------1
   */
  x = x * unitWidth + unitDepthX * z
  y = y * unitHeight - unitDepthY * z
  const _w = unitWidth * width
  const _h = unitHeight * height
  const _dx = unitDepthX * depth
  const _dy = unitDepthY * depth
  const points = r([
    [x, y],
    [x + _w, y],
    [x, y - _h],
    [x + _w, y - _h],
    [x + _w + _dx, y - _dy],
    [x + _dx, y - _h - _dy],
    [x + _w + _dx, y - _h - _dy],
    [x + _dx, y - _dy]
  ], wiggle)
  const lineGroups = [
    [[0, 1], [2, 3], [5, 6]],
    [[5, 2], [6, 3], [4, 1]],
    [[4, 6], [1, 3], [0, 2]]
  ]
  function getControlPoints (p0, p3) {
    const d = Math.sqrt(Math.pow(p0[0] - p3[0], 2) + Math.pow(p0[1] - p3[1], 2))
    return [
      r([(p0[0] * 2 + p3[0]) / 3, (p0[1] * 2 + p3[1]) / 3], d / 40),
      r([(p0[0] + p3[0] * 2) / 3, (p0[1] + p3[1] * 2) / 3], d / 40)
    ]
  }
  const allDirections = []
  const allLines = [...lineGroups.flat(), [7, 0], [7, 4], [7, 5]]
  allLines.forEach(([a, b]) => {
    const p0 = points[a]
    const p3 = points[b]
    const [p1, p2] = getControlPoints(p0, p3)
    allDirections[a] = allDirections[a] || []
    allDirections[a][b] = [p1, p2, p3]
    allDirections[b] = allDirections[b] || []
    allDirections[b][a] = [p2, p1, p0]
  })
  function curve (a, b) {
    const [p1, p2, p3] = allDirections[a][b]
    return `C${[p1, p2, p3].flat().join(' ')}`
  }
  const makeSide = arr => `M${points[arr[arr.length - 1]].join(' ')} ${arr.map((v, i, a) => curve(a[(i + a.length - 1) % a.length], v)).join('')}Z`
  const all = makeSide([0, 2, 5, 6, 4, 1])
  const bottom = makeSide([7, 4, 1, 0])
  const front = makeSide([1, 0, 2, 3])
  const top = makeSide([2, 5, 6, 3])
  const right = makeSide([6, 4, 1, 3])
  function interpolate (line, t) {
    const it = 1 - t
    const a = points[line[0]]
    const [b, c, d] = allDirections[line[0]][line[1]]
    return [0, 1].map(i => Math.pow(it, 3) * a[i] + 3 * Math.pow(it, 2) * t * b[i] + 3 * it * Math.pow(t, 2) * c[i] + Math.pow(t, 3) * d[i])
  }
  function mapLineGroup (lineGroup, g) {
    const len = [width, depth, height][g]
    if (!len) {
      return ''
    }
    return [...Array(len - 1).keys()].map((v, i, arr) => {
      const t = (i + 1 + Math.random() * 0.2 - 0.1) / (arr.length + 1)
      const [a, b, c] = lineGroup.map(line => interpolate(line, t))
      const [aab, abb] = getControlPoints(a, b)
      const [bbc, bcc] = getControlPoints(b, c)
      const ab = `C${[aab, abb, b].map(pair => pair.join(' ')).join(' ')}`
      const bc = `C${[bbc, bcc, c].map(pair => pair.join(' ')).join(' ')}`
      return `M${a.join(' ')}${ab}${bc}`
    }).join('')
  }
  const innerlines = lineGroups.map(mapLineGroup).join('')
  let _shadow = []
  if (shadow === 'bottom') {
    _shadow = h`<path d=${bottom} stroke="none" fill="#aa8866" filter="url(#shadow)"/>`
  } else if (shadow === 'all') {
    _shadow = h`<path d=${all} stroke="none" fill="#aa8866" filter="url(#shadow)"/>`
  }
  return h`
    ${_shadow}
    <path d=${top} stroke-width="2"fill="hsl(${color}, 100%, 95%)"/>
    <path d=${right} stroke-width="2"fill="hsl(${color}, 100%, 85%)"/>
    <path d=${front} stroke-width="2"fill="hsl(${color}, 100%, 90%)"/>
    <path d=${innerlines}/>
  `
}

export function ones (x, y, count, scale = 20) {
  const width = 1
  const height = 1
  const depth = 1
  return [
    [...Array(Math.min(count, 5)).keys()].map(i => box(x, y - i * 1.75, 0, width, height, depth, 'bottom', scale, scale, 60)),
    [...Array(Math.max(count - 5, 0)).keys()].map(i => box(x + 2, y - i * 1.75, 0, width, height, depth, 'bottom', scale, scale, 60))
  ]
}

export function tens (x, y, count, scale = 20) {
  const width = 1
  const height = 10
  const depth = 1
  return [
    [...Array(Math.max(count - 5, 0)).keys()].map(i => box(x + i * 2 + 1, y, 7, width, height, depth, 'all', scale, scale, 120)),
    [...Array(Math.min(count, 5)).keys()].map(i => box(x + i * 2, y, 0, width, height, depth, 'all', scale, scale, 120))
  ]
}

export function hundreds (x, y, count, scale = 20) {
  const width = 10
  const height = 10
  const depth = 1
  return [
    [...Array(Math.max(count - 5, 0)).keys()].map(i => box(x - i * 1.5 - 3, y, 14 + i * 2.5, width, height, depth, 'all', scale, scale, 240)).reverse(),
    [...Array(Math.min(count, 5)).keys()].map(i => box(x - i * 1.5, y, i * 2.5, width, height, depth, 'all', scale, scale, 240)).reverse()
  ]
}

export function thousands (x, y, count, scale = 5) {
  const width = 10
  const height = 10
  const depth = 10
  x *= 4
  y *= 4
  return [
    [...Array(count).keys()].map(i => box(x + i * 14, y, 0, width, height, depth, 'bottom', scale, scale, 0))
  ]
}
