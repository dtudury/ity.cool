import { h, mapEntries, showIfElse } from '../horseless.js'
import { getParentAddress } from '../address.js'
import octicons from '../octicons.js'

function fileListItemView ({ child, state, select, selected }, children, description) {
  const isExpanded = () => state.expanded.some(({ address }) => address === child.address)
  const chevronDown = octicons('chevron-down-16', el => ({
    onclick: e => {
      e.stopPropagation()
      console.log('close')
      for (let i = state.expanded.length - 1; i >= 0; i--) {
        if (state.expanded[i].address === child.address) {
          state.expanded.splice(i, 1)
        }
      }
    }
  }))
  const chevronRight = octicons('chevron-right-16', el => ({
    onclick: e => {
      e.stopPropagation()
      console.log('open')
      state.expanded.push({
        address: child.address,
        expanded: []
      })
    }
  }))
  return h`<div onclick=${el => select} style="border: 1px solid red;">
    ${showIfElse(isExpanded, chevronDown, chevronRight)}
    ${() => JSON.stringify(child.name)}
    ${showIfElse(() => state.selected && state.selected.address === child.address, octicons('north-star-16'))}
  </div>`
}

function fileListView ({ data, state, indent }) {
  const select = child => el => e => {
    state.selected = {
      address: child.address,
      expanded: []
    }
  }
  return h`
    ${mapEntries(() => data.children, child => h`
      <${fileListItemView}
        select=${select(child)}
        child=${child}
        state=${state}
        indent=${indent}
      />
    `)}
  `
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
    if (file.data) {
      model.focus = state.address
      const data = file.data
      return h`
        <section id=${state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          ${name}
          <${fileListView}
            data=${data}
            state=${state}
            indent=${0}
          />
        </section>
        <${panel} state=${state.selected} model=${model}/>
      `
    } else {
      return h`
        <section id=${state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          loading...
        </section>
        <${panel} state=${state.selected} model=${model}/>
      `
    }
  }
}
