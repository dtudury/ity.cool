import { render, h } from './horseless.js'
import root from './components/root.js'
import nav from './components/nav.js'
import main from './components/main.js'
import unibox from './components/unibox.js'
import { model } from './model.js'
import { ObjectStoreWrapper } from './db.js'

model.root = {}
model.selected = {
  component: './defaultMain.js'
}
const objectStoreWrapper = new ObjectStoreWrapper('0')
render(document.body, h`
  <div style="display: flex; height: 100%;">
    <${nav} style="flex: 0 1 24rem; display: flex; flex-direction: column;">
      <header style="display: flex; background: DimGray;">
        <${unibox} model=${model.root}/>
      </header>
      <${root} objectStoreWrapper=${objectStoreWrapper} model=${model.root}/>
    </${nav}>
    <${main} style="flex: 1" model=${model.selected} />
  </div>
`)
