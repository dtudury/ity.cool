import { render, h, mapEntries } from './horseless.js'
// import { ObjectStoreWrapper } from './db.js'
import { model } from './model.js'
import panel from './components/panel.js'
import { jsonDump } from './_debug/dump.js'
// import seeker from './components/seeker.js'

// const objectStoreWrapper = new ObjectStoreWrapper(address)
render(document.body, h`
  <main style="display: flex; height: 100%;">
    ${mapEntries(() => model.uiPanels, (_, index) => h`
      <section style="flex: 1 0 20em;">
        <${panel} panelIndex=${index} model=${model}/>
      </section>
    `)}
  </main>
  ${() => jsonDump(model)}
`)
// <${seeker} objectStoreWrapper=${objectStoreWrapper}/>
