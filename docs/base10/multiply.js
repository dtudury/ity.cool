import { h, render } from '../esm/0.6.0.min.js'
import { model } from './model.js'
import { digits } from './digits.js'
import { box } from './boxes.js'

model.x = Math.floor(Math.random() * 19 + 2)
model.y = Math.floor(Math.random() * 19 + 2)

const screenWidth = 700 - 100
const screenHeight = 600 - 110
const screenRatio = screenWidth / screenHeight

function boxes (el) {
  // void (model.tics)
  function map (x10, x5, x1, y10, y5, y1, width, depth) {
    let x = x10 * 10.5 + x5 * 5.5 + x1 * 1.5
    let y = y10 * 10.5 + y5 * 5.5 + y1 * 1.5
    if (width !== 10 && x10) x += 1
    if (width !== 5 && x5) x += 1
    if (width === 1 && x1 >= 5) x += 1
    if (depth !== 10 && y10) y += 1
    if (depth !== 5 && y5) y += 1
    if (depth === 1 && y1 >= 5) y += 1
    return { x, y }
  }
  const fivers = false
  const str = `${model.x}*${model.y}`
  const x10s = Math.floor(model.x / 10)
  const y10s = Math.floor(model.y / 10)
  const x5s = fivers ? Math.floor(model.x / 5) % 2 : 0
  const y5s = fivers ? Math.floor(model.y / 5) % 2 : 0
  const x1s = model.x % (fivers ? 5 : 10)
  const y1s = model.y % (fivers ? 5 : 10)
  const { x, y } = map(x10s, x5s, x1s, y10s, y5s, y1s, 1, 1)
  const height = y / 2 + (y1s % 5 ? 0.75 : 0.25)
  const frontWidth = x - (x1s % 5 ? 0.5 : 1.5)
  const width = frontWidth + height / 1.5 - 1 + 1 / 3
  const ratio = width / height
  let scale
  if (ratio > screenRatio) {
    scale = screenWidth / width
  } else {
    scale = screenHeight / height
  }
  const xOffset = (700 - scale * width) / 2
  const yOffset = ((600 - 90) - scale * height) / 2
  function group (x10, x5, x1, y10, y5, y1, width, depth, hue) {
    const { x, y } = map(x10, x5, x1, y10, y5, y1, width, depth)
    return box(xOffset / scale + x, yOffset / scale + height, y, width, 1, depth, 'none', scale, scale, hue)
  }
  const groups = [
    [...Array(x10s).keys()].map(x10 => [
      [...Array(y1s).keys()].map(y1 => {
        return group(x10, 0, 0, y10s, y5s, y1, 10, 1, 300)
      }).reverse(),
      [...Array(y5s).keys()].map(y5 => {
        return group(x10, 0, 0, y10s, y5, 0, 10, 5, 60)
      }).reverse(),
      [...Array(y10s).keys()].map(y10 => {
        return group(x10, 0, 0, y10, 0, 0, 10, 10, 0)
      }).reverse()
    ]),
    [...Array(x5s).keys()].map(x5 => [
      [...Array(y1s).keys()].map(y1 => {
        return group(x10s, x5, 0, y10s, y5s, y1, 5, 1, 180)
      }).reverse(),
      [...Array(y5s).keys()].map(y5 => {
        return group(x10s, x5, 0, y10s, y5, 0, 5, 5, 120)
      }).reverse(),
      [...Array(y10s).keys()].map(y10 => {
        return group(x10s, x5, 0, y10, 0, 0, 5, 10, 60)
      }).reverse()
    ]),
    [...Array(x1s).keys()].map(x1 => [
      [...Array(y1s).keys()].map(y1 => {
        return group(x10s, x5s, x1, y10s, y5s, y1, 1, 1, 240)
      }).reverse(),
      [...Array(y5s).keys()].map(y5 => {
        return group(x10s, x5s, x1, y10s, y5, 0, 1, 5, 180)
      }).reverse(),
      [...Array(y10s).keys()].map(y10 => {
        return group(x10s, x5s, x1, y10, 0, 0, 1, 10, 300)
      }).reverse()
    ])
  ]
  return [
    // box(0, 1, 0, 1, 1, 0, 'none', width * scale, height * scale),
    digits((xOffset + frontWidth * scale / 2) / 20 - (str.length * 1.5 - 0.5) / 2, (yOffset + scale * height + 60) / 20, 1, str),
    groups
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
