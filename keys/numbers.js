const BN = require('bn.js')
const ecc = require('tiny-secp256k1')

const keys = []

for (let i = 1, str = ''; str.length <= 78; i++) {
  if (i > 9) {
    i = 0;
  }

  keys.push(str += i)
}

for (let i = 1, str = ''; str.length <= 78; i++) {
  if (i > 9) {
    i = 0;
  }

  keys.push(str = i + str)
}

for (let i = 1; i < 10; i++) {
  for (let j = 1; j <= 78; j++) {
    keys.push(i.toString().repeat(j))
  }
}

for (let i = 0, str = ''; str.length <= 78; i++) {
  for (let j = 1; j < 10; j++) {
    keys.push(str = j + '0'.repeat(i))
  }
}

module.exports = keys
  .map(k => Object.assign(new BN(k), {original: k}))
  .filter(k => k.byteLength() <= 32)
  .map(k => Object.assign(k.toBuffer('be', 32), {original: k.original}))
  .filter(k => ecc.isPrivate(k))
