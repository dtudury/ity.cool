import { h, mapEntries, showIfElse } from '../horseless.js'
import { getParentAddress } from '../address.js'
import octicons from '../octicons.js'

function fileListItemView ({ child, state, select, selected }, children, description) {
  const chevronHandlers = el => ({
    onclick: e => {
      e.stopPropagation()
      console.log(el, e)
      console.log(JSON.parse(JSON.stringify(state)))
    }
  })
  return h`<div onclick=${el => select} style="border: 1px solid red;">
    ${showIfElse(() => state.expanded.indexOf(child.address) !== -1, octicons('chevron-down-16', chevronHandlers), octicons('chevron-right-16', chevronHandlers))}
    ${() => JSON.stringify(child.name)}
    ${showIfElse(() => state.selected && state.selected.address === child.address, octicons('north-star-16'))}
  </div>`
}

export default function panel ({ state, model }, children, description) {
  if (state && state.address) {
    const file = model.get(state.address)
    const parentAddress = getParentAddress(state.address)
    let name = 'root'
    if (parentAddress) {
      const parentFile = model.get(parentAddress)
      if (parentFile && parentFile.data) {
        (parentFile.data.children || []).forEach(child => {
          if (child.address === state.address) {
            name = child.name
          }
        })
      }
    }
    const select = child => el => e => {
      state.selected = {
        address: child.address,
        expanded: []
      }
    }
    if (file.data) {
      model.focus = state.address
      const data = file.data
      return h`
        <section id=${state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          ${name}
          ${mapEntries(() => data.children, child => h`
            <${fileListItemView}
              select=${select(child)}
              child=${child}
              state=${state}
            />
          `)}
        </section>
        <${panel} state=${state.selected} model=${model}/>
      `
    }
  }
}
