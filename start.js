global.fetch = require('node-fetch')

const zmq = require('zeromq')
const {createCall} = require('bitcoind-client')
const bitcoin = require('bitcoinjs-lib')
const {pushtx} = require('pushtx')
const randomBytes = require('randombytes')
const keys = require('./keys')
const config = require('./config')

const args = process.argv.slice(2)
const testing = args.length && args[0] === 'test'
const call = createCall(config.jsonrpc)

function connect() {
  const sock = zmq.socket('sub')
  sock.connect(config.zeromq.address)
  sock.subscribe('rawtx')

  console.log('Connected to %s\n', config.zeromq.address)

  sock.on('message', (topic, message) => {
    onTransaction(message.toString('hex'))
  })
}

function toCoins(satoshi) {
  return (satoshi / 1e8).toFixed(8)
}

function logStatus(status) {
  process.stdout.write("\033[1A\033[K")
  process.stdout.write(status + "\n")
}

function onTransaction(hex) {
  const tx = bitcoin.Transaction.fromHex(hex)

  const {outs} = tx

  outs.forEach((o, n) => {
    const {script, value} = o
    let addr

    try {
      addr = bitcoin.address.fromOutputScript(script)

      logStatus(toCoins(value) + ' => ' + addr)
    } catch (e) {
      return
    }

    if (addr in keys) {
      const hash = tx.getId().toString('hex')
      const pair = keys[addr]

      console.log('Sweeping %s (%s)...', addr, pair.privateKey.toString('hex'))

      if ('original' in pair.privateKey) {
        console.log('Original: %s', pair.privateKey.original ? pair.privateKey.original : '(empty)')
      }

      spend({hash, n, value, pair})
    }
  })
}

function spend(data) {
  const {hash, n, value, pair} = data
  const txb = new bitcoin.TransactionBuilder()
  let fee = 0

  if (value >= 10000000) {
    fee = 100000
  } else if (value >= 100000) {
    fee = Math.floor(value / 100)
  } else if (value >= 1000) {
    fee = 1000
  } else {
    fee = 0
  }

  txb.setVersion(1)
  txb.addInput(hash, n)
  txb.addOutput(config.address, value - fee)
  txb.sign(0, pair)

  const tx = txb.build()
  const hex = tx.toHex()

  console.log('Prev TX: %s:%d', hash, n)
  console.log('Value:   %s', toCoins(value))
  console.log('Fee:     %s', toCoins(fee))
  console.log('Output:  %s', config.address)
  console.log('TXID:    %s', tx.getId().toString('hex'))
  console.log('Raw Hex: %s', hex)

  sendTx(hex)
    .then((result) => console.log('sendTx result: ', result))
    .catch((err) => console.log('sendTx err: ', err))
}

function sendTx(hex) {
  return Promise.all([
    call('sendrawtransaction', hex),
    pushtx(hex)
  ].map(p => p.catch(err => {
    return err
  })))
}

function test() {
  const key = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
  const pair = bitcoin.ECPair.fromPrivateKey(key)
  const {address} = bitcoin.payments.p2pkh({pubkey: pair.publicKey})
  const txb = new bitcoin.TransactionBuilder()

  txb.setVersion(1)
  txb.addInput(randomBytes(32).toString('hex'), 0)
  txb.addOutput(address, 1000000)
  txb.sign(0, pair)

  onTransaction(txb.build().toHex())
}

console.log('Collecting coins to: %s', config.address)

connect()

if (testing) {
  test()
}
