import { render, h } from './horseless.js'
import dynamic from './components/dynamic.js'
import { model } from './model.js'
import { ObjectStoreWrapper } from './db.js'

const objectStoreWrapper = new ObjectStoreWrapper(0)
render(document.body, h`
  <${dynamic} 
    module="${() => model.root.module || './root.js'}" 
    objectStoreWrapper=${objectStoreWrapper} 
    model=${model.root} 
    address=${0}
  />
`)
