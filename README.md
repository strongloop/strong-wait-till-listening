# strong-wait-till-listening

This module provides a utility function to wait until there is a TCP server 
listening on a given port.

## Installation

```sh
$ npm install strong-wait-till-listening
```

## Usage

```js
var waitTillListening = require('strong-wait-till-listening');

waitTillListening(
  // host or IP address
  'localhost',  
  // port
  3000,
  // timeout in ms
  20000,
  // callback
  function(err) {}
);
```


