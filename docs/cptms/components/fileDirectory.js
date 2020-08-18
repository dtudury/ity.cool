import { h } from '../horseless.js'
import button from './button.js'
import octicons from '../octicons.js'

export default function ({ model, saveRepo }) {
  const newDir = el => e => {
    console.log('newDir')
  }
  const newFile = el => e => {
    console.log('newFile')
  }
  return h`
    <${button} onclick=${newDir}>
      ${octicons('plus-16', { style: 'padding-right: 4px;' })}
      ${octicons('file-directory-16')}
    </button>
    <${button} onclick=${newFile}>
      ${octicons('plus-16', { style: 'padding-right: 4px;' })}
      ${octicons('file-16')}
    </button>
  `
}
