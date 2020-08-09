import { render, h } from './horseless.js'
import { dynamic } from './nodes.js'
import { model } from './model.js'

render(document.body, h`
  <${dynamic} module="./repos.js" model=${model}/>
`)
