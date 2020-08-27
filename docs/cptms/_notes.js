export const asdf = {
  keyStuffSize: 33,
  keystuff: [],
  firstEntrySize: 36, // encrypted 4 bytes
  entries: [
    { // encrypted json
      attributes: {},
      childrenSizes: [0, 34, 48]
    }
  ]
}

export const qwerty = {
  // attribute part
  a: ['attributeSize', 'dataSize'],
  b: 10,
  // data part
  data: [
    'encrypted: {c: 14'
  ]
}

export const fubar = {
  keystuff: {},
  data: [
    // first one is root
  ]
}

export const bogo = [
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

export const explicit = {
  address: '0',
  selected: {
    address: '0.1',
    selected: {
      address: '0.1.0'
    }
  },
  expanded: {
    0.1: {
      '0.1.0': {}
    },
    0.2: {}
  }
}

export const dataByAddress = {
  0: {
    name: 'root',
    address: '0',
    module: './seeker.js',
    objectStoreWrapper: {}
  },
  0.1: {
    name: 'folder',
    address: '0.1',
    module: './seeker.js',
    objectStoreWrapper: {},
    children: []
  },
  '0.1.0': {
    name: 'document',
    address: '0.1.0',
    module: './whatever.js',
    objectStoreWrapper: {},
    children: []
  }
}
