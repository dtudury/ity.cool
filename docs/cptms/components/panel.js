import { h, mapEntries } from '../horseless.js'

export default function ({ panelIndex, model }, children, description) {
  return h`
    ${mapEntries(() => model.get(model.uiPanels[panelIndex].address).children, panel => {
      return h`<div style="border: 1px solid red;">
        ${() => JSON.stringify(panel)}
      </div>`
    })}
    ${() => JSON.stringify(model.uiPanels[panelIndex])}
    ${() => JSON.stringify(model.get(model.uiPanels[panelIndex].address))}
  `
}
