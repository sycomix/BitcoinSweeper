const ecc = require('tiny-secp256k1')
const alphabet = '0123456789abcdef'.split('')

let keys = []

alphabet.forEach(a => {
  alphabet.forEach(b => {
    if (a !== b) {
      for (let i = 0; i < 64; i++) {
        keys.push(a.repeat(i) + b.repeat(64 - i))
      }
    }
  })
})

alphabet.forEach(a => {
  alphabet.forEach(b => {
    if (a !== b) {
      [1, 2, 4, 8, 16, 32].forEach(r => {
        keys.push((a.repeat(r) + b.repeat(r)).repeat(32 / r))
      })
    }
  })
})

module.exports = Array.from(new Set(keys))
  .map(k => Buffer.from(k, 'hex'))
  .filter(k => ecc.isPrivate(k))
