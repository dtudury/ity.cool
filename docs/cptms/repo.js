import { h } from './horseless.js'

export default function ({ store }) {
  return h`
    <div>
      ${() => JSON.stringify(store)}
    </div>
  `
}
