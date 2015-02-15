/**
 * Created by Rem on 16.02.2015.
 */

var Q = require('q');

var Loop = function() {
    this.isStop = false;
    this.isCallDone = true;
};

Loop.prototype.run = function(delay, fn, done, promise) {
    if (typeof promise === 'undefined') {
        promise = Q();
    }

    var self = this;

    promise
        .then(function() {
            return fn();
        })
        .then(function() {
            if (self.isStop) {
                if (self.isCallDone) {
                    process.nextTick(done);
                }

                var err = new Error();
                err.code = 'done';
                throw err;
            }
        })
        .then(function() {
            return Q.delay(delay);
        })
        .then(Q.nextTick.bind(this, function() {
            self.run(delay, fn, done, promise);
        }))
        .fail(function(err) {
            if (err.code !== 'done') {
                process.nextTick(function() {
                    throw err;
                });
            }
        })
        .done();
};

Loop.prototype.stop = function(isCallDone) {
    if (typeof isCallDone === 'undefined') {
        isCallDone = true;
    }

    this.isCallDone = isCallDone;
    this.isStop = true;
};

module.exports = function() {
    return new Loop();
};