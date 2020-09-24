import { h } from '../esm/0.6.0.min.js'

function pToXY (x, y, scale, ps) {
  /**
   * 4--++-+ 2.0
   * |  || |
   * 3--++-+ 1.5
   * |  || |
   * 2--++-+ 1.0
   * |  || |
   * 1--++-+ 0.5
   * |  || |
   * 0-123-4 0.0
   */
  const r = v => Math.random() * v * 2 - v
  const xMap = [r(0.1), 0.33 + r(0.1), 0.5 + r(0.1), 0.67 + r(0.1), 1 + r(0.1)]
  const yMap = [r(0.2), 0.5 + r(0.2), 1 + r(0.2), 1.5 + r(0.2), 2 + r(0.2)]
  function map (ps) {
    return ps.map((p, i) => {
      if (Array.isArray(p)) {
        return map(p)
      }
      if (i % 2) {
        return y - yMap[p] * scale
      } else {
        return x + xMap[p] * scale
      }
    })
  }
  return map(ps)
}

function _0 (x, y, scale) {
  const [p, ps] = pToXY(x, y, scale, [[0, 2], [
    0, 4, 2, 4,
    4, 4, 4, 2,
    4, 0, 2, 0,
    0, 0, 0, 2
  ]])
  return h`<path d="M${p.join(' ')}Q${ps.join(' ')}Z"/>`
}

function _1 (x, y, scale) {
  const [ps1, ps2] = pToXY(x, y, scale, [[
    0, 3,
    2, 4,
    2, 0
  ], [
    0, 0,
    4, 0
  ]])
  return h`<path d="M${ps1.join(' ')}M${ps2.join(' ')}"/>`
}

function _2 (x, y, scale) {
  const [p1, ps1, p2] = pToXY(x, y, scale, [[0, 3], [
    0, 4, 2, 4,
    4, 4, 4, 3,
    4, 2, 0, 0
  ], [4, 0]])
  return h`<path d="M${p1.join(' ')}Q${ps1.join(' ')}L${p2.join(' ')}"/>`
}

function _3 (x, y, scale) {
  const [p, ps] = pToXY(x, y, scale, [[0, 3], [
    0, 4, 2, 4,
    4, 4, 4, 3,
    4, 2, 2, 2,
    4, 2, 4, 1,
    4, 0, 2, 0,
    0, 0, 0, 1
  ]])
  return h`<path d="M${p.join(' ')}Q${ps.join(' ')}"/>`
}

function _4 (x, y, scale) {
  const [ps1, ps2] = pToXY(x, y, scale, [[
    0, 4,
    0, 2,
    4, 2
  ], [
    3, 3,
    3, 0
  ]])
  return h`<path d="M${ps1.join(' ')}M${ps2.join(' ')}"/>`
}

function _5 (x, y, scale) {
  const [ps1, ps2] = pToXY(x, y, scale, [[
    4, 4,
    0, 4,
    0, 3
  ], [
    4, 3, 4, 1,
    4, 0, 2, 0,
    0, 0, 0, 1
  ]])
  return h`<path d="M${ps1.join(' ')}Q${ps2.join(' ')}"/>`
}

function _6 (x, y, scale) {
  const [p, ps] = pToXY(x, y, scale, [[4, 3], [
    4, 4, 2, 4,
    0, 4, 0, 1,
    0, 0, 2, 0,
    4, 0, 4, 1,
    4, 2, 2, 2,
    0, 2, 0, 1
  ]])
  return h`<path d="M${p.join(' ')}Q${ps.join(' ')}"/>`
}

function _7 (x, y, scale) {
  const ps = pToXY(x, y, scale, [
    0, 4,
    4, 4,
    0, 0
  ])
  return h`<path d="M${ps.join(' ')}"/>`
}

function _8 (x, y, scale) {
  const [p, ps] = pToXY(x, y, scale, [[2, 2], [
    4, 2, 4, 3,
    4, 4, 2, 4,
    0, 4, 0, 3,
    0, 2, 2, 2,
    4, 2, 4, 1,
    4, 0, 2, 0,
    0, 0, 0, 1,
    0, 2, 2, 2
  ]])
  return h`<path d="M${p.join(' ')}Q${ps.join(' ')}"/>`
}

function _9 (x, y, scale) {
  const [p, ps] = pToXY(x, y, scale, [[0, 1], [
    0, 0, 2, 0,
    4, 0, 4, 3,
    4, 4, 2, 4,
    0, 4, 0, 3,
    0, 2, 2, 2,
    4, 2, 4, 3
  ]])
  return h`<path d="M${p.join(' ')}Q${ps.join(' ')}"/>`
}

function _plus (x, y, scale) {
  const [ps1, ps2] = pToXY(x, y, scale, [[
    0, 2,
    4, 2
  ], [
    2, 3,
    2, 1
  ]])
  return h`<path d="M${ps1.join(' ')}M${ps2.join(' ')}"/>`
}

function _minus (x, y, scale) {
  const ps = pToXY(x, y, scale, [
    0, 2,
    4, 2
  ])
  return h`<path d="M${ps.join(' ')}"/>`
}

function _times (x, y, scale) {
  const [ps1, ps2] = pToXY(x, y, scale, [[
    0, 1,
    4, 3
  ], [
    0, 3,
    4, 1
  ]])
  return h`<path d="M${ps1.join(' ')}M${ps2.join(' ')}"/>`
}

function digit (char, x, y, scale) {
  switch (char) {
    case '0':
      return _0(x, y, scale)
    case '1':
      return _1(x, y, scale)
    case '2':
      return _2(x, y, scale)
    case '3':
      return _3(x, y, scale)
    case '4':
      return _4(x, y, scale)
    case '5':
      return _5(x, y, scale)
    case '6':
      return _6(x, y, scale)
    case '7':
      return _7(x, y, scale)
    case '8':
      return _8(x, y, scale)
    case '9':
      return _9(x, y, scale)
    case '+':
      return _plus(x, y, scale)
    case '-':
      return _minus(x, y, scale)
    case '*':
      return _times(x, y, scale)
    default:
      return []
  }
}

export function digits (x, y, scale, string, unitScale = 20, spacing = 1.5) {
  return [...string].map((char, i) => digit(char, (x + i * spacing * scale) * unitScale, y * unitScale, scale * unitScale))
}
