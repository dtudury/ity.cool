import { render, h } from './horseless.js'
import { model } from './model.js'
import { ObjectStoreWrapper } from './db.js'
import seeker from './components/seeker.js'

const address = document.location.hash.substring(1).split('.')[0] || '0'
const objectStoreWrapper = new ObjectStoreWrapper(address)
model.root = { address }
render(document.body, h`<${seeker} model=${model.root} objectStoreWrapper=${objectStoreWrapper}/>`)
