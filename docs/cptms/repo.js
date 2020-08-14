import { h, showIfElse } from './horseless.js'
import octicons from './octicons.js'

export default function ({ store }) {
  const toggleRepo = el => e => {
    console.log('click', JSON.stringify(store))
    if (!store.data) store.data = true
    else delete store.data
  }
  return h`
    <div 
      style="
        display: flex; 
        align-items: center; 
        border-bottom: 1px solid DimGray; 
        background: DarkGray; 
        cursor: pointer;
      " 
      onclick=${toggleRepo}
    >
      ${showIfElse(() => store.data, octicons('chevron-down-16', { style: 'padding: 8px;' }), octicons('chevron-right-16', { style: 'padding: 8px;' }))}
      ${octicons('repo-16', { style: 'padding: 8px;' })} 
      <span style="flex-grow: 1">
        ${() => store.name}
      </span>
      <span style="color: Gray; padding-right: 6px;">
        ${() => new Date(store.created).toLocaleString()}
      </span>
    </div>
  `
}
