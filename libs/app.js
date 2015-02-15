/**
 * Created by Rem on 12.02.2015.
 */

var log = require('./log')(module),
    fs = require('fs'),
    path = require('path'),
    git = require('git-tools'),
    Q = require('q'),
    loop = require('./loop')(),
    Repo = require('./repo');

var App = function(config) {
    this.config = config;
    this.repos = [];

    //fixme
    this.maxTicks = 2;
    this.ticks = 0;
};

/**
 * @returns {promise.promise|jQuery.promise|promise|Q.promise}
 */
App.prototype.init = function() {
    var self = this;
    var deferred = Q.defer();

    var repos = self.config.get('repos');
    var processedReposCnt = 0;

    Q
        .all(repos.map(function(repo) {
            var def = Q.defer();
            log.debug('repo: %s', repo);

            git.isRepo(repo, function(err, isRepo) {
                if (!err) {
                    if (isRepo) {
                        Repo(repo)
                            .then(function(rep) {
                                self.repos.push(rep);
                                deferred.notify(++processedReposCnt / repos.length);
                                def.resolve();
                            })
                            .done();
                    } else {
                        log.warn('%s is not a git repository', repo);
                        deferred.notify(++processedReposCnt / repos.length);
                        def.resolve();
                    }
                }
            });

            return def.promise;
        }))
        .then(function() {
            deferred.resolve();
        })
        .done();

    return deferred.promise;
};

App.prototype.process = function() {
    var self = this;

    log.debug('process tick');

    // fixme
    if (++self.ticks >= self.maxTicks) {
        log.debug('stop loop');
        loop.stop();
    }
};

App.prototype.run = function() {
    var self = this;

    self.init()
        .progress(function(percents) {
            log.info('init progress is %d%', parseInt(100 * percents));
        })
        .then(function() {
            log.info('Starting loop...');

            var deferred = Q.defer();

            loop.run(100, function() {
                self.process();
            }, function() {
                deferred.resolve();
            });

            return deferred.promise;
        })
        .then(function() {
            log.info('YAHOO!!');
        })
        .fail(function(err) {
            log.error('Error: %j', err);
        })
        .done();
};

module.exports = function(config) {
    return new App(config);
};