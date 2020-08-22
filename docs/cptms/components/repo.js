import { h, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

export default function ({ model, objectStoreWrapper }) {
  const toggleRepo = el => async e => {
    if (!repo.data) {
      repo.data = 'loading'
      repo.data = await objectStoreWrapper.getObject(repo.address)
    } else if (repo.data !== 'loading') delete repo.data
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
      ${showIfElse(() => repo.data, octicons('chevron-down-16', { style: 'padding-right: 4px;' }), octicons('chevron-right-16', { style: 'padding-right: 4px;' }))}
      ${octicons('repo-16', { style: 'padding-right: 4px;' })} 
      <span style="flex-grow: 1">
        ${() => repo.name}
      </span>
    </div>
    ${() => {
      if (repo.data) {
        return h`
          <${dynamic} 
            module="${() => repo.data.module || './encryptedRepo.js'}" 
            model=${repo.data} 
            objectStoreWrapper=${objectStoreWrapper.clone(repo.address)}
          />
        `
      }
    }}
  `
}
