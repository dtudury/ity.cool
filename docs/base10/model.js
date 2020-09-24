
import { proxy } from '../esm/0.6.0.min.js'
export const model = proxy({ v: 0, tics: 1 })

setInterval(() => ++model.tics)
