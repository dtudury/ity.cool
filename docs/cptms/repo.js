import { h } from './horseless.js'

export default function ({ model }) {
  const onclick = el => e => {
    model.v = model.v ? ++model.v : 1
  }
  return h`
    <div onclick=${onclick}>name ${() => model.v}</div>
    <label for="pass">Password:</label>
    <input type="password" id="pass" name="password">
  `
}
