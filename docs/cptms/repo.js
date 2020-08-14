import { h } from './horseless.js'
import octicons from './octicons.js'

export default function ({ store }) {
  const toggleRepo = el => e => {
    console.log('click', JSON.stringify(store))
  }
  return h`
    <div style="
      display: flex; 
      align-items: center; 
      border-bottom: 1px solid DimGray; 
      background: DarkGray; 
      cursor: pointer;
    " onclick=${toggleRepo}>
      ${octicons('chevron-right-16', { style: 'padding: 8px;' })} 
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
