
export const serialize = [
  /* magic number? */
  /* same prefix as below */'unencrypted data: nonce, iteration count',
  [
    /* size prefix (decimal number and crlf?) */'encrypted root: {a:1, b:102, x:103}',
    'next encrypted attribute encrypt(value of a)',
    /* ... encrypt(value) of children of a */
    'encrypt(value) of b',
    'encrypt(value) of x'
  ]
]

/* features
diff'able; folder should have a method for catching up. does small structure solve this? hash tree
*/

export const state = {
  address: '0',
  selected: {
    address: '0.1',
    selected: {
      address: '0.1.0'
    }
  },
  expanded: [0.1, '0.1.0', 0.2]
}

export const props = {
  0: {
    name: 'root',
    module: './seeker.js',
    objectStoreWrapper: {},
    children: []
  },
  0.1: {
    name: 'folder',
    module: './seeker.js',
    objectStoreWrapper: {},
    children: []
  },
  '0.1.0': {
    name: 'document',
    module: './whatever.js',
    objectStoreWrapper: {},
    children: []
  }
}
