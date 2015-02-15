/**
 * Created by Rem on 12.02.2015.
 */

var log = require("./log")(module),
    fs = require("fs"),
    git = require("git-tools"),
    Q = require("q");

var chp = require("child_process");

/**
 * @param {String} path
 * @returns {promise.promise|jQuery.promise|promise|Q.promise}
 * @constructor
 */
var Repo = function(path) {
    this.path = path;
    this.git = new git(path);

    this.activeDays = null;
    this.age = null;
    this.curBranch = null;

    log.debug('repo %s inited', path);

    var self = this;
    var deferred = Q.defer();

    Q
        .all([
            function() {
                var def = Q.defer();

                self.git.activeDays('master', function(err, days) {
                    if (!err) {
                        self.activeDays = days.activeDays;
                        log.debug('repo %s active days is %d', self.path, self.activeDays);
                        def.resolve();
                    }
                });

                return def.promise;
            }(),
            function() {
                var def = Q.defer();

                self.git.age(function(err, age) {
                    if (!err) {
                        self.age = age;
                        log.debug('repo %s is %s old', self.path, self.age);
                        def.resolve();
                    }
                });

                return def.promise;
            }(),
            function() {
                var def = Q.defer();

                self.git.currentBranch(function(err, branch) {
                    if (!err) {
                        self.curBranch = branch;
                        log.debug('repo %s is on %s branch', self.path, self.curBranch);
                        def.resolve();
                    }
                });

                return def.promise;
            }()
        ])
        .then(function() {
            deferred.resolve();
        })
        .done();

    return deferred.promise;
};

module.exports = function(path) {
    return new Repo(path);
};