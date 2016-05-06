// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: strong-wait-till-listening
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

/*global describe,it,beforeEach,afterEach */
var net = require('net');
var waitTillListening = require('../');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

describe('waitForListening', function() {
  var uniquePort = 62000;

  beforeEach(function makeUniquePort() {
    uniquePort++;
    sinon.spy(global, 'clearTimeout');
  });

  afterEach(function() {
    global.clearTimeout.restore();
  });

  describe('when the server is listening', function() {
    beforeEach(function() {
      // Let's define immediately as in less than 100 ms
      this.timeout(100);
    });

    it('returns immediately', function(done) {
      givenServerListeningAt(uniquePort)
        .on('listening', function() {
          waitTillListening({ port: uniquePort, timeoutInMs: 50}, done);
        });
    });

    it('clears the timeout', function(done) {
      givenServerListeningAt(uniquePort)
        .on('listening', function() {
          waitTillListening({ port: uniquePort, timeoutInMs: 50}, function() {
            expect(clearTimeout).to.have.been.calledOnce.calledWith();
            done();
          });
        });
    });
  });

  describe('when the timeout expires', function() {
    var start;
    beforeEach(function() {
      this.timeout(100);
      start = new Date();
    });

    it('returns an error', function(done) {
      waitTillListening(
        { port: uniquePort, timeoutInMs: 50},
        function(err) {
          var duration = new Date() - start;

          // Allow 1ms margin of error
          expect(duration, 'duration').to.be.gte(50 - 1);
          expect(err, 'err').to.not.equal(undefined);
          done();
        }
      );
    });

    it('clears the timeout', function(done) {
      waitTillListening(
        { port: uniquePort, timeoutInMs: 50},
        function() {
          expect(clearTimeout).to.have.been.calledTwice.calledWith();
          done();
        }
      );
    });
  });

  it('waits for the server to start', function(done) {
    waitTillListening({ port: uniquePort, timeoutInMs: 1000 }, done);
    setTimeout(function() { givenServerListeningAt(uniquePort); }, 300);
  });

  function givenServerListeningAt(port) {
    return net.createServer()
      .listen(port)
      .on('connection', function(connection) {
        connection.end();
      });
  }
});
