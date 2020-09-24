// ★
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

export const state = [
  {
    address: '0',
    expanded: [0.1, '0.1.0', 0.2],
    selected: '0.1'
  },
  {
    address: '0.1',
    expanded: [],
    selected: '0.1.0'
  }
]
/*
encoded:
0;.1,.1.0,.2:.1;:.1
*/

export const decoded = {
  address: '0',
  expanded: [
    {
      address: '0.1',
      expanded: [
        {
          address: '0.1.0'
        }
      ]
    },
    {
      address: '0.2'
    },
    {
      address: '0.3'
    }
  ],
  selected: {
    address: '0.2.3',
    expanded: [],
    selected: {
      address: '0.2.3.4',
      expanded: []
    }
  }
}
/*
encoded:
0[1[0]2,3]2.3[]4[]
0:[2[3:(4)]](1(0)2)
*/

export const props = {
  0: {
    objectStoreWrapper: {},
    children: [
      {
        name: 'folder',
        module: './seeker.js',
        address: '0.1'
      }
    ]
  },
  0.1: {
    objectStoreWrapper: {},
    children: [
      {
        name: 'document',
        module: './whatever.js',
        address: '0.1.0'
      }
    ]
  },
  '0.1.0': {
    objectStoreWrapper: {},
    children: []
  }
}
