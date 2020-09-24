import { h, render } from '../esm/0.6.0.min.js'
import { model } from './model.js'
import { digits } from './digits.js'
import { thousands, hundreds, tens, ones } from './boxes.js'
import { arrow } from './arrow.js'

model.v = Math.ceil(Math.random() * 99)

function boxes (el) {
  return [
    thousands(2, 28, Math.floor(model.v / 1000)),
    hundreds(5, 23, Math.floor((model.v % 1000) / 100)),
    tens(18.5, 16, Math.floor((model.v % 100) / 10)),
    ones(29, 23, model.v % 10),
    h`<g stroke-width="2">
      ${digits(18, 21, 1, ('   ' + model.v).substr(-4), 20, 2)}
    </g>`,
    arrow(20, 19, 2, 1),
    arrow(20, 21, 2, -1),
    arrow(22, 19, 1, 1),
    arrow(22, 21, 1, -1),
    arrow(24, 19, 0, 1),
    arrow(24, 21, 0, -1)
  ]
}

render(document.querySelector('main.card'), h`
  <svg viewBox="0 0 700 600" fill="none" stroke="#aa8866" stroke-linejoin="round" stroke-linecap="round" stroke-width="1" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="250%">
        <feOffset in="SourceGraphic" dy="2" />
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    ${boxes}
  </svg>
`)
