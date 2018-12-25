const BN = require('bn.js')
const minKey = new BN('0000000000000000000000000000000000000000000000000000000000000001', 16)
const maxKey = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140', 16)
const quarterKey = maxKey.divn(4)
const halfKey = maxKey.divn(2)
const threeQuartersKey = quarterKey.muln(3)

const keys = []

function range(start, n, incr) {
  const key = start.clone()

  for (let i = 0; i < n; i++, key.iaddn(incr)) {
    keys.push(key.toArrayLike(Buffer, 'be', 32))
  }
}

range(minKey, 10000, 1)
range(maxKey, 10000, -1)

range(quarterKey, 1000, 1)
range(quarterKey, 1000, -1)

range(halfKey, 1000, 1)
range(halfKey, 1000, -1)

range(threeQuartersKey, 1000, 1)
range(threeQuartersKey, 1000, -1)

module.exports = keys