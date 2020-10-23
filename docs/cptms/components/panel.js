import { h, mapEntries, showIfElse } from '../horseless.js'
import { model, getFile } from '../model.js'
import octicons from '../octicons.js'

const panelStateRecycler = new Map()

function fileListItemView ({ child, expandedState, panelState, indent, select, selected }, children, description) {
  const getExpanded = () => expandedState.expanded.find(({ address }) => address === child.address)
  const chevronDown = octicons('chevron-down-16', el => ({
    onclick: e => {
      e.stopPropagation()
      for (let i = expandedState.expanded.length - 1; i >= 0; i--) {
        if (expandedState.expanded[i].address === child.address) {
          expandedState.expanded.splice(i, 1)
        }
      }
    }
  }))
  const chevronRight = octicons('chevron-right-16', el => ({
    onclick: e => {
      e.stopPropagation()
      expandedState.expanded.push({
        address: child.address,
        expanded: [],
        selected: {}
      })
    }
  }))
  return h`
    <div onclick=${el => select} style="border: 1px solid red; padding-left: ${indent * 10}px">
      ${showIfElse(getExpanded, chevronDown, chevronRight)}
      ${() => JSON.stringify(child.name)}
      ${() => JSON.stringify(child.address)}
      ${showIfElse(() => panelState.selected && panelState.selected.address === child.address, octicons('north-star-16'))}
    </div>
    ${showIfElse(getExpanded, h`
      <${fileListView}
        expandedState=${getExpanded}
        panelState=${panelState}
        indent=${indent + 1}
      />
    `)}
  `
}

function fileListView ({ expandedState, panelState, indent }, children, description) {
  if (!expandedState.address) {
    return
  }
  const file = getFile(expandedState.address)
  const data = file.data
  if (data) {
    model.focus = expandedState.address
  }
  const select = child => el => e => {
    if (!panelStateRecycler.has(panelState)) {
      panelStateRecycler.set(panelState, panelState.selected || {})
    }
    panelState.selected = panelStateRecycler.get(panelState)
    if (panelState.selected.address !== child.address) {
      panelState.selected = {
        address: child.address,
        expanded: []
      }
    }
  }
  return showIfElse(() => getFile(expandedState.address).data, h`
    ${mapEntries(() => getFile(expandedState.address).data.children, child => h`
      <${fileListItemView}
        select=${select(child)}
        child=${() => child}
        expandedState=${() => expandedState}
        panelState=${() => panelState}
        indent=${indent}
      />
    `)}
  `, 'loading...')
}

const panels = new WeakMap()
export default function panel ({ state }, children, description) {
  if (state && state.address) {
    if (!panels.has(state)) {
      panels.set(state, h`
        <section id=${() => state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          ${() => state.address}
          <${fileListView}
            expandedState=${state}
            panelState=${state}
            indent=${0}
          />
        </section>
      `)
    }
    return h`
      ${panels.get(state)}
      <${panel} state=${state.selected}/>
    `
  }
}
