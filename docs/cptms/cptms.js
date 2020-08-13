import { render, h } from './horseless.js'
import { dynamic } from './nodes.js'
import { model } from './model.js'
import { ROOT_ADDRESS } from './db.js'

render(document.body, h`
  <${dynamic} module="${() => model.root.module}" model=${model.root} address=${ROOT_ADDRESS}/>
`)
