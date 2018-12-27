# Bitcoin Sweeper

Bitcoin Sweeper is a tool written in Node.JS to monitor Bitcoin addresses created from known/leaked 
private keys and sweep out any coins sent to that addresses.

## Addresses

Bitcoin Sweeper uses the following list of addresses created from known or potentially leaked private keys:

* Thousands of ordinal keys from the beginning and the end of [Bitcoin key range](https://en.bitcoin.it/wiki/Secp256k1)
* Some keys from the middle and quarters parts of Bitcoin key range 
* Private keys created from various passphrases (brainwallet)
* Private keys from [Bitcoin transaction puzzle](https://bitcointalk.org/index.php?topic=1306983.0)
* Nice private key patterns in HEX

## Technical Details

Bitcoin Sweeper connects to ZeroMQ address specified in the Bitcoin configuration,
subscribes to `rawtx` channel and listens for all transactions relayed over
Bitcoin network. When coins are sent to the known Bitcoin address, the tool
creates a spending transaction and broadcasts it over Bitcoin network via 
`sendrawtransaction` JSON-RPC command and pushtx API of popular block explorers.

## Usage

To run Bitcoin Sweeper, you will need a full Bitcoin node with enabled ZeroMQ & JSON-RPC.

**1. Setup Bitcoin node and enable JSON-RPC & ZeroMQ raw transaction publishing**

Example bitcoin.conf:

```text
server=1
rpcuser=test
rpcpassword=test
zmqpubrawtx=tcp://127.0.0.1:28832
minrelayfee=0
``` 
 **2. Create config.js**

Example config.js:

```javascript
module.exports = {
  zeromq: {
    address: 'tcp://127.0.0.1:28332'
  },

  jsonrpc: {
    rpchost: '127.0.0.1',
    rpcport: 8332,
    rpcuser: 'test',
    rpcpassword: 'test',
  },

  address: 'Your address'
}
```

**3. Install required packages:**

```bash
npm install
```

**4. Run Bitcoin Sweeper:**

```bash
npm run start 
```

## TODO

* P2WPKH, P2SH, P2WSH transaction types
* Add more networks
* Add more private keys
* Better network fees