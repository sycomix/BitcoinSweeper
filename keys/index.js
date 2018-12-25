const bitcoin = require('bitcoinjs-lib')

const keys = {}

function addKeys(keys) {
  keys.forEach(key => {
    addKey(key, false)
    addKey(key, true)
  })
}

function addKey(key, compressed) {
  const pair = bitcoin.ECPair.fromPrivateKey(key, {compressed})
  const {address} = bitcoin.payments.p2pkh({pubkey: pair.publicKey})

  keys[address] = pair
}

console.log('Generating keys...')
const s = new Date()

addKeys(require('./range'))
addKeys(require('./patterns'))
addKeys(require('./brainwallet'))
addKeys(require('./passwords'))
addKeys(require('./puzzle'))

console.log('Generated %s keys in %ss',
  Object.keys(keys).length,
  (new Date() - s) / 1000)

module.exports = keys
