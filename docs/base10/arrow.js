import { h } from '../esm/0.6.0.min.js'
import { model } from './model.js'
import { digits } from './digits.js'

function r (values, amount = 1) {
  if (Array.isArray(values)) {
    return values.map(value => r(value, amount))
  }
  return values + amount * Math.random() * 1 - 0.5
}

export function arrow (x, y, v, sign) {
  const inc = Math.pow(10, v)
  const result = Math.min(9999, Math.max(0, model.v + sign * inc))
  const onclick = el => e => {
    model.v = result
  }
  const triangle = r([
    (x + 0.2) * 20, (y - sign * 0.5) * 20,
    (x + 0.5) * 20, (y - sign * 0.8) * 20,
    (x + 0.8) * 20, (y - sign * 0.5) * 20
  ], 2)
  if (sign === -1) {
    y += 2.5
  }
  if (result === model.v + sign * inc) {
    return h`
      <g onclick=${onclick} style="cursor: pointer;">
        <rect x=${x * 20 - 10} y=${y * 20 - 70} width=${40} height=${90} fill="black" fill-opacity="0" stroke-opacity="0"/>
        <path d="M${triangle.join(' ')}Z"/>
        ${digits(x - 0.2 * v, y - 0.9 - sign * 0.3, 0.3, (sign === 1 ? '+' : '-') + inc, 20, 1.3)}
      </g>
    `
  } else {
    return []
  }
}
