import { render, h } from './horseless.js'
import { dynamic } from './nodes.js'
import { model } from './model.js'

render(document.body, h`
  <${dynamic} module="${() => model.root.module || './root.js'}" model=${model.root} address=${0}/>
`)
