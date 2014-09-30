var assert = require('assert');
var debug = require('debug')('strong-wait-till-listening');
var extend = require('util')._extend;
var net = require('net');


module.exports = function waitTillListening(options, callback) {
  options = extend(
    {
      host: 'localhost',
      pollingIntervalInMs: 50
    },
    options
  );

  assert(options.port, 'options.port is required');
  assert(options.timeoutInMs > 0,
    'options.timeoutInMs must be a positive number');

  var finished = false;

  setTimeout(failWithTimeout, options.timeoutInMs);
  tryConnect();

  function tryConnect() {
    if (finished) return;
    debug('Trying to connect to %s:%s', options.host, options.port);

    var client = net.connect({
      host: options.host,
      port: options.port
    });

    client.on('connect', function() {
      // Always close the client connection,
      // even if we already called the callback.
      client.end();

      if (finished) return;
      finished = true;

      debug('Connected.');
      callback();
    });

    client.on('error', function(err) {
      if (finished) return;

      debug('Connection failed, retrying in %sms. %s',
        options.pollingIntervalInMs, err);

      setTimeout(tryConnect, options.pollingIntervalInMs);
    });
  }

  function failWithTimeout() {
    if (finished) return;
    finished = true;

    var msg = 'Timed out while waiting for a server listening on ' +
      options.host + ':' + options.port;
    debug(msg);
    callback(new Error(msg));
  }
};
